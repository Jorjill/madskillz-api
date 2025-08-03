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

    // After adding a new note, update the summary
    try {
      // Get existing summary if available
      const existingSummary = await getSummaryFromDB(noteSkill, user_id);
      
      if (existingSummary) {
        // If we already have a summary, just update it with the new note
        await updateExistingSummaryWithNewNote(existingSummary, res.rows[0], noteSkill, user_id);
      } else {
        // If no summary exists, create a new one from scratch
        await summarizeNotesBySkill(noteSkill, user_id);
      }
    } catch (error) {
      console.error('Error updating summary after adding note:', error);
      // Continue even if summarization fails
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

    // After updating a note, update the summary
    try {
      // Get existing summary if available
      const existingSummary = await getSummaryFromDB(noteSkill, user_id);
      
      if (existingSummary) {
        // If we already have a summary, just update it with the new note
        await updateExistingSummaryWithNewNote(existingSummary, res.rows[0], noteSkill, user_id);
      } else {
        // If no summary exists, create a new one from scratch
        await summarizeNotesBySkill(noteSkill, user_id);
      }
    } catch (error) {
      console.error('Error updating summary after updating note:', error);
      // Continue even if summarization fails
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

// Update an existing summary with a new note
const updateExistingSummaryWithNewNote = async (existingSummary, newNote, skill, user_id) => {
  try {
    console.log(`Updating existing summary for skill ${skill} with new note`);
    
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    
    const prompt = `
    Here is an existing summary of notes about "${skill}":
    
    ${existingSummary.summary}
    
    Please update this summary to include the following new note:
    
    Title: ${newNote.notes_title}
    
    Content: ${newNote.content}
    
    The updated summary should remain concise and focused on essential information.
    `;
    
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that updates summaries with new information." },
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
    
    const updatedSummary = response.data.choices[0].message.content.trim();
    console.log(`Generated updated summary: ${updatedSummary.substring(0, 100)}...`);
    
    // Store the updated summary
    await storeSummary(skill, user_id, updatedSummary, existingSummary.note_count + 1);
    
    return {
      summary: updatedSummary,
      noteCount: existingSummary.note_count + 1,
      skill
    };
  } catch (error) {
    console.error("Error updating summary with new note:", error);
    throw error;
  }
};

// Generate a summary using OpenAI with chunking for large note sets
const generateSummary = async (notes, skill, user_id) => {
  try {
    console.log(`Generating summary for ${notes.length} notes about ${skill}`);
    
    // Define chunk size - adjust based on testing
    const CHUNK_SIZE = 10; // Number of notes per chunk
    const MAX_TOKENS_PER_NOTE = 1000; // Estimated average tokens per note
    
    // If we have a small number of notes, process directly
    if (notes.length <= CHUNK_SIZE) {
      return await generateSingleSummary(notes, skill, user_id);
    }
    
    // For larger sets, use chunked approach
    console.log(`Using chunked approach for ${notes.length} notes`);
    
    // Split notes into chunks
    const chunks = [];
    for (let i = 0; i < notes.length; i += CHUNK_SIZE) {
      chunks.push(notes.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`Split notes into ${chunks.length} chunks`);
    
    // Generate summary for each chunk
    const chunkSummaries = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i+1}/${chunks.length} with ${chunks[i].length} notes`);
      
      try {
        const chunkResult = await generateSingleSummary(chunks[i], `${skill} (part ${i+1})`, user_id, false);
        chunkSummaries.push(chunkResult.summary);
      } catch (error) {
        console.error(`Error processing chunk ${i+1}:`, error.message);
        // Continue with other chunks even if one fails
        chunkSummaries.push(`[Error summarizing chunk ${i+1}]`);
      }
    }
    
    // Now summarize the summaries
    console.log(`Generating meta-summary from ${chunkSummaries.length} chunk summaries`);
    
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    
    const metaPrompt = `
    Below are summaries of different sets of notes about "${skill}".
    Create a comprehensive yet concise summary that captures the key points across all these summaries.
    
    ${chunkSummaries.map((summary, i) => `Summary ${i+1}:\n${summary}`).join('\n\n---\n\n')}
    `;
    
    const response = await axios.post(
      apiUrl,
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that creates concise summaries from multiple sources." },
          { role: "user", content: metaPrompt },
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
    
    const finalSummary = response.data.choices[0].message.content.trim();
    console.log(`Generated final summary: ${finalSummary.substring(0, 100)}...`);
    
    // Store the final summary in the database
    await storeSummary(skill, user_id, finalSummary, notes.length);
    
    return {
      summary: finalSummary,
      noteCount: notes.length,
      skill
    };
  } catch (error) {
    console.error("Error in chunked summary generation:", error);
    throw error;
  }
};

// Helper function to generate a summary for a single chunk of notes
const generateSingleSummary = async (notes, skill, user_id, storeInDb = true) => {
  try {
    // Concatenate notes with separators
    const notesContent = notes.map(note => {
      return `Title: ${note.notes_title}\n\nContent: ${note.content}`;
    }).join('\n\n---\n\n');

    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    // Create prompt for this chunk
    const prompt = `
    Create a brief, concise summary of these ${notes.length} notes about "${skill}".
    Keep it short and to the point, focusing only on the most essential information.
    Each note is separated by '---'.
    
    ${notesContent}
    `;

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
    
    // Store in database only if requested (we don't store intermediate summaries)
    if (storeInDb) {
      await storeSummary(skill, user_id, summary, notes.length);
    }
    
    return { 
      summary,
      noteCount: notes.length,
      skill
    };
  } catch (error) {
    console.error("Error generating single summary:", error);
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
    return await generateSummary(notes, skill, user_id);
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
