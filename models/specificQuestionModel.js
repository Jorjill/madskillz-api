const db = require("../db");
require("dotenv").config();
const axios = require("axios");

const getSpecificQuestions = async (user_id) => {
  const res = await db.query('SELECT * FROM specific_questions WHERE "user_id" = $1;', [user_id]);
  return res.rows;
};

const createSpecificQuestion = async (question, answer, skill, user_id) => {
  const datetime = new Date().toISOString();
  const res = await db.query(
    "INSERT INTO specific_questions (question, answer, skill, datetime, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [question, answer, skill, datetime, user_id]
  );
  return res.rows[0];
};

const getSpecificQuestionAnswer = async (
  id,
  question,
  answer,
  providedAnswer
) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const prompt = `
  Please rate the provided answer based on the following criteria, please also use your own judgement to determine the rating based on the quality of the answer:
  
  **Rating Criteria:**
  - **5:** The provided answer is very close to the ideal answer with only slight mistakes.
  - **4:** The provided answer is close to the ideal answer but contains a few minor errors.
  - **3:** The provided answer is somewhat similar to the ideal answer but has several noticeable errors.
  - **2:** The provided answer is significantly different from the ideal answer with many errors.
  - **1:** The provided answer is completely incorrect or irrelevant.
  
  Sometimes answer might not be same as ideal answer but can still be rated high if it is well written and informative
  
  Format your rating as follows:
  Rating:[1-5]
  - Reason: [Brief explanation]
  
  Example format:
  Rating:5. Reason: It was a great answer, ideal answer is: ${answer} but the provided answer had slight mistakes such as [specific mistakes].
  
  Here is the question, ideal answer, and the user-provided answer for evaluation:
  
  - **Question:** ${question}
  - **Ideal Answer:** ${answer}
  - **Provided Answer:** ${providedAnswer}
  `;
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const gptAnswer = response.data.choices[0].message.content.trim();

    // Extract the rating and reason
    const ratingMatch = gptAnswer.match(/Rating:\s*(\d+)/i);
    let rating = null;
    if (ratingMatch) {
      rating = parseInt(ratingMatch[1], 10); // Correct base 10
    }

    let result = "FAIL";
    let reason = gptAnswer;

    if (rating >= 3) {
      result = "PASS";
    }

    return {
      result,
      reason,
    };
  } catch (error) {
    console.error(
      "Error calling OpenAI API:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to get response from ChatGPT API");
  }
};

const deleteSpecificQuestion = async (id) => {
  const res = await db.query('DELETE FROM specific_questions WHERE id = $1 RETURNING *;', [id]);
  return res.rows[0];
}

module.exports = {
  getSpecificQuestionAnswer,
  getSpecificQuestions,
  createSpecificQuestion,
  deleteSpecificQuestion
};
