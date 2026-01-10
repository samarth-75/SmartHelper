# Migrate to Postgres (Render Postgres)

This file lists the steps to provision a Render Postgres database, add the connection string to your service, and run the schema migration script that creates the tables used by SmartHelper.

1) Provision a Postgres database on Render
- Go to https://dashboard.render.com/new and choose "Postgres" → Create a new database
- Choose name, plan, region and create it
- When created, Render will provide a `DATABASE_URL` like `postgres://user:pass@host:5432/dbname`

2) Configure your backend service on Render
- Go to your Service (the SmartHelper backend)
- Under Environment, add a new Environment Variable `DATABASE_URL` with the value from Render Postgres
- Also ensure `PORT` is either left blank (Render supplies it) or set appropriately

3) Run the migration script to create schema
- Locally (for testing), set `DATABASE_URL` and run the migration script:

```powershell
# Windows PowerShell
$env:DATABASE_URL = "postgres://user:pass@host:5432/dbname"
node ./scripts/create_pg_schema.js
```

- On Render you can add a startup hook or run the script in a deploy hook, or run it manually from the Shell in the Render dashboard:

```bash
# from the service shell
npm run migrate:pg
```

4) Import data
- Export tables from SQLite as CSV and import into Postgres:

```bash
sqlite3 smarthelper.db -header -csv "SELECT * FROM users;" > users.csv
psql "$DATABASE_URL" -c "\copy users(name,email,password,role) FROM 'users.csv' CSV HEADER;"
```

- For more complex imports, consider `pgloader` which can migrate from SQLite to Postgres with type conversions.

5) Update app to use Postgres
- The project already contains `config/pg.js` (a `pg` Pool) and `scripts/create_pg_schema.js` to create the schema.
- Next step (recommended): convert data access code from SQLite (`sqlite3`) to `pg` queries or use a query builder (Knex) or ORM (Objection/Sequelize). This is a separate step and will require code changes across controllers.

6) Test and Deploy
- Once schema and data are in Postgres and your code uses `pg`, test locally (Docker Postgres) and then deploy to Render using the production `DATABASE_URL`.

Notes
- If your Postgres service requires SSL, `config/pg.js` detects production mode and sets `ssl: { rejectUnauthorized: false }` automatically.
- The migration script is **idempotent** (uses `CREATE TABLE IF NOT EXISTS`) so it can be safely re-run.

If you'd like, I can:
- Convert the most-critical backend endpoints to use `pg` (I'll start with auth and applications accept/reject to demonstrate transactions), or
- Create Knex config and starter migrations to convert the codebase incrementally.

Tell me which next step you want me to implement first.