const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 8888;

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/medix', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware для обработки JSON
app.use(express.json());

// Определение схемы и модели пользователя
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    speciality: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Маршрут для регистрации пользователя
app.post('/register', async (req, res) => {
    const { username, login, password, speciality } = req.body;

    try {
        const newUser = new User({ username, login, password, speciality });
        await newUser.save(); // Сохранение пользователя в базе данных

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
