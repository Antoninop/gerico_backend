const nodemailer = require('nodemailer');
const { promisify } = require('util'); 
const bcrypt = require('bcrypt');
const db = require('./db');
const query = promisify(db.query).bind(db);
const { generateSmallINT, generateUUID , hashPassword} = require('./utils');

const codeMemory = new Map();
const authorizedIDMemory = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendCodeResetPass = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Adresse email requise' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format de l\'adresse email incorrect' });
  }

  try {
    const sql = 'SELECT email FROM Users WHERE email = ?';
    const results = await query(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cette adresse email.' });
    }

    const code = generateSmallINT();
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes d'expiration

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Code de récupération de mot de passe',
      text: `Voici votre code : ${code}`,
    };

    await transporter.sendMail(mailOptions);

    codeMemory.set(email, { code, expirationTime });
    return res.status(200).json({ message: 'Code envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

exports.verifyCodeResetPass = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Adresse email et code requis.' });
  }

  const storedData = codeMemory.get(email);

  if (!storedData) {
    return res.status(404).json({ message: 'Code non trouvé ou expiré.' });
  }

  const { code: storedCode, expirationTime } = storedData;

  if (Date.now() > expirationTime) {
    codeMemory.delete(email);
    return res.status(400).json({ message: 'Code expiré.' });
  }

  if (parseInt(code.trim(), 10) === parseInt(storedCode.trim(), 10)) {
    const acceptID = generateUUID();
    authorizedIDMemory.set(email, acceptID); 
    codeMemory.delete(email); 

    return res.status(200).json({ id: acceptID });
  } else {
    return res.status(400).json({ message: 'Code incorrect.' });
  }
};

exports.Newpassword = async (req, res) => {
  const { email, id, password } = req.body;

  if (!email || !id || !password) {
    return res.status(400).json({ message: 'Adresse email, identifiant et mot de passe requis.' });
  }

  const storedID = authorizedIDMemory.get(email);

  if (id !== storedID) {
    return res.status(400).json({ message: 'Identifiant invalide ou expiré.' });
  }

  try {
    const hashedPassword = hashPassword(password); 
    const sql = 'UPDATE Users SET password = ? WHERE email = ?';
    await query(sql, [hashedPassword, email]);

    authorizedIDMemory.delete(email); 
    return res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};
