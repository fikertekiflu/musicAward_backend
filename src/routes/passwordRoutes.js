

const express = require('express');
const router = express.Router();
const authController = require('../controllers/passwordController');

// Route to check if an email exists
router.post('/check-email', authController.checkEmail);

// Route to reset password using email
router.post('/reset-password-email', authController.resetPasswordEmail);

module.exports = router;