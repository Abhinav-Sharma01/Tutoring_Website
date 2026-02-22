import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User.model.js";
import { Course } from "./models/Course.model.js";

const uri = `${process.env.MONGO_URI}/${process.env.DB_NAME}?appName=Cluster0`;

async function seed() {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    // Create tutor user
    let tutor = await User.findOne({ email: "tutor@tutorpro.com" });
    if (!tutor) {
        const hash = await bcrypt.hash("Tutor@123", 10);
        tutor = await User.create({
            username: "Abhinav Sharma",
            email: "tutor@tutorpro.com",
            password: hash,
            role: "tutor",
            status: "active",
            about: "Full Stack Developer & Instructor",
            avatar_url: "",
        });
        console.log("Tutor created:", tutor._id);
    } else {
        console.log("Tutor exists:", tutor._id);
    }

    const courses = [
        {
            title: "Complete Web Development Bootcamp",
            description: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build 10+ real-world projects and become a full stack developer.",
            price: 499,
            category: "web development",
            level: "beginner",
            tutorId: tutor._id,
            lessons: [
                { title: "Introduction to HTML", duration: "45 min" },
                { title: "CSS Fundamentals & Flexbox", duration: "60 min" },
                { title: "JavaScript Basics", duration: "55 min" },
                { title: "DOM Manipulation", duration: "50 min" },
                { title: "React Components & State", duration: "70 min" },
                { title: "Node.js & Express Setup", duration: "45 min" },
                { title: "MongoDB & Mongoose", duration: "60 min" },
                { title: "Building REST APIs", duration: "65 min" },
                { title: "Authentication & Security", duration: "55 min" },
                { title: "Deploying Your App", duration: "40 min" },
            ],
        },
        {
            title: "React.js Masterclass",
            description: "Deep dive into React.js — hooks, context, routing, state management, and performance optimization. Build production-ready apps.",
            price: 399,
            category: "frontend",
            level: "intermediate",
            tutorId: tutor._id,
            lessons: [
                { title: "React Fundamentals Review", duration: "30 min" },
                { title: "Hooks Deep Dive", duration: "55 min" },
                { title: "Context API & State", duration: "50 min" },
                { title: "React Router v6", duration: "45 min" },
                { title: "Custom Hooks", duration: "40 min" },
                { title: "Performance Optimization", duration: "50 min" },
                { title: "Testing React Apps", duration: "60 min" },
                { title: "Building a Dashboard", duration: "70 min" },
            ],
        },
        {
            title: "Python for Data Science",
            description: "Master Python programming, data analysis with Pandas, visualization with Matplotlib, and intro to machine learning with scikit-learn.",
            price: 599,
            category: "data science",
            level: "beginner",
            tutorId: tutor._id,
            lessons: [
                { title: "Python Basics", duration: "50 min" },
                { title: "Data Types & Functions", duration: "45 min" },
                { title: "NumPy for Computation", duration: "55 min" },
                { title: "Pandas DataFrames", duration: "60 min" },
                { title: "Data Cleaning", duration: "50 min" },
                { title: "Matplotlib & Seaborn", duration: "55 min" },
                { title: "Intro to Machine Learning", duration: "65 min" },
                { title: "Regression Models", duration: "60 min" },
                { title: "Classification Models", duration: "55 min" },
            ],
        },
        {
            title: "UI/UX Design Fundamentals",
            description: "Learn design thinking, wireframing, prototyping, and user research. Create stunning interfaces using Figma and modern design principles.",
            price: 349,
            category: "design",
            level: "beginner",
            tutorId: tutor._id,
            lessons: [
                { title: "Design Thinking Process", duration: "40 min" },
                { title: "Color Theory & Typography", duration: "45 min" },
                { title: "Wireframing Techniques", duration: "50 min" },
                { title: "Figma Basics", duration: "55 min" },
                { title: "Component Design Systems", duration: "60 min" },
                { title: "User Research Methods", duration: "45 min" },
                { title: "Prototyping & Testing", duration: "50 min" },
            ],
        },
    ];

    for (const c of courses) {
        const exists = await Course.findOne({ title: c.title });
        if (!exists) {
            await Course.create(c);
            console.log("Created:", c.title);
        } else {
            console.log("Exists:", c.title);
        }
    }

    console.log("Seeding complete!");
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((e) => { console.error("Seed error:", e.message); process.exit(1); });
