const db = require("../db");
require("dotenv").config();
const axios = require("axios");

const createQuizResult = async (quiz_name, skill, status, correct_answers, total_questions, user_id, answerResults) => {
  const created_at = new Date().toISOString();
  const res = await db.query(
    "INSERT INTO quiz_results (quiz_name, skill, status, correct_answers, total_questions, user_id, created_at, answer_results) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;",
    [quiz_name, skill, status, correct_answers, total_questions, user_id, created_at, JSON.stringify(answerResults)]
  );
  return res.rows[0];
};

const getQuizResults = async (user_id) => {
  const res = await db.query('SELECT * FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC;', [user_id]);
  const results = res.rows;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    const prompt = `
    Please analyze these quiz results and provide a comprehensive summary of the user's performance. Focus on:
    1. Overall performance trends
    2. Areas of strength
    3. Areas needing improvement
    4. Specific recommendations for improvement
    
    Quiz Results: ${JSON.stringify(results)}
    
    Please format your response in a clear, concise manner that's easy to read and actionable.`;

    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing educational performance data and providing constructive feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const analysis = response.data.choices[0].message.content;
    return {
      raw_results: results,
      performance_summary: analysis
    };
  } catch (error) {
    console.error("Error getting OpenAI analysis:", error);
    return {
      raw_results: results,
      performance_summary: "Unable to generate performance summary at this time."
    };
  }
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
