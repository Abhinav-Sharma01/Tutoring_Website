import { Review } from "../models/Review.model.js";
import { Course } from "../models/Course.model.js";

const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, rating, comment } = req.body;

        if (!courseId || !rating) {
            return res.status(400).json({ message: "Course and rating are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const existing = await Review.findOne({ userId, courseId });
        if (existing) {
            return res.status(400).json({ message: "You already reviewed this course" });
        }

        const review = await Review.create({
            userId,
            courseId,
            rating,
            comment
        });

        return res.status(201).json({
            message: "Review submitted successfully",
            review
        });

    } catch (error) {
        console.error("Create review error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = await Review.find({ courseId }).populate("userId", "username avatar_url");

        return res.status(200).json({
            total: reviews.length,
            reviews
        });

    } catch (error) {
        console.error("Get reviews error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.userId.toString() !== userId) {
            return res.status(403).json({ message: "Not allowed to edit this review" });
        }

        review.rating = req.body.rating ?? review.rating;
        review.comment = req.body.comment ?? review.comment;

        await review.save();

        res.status(200).json({
            message: "Review updated successfully",
            review
        });

    } catch (error) {
        console.error("Update review error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: "Review not found" });

        if (review.userId.toString() !== userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed to delete this review" });
        }

        await review.deleteOne();

        res.status(200).json({ message: "Review deleted successfully" });

    } catch (error) {
        console.error("Delete review error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};


export {
    createReview,
    getCourseReviews,
    updateReview,
    deleteReview
}


