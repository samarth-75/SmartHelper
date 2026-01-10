import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smarthelper'
};

// When using managed Postgres (Heroku/Render) with self-signed certs
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && !process.env.PGSSLMODE) {
  options.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(options);
export const query = (text, params) => pool.query(text, params);

export default pool;
