import { db } from "../config/db.js";

const secsToHours = (s) => s / 3600;

// Helper: given ordered attendance rows (paymentId IS NULL), compute total seconds worked
const computeWorkSeconds = (rows) => {
  let total = 0;
  let currentIn = null;
  for (const r of rows) {
    if (r.action === 'check-in') {
      currentIn = new Date(r.createdAt).getTime();
    } else if (r.action === 'check-out') {
      if (currentIn) {
        const outT = new Date(r.createdAt).getTime();
        if (outT > currentIn) total += Math.floor((outT - currentIn) / 1000);
        currentIn = null;
      }
    }
  }
  // If still checked-in, count until now
  if (currentIn) {
    const now = Date.now();
    if (now > currentIn) total += Math.floor((now - currentIn) / 1000);
  }
  return total;
};

export const createPayment = (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only families can make payments" });

  const { paymentId, jobId, helperId } = req.body;

  // Pay an existing payment record (legacy/confirm)
  if (paymentId) {
    const now = new Date().toISOString();
    db.run(
      "UPDATE payments SET status = 'paid', createdAt = ? WHERE id = ? AND familyId = ?",
      [now, paymentId, req.user.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Payment not found" });
        db.get("SELECT * FROM payments WHERE id = ?", [paymentId], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, payment: row });
        });
      }
    );
    return;
  }

  // Create payment by aggregating unpaid attendance for helper+job
  if (!helperId) return res.status(400).json({ error: 'helperId required' });

  // If jobId is missing, try to find an assigned job for this helper under this family
  const proceedWithJob = (effectiveJobId, rate) => {
    // Determine attendance rows to include: if effectiveJobId provided, include rows with that jobId OR jobId IS NULL (helpers may check-in w/o selecting a job)
    const sql = effectiveJobId
      ? `SELECT * FROM attendance WHERE helperId = ? AND (jobId = ? OR jobId IS NULL) AND paymentId IS NULL ORDER BY createdAt ASC`
      : `SELECT * FROM attendance WHERE helperId = ? AND jobId IS NULL AND paymentId IS NULL ORDER BY createdAt ASC`;
    const params = effectiveJobId ? [helperId, effectiveJobId] : [helperId];

    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows || rows.length === 0) return res.status(400).json({ error: 'No unpaid attendance for this helper/job' });

      const seconds = computeWorkSeconds(rows);
      const hours = Math.round((secsToHours(seconds) + Number.EPSILON) * 100) / 100; // round 2 decimals
      const amount = Math.round(hours * (Number(rate) || 0));

      const now = new Date().toISOString();
      db.run(
        "INSERT INTO payments (familyId, helperId, jobId, hoursWorked, rate, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, 'paid', ?)",
        [req.user.id, helperId, effectiveJobId, hours, rate, amount, now],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          const paymentIdCreated = this.lastID;
          // Associate attendance rows with this payment so they won't be counted again
          if (rows.length > 0) {
            const ids = rows.map(r => r.id);
            const placeholders = ids.map(() => '?').join(',');
            db.run(`UPDATE attendance SET paymentId = ? WHERE id IN (${placeholders})`, [paymentIdCreated, ...ids], (err) => {
              if (err) console.error('Failed to mark attendance as paid', err);
              db.get("SELECT * FROM payments WHERE id = ?", [paymentIdCreated], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, payment: row });
              });
            });
          } else {
            db.get("SELECT * FROM payments WHERE id = ?", [paymentIdCreated], (err, row) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true, payment: row });
            });
          }
        }
      );
    });
  };

  if (jobId) {
    // Validate job belongs to this family (if provided)
    db.get(`SELECT id, payPerHour FROM jobs WHERE id = ? AND familyId = ?`, [jobId, req.user.id], (err, job) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!job) return res.status(404).json({ error: 'Job not found for this family' });
      proceedWithJob(job.id, Number(job.payPerHour) || 0);
    });
  } else {
    // Find an assigned job for the helper under this family
    db.get(`SELECT id, payPerHour FROM jobs WHERE assignedHelperId = ? AND familyId = ? LIMIT 1`, [helperId, req.user.id], (err, job) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!job) return res.status(400).json({ error: 'jobId required or helper must be assigned to a job' });
      proceedWithJob(job.id, Number(job.payPerHour) || 0);
    });
  }
};

