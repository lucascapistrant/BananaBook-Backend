import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from './routes/auth.js';
import 'dotenv/config';
import connectDB from "./config/db.js";

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(generalLimiter);

connectDB().then(() => {
    app.use('/api/auth', authRoutes);
    
    app.get('/', (req, res) => {
        res.send('Welcome to Bananabook!');
    })
    
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
}).catch(err => {
    console.log('Failed to connect to MongoDB', err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something Broke!');
});