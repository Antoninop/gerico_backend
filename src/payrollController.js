const fs = require('fs').promises;
const path = require('path');
const db = require('./db');

const currentYear = new Date().getFullYear();
const currentMonth = new Date().toLocaleString('default', { month: '2-digit' });

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`Erreur lors de la création du dossier: ${dirPath}`, err);
  }
}

async function initPayrollFiles(userId) {
    const userPayrollPath = path.join(__dirname, 'payroll', userId.toString());
    await ensureDirectoryExists(userPayrollPath);
  }
  
  async function generatePayrollFile(user) {
  
    const userId = user.id;
    
    const yearPath = path.join(__dirname, 'payroll', userId.toString(), currentYear.toString());
    await ensureDirectoryExists(yearPath);
  
    const payrollFileName = `${currentYear}-${currentMonth}.txt`;
    const payrollFilePath = path.join(yearPath, payrollFileName);
  
    const payrollContent = `${user.email}\n${user.first_name}\n${user.last_name}\n${user.position}\n${user.salary}\n`;
    
    try {
      await fs.writeFile(payrollFilePath, payrollContent);
      console.log(`Fichier de paie créé: ${payrollFilePath}`);
      await savePayrollToDatabase(userId, payrollFilePath, user.salary);
    } catch (err) {
      console.error(`Erreur lors de la création du fichier de paie: ${payrollFilePath}`, err);
    }
  }
  
  async function generatePayrollForAllUsers() {
    try {
      const users = await getAllUsers();
      if (users.length === 0) {
        console.log('Aucun utilisateur trouvé.');
        return;
      }
  
      for (const user of users) {
        await generatePayrollFile(user);
      }
    } catch (err) {
      console.error('Erreur lors de la génération des fiches de paie:', err);
    }
  }
  
  // Requête SQL 
  
  async function getAllUsers() {
    const query = 'SELECT id, email, salary, first_name, last_name, position FROM Users'; 
  
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          console.error('Erreur lors de la requête SQL:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
  
  async function savePayrollToDatabase(userId, filePath, salary) {
    const query = `
      INSERT INTO Payroll (id_user, paye_id, pay_date, salary, created_at, comments, file_path)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
    `;
    
    const payDate = currentMonth + '/' + currentYear; 
    const payId = generateSmallID(); 
    const comments = null; 
  
    if (salary === null || salary === undefined || isNaN(salary) || salary < 0) {
      console.warn(`Le salaire pour l'utilisateur ${userId} est invalide (${salary}), défini à 0.`);
      salary = 0;  
    }
  
    return new Promise((resolve, reject) => {
      db.query(query, [userId, payId, payDate, salary, comments, filePath], (err, results) => {
        if (err) {
          console.error('Erreur lors de l\'insertion dans la base de données:', err);
          reject(err);
        } else {
          console.log(`Données de paie enregistrées dans la BDD pour l'utilisateur ID ${userId}.`);
          resolve(results);
        }
      });
    });
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

  
  
  module.exports = { 
    initPayrollFiles, 
    getAllUsers, 
    generatePayrollForAllUsers,
  };