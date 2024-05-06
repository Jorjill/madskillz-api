const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');

router.post('/items', async (req, res) => {
  try {
    const { title, imageurl } = req.body;
    const result = await itemModel.createItem(title, imageurl);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get('/items', async (req, res) => {
  try {
    const result = await itemModel.getItems();
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
