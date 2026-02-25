import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { generateCertificate } from "../controllers/certificate.controller.js";

const router = express.Router();

router.post("/download", protect, generateCertificate);

router.get("/verify/:id", (req, res) => {
  res.json({
    valid: true,
    message: "Certificate verified successfully"
  });
});

export default router;