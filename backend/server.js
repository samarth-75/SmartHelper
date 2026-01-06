import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import "./config/db.js";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/reviews", reviewsRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
