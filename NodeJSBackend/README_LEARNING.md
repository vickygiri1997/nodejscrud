# NodeJSBackend Learning Guide

This guide explains the current backend and suggests what to learn and build next. It is written for someone learning Node.js, Express, and PostgreSQL.

## What the application does now

The project is a REST API for users. It runs on Express, stores users in PostgreSQL, and uses `node-pg-migrate` to manage database schema changes.

The `users` table has:

- `id`: automatically assigned primary key.
- `name`: required user name.
- `email`: required, unique email address.
- `created_at`: timestamp assigned when the row is created.

The API currently supports these operations:

- `GET /api/users`: return all users as a JSON array.
- `POST /api/users`: create a user from `name` and `email` JSON fields.
- `PUT /api/users/:id`: replace a user's `name` and `email`.
- `DELETE /api/users/:id`: delete a user by ID.

Useful responses include `201` when a user is created, `400` for invalid input, `404` when an ID does not exist, and `409` when an email is already in use.

## How a request moves through the project

For `GET /api/users`, the flow is:

1. `server.js` starts Express and mounts the user router at `/api/users`.
2. `route/userRoutes.js` matches the HTTP method and path.
3. `controller/userController.js` validates input or decides what database operation to perform.
4. `config/db.js` provides the PostgreSQL connection pool.
5. PostgreSQL executes the parameterized query and returns rows.
6. The controller sends a JSON response to the API client, such as Postman.

## What each folder is for

- `config/`: application configuration, including the PostgreSQL connection pool.
- `controller/`: request handlers that validate input, call the database, and form HTTP responses.
- `route/`: maps HTTP methods and URL paths to controller functions.
- `model/`: a good home for reusable data-access functions as the application grows; it is currently unused.
- `migrations/`: versioned database schema changes. Each new table or column change should have a new migration.
- `server.js`: creates the Express app, adds middleware, mounts routes, and starts listening.

## Commands

Run these commands from the `NodeJSBackend` directory:

```powershell
npm run dev
```

This applies pending migrations and starts Nodemon. Nodemon restarts the server when watched files change. Stop it with `Ctrl+C`.

```powershell
npm start
```

This applies pending migrations and starts the server without Nodemon.

## Test the current API in Postman

Start the app with `npm run dev`, then use `http://localhost:9000` as the base URL.

### List users

- Method: `GET`
- URL: `/api/users`
- Expected result: a JSON array; it is `[]` when no users exist.

### Create a user

- Method: `POST`
- URL: `/api/users`
- Body type: **raw**, **JSON**
- Example body:

```json
{
  "name": "Test User",
  "email": "test.user@example.com"
}
```

The email must be unique. A successful response contains the new row and has status `201`.

### Update a user

- Method: `PUT`
- URL: `/api/users/1` (replace `1` with an existing user ID)
- Body type: **raw**, **JSON**
- Example body:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

Both fields are required for `PUT`.

### Delete a user

- Method: `DELETE`
- URL: `/api/users/1` (replace `1` with a user you intend to remove)
- Body: none

Deletion removes the row, so use a test user when practicing.

## Suggested learning roadmap

Build one feature at a time and test it in Postman before moving on.

### 1. Practice API validation

Try missing names, missing emails, invalid IDs, and duplicate emails. Confirm the API returns useful `400`, `404`, or `409` responses instead of crashing. Next, add email-format validation and consistent trimming of input.

### 2. Add partial updates with PATCH

`PUT` currently expects both `name` and `email`. A `PATCH /api/users/:id` endpoint can update only the fields included in the request. Learn how to build a safe parameterized update without accepting arbitrary SQL column names.

### 3. Add pagination and search

Support query parameters such as `?limit=10&offset=0` and `?search=alex`. This teaches query-string parsing and parameterized SQL. Set reasonable maximum limits so a request cannot accidentally return an unbounded number of rows.

### 4. Add a data-access layer

Move SQL out of the controller and into `model/userModel.js`, with functions such as `findAllUsers`, `findUserById`, `insertUser`, and `updateUser`. This teaches separation of responsibilities and gives the controller less database-specific code.

### 5. Add relationships and more tables

Build a related feature such as projects and tasks. Use migrations to create each table and add foreign keys. For example, a task can have a `project_id` that references a project. Learn how joins, one-to-many relationships, and constraints work.

### 6. Practice schema changes with migrations

Never edit a migration that has already been applied. Create a new migration for every later schema change:

```powershell
npx node-pg-migrate create add-phone-to-users
```

In the new migration, add the column in `up` and remove it in `down`. For example:

```js
exports.up = (pgm) => {
  pgm.addColumn("users", {
    phone: { type: "varchar(30)" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("users", "phone");
};
```

The configured app start scripts apply pending migrations before starting Express. A migration runs once and is tracked by `node-pg-migrate`.

### 7. Improve errors and logging

Add a shared Express error-handling middleware so unexpected errors have one consistent response format. Keep detailed errors in server logs, but do not send database internals, stack traces, or secrets to API clients.

### 8. Add automated tests

Test the routes with Node's test runner and an HTTP testing library. Cover successful create/update/delete operations as well as invalid input, duplicate emails, and missing IDs. Use a separate test database so tests cannot damage your development data.

### 9. Add security features

Learn request-size limits, CORS configuration, security headers, and rate limiting. If you later add passwords, store only strong password hashes; never store or log plaintext passwords. Keep `.env` out of Git and rotate any credential that has been exposed.

### 10. Add authentication and authorization

Authentication answers “who is making this request?” Authorization answers “is this person allowed to do this?” Add these only after you understand request middleware and password hashing. Protect user data so one user cannot read or change another user's records.

### 11. Document and deploy the API

Add OpenAPI/Swagger documentation, then learn how to deploy the service with environment variables, database backups, migrations, and production logging. Do not commit credentials or use development defaults in production.

## Good habits

- Keep SQL parameterized with placeholders such as `$1`; never concatenate user input into SQL.
- Validate request data on the server, even if a client validates it too.
- Use migrations for schema changes and keep applied migrations unchanged.
- Test with Postman and automated tests; do not rely only on a successful server start.
- Never put passwords or connection strings in source code, README files, screenshots, or chat.