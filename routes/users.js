import express from "express";
import { uploadPhoto, resizeAndUploadPhoto } from "../middleware/imageUploadMiddleware.js";
import verifyToken from '../middleware/auth.js';
import { body, validationResult } from "express-validator";
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

const router =  express.Router()

router.put('/:id/profilePicture', uploadPhoto.array('images', 1), [
    verifyToken
], async (req, res, next) => {
    if(!req.files || req.files.length === 0) {
        return res.status(400).json({message: "A profile picture must be uploaded"})
    }

    next();
}, resizeAndUploadPhoto, async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'A profile picture must be uploaded' });
    }
    try {
        const db = await connectDB();
        const id = req.params.id;
        const user = await db.collection('Users').findOne({_id: new ObjectId(String(id))});
        const profilePictureUrl = req.imageUrls[0];
    
        if(!user) {
            return res.status(404).json({message: 'User does not exist' });
        }

        if(id !== req.user.userId) {
            return res.status(403).json({message: 'You can only update your own profile picture'});
        }


    
        const result = await db.collection('Users').updateOne(
            {_id: new ObjectId(String(id))},
            {   $set: {"profilePicture": profilePictureUrl} }
        )

        if(result.modifiedCount === 0) {
            return res.status(400).json({message: 'Failed to update profile picture'});
        }

        res.status(200).json({
            message: 'Profile picture updated successfully!',
            profilePicture: profilePictureUrl
        });
    } catch(err) {
        console.error("Server Error:", err);
        return res.status(500).json({message: 'Profile picture failed to update'});
    }
})

router.put('/:id/bio', [
    verifyToken,
    body('biography')
        .isLength({ min: 1, max: 150 })
        .withMessage('Biography must be between 1 and 150 characters.')
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const db = await connectDB();
        const id = req.params.id;
        const user = await db.collection('Users').findOne({_id: new ObjectId(String(id))});
        const { biography } = req.body;
    
        if(!user) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        if(id !== req.user.userId) {
            return res.status(403).json({message: 'You can only update your own biography'});
        }

        const result = await db.collection('Users').updateOne(
            {_id: new ObjectId(String(id))},
            {   $set: {"biography": biography} }
        )

        if(result.modifiedCount === 0) {
            return res.status(400).json({message: 'Failed to update user biography or biography is equal to this request'});
        }

        res.status(200).json({
            message: 'User biography updated successfully!',
            biography: biography
        });

    } catch(err) {
        console.error("Server Error:", err);
        return res.status(500).json({message: 'User biography failed to update'});
    }
})

export default router