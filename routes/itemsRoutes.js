const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const itemModel = require("../models/itemModel");

// Set up multer for memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// Configure AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

router.post("/skills", async (req, res) => {
  try {
    const { title } = req.body;
    const { imageurl } = req.body;  
    // const file = req.file;
    // const key = `images/${uuidv4()}.jpg`;

    // const params = {
    //   Bucket: process.env.AWS_BUCKET_NAME,
    //   Key: key,
    //   Body: file.buffer,
    //   ContentType: file.mimetype,
    //   ACL: "public-read",
    // };

    // Upload image to S3
//    const uploadResult = await s3.upload(params).promise();

    // Create item with image URL from S3
    // const imageurl = uploadResult.Location;
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
  console.log("delete");
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
