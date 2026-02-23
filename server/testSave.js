import "dotenv/config";
import mongoose from "mongoose";
import { Course } from "./models/Course.model.js";

const testSave = async () => {
    try {
        const uri = `${process.env.MONGO_URI}/${process.env.DB_NAME}?appName=Cluster0`;
        await mongoose.connect(uri);

        const course = await Course.findOne();
        if (!course) {
            console.log("No courses found.");
            process.exit(0);
        }

        console.log("Found course:", course.title);
        // Try saving the exact existing course without modifications, just to trigger Mongoose validation.
        course.markModified("lessons"); // force Mongoose to validate the arrays
        await course.save();
        console.log("Save successful!");
    } catch (error) {
        console.error("Save Error:", error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- ${key}: ${error.errors[key].message}`);
            });
        }
    } finally {
        mongoose.disconnect();
    }
};

testSave();
