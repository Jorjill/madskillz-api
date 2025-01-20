const db = require("../db");
require("dotenv").config();

const createQuizResult = async (quiz_name, skill, status, correct_answers, total_questions, user_id) => {
  const created_at = new Date().toISOString();
  const res = await db.query(
    "INSERT INTO quiz_results (quiz_name, skill, status, correct_answers, total_questions, user_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
    [quiz_name, skill, status, correct_answers, total_questions, user_id, created_at]
  );
  return res.rows[0];
};

const getQuizResults = async (user_id) => {
  const res = await db.query('SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC;', [user_id]);
  return res.rows;
};

const getQuizResultsBySkill = async (user_id, skill) => {
  const res = await db.query('SELECT * FROM quiz_results WHERE user_id = $1 AND skill = $2 ORDER BY created_at DESC;', [user_id, skill]);
  return res.rows;
};

module.exports = {
  createQuizResult,
  getQuizResults,
  getQuizResultsBySkill
};
