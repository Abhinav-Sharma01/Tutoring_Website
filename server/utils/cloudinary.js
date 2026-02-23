import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect video vs image
            folder: "tutorpro_videos",
        });

        // File has been uploaded successfully
        fs.unlinkSync(localFilePath); // Remove locally saved temporary file
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove locally saved temporary file if operation failed
        }
        return null;
    }
};
