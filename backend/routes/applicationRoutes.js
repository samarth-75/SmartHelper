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

  db.get(
    `SELECT a.jobId, a.helperId, a.status, 
            u.email AS helperEmail, u.name AS helperName,
            j.title AS jobTitle, j.location, j.date, j.time, j.payPerHour,
            f.name AS familyName, f.email AS familyEmail
     FROM applications a
     JOIN users u ON a.helperId = u.id
     JOIN jobs j ON a.jobId = j.id
     JOIN users f ON j.familyId = f.id
     WHERE a.id = ?`,
    [appId],
    (err, app) => {
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
              
              // Send email notification via Make.com webhook
              const emailData = {
                helperEmail: app.helperEmail,
                helperName: app.helperName,
                familyName: app.familyName,
                jobTitle: app.jobTitle,
                jobLocation: app.location,
                status: 'accepted',
                subject: `🎉 Application Accepted - ${app.jobTitle}`,
                message: `Congratulations! Your application has been accepted for the job "${app.jobTitle}". Looking forward to working with you!`
              };

              (async () => {
                const obj = emailData;
                const option = {
                  method: 'POST',
                  body: JSON.stringify(obj),
                };
                await fetch('https://hook.eu1.make.com/fb793mla7g3uh3j83pnerj987nm4h9qv', option).catch((err) => console.error('Webhook error:', err));
              })();

              res.json({ accepted: true });
            });
          });
        });
      });
    }
  );
});


/* Family rejects an application */
router.post("/:id/reject", protect, (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only family can reject applications" });

  const appId = req.params.id;

  db.get(
    `SELECT a.jobId, a.status,
            u.email AS helperEmail, u.name AS helperName,
            j.title AS jobTitle, j.location,
            f.name AS familyName
     FROM applications a
     JOIN users u ON a.helperId = u.id
     JOIN jobs j ON a.jobId = j.id
     JOIN users f ON j.familyId = f.id
     WHERE a.id = ?`,
    [appId],
    (err, app) => {
      if (err) return res.status(500).json(err);
      if (!app) return res.status(404).json({ error: "Application not found" });

      db.get(`SELECT familyId FROM jobs WHERE id = ?`, [app.jobId], (err, job) => {
        if (err) return res.status(500).json(err);
        if (job.familyId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
        if (app.status === 'rejected') return res.status(400).json({ error: 'Already rejected' });

        const now = new Date().toISOString();
        db.run(`UPDATE applications SET status = 'rejected', decidedAt = ? WHERE id = ?`, [now, appId], function (err) {
          if (err) return res.status(500).json(err);
          
          // Send email notification via Make.com webhook
          const emailData = {
            helperEmail: app.helperEmail,
            helperName: app.helperName,
            familyName: app.familyName,
            jobTitle: app.jobTitle,
            jobLocation: app.location,
            status: 'rejected',
            subject: `Application Status Update - ${app.jobTitle}`,
            message: `Thank you for your interest in the "${app.jobTitle}" job. Unfortunately, the family has selected another helper for this position. Keep applying - there are more opportunities ahead!`
          };

          (async () => {
            const obj = emailData;
            const option = {
              method: 'POST',
              body: JSON.stringify(obj),
            };
            await fetch('https://hook.eu1.make.com/fb793mla7g3uh3j83pnerj987nm4h9qv', option).catch((err) => console.error('Webhook error:', err));
          })();

          res.json({ rejected: true });
        });
      });
    }
  );
});


/* Helper sees their own applications (return list of jobIds they've applied to) */
router.get("/helper", protect, (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can view their applications" });

  // Only return pending applications (accepted/rejected applications shouldn't be considered active applies)
  const q = `
    SELECT jobId FROM applications WHERE helperId = ? AND status = 'pending'
  `;

  db.all(q, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json(err);
    // return an array of jobIds
    const jobIds = rows.map((r) => r.jobId);
    res.json(jobIds);
  });
});

export default router;
