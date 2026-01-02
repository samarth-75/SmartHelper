import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import "./config/db.js";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);


app.listen(5000, () => console.log("Backend running on port 5000"));
