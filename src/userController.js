const db = require('./db');
const { hashPassword, isPasswordMatch, generateToken, generateUUID } = require('./utils');
const crypto = require('crypto'); 



exports.loginUser = async (req, res) => {
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

      const token = generateToken(user.id); 

      res.status(200).json({ message: 'Connexion réussie', token, userId: user.id, firstname: user.first_name });
    });
};


exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password, dateOfBirth, position, isAdmin } = req.body;

  if (!firstName || !lastName || !email || !password || !dateOfBirth) {
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
  }

  try {
    const emailCheckQuery = 'SELECT * FROM Users WHERE email = ?';
    const emailExists = await new Promise((resolve, reject) => {
      db.query(emailCheckQuery, [email], (err, results) => {
        if (err) reject(err);
        resolve(results.length > 0);
      });
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await hashPassword(password);

    const userId = generateUUID();

    const query = `
      INSERT INTO Users (id, first_name, last_name, email, password, date_of_birth, position, is_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const userValues = [userId, firstName, lastName, email, hashedPassword, dateOfBirth, position, isAdmin || false];

    db.query(query, userValues, (err, results) => {
      if (err) {
        console.error('Erreur lors de la création de l\'utilisateur:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      res.status(201).json({ message: 'Utilisateur créé avec succès.', userId });
    });

  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur:', err);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};


exports.fetchPayroll = async (req, res) => {
  const id_user = req.user.id;  

  try {
    const query = 'SELECT * FROM Payroll WHERE id_user = ?';
    const results = await new Promise((resolve, reject) => {
      db.query(query, [id_user], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucune fiche de paie trouvée pour cet utilisateur.' });
    }

    res.status(200).json({ results });
  } catch (err) {
    console.error('Erreur lors de la recherche des fiches de paie:', err);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};
