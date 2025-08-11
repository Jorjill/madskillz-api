const db = require("../db");

const typingExerciseModel = {
  // Create a new typing exercise
  async createTypingExercise(title, code, difficulty, language, skill, user_id) {
    try {
      const query = `
        INSERT INTO typing_exercises (title, code, difficulty, language, skill, user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const values = [title, code, difficulty, language, skill, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating typing exercise:", error);
      throw error;
    }
  },

  // Get all typing exercises for a user and skill
  async getTypingExercises(user_id, skill) {
    try {
      const query = `
        SELECT * FROM typing_exercises 
        WHERE user_id = $1 AND skill = $2
        ORDER BY created_at DESC
      `;
      const values = [user_id, skill];
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error fetching typing exercises:", error);
      throw error;
    }
  },

  // Get a specific typing exercise by ID
  async getTypingExerciseById(id, user_id) {
    try {
      const query = `
        SELECT * FROM typing_exercises 
        WHERE id = $1 AND user_id = $2
      `;
      const values = [id, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching typing exercise by ID:", error);
      throw error;
    }
  },

  // Update a typing exercise
  async updateTypingExercise(id, title, code, difficulty, language, skill, user_id) {
    try {
      const query = `
        UPDATE typing_exercises 
        SET title = $2, code = $3, difficulty = $4, language = $5, skill = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $7
        RETURNING *
      `;
      const values = [id, title, code, difficulty, language, skill, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating typing exercise:", error);
      throw error;
    }
  },

  // Delete a typing exercise
  async deleteTypingExercise(id, user_id) {
    try {
      const query = `
        DELETE FROM typing_exercises 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      const values = [id, user_id];
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting typing exercise:", error);
      throw error;
    }
  },

  // Get typing exercises count for a user and skill
  async getTypingExercisesCount(user_id, skill) {
    try {
      const query = `
        SELECT COUNT(*) as count FROM typing_exercises 
        WHERE user_id = $1 AND skill = $2
      `;
      const values = [user_id, skill];
      const result = await db.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error("Error getting typing exercises count:", error);
      throw error;
    }
  },


};

module.exports = typingExerciseModel;
