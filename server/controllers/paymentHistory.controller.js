import { Enrollment } from "../models/Enrollment.model.js";

export const getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const history = await Enrollment.find({ studentId })
      .populate("courseId", "title")
      .select("courseId paymentStatus createdAt");

    res.json(history);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};