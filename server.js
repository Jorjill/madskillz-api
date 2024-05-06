require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const nodePgMigrate = require("node-pg-migrate").default;

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "mydatabase",
  password: "password",
  port: 5432,
});

app.use(bodyParser.json());

const migrationOptions = {
  databaseUrl: process.env.DATABASE_URL,
  dir: "migrations",
  migrationsTable: "pgmigrations",
  direction: "up",
  count: Infinity,
};

(async () => {
  try {
    const result = await nodePgMigrate(migrationOptions);
    console.log("Migrations are successful", result);
  } catch (error) {
    console.error("Migration failed", error);
  }
})();

// Endpoint to save data
app.post("/items", async (req, res) => {
  const { title, imageurl } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO items (title, imageurl) VALUES ($1, $2) RETURNING *;",
      [title, imageurl]
    );
    res.status(201).send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Endpoint to retrieve data
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT title, imageurl FROM items;");
    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
