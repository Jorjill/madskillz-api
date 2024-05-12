const express = require("express");
const router = express.Router();
const itemModel = require("../models/itemModel");

router.post("/skills", async (req, res) => {
  try {
    const { title, imageurl } = req.body;
    const result = await itemModel.createItem(title, imageurl);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
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

router.delete("/skills/:name", async (req, res) => {
  console.log("delete");
  try {
    const { name } = req.params;
    const result = await itemModel.deleteItem(name);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
