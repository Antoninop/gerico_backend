const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); 
const swaggerDocument = YAML.load('./swagger.yaml');


dotenv.config();

const app = express();
const port = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use((req, res, next) => {
  const originalSend = res.send; 

  res.send = function (body) {
    console.log(`Response Status: ${res.statusCode}`);
    console.log('Response Body:', body);

    res.send = originalSend; 
    return res.send(body); 
  };
  next();
});

const userRoutes = require('./src/routes');
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
