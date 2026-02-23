import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.model.js";
import bcrypt from "bcryptjs";

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        let admin = await User.findOne({ email: "ab.qrc123@gmail.com" });

        if (admin) {
            admin.role = "admin";
            await admin.save();
            console.log("Existing user ab.qrc123@gmail.com updated to ADMIN role.");
        } else {
            const hashedPassword = await bcrypt.hash("Admin@123", 10);
            admin = await User.create({
                username: "Admin Abhinav",
                email: "ab.qrc123@gmail.com",
                password: hashedPassword,
                role: "admin",
                status: "active"
            });
            console.log("Created NEW admin user ab.qrc123@gmail.com with password Admin@123");
        }

        // Demote any other admins just in case
        await User.updateMany(
            { email: { $ne: "ab.qrc123@gmail.com" }, role: "admin" },
            { $set: { role: "student" } }
        );
        console.log("Ensured no other admins exist.");

        mongoose.disconnect();
        console.log("Done.");
    } catch (error) {
        console.error("Error:", error);
        mongoose.disconnect();
    }
};

updateAdmin();
