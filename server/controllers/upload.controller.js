import { User } from "../models/User.model.js";
import { Course } from "../models/Course.model.js";



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


export{
    uploadAvatar,
    uploadThumbnail,
    uploadLessonVideo
}


