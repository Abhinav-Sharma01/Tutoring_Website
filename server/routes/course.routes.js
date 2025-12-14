import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getTutorCourses,
    getCoursesByCategory,
    searchCourses
} from "../controllers/course.controller.js";

const router = express.Router();

// Create course (tutor/admin only)
router.post("/create", protect, createCourse);

// Get all courses
router.get("/", getAllCourses);

// Get single course
router.get("/:id", getCourseById);

// Update course
router.put("/:id", protect, updateCourse);

// Delete course
router.delete("/:id", protect, deleteCourse);

// Get tutor's courses
router.get("/tutor/:id", getTutorCourses);

// Get courses by category
router.get("/category/:category", getCoursesByCategory);

// Search courses
router.get("/search/query", searchCourses);

export default router;
