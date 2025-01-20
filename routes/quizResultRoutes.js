const express = require('express');
const router = express.Router();
const quizResultModel = require("../models/quizResultModel");

// Create a new quiz result
router.post("/", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { quiz_name, status, correct_answers, total_questions } = req.body;
    
    const result = await quizResultModel.createQuizResult(
      quiz_name,
      status,
      correct_answers,
      total_questions,
      user_id
    );
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get quiz results for a user
router.get("/", async (req, res) => {
  const user_id = req.user_id;
  try {
    const results = await quizResultModel.getQuizResults(user_id);
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
