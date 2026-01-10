import { pool } from '../config/pg.js';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        avatar TEXT,
        phone TEXT,
        address TEXT,
        bio TEXT
      );
    `);

    // jobs
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        location TEXT,
        date TEXT,
        time TEXT,
        duration TEXT,
        payPerHour INTEGER,
        category TEXT,
        familyId INTEGER REFERENCES users(id),
        assignedHelperId INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'open'
      );
    `);

    // applications
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        jobId INTEGER REFERENCES jobs(id),
        helperId INTEGER REFERENCES users(id),
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        message TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        decidedAt TIMESTAMP,
        UNIQUE(jobId, helperId)
      );
    `);

    // faces
    await client.query(`
      CREATE TABLE IF NOT EXISTS faces (
        id SERIAL PRIMARY KEY,
        helperId INTEGER UNIQUE REFERENCES users(id),
        template TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // attendance
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        helperId INTEGER REFERENCES users(id),
        jobId INTEGER REFERENCES jobs(id),
        familyId INTEGER REFERENCES users(id),
        action TEXT,
        lat DOUBLE PRECISION,
        lon DOUBLE PRECISION,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paymentId INTEGER
      );
    `);

    // payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        familyId INTEGER REFERENCES users(id),
        helperId INTEGER REFERENCES users(id),
        jobId INTEGER REFERENCES jobs(id),
        hoursWorked NUMERIC,
        rate NUMERIC,
        amount NUMERIC,
        status TEXT DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        receivedAt TIMESTAMP
      );
    `);

    // reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        jobId INTEGER UNIQUE REFERENCES jobs(id),
        familyId INTEGER REFERENCES users(id),
        helperId INTEGER REFERENCES users(id),
        rating INTEGER,
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        authorId INTEGER REFERENCES users(id),
        description TEXT,
        imageUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // followers
    await client.query(`
      CREATE TABLE IF NOT EXISTS followers (
        id SERIAL PRIMARY KEY,
        authorId INTEGER REFERENCES users(id),
        followerId INTEGER REFERENCES users(id),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(authorId, followerId)
      );
    `);

    await client.query('COMMIT');
    console.log('Postgres schema created/verified');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to create schema', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

createTables();
