const specificQuestionModel = require("../models/specificQuestionModel");
const router = require("express").Router();

router.get("/", async (req, res) => {
  const user_id = req.user_id;
  try {
    const result = await specificQuestionModel.getSpecificQuestions(user_id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/", async (req, res) => {
  const user_id = req.user_id;
  try {
    const { question } = req.body;
    const { answer } = req.body;
    const { skill } = req.body;

    const result = await specificQuestionModel.createSpecificQuestion(
      question,
      answer,
      skill,
      user_id
    );
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
