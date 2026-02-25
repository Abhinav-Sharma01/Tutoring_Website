import { Enrollment } from "../models/Enrollment.model.js";
import { Course } from "../models/Course.model.js";
import { User } from "../models/User.model.js";

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

const adminEnrollStudent = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can perform this action" });
    }

    const { courseId, email } = req.body;

    if (!courseId || !email) {
      return res.status(400).json({ message: "Course ID and Student Email are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "No user found with that email address" });
    }

    const studentId = targetUser._id;

    const exists = await Enrollment.findOne({ studentId, courseId });
    if (exists) {
      return res.status(400).json({ message: "Student is already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      studentId,
      courseId,
      status: "active",
      paymentStatus: "success", // Marked success for instructor dashboard earnings
    });

    return res.status(201).json({
      message: "Student successfully enrolled by Admin",
      enrollment,
    });
  } catch (error) {
    console.error("Admin enrollment error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkEnrollment = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    if (req.user.role === "admin") {
      return res.status(200).json({ enrolled: true });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role === "tutor" && course.tutorId.toString() === studentId) {
      return res.status(200).json({ enrolled: true });
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });

    return res.status(200).json({
      enrolled: !!enrollment,
      enrollment
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
    enrollment.progress = 100;

    // Also mark all lessons as watched so the UI checkmarks sync up if they visit Course Details later
    const course = await Course.findById(courseId);
    if (course && course.lessons) {
      enrollment.watchedVideos = course.lessons.map((_, i) => i);
    }

    await enrollment.save();

    res.status(200).json({
      message: "Course marked as completed",
    });
  } catch (error) {
    console.error("Complete course error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const markVideoWatched = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, lessonIndex } = req.body;

    if (!courseId || typeof lessonIndex !== "number") {
      return res.status(400).json({ message: "Course ID and Lesson Index are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "You are not enrolled in this course" });
    }

    if (!enrollment.watchedVideos.includes(lessonIndex)) {
      enrollment.watchedVideos.push(lessonIndex);
    }

    const totalLessons = course.lessons.length;
    const progress = totalLessons > 0
      ? Math.floor((enrollment.watchedVideos.length / totalLessons) * 100)
      : 0;

    enrollment.progress = progress;

    if (progress === 100) {
      enrollment.status = "completed";
    } else {
      enrollment.status = "active";
    }

    await enrollment.save();

    res.status(200).json({
      message: "Video progress saved",
      progress: enrollment.progress,
      status: enrollment.status,
      watchedVideos: enrollment.watchedVideos
    });
  } catch (error) {
    console.error("Mark video watched error:", error.message);
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
  adminEnrollStudent,
  checkEnrollment,
  completeCourse,
  getEnrollmentStats,
  markVideoWatched
};

