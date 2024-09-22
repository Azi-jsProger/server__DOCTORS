const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Подключаем dotenv для работы с переменными окружения
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8888;

app.use(bodyParser.json());
app.use(cors());

// Подключение к MongoDB через переменную окружения MONGO_URL
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Схема пользователя
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    speciality: String,
    login: String,
    role: { type: String, default: 'user' }
});

const User = mongoose.model('User', UserSchema);

// Маршрут для регистрации
app.post('/register', async (req, res) => {
    const { username, password, login, speciality } = req.body;

    try {
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        const newUser = new User({ username, password, login, speciality });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', _id: newUser._id });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json('Failed to register user');
    }
});

// Маршрут для логина
app.post('/login', async (req, res) => {
    const { password, login } = req.body;

    try {
        const user = await User.findOne({ login });
        if (!user || user.password !== password) {
            return res.status(400).json('Invalid login or password');
        }

        res.status(200).json({ _id: user._id, role: user.role, message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json('Internal server error');
    }
});

// Получение профиля пользователя
app.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('User not found');
        }
        res.json(user);
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json('Error retrieving user data');
    }
});

// Получение всех пользователей
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json('Error retrieving users');
    }
});

// Проверка, является ли пользователь администратором
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        res.status(403).send('Доступ запрещен');
    }
}

// Маршрут для админов
app.get('/admin', isAdmin, (req, res) => {
    res.send('Добро пожаловать в админку!');
});

// Обновление статуса пользователя
app.post('/update-status', async (req, res) => {
    const { userId, isOnline } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { isOnline }, { new: true });

        if (!user) {
            return res.status(404).json('User not found');
        }

        res.json({ message: 'Status updated successfully', user });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json('Failed to update status');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
