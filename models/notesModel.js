const db = require("../db");

const createNote = (notes_title, content, noteSkill, datetime, tags) => {
  console.log(notes_title, content, noteSkill, datetime, tags);
  return db
    .query(
      'INSERT INTO "notes" ("notes_title", "content", "noteSkill", "datetime", "tags") VALUES ($1, $2, $3, $4, $5) RETURNING *;',
      [notes_title, content, noteSkill, datetime, tags]
    )
    .then((res) => res.rows[0]);
};

const getNotes = () => {
  return db
    .query("SELECT notes_title, content, noteSkill, datetime, tags FROM notes;")
    .then((res) => res.rows);
};

const updateNote = (id, notes_title, content, noteSkill, datetime, tags) => {
  return db
    .query(
      "UPDATE notes SET notes_title = $2, content = $3, noteSkill = $4, datetime = $5, tags = $6 WHERE id = $1 RETURNING *;",
      [id, notes_title, content, noteSkill, datetime, tags]
    )
    .then((res) => res.rows[0]);
};

const deleteNote = (id) => {
  return db
    .query("DELETE FROM notes WHERE id = $1;", [id])
    .then((res) => res.rows);
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
};
