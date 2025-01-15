const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const QuizModel = {
  async getAllQuizzes(userId, skill) {
    const query = {
      text: `
        SELECT q.*, 
          (SELECT json_agg(qq.*) 
           FROM quiz_questions qq 
           WHERE qq.quiz_id = q.id) as questions
        FROM quizzes q
        WHERE q.user_id = $1
        ${skill ? 'AND q.skill = $2' : ''}
        ORDER BY q.created_at DESC
      `,
      values: skill ? [userId, skill.toLowerCase()] : [userId]
    };
    
    const result = await db.query(query);
    return result.rows;
  },

  async createQuiz({ title, skill, userId }) {
    const id = uuidv4();
    const query = {
      text: `
        INSERT INTO quizzes (id, title, skill, user_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      values: [id, title, skill.toLowerCase(), userId]
    };

    const result = await db.query(query);
    return { ...result.rows[0], questions: [] };
  },

  async updateQuiz({ id, title, userId }) {
    const query = {
      text: `
        UPDATE quizzes
        SET title = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `,
      values: [title, id, userId]
    };

    const result = await db.query(query);
    return result.rows[0];
  },

  async deleteQuiz(id, userId) {
    const query = {
      text: 'DELETE FROM quizzes WHERE id = $1 AND user_id = $2 RETURNING *',
      values: [id, userId]
    };

    const result = await db.query(query);
    return result.rows[0];
  }
};

module.exports = QuizModel;
