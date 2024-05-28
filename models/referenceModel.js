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
    .query(`
      SELECT 
        r.id as reference_id,
        r.skill,
        coalesce(json_agg(
          CASE
            WHEN t.id IS NOT NULL THEN json_build_object(
              'id', t.id,
              'title', t.title, 
              'content', t.content,
              'datetime', t.datetime
            )
            ELSE NULL
          END
        ) FILTER (WHERE t.id IS NOT NULL), '[]') as topics
      FROM 
        "references" as r
        LEFT JOIN "topics" as t ON r.id = t.reference_id
      GROUP BY 
        r.id, r.skill
    `)
    .then(res => res.rows.map(row => ({
      id: row.reference_id,
      skill: row.skill,
      topics: row.topics
    })));
};


const getReferenceBySkill = (skill) => {
  return db
    .query('SELECT "id","skill" FROM "references" WHERE "skill" = $1;', [skill])
    .then((res) => res.rows);
};

const deleteReference = (id) => {
  return db
    .query("BEGIN") // Start a transaction
    .then(() => {
      return db.query('DELETE FROM "topics" WHERE "reference_id" = $1;', [id]);
    })
    .then(() => {
      return db.query('DELETE FROM "references" WHERE "id" = $1 RETURNING *;', [
        id,
      ]);
    })
    .then((res) => {
      return db
        .query("COMMIT") // Commit the transaction
        .then(() => res.rows[0]);
    })
    .catch((err) => {
      return db
        .query("ROLLBACK") // Rollback the transaction on error
        .then(() => {
          throw err;
        });
    });
};

module.exports = {
  createReference,
  getReference,
  getReferences,
  getReferenceBySkill,
  deleteReference,
};
