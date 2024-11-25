import express from "express";
import { body, validationResult } from "express-validator";
import connectDB from "../config/db.js";
import verifyToken from '../middleware/auth.js'
import { ObjectId } from "mongodb";

const router = express.Router();

router.post('/', [
    verifyToken,
    body('content')
        .isLength({min: 1}).withMessage("Content is required")
        .isLength({max: 500}).withMessage("Content cannot exceed 500 characters")
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const { content } = req.body;
    const userId = req.user.userId; // This should be set by the authenticateToken middleware
    
    try {
        const db = await connectDB();

        const newPost = {
            userId: userId,
            content: content,
            createdAt: new Date()
        }

        const result = await db.collection('posts').insertOne(newPost);
        res.status(201).json({message: "New post created successfully", postId: result.insertedId});
    } catch {
        res.status(500).json({message: "Server Error"});
    }
});

router.get('/', [
    verifyToken,
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const db = await connectDB();
    const limit = parseInt(req.body.limit) || 10;
    const cursor = req.body.cursor;

    try {
        const query = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};
        const posts = await db.collection('posts')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray()
        
        const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt : null;

        res.status(200).json({ posts, nextCursor })
    } catch(err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id',[
    verifyToken,
], async (req, res) => {
    const id = req.params.id;

    if(!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Post Id'});
    }

    try {
        const db = await connectDB();

        const post = await db.collection('posts').findOne({ _id: new ObjectId(String(id)) });
        if(!post) {
            return res.status(404).json( { message: 'Post not found'} );
        }

        if(post.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this post' });
        }

        await db.collection('posts').deleteOne({_id: new ObjectId(String(id))});
        res.status(200).json({ message: 'Post deleted successfully'});
    }
    catch(err) {
        console.error('Error deleting post:', err);
        res.status(500).json({message: 'Server error'});
    }
});

router.post('/:id/like', (req, res) => {
    res.json({ message: 'Post liked API' });
});

export default router;