import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["active", "completed"],
        default: "active"
    },
    progress: {
        type: Number,
        default: 0
    },
    watchedVideos: [{
        type: Number
    }],
    paymentStatus: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "success"
    }
}, { timestamps: true });

enrollmentSchema.index(
    { studentId: 1, courseId: 1 },
    { unique: true }
);

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);


