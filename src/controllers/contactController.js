// controllers/publicController.js
const { validationResult } = require('express-validator');
const transporter = require('../config/mailConfig'); 

require('dotenv').config();
const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const DEFAULT_SENDER_EMAIL = process.env.EMAIL_USER; 

const submitContactForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, subject, message } = req.body;

    try {
        const mailOptions = {
            from: email ? email : `"Website Contact Form" <${DEFAULT_SENDER_EMAIL}>`,
            to: CONTACT_EMAIL,
            subject: `Website Contact Form: ${subject}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                ${phone ? `<p><strong>Phone Number:</strong> ${phone}</p>` : ''}
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        res.status(200).json({ message: 'Your message has been sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
    }
};

module.exports = {
    submitContactForm,
};