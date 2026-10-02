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

The migration defines `up` to create the `users` table and `down` to drop it. It includes `id`, `name`, `email`, and `created_at`; table creation uses `ifNotExists` so it does not fail if the table already exists. The migration uses CommonJS syntax to match this project and passed `node --check`; it has not yet been run against the database.

A later step will configure the application to apply pending migrations automatically at startup.

### Step 14: Add the migration connection URL

Add a `DATABASE_URL` entry to the local `.env` file so `node-pg-migrate` can connect. The CLI loads `.env` and uses `DATABASE_URL` by default. Use your existing PostgreSQL username and password, and keep the real value private:

```env
DATABASE_URL=postgres://postgres:your_postgres_password@localhost:5432/demoapp
```

Replace the username, password, host, and port if your local PostgreSQL settings differ. Use `PGPORT` (not `PGPOST`) for the port setting. If the password contains URL-special characters, URL-encode them in this connection string. Do not put a real URL in this README. You report that the migration ran, so the CLI connection configuration is working.

### Step 15: Apply pending migrations

After correcting the local `.env` values and setting `DATABASE_URL`, run this from the `NodeJSBackend` directory:

```bash
npx node-pg-migrate up
```

This applies any pending migration files, including the initial `users` table migration. You confirmed the migration completed and the table was created.

### Step 16: Run migrations automatically when starting the app

The `start` script in `package.json` is configured as:

```json
"start": "node-pg-migrate up && node server.js"
```

Run the application with `npm start`. Pending migrations run before Express starts; if a migration fails, the server will not start. Do not edit a migration after it has been applied. For each future table or column change, create a new migration with `npx node-pg-migrate create <descriptive-name>`; the next app start applies it automatically.

### Step 17: Install Nodemon for development

Run this from the `NodeJSBackend` directory:

```bash
npm install --save-dev nodemon
```

Nodemon is installed as a development dependency.

### Step 18: Start the auto-reloading development server

The `predev` script applies pending migrations, then `dev` starts Nodemon:

```json
"predev": "node-pg-migrate up",
"dev": "nodemon server.js"
```

Run the app from the `NodeJSBackend` directory with:

```bash
npm run dev
```

Nodemon restarts the server when JavaScript files change. Stop it with `Ctrl+C`.

### Step 19: List users through the API

The `GET /api/users` route is connected to the users controller and selects all users from PostgreSQL, ordered by `id`. It returns a JSON array (an empty array when there are no users).

With the development server running, `GET http://localhost:9000/api/users` returns a JSON array. Verified locally; it currently returns an empty array because no users have been inserted yet.

### Step 20: Create users through the API

`POST /api/users` accepts a JSON body with required `name` and `email` fields. It inserts the user with a parameterized query and returns the created row with HTTP `201`. Missing fields return `400`; a duplicate email returns `409`.

Postman request:

- Method: `POST`
- URL: `http://localhost:9000/api/users`
- Body: select `raw` and `JSON`, then send `{"name":"Test User","email":"test.user@example.com"}`

The email must be unique for each test. This endpoint is implemented; verify it in Postman.

### Step 21: Update users through the API

`PUT /api/users/:id` replaces a user's `name` and `email`. Both fields are required. It returns `404` when the ID does not exist, `409` when the email belongs to another user, and `400` for an invalid ID or missing fields.

Postman request:

- Method: `PUT`
- URL: `http://localhost:9000/api/users/1` (replace `1` with an existing user ID)
- Body: select `raw` and `JSON`, then send `{"name":"Updated Name","email":"updated@example.com"}`

The endpoint is implemented; verify it using an existing user ID and an email not used by another user.

### Step 22: Delete users through the API

`DELETE /api/users/:id` deletes the user with the supplied positive integer ID and returns the deleted row. It returns `404` if that ID does not exist and `400` if the ID is invalid.

Postman request:

- Method: `DELETE`
- URL: `http://localhost:9000/api/users/1` (replace `1` with the ID of a user you intend to delete)
- Body: none

This endpoint is implemented; verify using a test user because deletion removes the row.

## Progress log

Append each new setup step here as it is completed. Include commands, files changed, and whether the step was verified.