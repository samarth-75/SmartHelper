import express from "express";
import { db } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get current helper's face registration (helper only)
router.get("/face", protect, (req, res) => {
  if (req.user.role !== "helper") return res.status(403).json({ error: "Only helpers" });
  db.get(`SELECT id, helperId, template, createdAt FROM faces WHERE helperId = ?`, [req.user.id], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json(row || null);
  });
});

// Register face (store template/image). For demo we accept a base64 image string.
router.post("/register-face", protect, (req, res) => {
  if (req.user.role !== "helper") return res.status(403).json({ error: "Only helpers" });
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "Image required" });

  // Upsert template
  db.run(
    `INSERT INTO faces (helperId, template) VALUES (?, ?) ON CONFLICT(helperId) DO UPDATE SET template = excluded.template, createdAt = CURRENT_TIMESTAMP`,
    [req.user.id, image],
    function (err) {
      if (err) return res.status(500).json(err);
      db.get(`SELECT id, helperId, template, createdAt FROM faces WHERE helperId = ?`, [req.user.id], (err, row) => {
        if (err) return res.status(500).json(err);
        res.json(row);
      });
    }
  );
});

// Scan and record attendance
router.post('/scan', protect, (req, res) => {
  if (req.user.role !== 'helper') return res.status(403).json({ error: 'Only helpers' });
  const { action, image, lat, lon, jobId } = req.body;
  if (!action || (action !== 'check-in' && action !== 'check-out')) return res.status(400).json({ error: 'Invalid action' });

  // Check face registered
  db.get(`SELECT template FROM faces WHERE helperId = ?`, [req.user.id], (err, face) => {
    if (err) return res.status(500).json(err);
    if (!face) return res.status(412).json({ error: 'Face not registered' });

    // Demo verification: if image provided we treat it as verified; real implementation would compare templates
    const verified = !!image;

    if (!verified) return res.status(401).json({ error: 'Verification failed' });

    // Determine familyId from jobId if provided
    const recordAttendance = (familyId) => {
      db.run(`INSERT INTO attendance (helperId, jobId, familyId, action, lat, lon) VALUES (?, ?, ?, ?, ?, ?)`, [req.user.id, jobId || null, familyId || null, action, lat || null, lon || null], function (err) {
        if (err) return res.status(500).json(err);
        res.json({ verified: true, attendanceRecorded: true, attendanceId: this.lastID });
      });
    };

    if (jobId) {
      db.get(`SELECT familyId FROM jobs WHERE id = ?`, [jobId], (err, job) => {
        if (err) return res.status(500).json(err);
        const familyId = job ? job.familyId : null;
        recordAttendance(familyId);
      });
    } else {
      // Try to infer family from any job assigned to this helper
      db.get(`SELECT familyId FROM jobs WHERE assignedHelperId = ? LIMIT 1`, [req.user.id], (err, job) => {
        if (err) return res.status(500).json(err);
        const familyId = job ? job.familyId : null;
        recordAttendance(familyId);
      });
    }
  });
});

// Helper: get own attendance
router.get('/helper', protect, (req, res) => {
  if (req.user.role !== 'helper') return res.status(403).json({ error: 'Only helpers' });
  db.all(`SELECT * FROM attendance WHERE helperId = ? ORDER BY createdAt DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Family: get attendance for helpers assigned to this family (or for this family's jobs)
router.get('/family', protect, (req, res) => {
  if (req.user.role !== 'family') return res.status(403).json({ error: 'Only family' });
  const q = `
    SELECT attendance.*, users.name as helperName, users.email as helperEmail
    FROM attendance
    JOIN users ON attendance.helperId = users.id
    LEFT JOIN jobs ON attendance.jobId = jobs.id
    WHERE attendance.familyId = ?
      OR (
        attendance.familyId IS NULL
        AND attendance.helperId IN (SELECT assignedHelperId FROM jobs WHERE familyId = ?)
      )
    ORDER BY attendance.createdAt DESC
  `;
  db.all(q, [req.user.id, req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

export default router;