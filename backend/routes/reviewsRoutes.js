import express from "express";
import { db } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* Family submits a review for a job (only if payment is paid and they posted the job) */
router.post("/", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only family can submit reviews" });

  const { jobId, helperId, rating, comment } = req.body;
  if (!jobId || !helperId || !rating)
    return res.status(400).json({ error: "jobId, helperId and rating required" });

  const r = parseInt(rating, 10);
  if (isNaN(r) || r < 1 || r > 5)
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });

  // Verify job exists and belongs to this family
  db.get(`SELECT id, familyId FROM jobs WHERE id = ?`, [jobId], (err, job) => {
    if (err) return res.status(500).json(err);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.familyId !== req.user.id) return res.status(403).json({ error: "Not authorized to review this job" });

    // Check payment status: there must be at least one paid payment for this job+family
    db.get(`SELECT id FROM payments WHERE jobId = ? AND familyId = ? AND status = 'paid'`, [jobId, req.user.id], (err, payment) => {
      if (err) return res.status(500).json(err);
      if (!payment) return res.status(400).json({ error: "Payment not completed for this job" });

      // Ensure no existing review for this job
      db.get(`SELECT id FROM reviews WHERE jobId = ?`, [jobId], (err, existing) => {
        if (err) return res.status(500).json(err);
        if (existing) return res.status(400).json({ error: "Review already submitted for this job" });

        const createdAt = new Date().toISOString();
        const q = `INSERT INTO reviews (jobId, familyId, helperId, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(q, [jobId, req.user.id, helperId, r, comment || null, createdAt], function (err) {
          if (err) return res.status(500).json(err);
          // Return the new review row
          db.get(`SELECT reviews.*, users.name AS familyName FROM reviews JOIN users ON users.id = reviews.familyId WHERE reviews.id = ?`, [this.lastID], (err, row) => {
            if (err) return res.status(500).json(err);
            res.json(row);
          });
        });
      });
    });
  });
});

/* Family: get submitted and pending reviews */
router.get("/family", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only family can view this" });

  // Submitted reviews
  const submittedQ = `
    SELECT reviews.id, reviews.jobId, jobs.title AS jobTitle, reviews.helperId, users.name AS helperName, reviews.rating, reviews.comment, reviews.createdAt
    FROM reviews
    JOIN users ON users.id = reviews.helperId
    JOIN jobs ON jobs.id = reviews.jobId
    WHERE reviews.familyId = ?
    ORDER BY reviews.createdAt DESC
  `;

  // Pending: payments by this family with status 'paid' where no review exists for the job
  const pendingQ = `
    SELECT payments.jobId, jobs.title AS jobTitle, jobs.assignedHelperId AS helperId, users.name AS helperName, payments.id AS paymentId, payments.amount, payments.createdAt
    FROM payments
    JOIN jobs ON jobs.id = payments.jobId
    LEFT JOIN users ON users.id = jobs.assignedHelperId
    WHERE payments.familyId = ?
      AND payments.status = 'paid'
      AND NOT EXISTS (SELECT 1 FROM reviews WHERE reviews.jobId = payments.jobId)
    ORDER BY payments.createdAt DESC
  `;

  db.all(submittedQ, [req.user.id], (err, submitted) => {
    if (err) return res.status(500).json(err);
    db.all(pendingQ, [req.user.id], (err, pending) => {
      if (err) return res.status(500).json(err);
      res.json({ submitted, pending });
    });
  });
});

/* Helper: get their reviews + summary */
router.get("/helper", protect, (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can view this" });

  const listQ = `
    SELECT reviews.id, reviews.jobId, jobs.title AS jobTitle, reviews.familyId, users.name AS familyName, reviews.rating, reviews.comment, reviews.createdAt
    FROM reviews
    JOIN users ON users.id = reviews.familyId
    LEFT JOIN jobs ON jobs.id = reviews.jobId
    WHERE reviews.helperId = ?
    ORDER BY reviews.createdAt DESC
  `;

  const summaryQ = `SELECT AVG(rating) AS avgRating, COUNT(*) AS total FROM reviews WHERE helperId = ?`;
  const breakdownQ = `SELECT rating, COUNT(*) AS count FROM reviews WHERE helperId = ? GROUP BY rating`;

  db.all(listQ, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    db.get(summaryQ, [req.user.id], (err, summary) => {
      if (err) return res.status(500).json(err);
      db.all(breakdownQ, [req.user.id], (err, breakdown) => {
        if (err) return res.status(500).json(err);
        res.json({ reviews: rows, summary: summary || { avgRating: 0, total: 0 }, breakdown });
      });
    });
  });
});

/* Get a specific helper's rating summary by ID */
router.get("/helper/:helperId", (req, res) => {
  const helperId = Number(req.params.helperId);
  const summaryQ = `SELECT AVG(rating) AS avgRating, COUNT(*) AS total FROM reviews WHERE helperId = ?`;

  db.get(summaryQ, [helperId], (err, summary) => {
    if (err) return res.status(500).json(err);
    res.json({ avgRating: summary?.avgRating || 0, total: summary?.total || 0 });
  });
});

export default router;
