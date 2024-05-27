const specificQuestionModel = require("../models/specificQuestionModel");
const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const result = await specificQuestionModel.getSpecificQuestions();
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/answer", async (req, res) => {
  try {
    const { id } = req.body;
    const { question } = req.body;
    const { answer } = req.body;
    const { providedAnswer } = req.body;

    const result = await specificQuestionModel.getSpecificQuestionAnswer(
      id,
      question,
      answer,
      providedAnswer
    );
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
