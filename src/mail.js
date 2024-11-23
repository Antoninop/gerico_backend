const nodemailer = require('nodemailer');
const { promisify } = require('util'); 
const db = require('./db');
const query = promisify(db.query).bind(db);
const { generateSmallINT } = require('./utils');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendHelloWorld = async (req, res) => {
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

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Code de récupèration de mot de passe',
      text: 'Voici votre code : ' + generateSmallINT(),
    };

    if (results.length === 1) {
      await transporter.sendMail(mailOptions);
    }

  } catch (error) {
    console.error('Error during the process:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
