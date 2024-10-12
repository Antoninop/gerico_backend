const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const db = require('./db');

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

function initPayrollFiles(userId) {
  const rootPayrollPath = path.join(__dirname, 'payroll');  
  const userPayrollPath = path.join(rootPayrollPath, userId.toString());  
  if (!fs.existsSync(rootPayrollPath)) {
    fs.mkdirSync(rootPayrollPath, { recursive: true });
    console.log(`Dossier 'payroll' créé à la racine: ${rootPayrollPath}`);
  }
  if (!fs.existsSync(userPayrollPath)) {
    fs.mkdirSync(userPayrollPath, { recursive: true });
    console.log(`Dossier créé pour l'utilisateur ${userId}: ${userPayrollPath}`);
  } else {
    console.log(`Le dossier pour l'utilisateur ${userId} existe déjà.`);
  }
}

function generatePayrollFile(userId) {
  const currentYear = new Date().getFullYear();  
  const currentMonth = new Date().toLocaleString('default', { month: '2-digit' });  

  const userPayrollPath = path.join(__dirname, 'payroll', userId.toString());

  if (!fs.existsSync(userPayrollPath)) {
    fs.mkdirSync(userPayrollPath, { recursive: true });
    console.log(`Dossier créé pour l'utilisateur ${userId}: ${userPayrollPath}`);
  } else {
    console.log(`Le dossier pour l'utilisateur ${userId} existe déjà.`);
  }

  const yearPath = path.join(userPayrollPath, currentYear.toString());

  if (!fs.existsSync(yearPath)) {
    fs.mkdirSync(yearPath, { recursive: true });
    console.log(`Dossier créé pour l'année ${currentYear} pour l'utilisateur ${userId}`);
  } else {
    console.log(`Le dossier pour l'année ${currentYear} existe déjà.`);
  }

  const payrollFileName = `${currentYear}-${currentMonth}.txt`;
  const payrollFilePath = path.join(yearPath, payrollFileName);

  if (!fs.existsSync(payrollFilePath)) {
    fs.writeFileSync(payrollFilePath, `Fichier de paie pour ${currentMonth}/${currentYear}`);
    console.log(`Fichier de paie créé: ${payrollFilePath}`);
  } else {
    console.log(`Le fichier de paie pour ${currentMonth}/${currentYear} existe déjà.`);
  }
}

function generatePayrollForAllUsers() {
  getAllUsers((err, users) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      return;
    }

    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé.');
      return;
    }

    users.forEach(user => {
      generatePayrollFile(user.id);  
    });
  });
}
// récupère tous les utilisateurs pour remplirs les fiches de payes et leur id pour les dossiers

function getAllUsers(callback) {
  const query = 'SELECT id, email, salary, first_name, last_name, position FROM Users'; 

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la requête SQL:', err);
      return callback(err, null);
    }
    
    if (results.length > 0) {
      return callback(null, results); 
    } else {
      return callback(null, "Aucun utilisateur trouvé.");  
    }
  });
}

module.exports = { 
  hashPassword, 
  isPasswordMatch, 
  generateToken, 
  initPayrollFiles, 
  getAllUsers, 
  generatePayrollForAllUsers,
};
