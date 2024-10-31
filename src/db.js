const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

let db; 

function connectWithRetry() {
  db = mysql.createConnection(dbConfig); 

  db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données:', err);
      console.log('Nouvelle tentative de connexion dans 5 secondes...');
      setTimeout(connectWithRetry, 5000); 
    } else {
      console.log('Connecté à la base de données MariaDB');
    }
  });

  db.on('error', (err) => {
    console.error('Erreur de la base de données:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Connexion perdue. Reconnexion...');
      connectWithRetry();
    }
  });
}

setTimeout(connectWithRetry, 5000); //  délai initial

module.exports = {
  query: (sql, values, callback) => {
    if (!db) {
      console.error('La connexion à la base de données n\'est pas encore établie.');
      return callback(new Error('Connexion à la base de données non établie'));
    }
    return db.query(sql, values, callback); 
  }
};
