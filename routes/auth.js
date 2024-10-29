import express from "express";
import bcrypt from 'bcrypt';
import { body, validationResult } from "express-validator";
import connectDB from "../config/db.js";
import jwt from "jsonwebtoken";

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

router.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body;
    try {
        const db = await connectDB();

        const user = await db.collection('Users').findOne({ username });
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!user || !isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username }, process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );
        res.status(200).json({ token });
    } catch(err) {
        console.error("Server Error:", err);
        res.status(500).json({ message: 'Server Error' })
    }
});

export default router;