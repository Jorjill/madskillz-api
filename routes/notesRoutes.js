const express = require("express");
const router = express.Router();
const noteModel = require("../models/notesModel");
const { user } = require("pg/lib/defaults");

router.post("/", async (req, res) => {
  try {
    const { notes_title, content, noteSkill, datetime, tags, user_id } = req.body;
    // Convert tags from string to array if necessary
    const tagsArray = typeof tags === "string" ? tags.split(",") : tags;

    const result = await noteModel.createNote(
      notes_title,
      content,
      noteSkill,
      datetime,
      tagsArray,
      user_id
    );
    res.status(201).send(result);
  } catch (err) {
    console.error("Error in creating a note:", err);
    res.status(500).send("Server error");
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await noteModel.getNotes();
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { notes_title, content, noteSkill, datetime, tags, user_id } = req.body;
    const tagsArray = typeof tags === "string" ? tags.split(",") : tags;

    const result = await noteModel.updateNote(
      id,
      notes_title,
      content,
      noteSkill,
      datetime,
      tagsArray,
      user_id
    );
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in updating note:", err);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await noteModel.deleteNote(id);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in deleting note:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
