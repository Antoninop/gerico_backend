const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Fonctions d'authentification

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isPasswordMatch(password, hashedPassword) {
  const hashedInput = hashPassword(password);
  return hashedInput === hashedPassword;
}

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}


module.exports = { 
  hashPassword, 
  isPasswordMatch, 
  generateToken, 
};
