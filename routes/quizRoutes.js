const express = require('express');
const router = express.Router();
const QuizModel = require('../models/quizModel');
const QuizQuestionModel = require('../models/quizQuestionModel');
const authMiddleware = require('../authMiddleware');

// Get all quizzes for a skill
router.get('/:skill?', authMiddleware, async (req, res) => {
  try {
    const quizzes = await QuizModel.getAllQuizzes(req.user_id, req.params.skill);
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Create a new quiz
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { skill, title = 'New Quiz' } = req.body;
    if (!skill) {
      return res.status(400).json({ error: 'Skill is required' });
    }
    
    const quiz = await QuizModel.createQuiz({
      title,
      skill,
      userId: req.user_id
    });
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update a quiz
router.put('/:quizId', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const quiz = await QuizModel.updateQuiz({
      id: req.params.quizId,
      title,
      userId: req.user_id
    });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Delete a quiz
router.delete('/:quizId', authMiddleware, async (req, res) => {
  try {
    const quiz = await QuizModel.deleteQuiz(req.params.quizId, req.user_id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Create a question
router.post('/:quizId/questions', authMiddleware, async (req, res) => {
  try {
    const { title = 'New Question', text = '', answer = '' } = req.body;
    const question = await QuizQuestionModel.createQuestion({
      quizId: req.params.quizId,
      title,
      text,
      answer
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update a question
router.put('/:quizId/questions/:questionId', authMiddleware, async (req, res) => {
  try {
    const { text, answer } = req.body;
    if (!text || !answer) {
      return res.status(400).json({ error: 'Text and answer are required' });
    }

    const question = await QuizQuestionModel.updateQuestion({
      id: req.params.questionId,
      quizId: req.params.quizId,
      text,
      answer
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
router.delete('/:quizId/questions/:questionId', authMiddleware, async (req, res) => {
  try {
    const question = await QuizQuestionModel.deleteQuestion(
      req.params.questionId,
      req.params.quizId
    );
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
