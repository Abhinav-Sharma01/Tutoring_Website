import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    getUserNotifications,
    clearAllNotifications,
    deleteNotification
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.delete("/clear-all", protect, clearAllNotifications);
router.delete("/:id", protect, deleteNotification);

export default router;
