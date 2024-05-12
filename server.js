const express = require('express');
const bodyParser = require('body-parser');
const itemsRoutes = require('./routes/itemsRoutes');
const notesRoutes = require('./routes/notesRoutes');  
const db = require('./db');
const cors = require('cors');


const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/', itemsRoutes);
app.use('/notes', notesRoutes);

db.migrateDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});