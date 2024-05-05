const express = require("express");
const { Pool } = require("pg");
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: "user",
  host: "db",
  database: "mydatabase",
  password: "password",
  port: 5432,
});

app.get("/db", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.send(rows[0]);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
