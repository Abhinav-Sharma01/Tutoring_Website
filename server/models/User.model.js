import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "disabled"],
        default: "active"
    },
    role: {
        type: String,
        enum: ["student", "admin", "tutor"],
        default: "student",
        required: true,
    },
    avatar_url: {
        type: String,
        default: ""
    },
    about: {
        type: String,
        trim: true,
        default: ""
    },
    refreshToken: {
        type: String,
        default: ""
    },
    resetOtp: {
        type: String,
        default: null
    },
    resetOtpExpiry: {
        type: Date,
        default: null
    },
    lastLoginDate: {
        type: Date,
        default: null
    },
    currentStreak: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const User = mongoose.model("User", UserSchema);


