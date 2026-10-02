const pool = require("../config/db");

const getUsers = async (req, res) => {
  try {
    console.log("Fetching users from the database...");
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY id"
    );
  console.log("Users fetched successfully:", result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  const { name, email } = req.body ?? {};
  console.log("Received request to create user:", { name, email });

  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
      [name.trim(), email.trim()]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    console.error("Failed to create user:", error);
    return res.status(500).json({ message: "Failed to create user" });
  }
};

const updateUser = async (req, res) => {
  const userId = Number(req.params.id);
  const { name, email } = req.body ?? {};

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "User ID must be a positive integer" });
  }

  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, created_at",
      [name.trim(), email.trim(), userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    console.error("Failed to update user:", error);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "User ID must be a positive integer" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email, created_at",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to delete user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };