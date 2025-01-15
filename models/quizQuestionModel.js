const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const QuizQuestionModel = {
  async getQuestions(quizId) {
    const query = {
      text: `
        SELECT * FROM quiz_questions
        WHERE quiz_id = $1
        ORDER BY created_at ASC
      `,
      values: [quizId]
    };

    const result = await db.query(query);
    return result.rows;
  },

  async createQuestion({ quizId, title, text, answer }) {
    const id = uuidv4();
    const query = {
      text: `
        INSERT INTO quiz_questions (id, quiz_id, title, text, answer)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      values: [id, quizId, title, text, answer]
    };

    const result = await db.query(query);
    return result.rows[0];
  },

  async updateQuestion({ id, quizId, text, answer }) {
    const query = {
      text: `
        UPDATE quiz_questions
        SET text = $1, answer = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND quiz_id = $4
        RETURNING *
      `,
      values: [text, answer, id, quizId]
    };

    const result = await db.query(query);
    return result.rows[0];
  },

  async deleteQuestion(id, quizId) {
    const query = {
      text: 'DELETE FROM quiz_questions WHERE id = $1 AND quiz_id = $2 RETURNING *',
      values: [id, quizId]
    };

    const result = await db.query(query);
    return result.rows[0];
  }
};

module.exports = QuizQuestionModel;
