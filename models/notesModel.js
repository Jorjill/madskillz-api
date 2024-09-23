const db = require("../db");
const axios = require("axios");
const { generateGeneralQuestions, generateSpecificQuestion } = require('./topicsModel');

const createNote = async (
  notes_title,
  content,
  noteSkill,
  datetime,
  tags,
  user_id,
  general_questions,
  specific_questions
) => {

  if(general_questions !=null && general_questions > 0){
    generateGeneralQuestions(notes_title, content, noteSkill, user_id, general_questions);
  }

  if(specific_questions !=null && specific_questions > 0){
    generateSpecificQuestion(notes_title, content, noteSkill, specific_questions);
  }

  try {
    const res = await db.query(
      'INSERT INTO "notes" ("notes_title", "content", "noteSkill", "datetime", "tags", "user_id") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [notes_title, content, noteSkill, datetime, tags, user_id]
    );

    return res.rows[0];
  } catch (error) {
    console.error("Error adding topic:", error);
    throw error;
  }
};

const getNotes = (user_id) => {
  return db
    .query(
      'SELECT "id","notes_title", "content", "noteSkill", "datetime", "tags", "user_id" FROM "notes" WHERE "user_id" = $1 ;',
      [user_id]
    )
    .then((res) => res.rows);
};

const updateNote = (
  id,
  notes_title,
  content,
  noteSkill,
  datetime,
  tags,
  user_id
) => {
  return db
    .query(
      'UPDATE "notes" SET "notes_title" = $2, "content" = $3, "noteSkill" = $4, "datetime" = $5, "tags" = $6, "user_id" = $7 WHERE "id" = $1 RETURNING *;',
      [id, notes_title, content, noteSkill, datetime, tags, user_id]
    )
    .then((res) => res.rows[0]);
};

const deleteNote = (id) => {
  return db
    .query('DELETE FROM "notes" WHERE "id" = $1;', [id])
    .then((res) => res.rows);
};

const deleteNoteBySkill = (skill, user_id) => {
  return db
    .query(
      'DELETE FROM "notes" WHERE "noteSkill" = $1 AND "user_id" = $2 RETURNING *;',
      [skill, user_id]
    )
    .then((res) => res.rows);
};

const selectNotesBySkill = (skill, user_id) => {
  return db
    .query('SELECT * FROM "notes" WHERE "noteSkill" = $1 AND "user_id" = $2;', [
      skill,
      user_id,
    ])
    .then((res) => res.rows);
};

const filterBase64Images = (content) => {
  const base64ImagePattern = /data:image\/[a-zA-Z]+;base64,[^\s]+/g;
  return content.replace(base64ImagePattern, "[Image]");
};

const createExperienceQuestion = async (
  question,
  answer,
  noteSkill,
  user_id
) => {
  const datetime = new Date().toISOString();
  const res = await db.query(
    "INSERT INTO experience_questions (question, answer, skill, datetime, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [question, answer, noteSkill, datetime, user_id]
  );
  return res.rows[0];
};

const generateExperienceQuestions = async (notes_title, content, noteSkill) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const filteredContent = filterBase64Images(content);
  const prompt = `
  Based on the following title and content, generate 1-3 coding questions and their corresponding ideal answers based on the size of the content text. The questions should be specific coding questions related to the content, asking the user to write some code (for example, if the content is about React styling, then the question must be: 'Please write code to add styling to this component,' or if the question is about controllers in NestJS, then ask the user to write controller code). The answer must be code. Only generate questions and answers if the content is strictly about coding and contains code snippets or detailed explanations of code. If the content is not strictly about coding, return empty responses. The response should be in a JSON format that is easy to parse and use in code, like:  [{question:"", answer:""},{question:"", answer:""},{question:"", answer:""}].
  
  Title: ${notes_title}
  
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
      await createExperienceQuestion(qa.question, qa.answer, noteSkill);
    }
  } catch (error) {
    console.error("Error generating questions:", error);
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  deleteNoteBySkill,
  selectNotesBySkill,
};
