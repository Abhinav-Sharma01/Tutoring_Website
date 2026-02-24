import { User } from "../models/User.model.js";
import { Course } from "../models/Course.model.js";
import { Enrollment } from "../models/Enrollment.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    const enrichedUsers = await Promise.all(users.map(async (u) => {
      const userObj = u.toObject();
      if (u.role === "student") {
        const enrollments = await Enrollment.find({ studentId: u._id }).populate("courseId", "title");
        userObj.enrolledCourses = enrollments.map(e => e.courseId?.title).filter(Boolean);
      }
      if (u.role === "tutor" || u.role === "admin") {
        const courses = await Course.find({ tutorId: u._id }).select("title");
        userObj.createdCourses = courses.map(c => c.title);
      }
      return userObj;
    }));
    res.json(enrichedUsers);
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

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Cascade deletion based on role
    if (user.role === "tutor") {
      // Find all courses created by this tutor
      const tutorCourses = await Course.find({ tutorId: user._id });
      const courseIds = tutorCourses.map(c => c._id);

      // Delete all enrollments attached to those specific courses 
      await Enrollment.deleteMany({ courseId: { $in: courseIds } });

      // Delete the actual courses
      await Course.deleteMany({ tutorId: user._id });
    } else if (user.role === "student") {
      // Delete all of this student's enrollments
      await Enrollment.deleteMany({ studentId: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
};