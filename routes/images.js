import express from "express";
import { uploadPhoto, resizeAndUploadPhoto } from "../middleware/imageUploadMiddleware.js";

const router = express.Router();

router.post('/upload', uploadPhoto.array('images', 5),
resizeAndUploadPhoto, (req, res) => {
    res.status(200).json({
        message: "Images upload successfully",
        urls: req.imageUrls,
    })
})

export default router