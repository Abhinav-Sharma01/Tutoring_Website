import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

export const protect = async (req, res, next) => {
    try {
        if (!JWT_ACCESS_TOKEN_SECRET || !JWT_REFRESH_TOKEN_SECRET) {
            return res.status(500).json({ message: "Server auth configuration error" });
        }
        let userId = null;

        const accessToken = req.cookies?.accessToken;
        if (accessToken) {
            try {
                let decoded = jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET);
                userId = decoded.id;
            } catch (error) { }
        }

        let needsNewToken = false;
        if (!userId) {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: "Not authorized..." });
            }

            try {
                const decoded = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);
                userId = decoded.id;
                needsNewToken = true;
            } catch (error) {
                return res.status(401).json({ message: "Refresh token invalid or expired" });
            }
        }

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }
        if (user.status === "disabled") {
            return res.status(403).json({ message: "Account is disabled" });
        }

        req.user = user;

        if (needsNewToken) {
            const newaccessToken = jwt.sign(
                { id: user._id, role: user.role },
                JWT_ACCESS_TOKEN_SECRET,
                { expiresIn: "15m" }
            )
            const isProduction = process.env.NODE_ENV === "production";
            res.cookie("accessToken", newaccessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
}

