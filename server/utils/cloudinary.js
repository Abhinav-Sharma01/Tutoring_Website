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

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect video vs image
            folder: "tutorpro_videos",
        });

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

export const deleteFromCloudinary = async (cloudUrl) => {
    try {
        if (!cloudUrl) return null;

        const urlParts = cloudUrl.split("/");
        const filenameWithExt = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        const filename = filenameWithExt.split(".")[0];
        const publicId = `${folder}/${filename}`;

        const isVideo = cloudUrl.includes("/video/");
        const resourceType = isVideo ? "video" : "image";

        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return response;
    } catch (error) {
        console.error("Cloudinary delete failed:", error);
        return null;
    }
};
