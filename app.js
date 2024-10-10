const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./src/routes'); 
const db = require('./src/db'); 

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', routes); 

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
