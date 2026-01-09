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
  // Add payments.receivedAt to track when helper confirmed receipt
  db.run(`ALTER TABLE payments ADD COLUMN receivedAt TEXT`, (err) => {});

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

  // Reviews table (one review per job enforced by UNIQUE(jobId))
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jobId INTEGER,
      familyId INTEGER,
      helperId INTEGER,
      rating INTEGER,
      comment TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (jobId) REFERENCES jobs(id),
      FOREIGN KEY (familyId) REFERENCES users(id),
      FOREIGN KEY (helperId) REFERENCES users(id),
      UNIQUE(jobId)
    )
  `);

  // Posts table for helpers' work posts
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      authorId INTEGER,
      description TEXT,
      imageUrl TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES users(id)
    )
  `);

  // Followers table: who follows which author (helper)
  db.run(`
    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      authorId INTEGER,
      followerId INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(authorId, followerId),
      FOREIGN KEY (authorId) REFERENCES users(id),
      FOREIGN KEY (followerId) REFERENCES users(id)
    )
  `);

});

