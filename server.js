import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import 'dotenv/config';
import connectDB from "./config/db.js";

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

const app = express();

const PORT = process.env.PORT || 3000;
const STATUS = process.env.STATUS;

const allowedOrigins = process.env.ALLOWEDORIGINS.split(",");

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(generalLimiter);
app.use(cors({
    origin: (origin, cb) => {
        if(!origin || allowedOrigins.includes(origin)) {
            cb(null, true);
        }
        else {
            cb(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
}))

connectDB().then(() => {
    app.use('/api/auth', authRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/users', userRoutes);

    if(STATUS == 'DEV') {
        app.listen(PORT, () => {
            console.log('Listening on port', PORT);
        })
    }
    
    app.get('/', (req, res) => {
        res.send('Welcome to Bananabook!');
    })
    
    console.log(`Server is ready to handle requests.`);

}).catch(err => {
    console.log('Failed to connect to MongoDB', err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error - Unidentified');
});

export default app