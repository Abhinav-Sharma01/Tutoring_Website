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

router.post("/create", protect, createCourse);


router.get("/search/query", searchCourses);

router.get("/category/:category", getCoursesByCategory);

router.get("/tutor/:id", getTutorCourses);

router.get("/", getAllCourses);


router.get("/:id", getCourseById);

router.put("/:id", protect, updateCourse);

router.delete("/:id", protect, deleteCourse);

export default router;
