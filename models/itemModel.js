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
  // First, check if the item exists and get its title
  const res = await db.query("SELECT title FROM items WHERE id = $1;", [id]);
  if (res.rows.length === 0) {
    throw new Error(`Cannot find item with id ${id}`);
  }

  // Use the item's title to get associated reference
  const refs = await getReferenceBySkill(res.rows[0].title);
  if (refs.length > 0) {
    // If a reference is found, delete the reference
    await deleteReference(refs[0].id);
  }

  const notes = await selectNotesBySkill(res.rows[0].title);
  if(notes.length > 0){
    await deleteNoteBySkill(res.rows[0].title);
  }

  // Finally, delete the item
  const deleteRes = await db.query("DELETE FROM items WHERE id = $1;", [id]);
  return deleteRes.rows;
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
};
