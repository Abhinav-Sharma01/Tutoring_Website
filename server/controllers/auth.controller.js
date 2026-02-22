import { User } from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        const { username, email, password, about } = req.body;

        if ([username, email, password].some((field) => !field || field.trim() === "")) {
            return res.status(400).json({ message: "All fields are must required..." });
        }

        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        })
        if (userExists) {
            return res.status(400).json({ message: "Email or username already exists..." });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashpassword,
            about,
            status: "active",
            avatar_url: "",
            role: "student",
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

        res.status(201).json({
            message: "User registered successfully",
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
        return res.status(500).json({ message: "Internal server error while registering the user..." });
    }
}


const loginUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!password) {
            return res.status(401).json({ message: "Password is required..." });
        }

        if (!email && !username) {
            return res.status(401).json({ message: "Username or Email is required..." });
        }

        let loginEmail;
        if (email) {
            loginEmail = email.toLowerCase();
        }

        const userExists = await User.findOne({
            $or: [{ username }, { email: loginEmail }]
        })

        if (!userExists) {
            return res.status(404).json({ message: "User didn't exists" })
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
            message: "User successfully logged-In..",
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

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
}