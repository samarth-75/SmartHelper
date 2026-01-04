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

});
