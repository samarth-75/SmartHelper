import express from "express";
import { register, login, chatbaseToken } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { db } from "../config/db.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// Return a short-lived Chatbase identity token for the logged in user
router.get("/chatbase-token", protect, chatbaseToken);

// Return full profile from DB (not only token contents)
router.get("/profile", protect, (req, res) => {
  const q = `SELECT id, name, email, role, avatar, phone, address, bio FROM users WHERE id = ?`;
  db.get(q, [req.user.id], (err, user) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
});

// Update profile fields
router.put("/profile", protect, (req, res) => {
  const { name, avatar, phone, address, bio } = req.body;
  const q = `UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar), phone = COALESCE(?, phone), address = COALESCE(?, address), bio = COALESCE(?, bio) WHERE id = ?`;
  db.run(q, [name, avatar, phone, address, bio, req.user.id], function (err) {
    if (err) return res.status(500).json(err);
    db.get(`SELECT id, name, email, role, avatar, phone, address, bio FROM users WHERE id = ?`, [req.user.id], (err, user) => {
      if (err) return res.status(500).json(err);
      res.json(user);
    });
  });
});

// Family: get assigned helpers (helpers assigned to jobs for this family)
router.get("/family/assigned-helpers", protect, (req, res) => {
  if (req.user.role !== "family") return res.status(403).json({ error: "Only family can view assigned helpers" });
  const q = `
    SELECT
      jobs.id AS jobId,
      jobs.title,
      jobs.date,
      jobs.time,
      jobs.duration,
      jobs.payPerHour,
      users.id AS helperId,
      users.name AS helperName,
      users.email AS helperEmail,
      users.avatar AS helperAvatar
    FROM jobs
    JOIN users ON jobs.assignedHelperId = users.id
    WHERE jobs.familyId = ? AND jobs.assignedHelperId IS NOT NULL
  `;
  db.all(q, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Helper: get assigned jobs for this helper
router.get("/helper/assigned-jobs", protect, (req, res) => {
  if (req.user.role !== "helper") return res.status(403).json({ error: "Only helpers can view their assigned jobs" });
  const q = `
    SELECT
      jobs.id AS jobId,
      jobs.title,
      jobs.description,
      jobs.location,
      jobs.date,
      jobs.time,
      jobs.duration,
      jobs.payPerHour,
      users.id AS familyId,
      users.name AS familyName,
      users.email AS familyEmail
    FROM jobs
    JOIN users ON jobs.familyId = users.id
    WHERE jobs.assignedHelperId = ?
  `;
  db.all(q, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Family: list helpers (for SmartMatch recommendations)
router.get('/helpers', protect, (req, res) => {
  if (req.user.role !== 'family') return res.status(403).json({ error: 'Only families can view helpers' });
  const q = `
    SELECT
      u.id,
      u.name,
      u.avatar,
      u.bio,
      COALESCE((SELECT ROUND(AVG(rating),1) FROM reviews r WHERE r.helperId = u.id), 0) AS avgRating
    FROM users u
    WHERE u.role = 'helper'
    ORDER BY avgRating DESC, u.name ASC
  `;
  db.all(q, [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

export default router;
