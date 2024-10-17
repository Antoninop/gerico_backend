const db = require('./db'); 
const {generateSmallID} = require('./utils'); 


function SavePayrolltoDB(userId, dateName, salary, payrollFilePath) {
    try {
        const PayrollId = generateSmallID(); 

        const query = `
            INSERT INTO Payroll (id_user, paye_id, pay_date, salary, file_path)
            VALUES (?, ?, ?, ?, ?)
        `;
        const queryValues = [userId, PayrollId, dateName, salary, payrollFilePath];

        return new Promise((resolve, reject) => {
            db.query(query, queryValues, (err, results) => {
                if (err) {
                    console.error('Erreur lors de l\'insertion de la fiche de paie', err);
                    return reject({ message: 'Échec de la création de la fiche de paie.' });
                }
                resolve({ message: 'Fiche de paie insérée.', results });
            });
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//TODO : fonction qui permet de générer une fiche de paye pour tous les utilisateurs pour le mois courant

module.exports = {
    SavePayrolltoDB,
};
