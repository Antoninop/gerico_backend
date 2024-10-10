const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const crypto = require('crypto'); 

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'phpmyadmin',
  password: 'J@/4Tf1FE/e-OFql', 
  database: 'gerico_db' 
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données MariaDB');
  }
});

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/api/users', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  try {
    const hashedPassword = hashPassword(password); 
    const query = 'INSERT INTO Users (email, password) VALUES (?, ?)';

    db.query(query, [email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Erreur lors de la création de l\'utilisateur:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.status(201).json({ message: 'Utilisateur créé avec succès', userId: result.insertId });
    });
  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

function isPasswordMatch(password, hashedPassword) {
  const hashedInput = hashPassword(password); 
  return hashedInput === hashedPassword; 
}

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  const query = 'SELECT * FROM Users WHERE email = ?';
  
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Erreur lors de la recherche de l\'utilisateur:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const user = results[0];

    const isMatch = isPasswordMatch(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    res.status(200).json({ message: 'Connexion réussie', userId: user.id });
  });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
