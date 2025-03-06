// Title: Simple User Authentication API in Node.js (100 Lines)

// Required modules
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3000;



app.use(express.json());

// In-memory user store (for simplicity)
const users = {};

// Helper to generate a mock token
const generateToken = (username) => crypto.createHash('sha256').update(username + Date.now()).digest('hex');

// Register a new user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users[username] = { password, token: null };
    res.status(201).json({ message: 'User registered successfully' });
});

// Login user and return token
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(username);
    user.token = token;
    res.json({ message: 'Login successful', token });
});

// Protected route
app.get('/profile', (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }
    const user = Object.values(users).find(u => u.token === token);
    if (!user) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
    res.json({ message: 'Welcome to your profile', username: Object.keys(users).find(key => users[key] === user) });
});

// Logout (invalidate token)
app.post('/logout', (req, res) => {
    const token = req.headers.authorization;
    const user = Object.values(users).find(u => u.token === token);
    if (!user) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
    user.token = null;
    res.json({ message: 'Logged out successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`User Auth API running at http://localhost:${PORT}`);
});
