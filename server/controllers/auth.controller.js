import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendOtpEmail, sendContactEmail } from "../utils/email.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    try {
        const { username, email, password, about, role } = req.body;

        if ([username, email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ message: "Looks like you missed a few fields. Please fill them all in." });
        }

        const userRole = (role === "tutor") ? "tutor" : "student";

        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        })
        if (userExists) {
            return res.status(400).json({ message: "That email or username is already taken. Try another one!" });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashpassword,
            about,
            status: "active",
            avatar_url: "",
            role: userRole,
        });

        const RefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )

        const AccessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        )

        user.refreshToken = RefreshToken;
        await user.save();

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOpts = {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
        };
        res.cookie("refreshToken", RefreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .cookie("accessToken", AccessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });

        await Notification.create({
            recipient: user._id,
            title: "Welcome to TutorPro! 🎉",
            message: "Hey there, so glad you joined! Head over to Settings to drop in a profile picture and tell us a bit about yourself.",
            type: "success"
        });

        res.status(201).json({
            message: "You're successfully signed up!",
            AccessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                about: user.about,
                avatar_url: user.avatar_url,
            }
        })


    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ message: "Oops, something went wrong on our end while signing you up." });
    }
}


const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!password) {
            return res.status(401).json({ message: "Password is required..." });
        }

        if (!email && !username) {
            return res.status(400).json({ message: "Please provide your email or username to log in." });
        }

        let loginEmail;
        if (email) {
            loginEmail = email.toLowerCase();
        }

        const userExists = await User.findOne({
            $or: [{ username }, { email: loginEmail }]
        })

        if (!userExists) {
            return res.status(404).json({ message: "We couldn't find an account with those details." })
        }

        const isPasswordCorrect = await bcrypt.compare(password, userExists.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Password is incorrect..." });
        }

        if (userExists.status === "disabled") {
            return res.status(403).json({ message: "Your account is disabled..." });
        }

        const AccessToken = jwt.sign(
            { id: userExists._id, role: userExists.role },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        )

        const RefreshToken = jwt.sign(
            { id: userExists._id },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )

        userExists.refreshToken = RefreshToken;
        await userExists.save();


        const isProduction = process.env.NODE_ENV === "production";
        const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: "lax" };
        res.cookie("refreshToken", RefreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .cookie("accessToken", AccessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });

        res.status(200).json({
            message: "Welcome back!",
            AccessToken,
            user: {
                id: userExists._id,
                username: userExists.username,
                email: userExists.email,
                status: userExists.status,
                about: userExists.about,
                role: userExists.role,
                avatar_url: userExists.avatar_url
            }
        });


    } catch (error) {
        console.error("Error occurred while logging the user", error.message);
        res.status(500).json({ message: "Internal server error while logging the user..." });
    }
}


const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const currUserData = await User.findById(userId).select("-password -refreshToken");

        res.status(200).json({
            message: "Here are the current user details..",
            user: {
                id: currUserData._id,
                username: currUserData.username,
                email: currUserData.email,
                status: currUserData.status,
                role: currUserData.role,
                avatar_url: currUserData.avatar_url,
                about: currUserData.about
            }
        })

    } catch (error) {
        console.error("Error occurred while getting the current user details", error.message);
        return res.status(500).json({ message: "Internal server error occurred while getting the current user details..." });
    }
}



const logoutUser = async (req, res) => {
    try {
        res.clearCookie("accessToken", { httpOnly: true, sameSite: "lax" })
            .clearCookie("refreshToken", { httpOnly: true, sameSite: "lax" });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Logout failed" });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);
            user = await User.create({
                username: name,
                email,
                password: randomPassword,
                status: "active",
                avatar_url: picture || "",
                role: "student",
                about: "",
            });
        }

        if (user.status === "disabled") {
            return res.status(403).json({ message: "Your account is disabled" });
        }

        const AccessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        const RefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = RefreshToken;
        if (picture && !user.avatar_url) user.avatar_url = picture;
        await user.save();

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: "lax" };
        res.cookie("refreshToken", RefreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 })
            .cookie("accessToken", AccessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });

        res.status(200).json({
            message: "Google login successful",
            AccessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                about: user.about,
                avatar_url: user.avatar_url,
            },
        });
    } catch (error) {
        console.error("Google auth error:", error.message);
        return res.status(500).json({ message: "Google authentication failed" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.resetOtp = hashedOtp;
        user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.status(200).json({ message: "we sent a reset code to your email!" });
    } catch (error) {
        console.error("Forgot password error:", error.message);
        res.status(500).json({ message: "Failed to send OTP. Check your email configuration." });
    }
};

const submitContactForm = async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const fullName = `${firstName} ${lastName}`;
        await sendContactEmail(fullName, email, message);

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.resetOtp || !user.resetOtpExpiry) {
            return res.status(400).json({ message: "No OTP request found. Please request a new one." });
        }
        if (new Date() > user.resetOtpExpiry) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const isValid = await bcrypt.compare(otp, user.resetOtp);
        if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        await Notification.create({
            recipient: user._id,
            title: "Security Alert: Password Changed",
            message: "Just a heads up—your password was just changed. If that wasn't you, please reach out to us right away.",
            type: "warning"
        });

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset password error:", error.message);
        res.status(500).json({ message: "Failed to reset password" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, about, avatar_url } = req.body;

        if (username || email) {
            const query = [];
            if (username) query.push({ username: new RegExp(`^${username}$`, "i") });
            if (email) query.push({ email: email.toLowerCase() });

            const existingUser = await User.findOne({
                _id: { $ne: userId },
                $or: query
            });

            if (existingUser) {
                if (existingUser.username.toLowerCase() === username?.toLowerCase()) {
                    return res.status(400).json({ message: "Looks like someone already grabbed that username." });
                }
                if (existingUser.email === email?.toLowerCase()) {
                    return res.status(400).json({ message: "That email is already tied to an account." });
                }
            }
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email.toLowerCase();
        if (about !== undefined) updateData.about = about;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password -refreshToken");

        if (!updatedUser) return res.status(404).json({ message: "User not found." });

        await Notification.create({
            recipient: updatedUser._id,
            title: "Profile Updated ✨",
            message: "Looking good! Your profile changes have been saved.",
            type: "success"
        });

        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status,
                about: updatedUser.about,
                avatar_url: updatedUser.avatar_url,
            }
        });

    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ message: "Failed to update profile." });
    }
};

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    googleAuth,
    forgotPassword,
    resetPassword,
    submitContactForm
}