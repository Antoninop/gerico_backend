const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const userRoutes = require('./src/routes'); 
app.use('/api', userRoutes); 

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
