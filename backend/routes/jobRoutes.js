import express from "express";
import { db } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* Create Job (Family only) */
router.post("/", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only families can post jobs" });

  const {
    title,
    description,
    location,
    date,
    time,
    duration,
    payPerHour,
    category
  } = req.body;

  const q = `
    INSERT INTO jobs 
    (title, description, location, date, time, duration, payPerHour, category, familyId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    q,
    [title, description, location, date, time, duration, payPerHour, category, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

/* Get all jobs for helpers */
router.get("/", protect, (req, res) => {
  db.all("SELECT * FROM jobs", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

export default router;
