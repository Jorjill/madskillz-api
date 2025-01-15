const db = require("../db");
const { createReference, getReferenceBySkill } = require("./referenceModel");
const axios = require("axios");

const addTopic = async (
  title,
  content,
  skill,
  datetime,
  user_id,
  general_questions,
  specific_questions
) => {
  try {
    const references = await getReferenceBySkill(skill, user_id);
    let reference;

    if (general_questions > 0) {
      generateGeneralQuestions(
        title,
        content,
        skill,
        user_id,
        general_questions
      );
    }

    if (specific_questions > 0) {
      generateSpecificQuestion(title, content, skill, specific_questions);
    }

    if (references.length > 0) {
      reference = references[0];
    } else {
      reference = await createReference(skill, user_id);
    }

    const res = await db.query(
      'INSERT INTO "topics" ("title", "content", "reference_id", "datetime", "user_id") VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [title, content, reference.id, datetime, user_id]
    );

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
        t.datetime,
        r.skill,
        r.user_id
      FROM 
        "topics" as t
        JOIN "references" as r ON t.reference_id = r.id;
    `
    )
    .then((res) => res.rows);
};

const updateTopic = (id, title, content, skill, datetime, user_id) => {
  return getReferenceBySkill(skill, user_id)
    .then((references) => {
      if (references.length > 0) {
        return references[0];
      } else {
        return createReference(skill);
      }
    })
    .then((reference) => {
      return db.query(
        'UPDATE "topics" SET "title" = $1, "content" = $2, "reference_id" = $3, "datetime"=$4 WHERE "id" = $5 AND "user_id" = $6 RETURNING *;',
        [title, content, reference.id, datetime, id, user_id]
      );
    })
    .then((res) => res.rows[0]);
};

const deleteTopic = (id) => {
  return db
    .query('DELETE FROM "topics" WHERE "id" = $1 RETURNING *;', [id])
    .then((res) => res.rows[0]);
};

const filterBase64Images = (content) => {
  const base64ImagePattern = /data:image\/[a-zA-Z]+;base64,[^\s]+/g;
  return content.replace(base64ImagePattern, "[Image]");
};

const createGeneralQuestion = async (question, answer, skill, user_id) => {
  const datetime = new Date().toISOString();
  const res = await db.query(
    "INSERT INTO questions (question, answer, skill, datetime, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [question, answer, skill, datetime, user_id]
  );
  return res.rows[0];
};

const createSpecificQuestion = async (question, answer, skill) => {
  const datetime = new Date().toISOString();
  const res = await db.query(
    "INSERT INTO specific_questions (question, answer, skill, datetime) VALUES ($1, $2, $3, $4) RETURNING *;",
    [question, answer, skill, datetime]
  );
  return res.rows[0];
};

const generateGeneralQuestions = async (
  title,
  content,
  skill,
  user_id,
  general_questions
) => {

  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const filteredContent = filterBase64Images(content);
  const prompt = `
  Based on the following title and content, generate ${general_questions} questions and their corresponding ideal answers based on size of content text. The questions should be general knowledge questions related to the content, not specific details (for example if content is about react styling then question should be explain how react styling must be done) and answer must be at lease 300 words long. The response should be in a JSON format that is easy to parse and use in code, like: [{question:"", answer:""},{question:"", answer:""},{question:"", answer:""}].
  
  Title: ${title}
  
  Content: ${filteredContent}
  
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
    for (const qa of questionsAndAnswers) {
      await createGeneralQuestion(qa.question, qa.answer, skill, user_id);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
  }
};

const generateSpecificQuestion = async (
  title,
  content,
  skill,
  specific_questions
) => {
  console.log("Generating specific questions...");
  
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const filteredContent = filterBase64Images(content);
  const prompt = `
  Based on the following title and content, generate ${specific_questions} coding questions and their corresponding ideal answers based on the size of the content text. The questions should be specific coding questions related to the content, asking the user to write some code (for example, if the content is about React styling, then the question must be: 'Please write code to add styling to this component,' or if the question is about controllers in NestJS, then ask the user to write controller code). The answer must be code. Only generate questions and answers if the content is strictly about coding and contains code snippets or detailed explanations of code. If the content is not strictly about coding, return empty responses. The response should be in a JSON format that is easy to parse and use in code, like:  [{question:"", answer:""},{question:"", answer:""},{question:"", answer:""}].
  
  Title: ${title}
  
  Content: ${filteredContent}
  
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
      await createSpecificQuestion(qa.question, qa.answer, skill);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
  }
};

module.exports = {
  addTopic,
  getTopics,
  updateTopic,
  deleteTopic,
  generateGeneralQuestions,
  generateSpecificQuestion,
};
