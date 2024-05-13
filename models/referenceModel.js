const db = require("../db");

const createReference = (skill) => {
  return db
    .query('INSERT INTO "references" ("skill") VALUES ($1) RETURNING *;', [
      skill,
    ])
    .then((res) => res.rows[0]);
};

const getReference = (id) => {
  return db
    .query('SELECT "id","skill" FROM "references" WHERE "id" = $1;', [id])
    .then((res) => res.rows);
};

const getReferences = () => {
  return db
    .query('SELECT "id","skill" FROM "references";')
    .then((res) => res.rows);
};

const getReferenceBySkill = (skill) => {
  return db
    .query('SELECT "id","skill" FROM "references" WHERE "skill" = $1;', [skill])
    .then((res) => res.rows);
};

module.exports = { createReference, getReference, getReferences, getReferenceBySkill};
