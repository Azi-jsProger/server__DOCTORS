const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8888;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/medix', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Check connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    speciality: String,
    login: String
});

const User = mongoose.model('User', UserSchema);

// Register endpoint
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

// Login endpoint
app.post('/login', async (req, res) => {
    const { password, login } = req.body;

    try {
        const user = await User.findOne({ login });
        if (!user) {
            return res.status(400).json('Invalid login or password');
        }

        if (user.password !== password) {
            return res.status(400).json('Invalid login or password');
        }

        res.status(200).json({ _id: user._id, message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json('Internal server error');
    }
});

// Profile endpoint
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
