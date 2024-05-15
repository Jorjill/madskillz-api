const db = require("../db");
const { createReference, getReferenceBySkill } = require("./referenceModel");

const addTopic = async (title, content, skill) => {
  try {
    console.log("Getting references by skill...");
    const references = await getReferenceBySkill(skill);
    let reference;

    if (references.length > 0) {
      console.log("Using existing reference:", references[0]);
      reference = references[0];
    } else {
      console.log("No existing references found, creating new reference...");
      reference = await createReference(skill);
      console.log("New reference created:", reference);
    }

    console.log("Inserting new topic into database...");
    const res = await db.query(
      'INSERT INTO "topics" ("title", "content", "reference_id") VALUES ($1, $2, $3) RETURNING *;',
      [title, content, reference.id]
    );
    console.log("New topic inserted:", res.rows[0]);

    return res.rows[0];
  } catch (error) {
    console.error("Error adding topic:", error);
    throw error; // Re-throw the error for further handling if necessary
  }
};

const getTopics = () => {
  return db
    .query(
      `
      SELECT 
        t.id, 
        t.title, 
        t.content, 
        t.reference_id, 
        r.skill 
      FROM 
        "topics" as t
        JOIN "references" as r ON t.reference_id = r.id;
    `
    )
    .then((res) => res.rows);
};

const updateTopic = (id, title, content, skill) => {
  return getReferenceBySkill(skill)
    .then((references) => {
      if (references.length > 0) {
        return references[0];
      } else {
        return createReference(skill);
      }
    })
    .then((reference) => {
      return db.query(
        'UPDATE "topics" SET "title" = $1, "content" = $2, "reference_id" = $3 WHERE "id" = $4 RETURNING *;',
        [title, content, reference.id, id]
      );
    })
    .then((res) => res.rows[0]);
};

const deleteTopic = (id) => {
  return db
    .query('DELETE FROM "topics" WHERE "id" = $1 RETURNING *;', [id])
    .then((res) => res.rows[0]);
};

module.exports = { addTopic, getTopics, updateTopic, deleteTopic };
