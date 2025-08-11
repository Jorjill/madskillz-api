const express = require("express");
const router = express.Router();
const typingExerciseModel = require("../models/typingExerciseModel");

// Create a new typing exercise
router.post("/", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { title, code, difficulty, language, skill } = req.body;

    // Validate required fields
    if (!title || !code || !difficulty || !language || !skill) {
      return res.status(400).json({ 
        error: "Missing required fields: title, code, difficulty, language, skill" 
      });
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ 
        error: "Invalid difficulty. Must be one of: Easy, Medium, Hard" 
      });
    }

    const result = await typingExerciseModel.createTypingExercise(
      title,
      code,
      difficulty,
      language,
      skill,
      user_id
    );
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating typing exercise:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all typing exercises for a user and skill
router.get("/:skill", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { skill } = req.params;
    
    if (!skill) {
      return res.status(400).json({ error: "Skill parameter is required" });
    }

    let exercises = await typingExerciseModel.getTypingExercises(user_id, skill);
    
    // If no exercises exist, create default ones
    if (exercises.length === 0) {
      console.log(`No typing exercises found for user ${user_id} and skill ${skill}. Creating default exercises.`);
      exercises = await typingExerciseModel.createDefaultExercises(user_id, skill);
    }

    res.status(200).json(exercises);
  } catch (err) {
    console.error("Error fetching typing exercises:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific typing exercise by ID
router.get("/exercise/:id", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Exercise ID is required" });
    }

    const exercise = await typingExerciseModel.getTypingExerciseById(id, user_id);
    
    if (!exercise) {
      return res.status(404).json({ error: "Typing exercise not found" });
    }

    res.status(200).json(exercise);
  } catch (err) {
    console.error("Error fetching typing exercise:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a typing exercise
router.put("/:id", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { id } = req.params;
    const { title, code, difficulty, language, skill } = req.body;

    // Validate required fields
    if (!title || !code || !difficulty || !language || !skill) {
      return res.status(400).json({ 
        error: "Missing required fields: title, code, difficulty, language, skill" 
      });
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ 
        error: "Invalid difficulty. Must be one of: Easy, Medium, Hard" 
      });
    }

    const result = await typingExerciseModel.updateTypingExercise(
      id,
      title,
      code,
      difficulty,
      language,
      skill,
      user_id
    );

    if (!result) {
      return res.status(404).json({ error: "Typing exercise not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error updating typing exercise:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a typing exercise
router.delete("/:id", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "Exercise ID is required" });
    }

    // Check if this is the last exercise for the user/skill
    const exercise = await typingExerciseModel.getTypingExerciseById(id, user_id);
    if (!exercise) {
      return res.status(404).json({ error: "Typing exercise not found" });
    }

    const count = await typingExerciseModel.getTypingExercisesCount(user_id, exercise.skill);
    if (count <= 1) {
      return res.status(400).json({ 
        error: "Cannot delete the last exercise. At least one exercise must remain." 
      });
    }

    const result = await typingExerciseModel.deleteTypingExercise(id, user_id);
    
    if (!result) {
      return res.status(404).json({ error: "Typing exercise not found" });
    }

    res.status(200).json({ message: "Typing exercise deleted successfully", exercise: result });
  } catch (err) {
    console.error("Error deleting typing exercise:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get typing exercises count for a skill
router.get("/:skill/count", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { skill } = req.params;
    
    if (!skill) {
      return res.status(400).json({ error: "Skill parameter is required" });
    }

    const count = await typingExerciseModel.getTypingExercisesCount(user_id, skill);
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting typing exercises count:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
