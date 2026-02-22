import { User } from "../models/User.model.js";
import { Course } from "../models/Course.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("tutorId", "username email");
    res.json(courses);
  } catch (error) {
    console.error("Admin get courses error:", error.message);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted" });
  } catch (error) {
    console.error("Admin delete course error:", error.message);
    res.status(500).json({ message: "Failed to delete course" });
  }
};