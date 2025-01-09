const db = require('./db');
const { promisify } = require('util');
const { generateSmallID, generateUUID} = require('./utils');
const query = promisify(db.query).bind(db);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

exports.sendInvitation = async (req, res) => {
    const email = req.body?.email?.email; 

    if (!email) {
        return res.status(400).json({ message: 'Adresse email requise' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Format de l\'adresse email incorrect' + email });
    }

    try {
        const id_invitation = generateSmallID();
        const token = generateUUID();
        const sql = 'INSERT INTO invitation (id_invitation, email, token) VALUES (?, ?, ?)';
        await query(sql, [id_invitation, email, token]);

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Invitation à rejoindre le portail de l\'application Gerico !',
            html: `
                <p>Bonjour,</p>
                <p>Vous avez été invité à rejoindre notre application. Cliquez sur le lien ci-dessous pour compléter votre inscription :</p>
                <a href="http://127.0.0.1:5173/invitation?token=${token}">Compléter votre inscription</a>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Invitation envoyée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du mail:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};