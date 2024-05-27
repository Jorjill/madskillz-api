const db = require("../db");
const { get } = require("../routes/generalQuestionRoutes");
require("dotenv").config();
const axios = require("axios");

const getGeneralQuestions = async () => {
  const res = await db.query("SELECT * FROM questions;");
  return res.rows;
};

const createGeneralQuestion = async (question, answer, skill) => {
  const res = await db.query(
    "INSERT INTO questions (question, answer, skill) VALUES ($1, $2, $3) RETURNING *;",
    [question, answer, skill]
  );
  return res.rows[0];
};

const getGeneralQuestionAnswer = async (
  id,
  question,
  answer,
  providedAnswer
) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const prompt = `
Please rate the provided answer based on the following criteria:

**Rating Criteria:**
- **5:** The provided answer is very close to the ideal answer with only slight mistakes.
- **4:** The provided answer is close to the ideal answer but contains a few minor errors.
- **3:** The provided answer is somewhat similar to the ideal answer but has several noticeable errors.
- **2:** The provided answer is significantly different from the ideal answer with many errors.
- **1:** The provided answer is completely incorrect or irrelevant.

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

    if (rating >= 4) {
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

module.exports = {
  getGeneralQuestions,
  getGeneralQuestionAnswer,
  createGeneralQuestion,
};
