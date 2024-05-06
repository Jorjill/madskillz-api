const db = require('../db');

const createItem = (title, imageurl) => {
  return db.query(
    "INSERT INTO items (title, imageurl) VALUES ($1, $2) RETURNING *;",
    [title, imageurl]
  ).then(res => res.rows[0]);
};

const getItems = () => {
  return db.query("SELECT title, imageurl FROM items;")
    .then(res => res.rows);
};

module.exports = {
  createItem,
  getItems
};
