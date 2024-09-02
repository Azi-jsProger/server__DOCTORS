const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8888;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/medix', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    speciality: String,
    login: String,
    role: { type: String, default: 'user' }
});


const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    const { username, password, login, speciality, role } = req.body;

    try {
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        const newUser = new User({ username, password, login, speciality, role });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', _id: newUser._id });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json('Failed to register user');
    }
});

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

app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json('Error retrieving users');
    }
});

function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        return next(); // Пропускаем к маршруту
    } else {
        res.status(403).send('Доступ запрещен'); // Возвращаем ошибку 403, если роль не 'admin'
    }
}

app.get('/admin', isAdmin, (req, res) => {
    res.send('Добро пожаловать в админку!');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
