# NodeJSBackend

A Node.js backend project using Express.

## Project structure

```text
NodeJSBackend/
├── config/
├── controller/
├── model/
├── route/
├── server.js
├── package.json
└── README.md
```

## Setup progress

### Step 1: Initialize the Node.js project

From the `NodeJSBackend` directory, run:

```bash
npm init -y
```

This created `package.json`. The project currently uses CommonJS modules.

### Step 2: Install Express

Run:

```bash
npm install express
```

Express is now listed as a project dependency.

### Step 3: Create the Express server

`server.js` currently:

- Creates an Express application.
- Enables JSON request-body parsing with `express.json()`.
- Defines `GET /`, which responds with `Hello World!`.
- Listens on port `8000`.

Start the server with:

```bash
node server.js
```

**Verification status:** This command was attempted but exited with code 1. The server has not yet been confirmed running; check the terminal error and retry.

### Step 4: Install the PostgreSQL driver

The local PostgreSQL database `demoapp` has been created in pgAdmin. Install the Node.js PostgreSQL client from the project directory:

```bash
npm install pg
```

The PostgreSQL driver is installed. The app has not been configured to connect to the database yet.

### Step 5: Install dotenv

Install `dotenv` so local database settings can be loaded from a `.env` file instead of being placed directly in source code:

```bash
npm install dotenv
```

`dotenv` is installed.

### Step 6: Ignore local and generated files

Create a `.gitignore` file in the project root and add:

```gitignore
node_modules/
.env
```

This prevents installed packages and local database credentials from being committed to Git. You report that this step is complete; verify `.env` is ignored before committing.

An `.env` file is present in the project directory, so do not commit or share it. Add `.env` to `.gitignore` before staging or committing project files.

### Step 7: Configure PostgreSQL environment variables

After `.env` is ignored by Git, set the local PostgreSQL connection values in `.env`:

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=demoapp
PGUSER=postgres
PGPASSWORD=your_postgres_password
```

Use the PostgreSQL role username and password for your local server; `postgres` and port `5432` are common defaults, but your setup may differ. Replace the password placeholder locally and never put a real password in this README or share it in chat. You report that these values are configured locally.

### Step 8: Create the PostgreSQL connection pool

Create `config/db.js` with:

```js
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool();

module.exports = pool;
```

The `pg` package reads the standard `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` environment variables. The module has been created and is ready to test.

### Step 9: Test the PostgreSQL connection

From the `NodeJSBackend` directory, run this one-time query:

```powershell
node -e "const pool = require('./config/db'); (async () => { try { await pool.query('SELECT 1'); console.log('Connected to demoapp'); } catch (error) { console.error('Connection failed:', error.message); process.exitCode = 1; } finally { await pool.end(); } })();"
```

You confirmed the query ran successfully and connected to `demoapp`.

### Step 10: Use migrations for database schema changes

Do not create application tables manually in pgAdmin. We will use versioned migration files so the application can create missing tables and apply later schema changes, such as adding columns, automatically at startup. The earlier manual `users` table SQL is superseded by this approach.

### Step 11: Install the migration tool

From the `NodeJSBackend` directory, run:

```bash
npm install node-pg-migrate
```

`node-pg-migrate` is installed. Later steps will create the initial `users` table migration and run pending migrations before the server accepts requests.

### Step 12: Generate the initial migration file

From the `NodeJSBackend` directory, run:

```bash
npx node-pg-migrate create create-users-table
```

This generated a migration file under `migrations/`; it does not yet create a table in the database.

### Step 13: Define the users table migration

The generated migration now defines `up` to create the `users` table and `down` to drop it. The `id`, `name`, `email`, and `created_at` columns and their constraints are included.

The migration will describe the schema change only. A later step will configure the application to apply pending migrations automatically at startup.

### Step 14: Add the migration connection URL

Add a `DATABASE_URL` entry to the local `.env` file so `node-pg-migrate` can connect. Use your existing PostgreSQL username and password, and keep the real value private:

```env
DATABASE_URL=postgres://postgres:your_postgres_password@localhost:5432/demoapp
```

Replace the username, password, host, and port if your local PostgreSQL settings differ. If the password contains URL-special characters, URL-encode them in this connection string. Do not put a real URL in this README. This step is pending.

## Progress log

Append each new setup step here as it is completed. Include commands, files changed, and whether the step was verified.