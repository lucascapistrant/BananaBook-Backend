import express from "express";
import { uploadPhoto, resizeAndUploadPhoto } from "../middleware/imageUploadMiddleware.js";
import verifyToken from '../middleware/auth.js';
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

const router =  express.Router()

router.put('/:id/profilePicture', uploadPhoto.array('images', 1), [
    verifyToken
], resizeAndUploadPhoto, async (req, res) => {
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

export default router