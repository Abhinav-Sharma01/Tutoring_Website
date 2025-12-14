import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/currUser",protect,getCurrentUser);

export default router;