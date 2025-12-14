import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "tutoring/images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "tutoring/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "avi", "mkv"]
    }
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadVideo = multer({ storage: videoStorage });
