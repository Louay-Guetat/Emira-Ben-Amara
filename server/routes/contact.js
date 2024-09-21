const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config();

const transporter = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.post('/send-email', (req, res) => {
    const { name, email, phone, message } = req.body;

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Always use the sender's email here
        to: process.env.EMAIL_USER, // This is the email where you want to receive the contact messages
        subject: `Nouveau Message de ${name}`,
        text: `Nom complet : ${name}\nAdresse E-Mail: ${email}\nNumero de Telephone: ${phone}\n\nMessage:\n${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Failed to send email.');
        }
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully!');
    });
});

module.exports = router;
