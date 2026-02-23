import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.model.js";
import bcrypt from "bcryptjs";

const updateAdmin = async () => {
    try {
        const uri = `${process.env.MONGO_URI}/${process.env.DB_NAME}?appName=Cluster0`;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB at", uri);

        // The precise email and password requested by the user
        const targetEmail = "ab.qrc123@gmail.com";
        const targetPassword = "Admin@123";

        let admin = await User.findOne({ email: targetEmail });

        if (admin) {
            admin.role = "admin";
            admin.password = await bcrypt.hash(targetPassword, 10);
            await admin.save();
            console.log(`Existing user ${targetEmail} updated to ADMIN role with new password.`);
        } else {
            const hashedPassword = await bcrypt.hash(targetPassword, 10);
            admin = await User.create({
                username: "Admin Abhinav",
                email: targetEmail,
                password: hashedPassword,
                role: "admin",
                status: "active"
            });
            console.log(`Created NEW admin user ${targetEmail} with password ${targetPassword}`);
        }

        // Aggressively demote ALL other admins
        const demotionResult = await User.updateMany(
            { email: { $ne: targetEmail }, role: "admin" },
            { $set: { role: "student" } }
        );
        console.log(`Demoted ${demotionResult.modifiedCount} other admins to student.`);

        mongoose.disconnect();
        console.log("Done.");
    } catch (error) {
        console.error("Error:", error);
        mongoose.disconnect();
    }
};

updateAdmin();
