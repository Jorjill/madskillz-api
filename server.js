const express = require('express');
const bodyParser = require('body-parser');
const itemsRoutes = require('./routes/itemsRoutes');
const notesRoutes = require('./routes/notesRoutes');  
const referenceRoutes = require('./routes/referenceRoutes');
const topicRoutes = require('./routes/topicRoutes');
const db = require('./db');
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/', itemsRoutes);
app.use('/notes', notesRoutes);
app.use('/references', referenceRoutes);
app.use('/topics', topicRoutes);

db.migrateDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});