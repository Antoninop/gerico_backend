const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises; 
const db = require('./db'); 

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function isPasswordMatch(password, hashedPassword) {
  const hashedInput = hashPassword(password);
  return hashedInput === hashedPassword;
}

function generateToken(userId) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.log('Veuillez créer un fichier .env dans le répertoire backend avec la ligne suivante :');
    console.log('JWT_SECRET=cle_secrete');
    return null; 
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
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

function generateSmallINT() {
  let num = Math.floor(Math.random() * 100000);  
  return num.toString().padStart(5, '0');
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

async function findUserByEmail(email) {
  const query = 'SELECT * FROM Users WHERE email = ?';
  return new Promise((resolve, reject) => {
      db.query(query, [email], (err, results) => {
          if (err) {
              console.error('Erreur lors de la recherche de l\'utilisateur par email:', err);
              return reject(err);
          }
          resolve(results.length > 0 ? results[0] : null);
      });
  });
}

async function deleteUserByEmail(email) {
  const queryUser = 'DELETE FROM Users WHERE email = ?';
  const queryPayroll = 'DELETE FROM Payroll WHERE id_user = ?';

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`Aucun utilisateur trouvé avec l'email : ${email}`);
      return; 
    }
    const userId = user.id; 

    await new Promise((resolve, reject) => {
      db.query(queryPayroll, [userId], (err, results) => {
        if (err) {
          console.error(`Erreur lors de la suppression des fiches de paie pour l'utilisateur avec l'id ${userId}:`, err);
          return reject(err);
        }
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.query(queryUser, [email], (err, results) => {
        if (err) {
          console.error(`Erreur lors de la suppression de l'utilisateur avec l'email ${email}:`, err);
          return reject(err);
        }
        console.log(`Utilisateur avec l'email ${email} supprimé avec succès.`);
        resolve();
      });
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur et des fiches de paie:', error);
    throw error;
  }
}

module.exports = { 
  hashPassword, 
  isPasswordMatch, 
  generateToken, 
  generateSmallID,
  ensureDirectoryExists,
  generateUUID,
  deleteUserByEmail,
  findUserByEmail,
  generateSmallINT,
};
