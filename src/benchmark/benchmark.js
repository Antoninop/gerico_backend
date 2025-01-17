const fetch = require('node-fetch'); 
const db = require('../db'); 
const { SavePayrolltoDB } = require('../payrollController');
const { hashPassword, generateUUID, ensureDirectoryExists, deleteUserByEmail } = require('../utils'); 
const fs = require('fs').promises; 
const path = require('path'); 

async function benchmark() {
    const apiUrl = "https://api.mockaroo.com/api/9dd66a20?count=3&key=67bfd260"; 
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const userCreationPromises = data.map(async (user) => {
            const userPayload = {
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                password: user.password,
                dateOfBirth: user.birthdate,
                position: user.position,
                salary: user.salary,
                hireDate: user.hire_date
            };
            await BenchmarkcreateUser(userPayload);
            console.log('Utilisateur créé avec succès:', userPayload);
        });

        await Promise.all(userCreationPromises);

        await BenchmarkcreateDEVUser(); 
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

async function BenchmarkcreateDEVUser() {
    const email = 'a@a';
    try {
        await deleteUserByEmail(email);

        const userPayload = {
            firstName: 'John',
            lastName: 'Doe',
            email: email,
            password: 'a',
            dateOfBirth: '1990-01-01',
            position: 'Administrateur',
            salary: 1000,
            hireDate: '2020-01-01'
        };

        await BenchmarkcreateUser(userPayload);
        console.log('Compte DEV recréé avec succès.');
    } catch (error) {
        console.error('Erreur lors de la création du compte DEV:', error);
    }
}

async function BenchmarkcreateUser(data) {
    const { firstName, lastName, email, password, dateOfBirth, position, salary, hireDate, remaining_holidays = null } = data;
    try {
        const hashedPassword = await hashPassword(password);
        const userId = generateUUID();

        const query = `
            INSERT INTO Users (id, first_name, last_name, email, password, date_of_birth, position, hire_date, salary, remaining_holidays)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const userValues = [userId, firstName, lastName, email, hashedPassword, dateOfBirth, position, hireDate, salary, remaining_holidays || 30];

        await new Promise((resolve, reject) => {
            db.query(query, userValues, (err, results) => {
                if (err) {
                    console.error('Erreur lors de la création de l\'utilisateur:', err);
                    return reject({ message: 'Échec de la création de l\'utilisateur.' });
                }
                resolve();
            });
        });

        await BenchmarkgeneratePayrollFiles({
            id: userId,
            firstName,
            lastName,
            position,
            salary,
            hireDate
        });
    } catch (error) {
        console.error('Erreur lors du hachage du mot de passe ou de la création de l\'utilisateur:', error);
        throw error;
    }
}

async function BenchmarkgeneratePayrollFiles(user) {
    try {
        const userId = user.id;
        const currentDate = new Date();
        const hireDate = new Date(user.hireDate);

        const monthNames = [
            "01", "02", "03", "04", "05", "06", 
            "07", "08", "09", "10", "11", "12"
        ];

        let currentYear = hireDate.getFullYear();
        let currentMonth = hireDate.getMonth(); 

        while (currentYear < currentDate.getFullYear() || (currentYear === currentDate.getFullYear() && currentMonth <= currentDate.getMonth())) {
            const monthString = monthNames[currentMonth]; 
            const dateName = `${currentYear}-${monthString}`;

            const payrollDir = path.join(__dirname, `../payroll/${userId}/${currentYear}`);
            await ensureDirectoryExists(payrollDir);

            const payrollFilePath = path.join(payrollDir, `${dateName}.txt`);
            const payrollContent = `
                Fiche de paie - ${dateName}
                Utilisateur : ${user.firstName} ${user.lastName}
                Poste : ${user.position}
                Salaire : ${user.salary}
                Date d'embauche : ${user.hireDate}
            `;
            
            await fs.writeFile(payrollFilePath, payrollContent, 'utf8');

            await SavePayrolltoDB(userId, dateName, user.salary, payrollFilePath);

            currentMonth++;
            if (currentMonth === 12) {
                currentMonth = 0;
                currentYear++;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la génération des fichiers de paie :', error);
    }
}

module.exports = {
    benchmark,
};
