const db = require('./db');
const { hashPassword, isPasswordMatch, generateToken } = require('./utils');

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

    res.status(200).json({ message: 'Connexion réussie', token });
  });
};
