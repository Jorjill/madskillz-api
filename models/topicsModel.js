const db = require("../db");

const addTopic = (topic) => {
  return db
    .query('INSERT INTO "topics" ("topic") VALUES ($1) RETURNING *;', [
      topic,
    ])
    .then((res) => res.rows[0]);
};

module.exports = { addTopic };