import express from "express";
import { db } from "../config/db.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/* Helper applies for job */
router.post("/", protect, (req, res) => {
  if (req.user.role !== "helper")
    return res.status(403).json({ error: "Only helpers can apply" });

  const { jobId } = req.body;

  db.run(
    "INSERT OR IGNORE INTO applications (jobId, helperId) VALUES (?, ?)",
    [jobId, req.user.id],
    function () {
      res.json({ applied: this.changes === 1 });
    }
  );
});


/* Family sees applications for their jobs */
router.get("/helper", protect, (req,res)=>{
  db.all(
    "SELECT jobId FROM applications WHERE helperId=?",
    [req.user.id],
    (err,rows)=>{
      res.json(rows.map(r=>r.jobId));
    }
  );
});


export default router;
