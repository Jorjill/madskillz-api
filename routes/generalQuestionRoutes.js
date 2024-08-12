const generalQuestionModel = require("../models/generalQuestionModel");
const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const result = await generalQuestionModel.getGeneralQuestions();
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    const { answer } = req.body;
    const { skill } = req.body;
    const { user_id } = req.body;

    const result = await generalQuestionModel.createGeneralQuestion(
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

    const result = await generalQuestionModel.getGeneralQuestionAnswer(
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

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await generalQuestionModel.deleteGeneralQuestion(id);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
