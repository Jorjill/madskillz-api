const express = require("express");
const bodyParser = require("body-parser");
const itemsRoutes = require("./routes/itemsRoutes");
const notesRoutes = require("./routes/notesRoutes");
const referenceRoutes = require("./routes/referenceRoutes");
const topicRoutes = require("./routes/topicRoutes");
const generalQuestionRoutes = require("./routes/generalQuestionRoutes");
const specificQuestionRoutes = require("./routes/specificQuestionRoutes");
const experienceQuestionRoutes = require("./routes/experienceQuestionRoutes");
const quizRoutes = require("./routes/quizRoutes");
const verifyToken = require("./authMiddleware");
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/", verifyToken, itemsRoutes);
app.use("/notes", verifyToken, notesRoutes);
app.use("/references", verifyToken, referenceRoutes);
app.use("/topics", verifyToken, topicRoutes);
app.use("/general-question", verifyToken, generalQuestionRoutes);
app.use("/specific-question", verifyToken, specificQuestionRoutes);
app.use("/experience-question", verifyToken, experienceQuestionRoutes);
app.use("/quizzes", verifyToken, quizRoutes);

db.migrateDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
