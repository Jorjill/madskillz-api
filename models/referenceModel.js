const { user } = require("pg/lib/defaults");
const db = require("../db");

const createReference = (skill, user_id) => {
  return db
    .query(
      'INSERT INTO "references" ("skill", "user_id") VALUES ($1, $2) RETURNING *;',
      [skill, user_id]
    )
    .then((res) => res.rows[0]);
};

const getReference = (id, user_id) => {
  return db
    .query(
      'SELECT "id","skill" FROM "references" WHERE "id" = $1 AND "user_id" = $2;',
      [id, user_id]
    )
    .then((res) => res.rows);
};

const getReferences = (user_id) => {
  return db
    .query(
      `
      SELECT 
        r.id as reference_id,
        r.skill,
        r.user_id,
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
      WHERE 
        r.user_id = $1
      GROUP BY 
        r.id, r.skill, r.user_id
    `,
      [user_id]
    )
    .then((res) =>
      res.rows.map((row) => ({
        id: row.reference_id,
        skill: row.skill,
        user_id: row.user_id,
        topics: row.topics,
      }))
    );
};

const getReferenceBySkill = (skill, user_id) => {
  return db
    .query(
      'SELECT "id","skill" FROM "references" WHERE "skill" = $1 AND "user_id" = $2;',
      [skill, user_id]
    )
    .then((res) => res.rows);
};

const deleteReference = (id, user_id) => {
  return db
    .query("BEGIN") // Start a transaction
    .then(() => {
      return db.query(
        'DELETE FROM "topics" WHERE "reference_id" = $1 AND "user_id" = $2;',
        [id, user_id]
      );
    })
    .then(() => {
      return db.query(
        'DELETE FROM "references" WHERE "id" = $1 AND "user_id" = $2 RETURNING *;',
        [id, user_id]
      );
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
