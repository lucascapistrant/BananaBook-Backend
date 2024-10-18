import express from "express";
import bcrypt from 'bcrypt';
import { ExpressValidator, body, validationResult } from "express-validator";
// import { JsonWebTokenError } from "jsonwebtoken";
import connectDB from "../config/db.js";

const router = express.Router();

router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const db = await connectDB();
        const existingUser = await db.collection('Users').findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('Users').insertOne({ username: username, passwordHash: hashedPassword });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: `Internal Server Error: ${err}` });
    }
});

export default router;

// import jwt from "jsonwebtoken";

// router.post('/login', [
//     body('username').notEmpty().withMessage('Username is required'),
//     body('password').notEmpty().withMessage('Password is required')
// ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     const { username, password } = req.body;
//     try {
//         const db = await connectDB();
//         const user = await db.collection('users').findOne({ username });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid username or password' });
//         }

//         const isMatch = await bcrypt.compare(password, user.passwordHash);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid username or password' });
//         }

//         // Create a JWT token
//         const token = jwt.sign(
//             { userId: user._id, username: user.username },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         res.json({ token });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });
