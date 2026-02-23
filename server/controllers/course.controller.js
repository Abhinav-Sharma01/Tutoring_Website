import express from "express";
import { User } from "../models/User.model.js";
import { Course } from "../models/Course.model.js";

const createCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const userData = await User.findById(userId);

        if (userData.role !== "tutor" && userData.role !== "admin") {
            return res.status(403).json({ message: "Not allowed to create a course" });
        }

        const { title, description, price, category, level, lessons, thumbnail } = req.body;

        if (!title || !description || !price || !category || !level || !lessons) {
            return res.status(400).json({ message: "All fields are required..." });
        }

        const courseExists = await Course.findOne({ title });
        if (courseExists) {
            return res.status(400).json({ message: "Course title already exists..." });
        }

        const course = await Course.create({
            title,
            description,
            price,
            category,
            thumbnail,
            level,
            lessons,
            tutorId: userData._id
        })

        res.status(201).json({ message: "Course created successfully..", course });
    } catch (error) {
        console.error("Create course error", error.message);
        return res.status(500).json({ message: "Internal server error while creating the course..." });
    }
}

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({})
            .populate("tutorId", "username email avatar_url");

        res.status(200).json({
            message: "All courses fetched successfully",
            total: courses.length,
            courses
        });
    } catch (error) {
        console.error("Error fetching all courses:", error.message);
        return res.status(500).json({
            message: "Internal server error while fetching courses"
        });
    }
};

const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId)
            .populate("tutorId", "username email avatar_url");

        if (!course) {
            return res.status(404).json({ message: "Course not found..." });
        }

        res.status(200).json({
            message: "Course fetched successfully",
            course
        });

    } catch (error) {
        console.error("Error fetching single course:", error.message);
        res.status(500).json({
            message: "Internal server error while fetching course..."
        });
    }
};


const updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.id;

        const user = await User.findById(userId);

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (user.role !== "admin" && course.tutorId.toString() !== userId) {
            return res.status(403).json({ message: "Not allowed to update this course" });
        }

        const allowedUpdates = ["title", "description", "price", "category", "thumbnail", "level", "lessons"];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                course[field] = req.body[field];
            }
        });

        await course.save();

        res.status(200).json({
            message: "Course updated successfully",
            course,
        });

    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({ message: "Internal server error while updating course", error: error.message, stack: error.stack });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const allowedTutor = course.tutorId.toString() === user._id.toString();
        const isAdmin = user.role === "admin";

        if (!allowedTutor && !isAdmin) {
            return res.status(403).json({ message: "You are not allowed to delete this course..." });
        }

        await course.deleteOne();

        return res.status(200).json({
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.error("Delete course error:", error.message);
        return res.status(500).json({
            message: "Internal server error while deleting course"
        });
    }
};

const getTutorCourses = async (req, res) => {
    try {
        const tutorId = req.params.id;

        const tutor = await User.findById(tutorId);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        if (tutor.role !== "tutor" && tutor.role !== "admin") {
            return res.status(400).json({ message: "This user is not a tutor" });
        }

        const courses = await Course.find({ tutorId })
            .populate("tutorId", "username email avatar_url");

        res.status(200).json({
            message: "Courses fetched successfully",
            courses
        });

    } catch (error) {
        console.error("Get tutor courses error:", error.message);
        return res.status(500).json({
            message: "Internal server error while fetching tutor courses"
        });
    }
};

const getCoursesByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category || category.trim() === "") {
            return res.status(400).json({ message: "Category is required" });
        }

        const courses = await Course.find({ category }).populate("tutorId", "username email avatar_url");

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found in this category" });
        }

        return res.status(200).json({
            message: "Courses fetched successfully",
            results: courses.length,
            courses
        });

    } catch (error) {
        console.error("Get courses by category error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const searchCourses = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || keyword.trim() === "") {
            return res.status(400).json({ message: "Keyword is required" });
        }

        const courses = await Course.find({
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).populate("tutorId", "username avatar_url");

        if (courses.length === 0) {
            return res.status(404).json({ message: "No matching courses found" });
        }

        return res.status(200).json({
            message: "Search results",
            results: courses.length,
            courses
        });

    } catch (error) {
        console.error("Search error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getTutorCourses,
    getCoursesByCategory,
    searchCourses
}


