const nodemailer = require('nodemailer');
const { promisify } = require('util'); 
const db = require('./db');
const query = promisify(db.query).bind(db);
const { generateSmallINT } = require('./utils');
const codeMemory = new Map();

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
    return res.status(400).json({ message: 'Format incorrect' });
  }

  try {
    const sql = 'SELECT email FROM Users WHERE email = ?';
    const results = await query(sql, [email]);
    const code = generateSmallINT();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Code de récupèration de mot de passe',
      text: 'Voici votre code : ' + code,
    };

    if (results.length === 1) {
      await transporter.sendMail(mailOptions);
      codeMemory.set(email, code);
    }

  } catch (error) {
    console.error('Error during the process:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};


exports.verifyCodeResetPass = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Adresse email et code requis' });
  }

  const storedCode = codeMemory.get(email);

  if (!storedCode) {
    return res.status(404).json({ message: 'Code non trouvé ou expiré' });
  }

  if (parseInt(code.trim(), 10) === parseInt(storedCode.trim(), 10)) {
    codeMemory.delete(email); 
    return res.status(200).json({ message: 'Code valide' });
  } else {
    console.log('Mismatch:', code.trim(), storedCode.trim());
    return res.status(400).json({ message: 'Code incorrect' });
  }
};
