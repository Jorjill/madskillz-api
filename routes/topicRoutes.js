// const express = require("express");
// const router = express.Router();
// const topicModel = require("../models/topicModel");

// router.post("/", async (req, res) => {
//   try {
//     const { skill } = req.body;
//     const result = await noteModel.createReference(skill);
//     res.status(201).send(result);
//   } catch (err) {
//     console.error("Error in creating a note:", err);
//     res.status(500).send("Server error");
//   }
// });