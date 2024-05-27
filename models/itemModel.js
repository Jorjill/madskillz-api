const db = require("../db");
const { getReferenceBySkill, deleteReference } = require("./referenceModel");
const { selectNotesBySkill, deleteNoteBySkill } = require("./notesModel");

const createItem = (title, imageurl) => {
  return db
    .query("INSERT INTO items (title, imageurl) VALUES ($1, $2) RETURNING *;", [
      title,
      imageurl,
    ])
    .then((res) => res.rows[0]);
};

const getItems = () => {
  return db
    .query("SELECT id, title, imageurl FROM items;")
    .then((res) => res.rows);
};

const deleteItem = async (id) => {
  const res = await db.query("SELECT title FROM items WHERE id = $1;", [id]);
  if (res.rows.length === 0) {
    throw new Error(`Cannot find item with id ${id}`);
  }

  const refs = await getReferenceBySkill(res.rows[0].title);
  if (refs.length > 0) {
    await deleteReference(refs[0].id);
  }

  const notes = await selectNotesBySkill(res.rows[0].title);
  if(notes.length > 0){
    await deleteNoteBySkill(res.rows[0].title);
  }

  const deleteRes = await db.query("DELETE FROM items WHERE id = $1;", [id]);
  return deleteRes.rows;
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
};
