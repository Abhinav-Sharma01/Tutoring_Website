import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadImage, uploadVideo } from "../middlewares/multer.middleware.js";

import {
    uploadVideoFile,
    uploadAvatar,
    uploadThumbnail,
    uploadLessonVideo
} from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/video", protect, uploadVideo.single("video"), uploadVideoFile);

router.post("/avatar", protect, uploadImage.single("avatar"), uploadAvatar);

router.post("/thumbnail/:courseId", protect, uploadImage.single("thumbnail"), uploadThumbnail);

router.post("/lesson-video", protect, uploadVideo.single("video"), uploadLessonVideo);

export default router;


