import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";

const app = express();

// Simple CORS: set FRONTEND_URL in env to restrict origin; set CORS_ALLOW_ALL=true to allow all
const FRONTEND_URL = process.env.FRONTEND_URL || "https://smart-helper-17eu0a3a1-samarth-75s-projects.vercel.app";
if (process.env.CORS_ALLOW_ALL === "true" || !FRONTEND_URL) {
  app.use(cors());
} else {
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
}

app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/test", testRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/posts", postsRoutes);

// Start
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend running on port ${port}`));

export default app;
