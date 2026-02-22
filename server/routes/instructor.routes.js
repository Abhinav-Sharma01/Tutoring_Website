import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getInstructorStats } from "../controllers/instructor.controller.js";

const router = express.Router();

router.get("/stats", protect, getInstructorStats);

export default router;