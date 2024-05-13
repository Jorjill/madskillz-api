const db = require('../db');

const createItem = (title, imageurl) => {
  return db.query(
    "INSERT INTO items (title, imageurl) VALUES ($1, $2) RETURNING *;",
    [title, imageurl]
  ).then(res => res.rows[0]);
};

const getItems = () => {
  return db.query("SELECT id, title, imageurl FROM items;")
    .then(res => res.rows);
};

const deleteItem = (id) => {
  return db.query("DELETE FROM items WHERE id = $1;", [id])
    .then(res => res.rows);
};

module.exports = {
  createItem,
  getItems, 
  deleteItem
};
