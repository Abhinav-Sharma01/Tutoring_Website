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

router.post("/enroll", protect, enrollCourse);

router.post("/admin-enroll", protect, adminEnrollStudent);

router.get("/my-enrollments", protect, getMyEnrollments);

router.get("/check/:courseId", protect, checkEnrollment);

router.post("/complete", protect, completeCourse);

router.get("/stats", protect, getEnrollmentStats);

export default router;


