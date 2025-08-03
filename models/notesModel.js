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

    // After adding a new note, update the summary for this skill
    try {
      // Get all notes for this skill
      const notes = await selectNotesBySkill(noteSkill, user_id);
      if (notes && notes.length > 0) {
        // Generate a new summary and store it in the database
        await generateSummary(noteSkill, user_id, notes);
      }
    } catch (summaryError) {
      console.error("Error updating summary after adding note:", summaryError);
      // Don't throw the error here to avoid disrupting the note creation process
    }

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

const updateNote = async (
  id,
  notes_title,
  content,
  noteSkill,
  datetime,
  tags,
  user_id
) => {
  try {
    const res = await db.query(
      'UPDATE "notes" SET "notes_title" = $2, "content" = $3, "noteSkill" = $4, "datetime" = $5, "tags" = $6, "user_id" = $7 WHERE "id" = $1 RETURNING *;',
      [id, notes_title, content, noteSkill, datetime, tags, user_id]
    );

    // After updating a note, update the summary for this skill
    try {
      // Get all notes for this skill
      const notes = await selectNotesBySkill(noteSkill, user_id);
      if (notes && notes.length > 0) {
        // Generate a new summary and store it in the database
        await generateSummary(noteSkill, user_id, notes);
      }
    } catch (summaryError) {
      console.error("Error updating summary after updating note:", summaryError);
      // Don't throw the error here to avoid disrupting the note update process
    }

    return res.rows[0];
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
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

// Store a summary in the database
const storeSummary = async (skill, user_id, summary, noteCount) => {
  try {
    // Check if a summary already exists for this skill and user
    const existingRes = await db.query(
      'SELECT * FROM "note_summaries" WHERE "skill" = $1 AND "user_id" = $2',
      [skill, user_id]
    );

    const now = new Date().toISOString();

    if (existingRes.rows.length > 0) {
      // Update existing summary
      const res = await db.query(
        'UPDATE "note_summaries" SET "summary" = $1, "note_count" = $2, "updated_at" = $3 WHERE "skill" = $4 AND "user_id" = $5 RETURNING *',
        [summary, noteCount, now, skill, user_id]
      );
      return res.rows[0];
    } else {
      // Insert new summary
      const res = await db.query(
        'INSERT INTO "note_summaries" ("skill", "user_id", "summary", "note_count", "created_at", "updated_at") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [skill, user_id, summary, noteCount, now, now]
      );
      return res.rows[0];
    }
  } catch (error) {
    console.error('Error storing summary:', error);
    throw error;
  }
};

// Get a summary from the database
const getSummaryFromDB = async (skill, user_id) => {
  try {
    const res = await db.query(
      'SELECT * FROM "note_summaries" WHERE "skill" = $1 AND "user_id" = $2',
      [skill, user_id]
    );
    
    if (res.rows.length > 0) {
      return res.rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error retrieving summary:', error);
    throw error;
  }
};

// Generate a summary using OpenAI
const generateSummary = async (skill, user_id, notes) => {
  try {
    console.log(`Generating summary for ${notes.length} notes with skill ${skill}`);
    
    // Prepare the content for summarization
    const notesContent = notes.map((note, index) => {
      console.log(`Processing note ${index + 1}/${notes.length}: ${note.notes_title}`);
      return `Title: ${note.notes_title}\n\nContent: ${filterBase64Images(note.content)}`;
    }).join('\n\n---\n\n');
    
    console.log(`Total content length: ${notesContent.length} characters`);

    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    // Make sure OpenAI gets all notes by explicitly mentioning the count
    const prompt = `
    Create a brief, concise summary of these ${notes.length} notes about "${skill}".
    Keep it short and to the point, focusing only on the most essential information.
    Each note is separated by '---'.
    
    ${notesContent}
    `;
    
    console.log(`Sending prompt to OpenAI with ${notes.length} notes`);

    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes technical notes and learning materials." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const summary = response.data.choices[0].message.content.trim();
    
    console.log(`Received summary from OpenAI: ${summary.substring(0, 100)}...`);
    
    // Store the summary in the database
    await storeSummary(skill, user_id, summary, notes.length);
    
    return { 
      summary,
      noteCount: notes.length,
      skill
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

const summarizeNotesBySkill = async (skill, user_id) => {
  try {
    console.log(`Summarizing notes for skill: ${skill}, user_id: ${user_id}`);
    
    // Get all notes for the specified skill and user first
    const notes = await selectNotesBySkill(skill, user_id);
    console.log(`Found ${notes ? notes.length : 0} notes for skill ${skill}`);
    
    // If no notes exist, return early
    if (!notes || notes.length === 0) {
      console.log(`No notes found for skill: ${skill}`);
      return { summary: "No notes found for this skill." };
    }
    
    // Check if we have a summary in the database
    const existingSummary = await getSummaryFromDB(skill, user_id);
    
    if (existingSummary) {
      console.log(`Found existing summary in database for skill: ${skill}`);
      return {
        summary: existingSummary.summary,
        noteCount: existingSummary.note_count,
        skill
      };
    }
    
    console.log(`No existing summary found, generating new summary for skill: ${skill}`);
    // Generate and store a new summary
    return await generateSummary(skill, user_id, notes);
  } catch (error) {
    console.error("Error summarizing notes:", error);
    throw error;
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  deleteNoteBySkill,
  selectNotesBySkill,
  summarizeNotesBySkill,
  storeSummary,
  getSummaryFromDB,
  generateSummary,
};
