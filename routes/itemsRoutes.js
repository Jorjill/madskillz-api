const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const itemModel = require("../models/itemModel");

router.post("/skills", async (req, res) => {
  try {
    const { title } = req.body;
    const { imageurl } = req.body;  
    const result = await itemModel.createItem(title, imageurl);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error in uploading to S3 or database operation:", err);
    res.status(500).send("Server error");
  }
});

router.get("/skills", async (req, res) => {
  try {
    const result = await itemModel.getItems();
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.delete("/skills/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await itemModel.deleteItem(id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
