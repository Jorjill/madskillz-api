const express = require("express");
const router = express.Router();
const referenceModel = require("../models/referenceModel");

router.post("/", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { skill } = req.body;
    const result = await referenceModel.createReference(skill, user_id);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error in creating a note:", err);
    res.status(500).send("Server error");
  }
});

router.get("/by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await referenceModel.getReference(id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/by-name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const result = await referenceModel.getReferenceBySkill(name);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/", async (req, res) => {
  const user_id = req.user_id;
  console.log("user_id", user_id);
  try {
    const result = await referenceModel.getReferences(user_id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await referenceModel.deleteReference(id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
