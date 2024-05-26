const db = require("../db");
const { get } = require("../routes/generalQuestionRoutes");
require("dotenv").config();
const axios = require("axios");

const getGeneralQuestions = async () => {
  const res = await db.query("SELECT * FROM questions;");
  return res.rows;
};

const getGeneralQuestionAnswer = async (
  id,
  question,
  answer,
  providedAnswer
) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const prompt = `Please rate this answer on a scale of 1-5 if question was: ${question} and ideal answer is: ${answer} and user provided answer: ${providedAnswer}. Provide rating in format: Rating: 5. Reason: It was a great answer, ideal answer is: . Please rate more than 3 only if it's very close to ideal answer:${answer}, but only slight mistakes. If rating is less than 3 it means answer if failed, if more than 3 then passed.`;
  console.log("prompt", prompt);
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo", // Updated model
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
      rating = parseInt(ratingMatch[1], 5);
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

module.exports = {
  getGeneralQuestions,
  getGeneralQuestionAnswer,
};
