const express = require('express');
const router = express.Router();
const adminController = require('../controllers/passwordController'); // Adjust the path as needed

// Route to request password reset
router.post('/request-password', adminController.requestPasswordReset);

// Route to verify OTP
router.post('/verify-otp', adminController.verifyOTP);

// Route to reset password
router.post('/reset-password', adminController.resetPassword);

module.exports = router;