import sqlite3 from "sqlite3";
export const db = new sqlite3.Database("./smarthelper.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      location TEXT,
      date TEXT,
      time TEXT,
      duration TEXT,
      payPerHour TEXT,
      category TEXT,
      familyId INTEGER,
      FOREIGN KEY (familyId) REFERENCES users(id)
    );
`);

  db.run(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jobId INTEGER,
    helperId INTEGER,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    message TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jobId, helperId)
  )
`);

  // Add columns to support accept/reject simple workflow. ALTER statements are run
  // on startup and errors (if column already exists) are ignored.
  db.run(`ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'pending'`, (err) => {});
  db.run(`ALTER TABLE applications ADD COLUMN decidedAt TEXT`, (err) => {});
  db.run(`ALTER TABLE jobs ADD COLUMN assignedHelperId INTEGER`, (err) => {});
  db.run(`ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'open'`, (err) => {});

  // Add attendance.paymentId to link attendance rows to payments
  db.run(`ALTER TABLE attendance ADD COLUMN paymentId INTEGER`, (err) => {});

  // Add user profile fields
  db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, (err) => {});
  db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {});
  db.run(`ALTER TABLE users ADD COLUMN address TEXT`, (err) => {});
  db.run(`ALTER TABLE users ADD COLUMN bio TEXT`, (err) => {});

  // Initialize existing rows to defaults when columns were added in older DBs
  db.run(`UPDATE applications SET status = 'pending' WHERE status IS NULL`, (err) => {});
  db.run(`UPDATE jobs SET status = 'open' WHERE status IS NULL`, (err) => {});
  db.run(`UPDATE users SET avatar = NULL WHERE avatar IS NULL`, (err) => {});
  db.run(`UPDATE users SET phone = NULL WHERE phone IS NULL`, (err) => {});
  db.run(`UPDATE users SET address = NULL WHERE address IS NULL`, (err) => {});
  db.run(`UPDATE users SET bio = NULL WHERE bio IS NULL`, (err) => {});

  // Faces table stores a helper's registered face image/template (for demo we store image data)
  db.run(`
    CREATE TABLE IF NOT EXISTS faces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      helperId INTEGER UNIQUE,
      template TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (helperId) REFERENCES users(id)
    )
  `);

  // Attendance records
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      helperId INTEGER,
      jobId INTEGER,
      familyId INTEGER,
      action TEXT,
      lat REAL,
      lon REAL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (helperId) REFERENCES users(id),
      FOREIGN KEY (jobId) REFERENCES jobs(id),
      FOREIGN KEY (familyId) REFERENCES users(id)
    )
  `);
  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      familyId INTEGER,
      helperId INTEGER,
      jobId INTEGER,
      hoursWorked INTEGER,
      rate INTEGER,
      amount INTEGER,
      status TEXT DEFAULT 'pending',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (familyId) REFERENCES users(id),
      FOREIGN KEY (helperId) REFERENCES users(id),
      FOREIGN KEY (jobId) REFERENCES jobs(id)
    )
  `);

  // Seed sample payments only if none exist
  db.get("SELECT COUNT(*) as count FROM payments", (err, row) => {
    if (err) return;
    if (row.count === 0) {
      // Hash passwords for seeded users using dynamic import (ESM-safe)
      import('bcryptjs').then((bcrypt) => {
        const hashed = bcrypt.default.hashSync('password', 10);

        db.run(
          "INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)",
          ["Demo Family", "family@example.com", hashed, "family"]
        );
        db.run(
          "INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)",
          ["Maria", "maria@example.com", hashed, "helper"]
        );

        // Ensure password is set to hashed value for those emails (covers existing rows)
        db.run("UPDATE users SET password = ? WHERE email = ?", [hashed, "family@example.com"]);
        db.run("UPDATE users SET password = ? WHERE email = ?", [hashed, "maria@example.com"]);

        // After users are present/updated, create job and payments
        db.get("SELECT id FROM users WHERE email = ?", ["family@example.com"], (err, familyRow) => {
          db.get("SELECT id FROM users WHERE email = ?", ["maria@example.com"], (err, helperRow) => {
            if (!familyRow || !helperRow) return;
            db.run(
              `INSERT INTO jobs (title, description, location, date, time, duration, payPerHour, category, familyId, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              ["Housekeeping", "Light cleaning and laundry", "Home", "2026-01-12", "09:00", "6", "200", "Housekeeping", familyRow.id, "closed"],
              function (err) {
                if (err) return;
                const jobId = this.lastID;
                // Pending payment
                db.run(
                  "INSERT INTO payments (familyId, helperId, jobId, hoursWorked, rate, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  [familyRow.id, helperRow.id, jobId, 18, 200, 18*200, "pending", new Date().toISOString()]
                );
                // Paid payment
                db.run(
                  "INSERT INTO payments (familyId, helperId, jobId, hoursWorked, rate, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  [familyRow.id, helperRow.id, jobId, 24, 200, 24*200, "paid", new Date().toISOString()]
                );
              }
            );
          });
        });
      }).catch((e) => {
        // If bcrypt import fails, fall back to plain text (best-effort)
        db.run(
          "INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)",
          ["Demo Family", "family@example.com", "password", "family"]
        );
        db.run(
          "INSERT OR IGNORE INTO users (name,email,password,role) VALUES (?,?,?,?)",
          ["Maria", "maria@example.com", "password", "helper"]
        );

        db.get("SELECT id FROM users WHERE email = ?", ["family@example.com"], (err, familyRow) => {
          db.get("SELECT id FROM users WHERE email = ?", ["maria@example.com"], (err, helperRow) => {
            if (!familyRow || !helperRow) return;
            db.run(
              `INSERT INTO jobs (title, description, location, date, time, duration, payPerHour, category, familyId, status) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              ["Housekeeping", "Light cleaning and laundry", "Home", "2026-01-12", "09:00", "6", "200", "Housekeeping", familyRow.id, "closed"],
              function (err) {
                if (err) return;
                const jobId = this.lastID;
                // Pending payment
                db.run(
                  "INSERT INTO payments (familyId, helperId, jobId, hoursWorked, rate, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  [familyRow.id, helperRow.id, jobId, 18, 200, 18*200, "pending", new Date().toISOString()]
                );
                // Paid payment
                db.run(
                  "INSERT INTO payments (familyId, helperId, jobId, hoursWorked, rate, amount, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                  [familyRow.id, helperRow.id, jobId, 24, 200, 24*200, "paid", new Date().toISOString()]
                );
              }
            );
          });
        });
      });
    }
  });

  // One-off: if demo users exist with plaintext 'password', hash and update them so login works
  db.get("SELECT password FROM users WHERE email = ?", ["family@example.com"], (err, row) => {
    if (row && row.password === 'password') {
      import('bcryptjs').then((bcrypt) => {
        const hashed = bcrypt.default.hashSync('password', 10);
        db.run("UPDATE users SET password = ? WHERE email = ?", [hashed, "family@example.com"]);
      }).catch(() => {});
    }
  });

  db.get("SELECT password FROM users WHERE email = ?", ["maria@example.com"], (err, row) => {
    if (row && row.password === 'password') {
      import('bcryptjs').then((bcrypt) => {
        const hashed = bcrypt.default.hashSync('password', 10);
        db.run("UPDATE users SET password = ? WHERE email = ?", [hashed, "maria@example.com"]);
      }).catch(() => {});
    }
  });

});
