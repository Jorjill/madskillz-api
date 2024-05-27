const express = require("express");
const router = express.Router();
const topicModel = require("../models/topicsModel");

router.post("/", async (req, res) => {
  try {
    const { title, content, skill, datetime } = req.body;
    const result = await topicModel.addTopic(title, content, skill, datetime);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error in creating a note:", err);
    res.status(500).send("Server error");
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await topicModel.getTopics();
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in getting topics:", err);
    res.status(500).send("Server error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await topicModel.deleteTopic(id);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in deleting topic:", err);
    res.status(500).send("Server error");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, skill, datetime } = req.body;
    const result = await topicModel.updateTopic(id, title, content, skill, datetime);
    res.status(200).send(result);
  } catch (err) {
    console.error("Error in updating topic:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;