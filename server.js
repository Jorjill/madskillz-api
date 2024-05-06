const express = require('express');
const bodyParser = require('body-parser');
const itemsRoutes = require('./routes/itemsRoutes');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/', itemsRoutes);

db.migrateDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});