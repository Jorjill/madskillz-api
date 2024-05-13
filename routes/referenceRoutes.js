const express = require("express");
const router = express.Router();
const noteModel = require("../models/referenceModel");

router.post("/", async (req, res) => {
  try {
    const { skill } = req.body;
    const result = await noteModel.createReference(skill);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error in creating a note:", err);
    res.status(500).send("Server error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await noteModel.getReference(id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await noteModel.getReferences();
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
