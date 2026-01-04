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
      applications.status,
      applications.decidedAt,
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


/* Family accepts an application */
router.post("/:id/accept", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only family can accept applications" });

  const appId = req.params.id;

  db.get(`SELECT jobId, helperId, status FROM applications WHERE id = ?`, [appId], (err, app) => {
    if (err) return res.status(500).json(err);
    if (!app) return res.status(404).json({ error: "Application not found" });

    db.get(`SELECT familyId, assignedHelperId FROM jobs WHERE id = ?`, [app.jobId], (err, job) => {
      if (err) return res.status(500).json(err);
      if (!job) return res.status(404).json({ error: "Job not found" });
      if (job.familyId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
      if (job.assignedHelperId) return res.status(400).json({ error: "Job already assigned" });

      const now = new Date().toISOString();

      db.run(`UPDATE applications SET status = 'accepted', decidedAt = ? WHERE id = ?`, [now, appId], function (err) {
        if (err) return res.status(500).json(err);

        db.run(`UPDATE jobs SET assignedHelperId = ?, status = 'assigned' WHERE id = ?`, [app.helperId, app.jobId], function (err) {
          if (err) return res.status(500).json(err);

          db.run(`UPDATE applications SET status = 'rejected', decidedAt = ? WHERE jobId = ? AND id != ? AND status = 'pending'`, [now, app.jobId, appId], function (err) {
            if (err) return res.status(500).json(err);
            res.json({ accepted: true });
          });
        });
      });
    });
  });
});


/* Family rejects an application */
router.post("/:id/reject", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only family can reject applications" });

  const appId = req.params.id;

  db.get(`SELECT jobId, status FROM applications WHERE id = ?`, [appId], (err, app) => {
    if (err) return res.status(500).json(err);
    if (!app) return res.status(404).json({ error: "Application not found" });

    db.get(`SELECT familyId FROM jobs WHERE id = ?`, [app.jobId], (err, job) => {
      if (err) return res.status(500).json(err);
      if (job.familyId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
      if (app.status === 'rejected') return res.status(400).json({ error: 'Already rejected' });

      const now = new Date().toISOString();
      db.run(`UPDATE applications SET status = 'rejected', decidedAt = ? WHERE id = ?`, [now, appId], function (err) {
        if (err) return res.status(500).json(err);
        res.json({ rejected: true });
      });
    });
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
