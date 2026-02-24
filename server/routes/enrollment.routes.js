import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
    enrollCourse,
    getMyEnrollments,
    checkEnrollment,
    completeCourse,
    getEnrollmentStats,
    adminEnrollStudent
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// Enroll in a course
router.post("/enroll", protect, enrollCourse);

// Admin bypass enrollment
router.post("/admin-enroll", protect, adminEnrollStudent);

// Get student's enrolled courses
router.get("/my-enrollments", protect, getMyEnrollments);

// Check if student is enrolled
router.get("/check/:courseId", protect, checkEnrollment);

// Mark course as completed
router.post("/complete", protect, completeCourse);

router.get("/stats", protect, getEnrollmentStats);

export default router;


