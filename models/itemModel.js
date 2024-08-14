const db = require("../db");
const { getReferenceBySkill, deleteReference } = require("./referenceModel");
const { selectNotesBySkill, deleteNoteBySkill } = require("./notesModel");
const { user } = require("pg/lib/defaults");

const createItem = (title, imageurl, user_id) => {
  return db
    .query(
      "INSERT INTO items (title, imageurl, user_id) VALUES ($1, $2, $3) RETURNING *;",
      [title, imageurl, user_id]
    )
    .then((res) => res.rows[0]);
};

const getItems = (user_id) => {
  return db
    .query(
      "SELECT id, title, imageurl, user_id FROM items WHERE user_id = $1;",
      [user_id]
    )
    .then((res) => res.rows);
};

const deleteItem = async (id, user_id) => {
  const res = await db.query(
    "SELECT title FROM items WHERE id = $1 AND user_id = $2;",
    [id, user_id]
  );
  if (res.rows.length === 0) {
    throw new Error(`Cannot find item with id ${id}`);
  }

  const refs = await getReferenceBySkill(res.rows[0].title, user_id);
  if (refs.length > 0) {
    await deleteReference(refs[0].id, user_id);
  }

  const notes = await selectNotesBySkill(res.rows[0].title, user_id);
  if (notes.length > 0) {
    await deleteNoteBySkill(res.rows[0].title, user_id);
  }

  const deleteRes = await db.query("DELETE FROM items WHERE id = $1;", [id]);
  return deleteRes.rows;
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
};
