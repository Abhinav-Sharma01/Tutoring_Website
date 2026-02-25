import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
    createReview,
    getCourseReviews,
    updateReview,
    deleteReview
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/create", protect, createReview);

router.get("/:courseId", getCourseReviews);

router.put("/update/:reviewId", protect, updateReview);

router.delete("/delete/:reviewId", protect, deleteReview);

export default router;


