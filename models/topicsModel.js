const db = require("../db");
const { createReference, getReferenceBySkill } = require("./referenceModel");
const axios = require("axios");

const addTopic = async (title, content, skill) => {
  try {
    const references = await getReferenceBySkill(skill);
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    let reference;

    if (references.length > 0) {
      reference = references[0];
    } else {
      reference = await createReference(skill);
    }

    const res = await db.query(
      'INSERT INTO "topics" ("title", "content", "reference_id") VALUES ($1, $2, $3) RETURNING *;',
      [title, content, reference.id]
    );

    const prompt = `
    Based on the following title and content, generate 1-10 questions and their corresponding ideal answers based on size of content text. The questions should be general knowledge questions related to the content, not specific details. The response should be in a JSON format that is easy to parse and use in code, like: [{question:"", answer:""},{question:"", answer:""},{question:"", answer:""}].
    
    Title: ${title}
    
    Content: ${content}
    
    Response format:
    [
      {question:"", answer:""},
      {question:"", answer:""},
      {question:"", answer:""}
    ]
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
          max_tokens: 1024, // Increase max_tokens to handle longer responses
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      let gptAnswer = response.data.choices[0].message.content.trim();
      console.log("GPT Answer:", gptAnswer);

      // Remove backticks and parse JSON
      gptAnswer = gptAnswer
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let questionsAndAnswers;
      try {
        questionsAndAnswers = JSON.parse(gptAnswer);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        throw new Error("Failed to parse GPT-3 response as JSON");
      }

      console.log("Questions and answers:", questionsAndAnswers);
      for (const qa of questionsAndAnswers) {
        await createGeneralQuestion(qa.question, qa.answer, skill);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    }

    return res.rows[0];
  } catch (error) {
    console.error("Error adding topic:", error);
    throw error; // Re-throw the error for further handling if necessary
  }
};

const getTopics = () => {
  return db
    .query(
      `
      SELECT 
        t.id, 
        t.title, 
        t.content, 
        t.reference_id, 
        r.skill 
      FROM 
        "topics" as t
        JOIN "references" as r ON t.reference_id = r.id;
    `
    )
    .then((res) => res.rows);
};

const updateTopic = (id, title, content, skill) => {
  return getReferenceBySkill(skill)
    .then((references) => {
      if (references.length > 0) {
        return references[0];
      } else {
        return createReference(skill);
      }
    })
    .then((reference) => {
      return db.query(
        'UPDATE "topics" SET "title" = $1, "content" = $2, "reference_id" = $3 WHERE "id" = $4 RETURNING *;',
        [title, content, reference.id, id]
      );
    })
    .then((res) => res.rows[0]);
};

const deleteTopic = (id) => {
  return db
    .query('DELETE FROM "topics" WHERE "id" = $1 RETURNING *;', [id])
    .then((res) => res.rows[0]);
};

const createGeneralQuestion = async (question, answer, skill) => {
  const res = await db.query(
    "INSERT INTO questions (question, answer, skill) VALUES ($1, $2, $3) RETURNING *;",
    [question, answer, skill]
  );
  return res.rows[0];
};

module.exports = { addTopic, getTopics, updateTopic, deleteTopic };
