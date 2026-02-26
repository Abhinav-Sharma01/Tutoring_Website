import mongoose, { Schema } from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    thumbnail: {
        type: String,
        default: ""
    },
    lessons: [
        {
            title: { type: String, required: true },
            duration: { type: String, default: "" },
            videoUrl: { type: String, default: "" }
        }
    ],
    category: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },
    tutorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true })

export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
