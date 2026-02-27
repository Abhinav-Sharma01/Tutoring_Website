import { User } from "../models/User.model.js";
import { Course } from "../models/Course.model.js";
import cloudinary from "../config/cloudinary.js";



const uploadVideoFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video uploaded" });
        }
        res.status(200).json({
            message: "Video uploaded successfully",
            videoUrl: req.file.path
        });
    } catch (error) {
        res.status(500).json({ message: "Video upload failed" });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { avatar_url: req.file.path },
            { new: true }
        );

        res.status(200).json({
            message: "Avatar uploaded successfully",
            avatar_url: user.avatar_url
        });

    } catch (error) {
        res.status(500).json({ message: "Avatar upload failed" });
    }
};



const uploadThumbnail = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const course = await Course.findByIdAndUpdate(
            courseId,
            { thumbnail: req.file.path },
            { new: true }
        );

        res.status(200).json({
            message: "Thumbnail uploaded successfully",
            thumbnail: course.thumbnail
        });

    } catch (error) {
        res.status(500).json({ message: "Thumbnail upload failed" });
    }
};


const uploadLessonVideo = async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No video uploaded" });
        }

        const course = await Course.findById(courseId);

        course.lessons[lessonIndex].videoUrl = req.file.path;
        await course.save();

        res.status(200).json({
            message: "Video uploaded successfully",
            videoUrl: req.file.path
        });

    } catch (error) {
        res.status(500).json({ message: "Video upload failed" });
    }
};


export const getCloudinarySignature = (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);
        const folder = req.query.folder || 'tutoring/videos';

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder,
        }, process.env.CLOUDINARY_API_SECRET);

        res.status(200).json({
            signature,
            timestamp,
            folder,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY
        });
    } catch (error) {
        console.error("Signature error:", error);
        res.status(500).json({ message: "Failed to generate upload signature" });
    }
}

export {
    uploadVideoFile,
    uploadAvatar,
    uploadThumbnail,
    uploadLessonVideo
}


