const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const itemModel = require("../models/itemModel");
const { user } = require("pg/lib/defaults");

router.post("/skills", async (req, res) => {
  try {
    const { title } = req.body;
    const { imageurl } = req.body; 
    const { user_id } = req.body;
    const result = await itemModel.createItem(title, imageurl, user_id);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error in uploading to S3 or database operation:", err);
    res.status(500).send("Server error");
  }
});

router.get("/skills", async (req, res) => {
  const user_id = req.user_id;

  try {
    const result = await itemModel.getItems(user_id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.delete("/skills/:id", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { id } = req.params;
    const result = await itemModel.deleteItem(id, user_id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
