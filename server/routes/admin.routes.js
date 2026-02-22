import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  getAllUsers,
  getAllCourses,
  deleteCourse
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", protect, isAdmin, getAllUsers);
router.get("/courses", protect, isAdmin, getAllCourses);
router.delete("/courses/:id", protect, isAdmin, deleteCourse);

export default router;