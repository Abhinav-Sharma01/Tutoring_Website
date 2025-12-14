import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
    enrollCourse,
    getMyEnrollments,
    checkEnrollment,
    completeCourse
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// Enroll in a course
router.post("/enroll", protect, enrollCourse);

// Get student's enrolled courses
router.get("/my-enrollments", protect, getMyEnrollments);

// Check if student is enrolled
router.get("/check/:courseId", protect, checkEnrollment);

// Mark course as completed
router.post("/complete", protect, completeCourse);

export default router;
