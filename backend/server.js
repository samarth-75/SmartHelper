import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import "./config/db.js";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";

dotenv.config();


const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://smart-helper-6k8pnjt6v-samarth-75s-projects.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser tools
    if(allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error("CORS not allowed"));
  },
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

// Preflight requests are handled by the global CORS middleware registered above.
// (Removed explicit app.options wildcard because path-to-regexp rejects bare wildcards)
app.use(express.json());

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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend running on port ${port}`));
