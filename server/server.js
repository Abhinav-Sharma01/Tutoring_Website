import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import paymentHistoryRoutes from "./routes/paymentHistory.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://tutoring-website-one-omega.vercel.app",
  "https://tutoring-website-qgjl.vercel.app"
].filter(Boolean);

// Helper to check origin
const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);

  // Remove trailing slash if present for strict comparison
  const originWithoutSlash = origin.endsWith("/") ? origin.slice(0, -1) : origin;

  const isAllowed = allowedOrigins.some(allowed => {
    const allowedWithoutSlash = allowed.endsWith("/") ? allowed.slice(0, -1) : allowed;
    return originWithoutSlash === allowedWithoutSlash;
  });

  if (isAllowed) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

const corsOptions = {
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Explicit headers middleware just in case vercel strips it
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  next();
});

app.use(morgan("dev"));

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Await connection dynamically for Vercel
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/payment-history", paymentHistoryRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running... Vercel Deployment Successful." });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

export default app;
