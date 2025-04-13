// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const publicController = require('../controllers/contactController');

const contactFormValidationRules = [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid email').optional().isEmail().normalizeEmail(), // Email is now optional
    body('phone').optional().isLength({ min: 7 }).trim(),
    body('subject', 'Subject is required').notEmpty().trim(),
    body('message', 'Message is required').notEmpty().trim(),
];

router.post('/contact', contactFormValidationRules, publicController.submitContactForm);

module.exports = router;