export const getFamilyPayments = (req, res) => {
  if (req.user.role !== "family")
    return res.status(403).json({ error: "Only families can view payments" });

  console.debug(`getFamilyPayments called for userId=${req.user.id}`);

  // 1) Get payment history from payments table
  db.all(
    `SELECT p.*, u.name as helperName, j.title as jobTitle, j.date as jobDate FROM payments p
     LEFT JOIN users u ON p.helperId = u.id
     LEFT JOIN jobs j ON p.jobId = j.id
     WHERE p.familyId = ?
     ORDER BY p.createdAt DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      console.debug('payments rows count:', rows ? rows.length : 0, 'for user', req.user.id);
      const paid = rows.filter((r) => r.status === "paid");
      console.debug('paid rows count:', paid.length);

      // 2) Compute pending payments by aggregating unpaid attendance rows (group by helperId+jobId)
      db.all(`SELECT a.helperId, a.jobId, u.name as helperName, j.title as jobTitle, j.date as jobDate, j.payPerHour FROM attendance a LEFT JOIN users u ON a.helperId = u.id LEFT JOIN jobs j ON a.jobId = j.id WHERE a.familyId = ? AND a.paymentId IS NULL ORDER BY a.helperId, a.jobId, a.createdAt ASC`, [req.user.id], (err, unpaidRows) => {
        if (err) return res.status(500).json({ error: err.message });

        console.debug('unpaid attendance rows count:', unpaidRows ? unpaidRows.length : 0);

        const groups = {};
        for (const r of unpaidRows) {
          const key = `${r.helperId}::${r.jobId}`;
          groups[key] = groups[key] || { helperId: r.helperId, jobId: r.jobId, helperName: r.helperName, jobTitle: r.jobTitle, jobDate: r.jobDate, rate: Number(r.payPerHour) || 0, rows: [] };
          groups[key].rows.push(r);
        }

        const pending = Object.values(groups).map((g) => {
          const seconds = computeWorkSeconds(g.rows);
          const hours = Math.round((secsToHours(seconds) + Number.EPSILON) * 100) / 100;
          const amount = Math.round(hours * (g.rate || 0));
          return {
            helperId: g.helperId,
            jobId: g.jobId,
            helperName: g.helperName,
            jobTitle: g.jobTitle,
            jobDate: g.jobDate,
            hoursWorked: hours,
            rate: g.rate,
            amount,
            status: 'pending'
          };
        });

        console.debug('returning pending count:', pending.length, 'paid count:', paid.length);
        res.json({ pending, paid });
      });
    }
  );
};

// Helper: get earned (paid) and pending amounts for the logged-in helper
export const getHelperPayments = (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can view earnings" });

  // Paid payments where helperId = logged-in helper
  db.all(
    `SELECT p.*, u.name as familyName, j.title as jobTitle, j.date as jobDate FROM payments p
     LEFT JOIN users u ON p.familyId = u.id
     LEFT JOIN jobs j ON p.jobId = j.id
     WHERE p.helperId = ?
     ORDER BY p.createdAt DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const paid = rows || [];

      // Pending: unpaid attendance rows for this helper (group by jobId)
      db.all(
        `SELECT a.helperId, a.jobId, a.familyId, u.name as familyName, j.title as jobTitle, j.date as jobDate, j.payPerHour FROM attendance a LEFT JOIN users u ON a.familyId = u.id LEFT JOIN jobs j ON a.jobId = j.id WHERE a.helperId = ? AND a.paymentId IS NULL ORDER BY a.jobId, a.createdAt ASC`,
        [req.user.id],
        (err, unpaidRows) => {
          if (err) return res.status(500).json({ error: err.message });

          const groups = {};
          for (const r of unpaidRows) {
            const key = `${r.jobId}`;
            groups[key] = groups[key] || { jobId: r.jobId, familyName: r.familyName, jobTitle: r.jobTitle, jobDate: r.jobDate, rate: Number(r.payPerHour) || 0, rows: [] };
            groups[key].rows.push(r);
          }

          const pending = Object.values(groups).map((g) => {
            const seconds = computeWorkSeconds(g.rows);
            const hours = Math.round((secsToHours(seconds) + Number.EPSILON) * 100) / 100;
            const amount = Math.round(hours * (g.rate || 0));
            return {
              jobId: g.jobId,
              familyName: g.familyName,
              jobTitle: g.jobTitle,
              jobDate: g.jobDate,
              hoursWorked: hours,
              rate: g.rate,
              amount,
              status: 'pending'
            };
          });

          res.json({ pending, paid });
        }
      );
    }
  );
};

// Helper: mark a paid payment as received (only the helper assigned to the payment)
export const receivePayment = (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can mark payments as received" });

  const paymentId = req.params.id;
  db.get("SELECT * FROM payments WHERE id = ?", [paymentId], (err, payment) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.helperId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
    if (payment.status !== 'paid') return res.status(400).json({ error: "Only paid payments can be marked as received" });

    const receivedAt = new Date().toISOString();
    db.run("UPDATE payments SET status = 'received', receivedAt = ? WHERE id = ?", [receivedAt, paymentId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM payments WHERE id = ?", [paymentId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, payment: row });
      });
    });
  });
};
