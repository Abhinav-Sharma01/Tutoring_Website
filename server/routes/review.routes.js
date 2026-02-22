import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
    createReview,
    getCourseReviews,
    updateReview,
    deleteReview
} from "../controllers/review.controller.js";

const router = express.Router();

// Create review
router.post("/create", protect, createReview);

// Get reviews for a course
router.get("/:courseId", getCourseReviews);

// Update review
router.put("/update/:reviewId", protect, updateReview);

// Delete review
router.delete("/delete/:reviewId", protect, deleteReview);

export default router;


