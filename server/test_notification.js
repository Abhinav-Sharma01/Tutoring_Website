import "dotenv/config";
import mongoose from "mongoose";
import { Notification } from "./models/Notification.model.js";

// Uses the hardcoded specific user ID of the Admin account logic from earlier seeding
const TEST_USER_ID = "67b9d5c3672d93e50b73b22e"; // Assuming this is Admin Abhinav's ID, or it will just float in DB

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // We don't know the exact current user ID without checking the DB, 
        // so we'll just insert a notification for EVERY user in the DB to guarantee the logged-in user sees it.
        const { User } = await import("./models/User.model.js");
        const users = await User.find({});

        let count = 0;
        for (const user of users) {
            await Notification.create({
                recipient: user._id,
                title: "🌟 New Feature: Notifications!",
                message: "This is a test notification. The new real-time Bell icon is now live on the platform. Try marking this message as read, or deleting it!",
                type: "info"
            });
            count++;
        }

        console.log(`Successfully generated ${count} test notifications!`);
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
