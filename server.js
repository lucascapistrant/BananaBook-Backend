import express from "express";

import authRoutes from './routes/auth.js';
import 'dotenv/config';

const app = express();


const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to Bananabook!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})