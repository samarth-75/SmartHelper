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

});
