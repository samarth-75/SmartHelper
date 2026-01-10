// Postgres support was removed per the current project plan.
// This file is intentionally a no-op placeholder to avoid runtime errors
// if it is imported accidentally. Restore from git history to re-enable.

export const pool = null;
export const query = () => { throw new Error('Postgres disabled. Restore config/pg.js from git if you need it.'); };

export default null;
