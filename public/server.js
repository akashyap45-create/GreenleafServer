const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000; // You can choose any port

// Middleware to serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies (if you decide to send JSON in requests)
app.use(express.json());

const usersFilePath = path.join(__dirname, 'users.json');

// Helper function to read user data from JSON file
function readUsers() {
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        // If the file doesn't exist or JSON is invalid, return an empty array
        return [];
    }
}

// Helper function to write user data to JSON file
function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Signup endpoint
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const users = readUsers();

    // Check if user with this email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).send('User with this email already exists.');
    }

    const newUser = {
        email: email,
        password: password, // In a real application, you should hash the password!
        timestamp: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    console.log(`New user signed up: ${email}`);
    res.send('Signup successful!');
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    const users = readUsers();
    const user = users.find(user => user.email === email && user.password === password); // In real app, compare hashed passwords

    if (user) {
        console.log(`User logged in: ${email}`);
        res.send('Login successful!');
    } else {
        console.log(`Login failed for: ${email}`);
        res.status(401).send('Invalid email or password.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});
