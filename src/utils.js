const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises; 

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

function generateSmallID() {
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Erreur lors de la création du dossier: ${dirPath}`, err);
  }
}

function generateUUID() {
  return crypto.randomUUID(); 
}

module.exports = { 
  hashPassword, 
  isPasswordMatch, 
  generateToken, 
  generateSmallID,
  ensureDirectoryExists,
  generateUUID,
};
