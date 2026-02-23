import express from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser, googleAuth, forgotPassword, resetPassword, submitContactForm } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/logout", protect, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/contact", submitContactForm);
router.get("/currUser", protect, getCurrentUser);
router.get("/me", protect, getCurrentUser);

export default router;