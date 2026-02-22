import { Course } from "../models/Course.model.js";
import { Enrollment } from "../models/Enrollment.model.js";

export const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.find({ tutorId: instructorId });

    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      paymentStatus: "success",
    }).populate("courseId");

    const totalStudents = enrollments.length;

    const totalEarnings = enrollments.reduce((sum, e) => {
      return sum + (e.courseId.price || 0);
    }, 0);

    res.json({
      totalCourses: courses.length,
      totalStudents,
      totalEarnings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch instructor stats" });
  }
};
