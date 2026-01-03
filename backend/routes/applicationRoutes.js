import express from "express";
import { db } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* Helper applies for job */
router.post("/", protect, (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can apply" });

  const { jobId, phone, address, message } = req.body;

  if (!phone || !address)
    return res.status(400).json({ error: "Phone & address required" });

  const q = `
    INSERT OR IGNORE INTO applications
    (jobId, helperId, phone, address, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(q, [jobId, req.user.id, phone, address, message], function () {
    res.json({ applied: this.changes === 1 });
  });
});



/* Family sees applications for their jobs */
router.get("/family", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only family can view applications" });

  const q = `
    SELECT
      applications.id,
      applications.jobId,
      jobs.title,
      users.id AS helperId,
      users.name AS helper,
      users.email AS helperEmail,
      applications.phone,
      applications.address,
      applications.message,
      applications.createdAt
    FROM applications
    JOIN jobs ON applications.jobId = jobs.id
    JOIN users ON applications.helperId = users.id
    WHERE jobs.familyId = ?
    ORDER BY applications.createdAt DESC
  `;

  db.all(q, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});


/* Helper sees their own applications (return list of jobIds they've applied to) */
router.get("/helper", protect, (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can view their applications" });

  const q = `
    SELECT jobId FROM applications WHERE helperId = ?
  `;

  db.all(q, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    // return an array of jobIds
    const jobIds = rows.map((r) => r.jobId);
    res.json(jobIds);
  });
});

export default router;
