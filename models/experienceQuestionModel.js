const db = require("../db");
require("dotenv").config();
const axios = require("axios");

const getExperienceQuestions = async (user_id) => {
  const res = await db.query(
    "SELECT * FROM experience_questions WHERE user_id = $1;",
    [user_id]
  );
  return res.rows;
};

const getExperienceQuestionAnswer = async (
  id,
  question,
  answer,
  providedAnswer
) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const prompt = `
    Please rate the provided answer based on the overall quality, context, and how well it addresses the question. Focus on how informative and helpful the answer is, rather than whether it matches the ideal answer word-for-word.

    **Rating Criteria:**
    - **5:** The provided answer is highly accurate, well-explained, and addresses the question comprehensively, with only minor improvements possible.
    - **4:** The provided answer is mostly accurate and informative, but may contain minor errors or areas that could be expanded upon.
    - **3:** The provided answer is somewhat helpful, but has noticeable errors, missing key details, or is partially unclear.
    - **2:** The provided answer is off-track with several errors or missing important context, making it hard to understand or not particularly useful.
    - **1:** The provided answer is incorrect, irrelevant, or lacks meaningful content.

    Even if the answer is not identical to the ideal, please consider its value if it provides useful, relevant information or is well-written.

    Format your rating as follows:
    Rating: [1-5]
    - Reason: [Brief explanation]

    Example format:
    Rating: 5. Reason: The answer was informative, addressed the question thoroughly, but could be improved slightly by [specific suggestions].

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

module.exports = {
  getExperienceQuestions,
  getExperienceQuestionAnswer,
};
