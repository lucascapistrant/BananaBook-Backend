import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";

const uploadPhoto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('File must be an image'), false);
    },
});

const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(options, (error, result) => {
            if(error) reject(error)
            else resolve(result)
        }).end(buffer)
    })
}

const resizeAndUploadPhoto = async (req, res, next) => {

    try {
        // adjust the mapping to pass the file buffer and options to uploadToCloudinary
        const uploadPromises = req.files.map(file => {
            return uploadToCloudinary(file.buffer, {
                transformation: [{ width: 200, height: 200, crop: "limit"}]
            })
        });

        const results = await Promise.all(uploadPromises);
        req.imageUrls = results.map(result => result.url) // store the URLs for the uploaded image
        next();
    }
    catch(err) {
        next(err);
    }
}

export {uploadPhoto, resizeAndUploadPhoto};