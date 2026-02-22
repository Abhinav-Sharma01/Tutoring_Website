import { Enrollment } from "../models/Enrollment.model.js";
import { Course } from "../models/Course.model.js";

const enrollCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "CourseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Prevent duplicate enrollment
    const exists = await Enrollment.findOne({ studentId, courseId });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: "active",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      message: "Enrollment created successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ studentId }).populate(
      "courseId",
    );

    res.status(200).json({
      total: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Get enrollments error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkEnrollment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({ studentId, courseId });

    return res.status(200).json({
      enrolled: !!enrollment,
    });
  } catch (error) {
    console.error("Check enrollment error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const completeCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    const enrollment = await Enrollment.findOne({ studentId, courseId });

    if (!enrollment) {
      return res
        .status(404)
        .json({ message: "You are not enrolled in this course" });
    }

    enrollment.status = "completed";
    await enrollment.save();

    res.status(200).json({
      message: "Course marked as completed",
    });
  } catch (error) {
    console.error("Complete course error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getEnrollmentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const total = await Enrollment.countDocuments({ studentId });
    const completed = await Enrollment.countDocuments({
      studentId,
      status: "completed",
    });

    const pending = total - completed;

    res.json({
      total,
      completed,
      pending,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export {
    enrollCourse,
    getMyEnrollments,
    checkEnrollment,
    completeCourse,
    getEnrollmentStats
};

