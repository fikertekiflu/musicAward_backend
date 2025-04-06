const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Store OTPs temporarily (consider a better solution for production like Redis)
const otpStorage = {};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = generateOTP();
    otpStorage[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: admin.email,
      from: process.env.EMAIL,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOTP = otpStorage[email];
    if (!storedOTP || storedOTP.otp !== otp || storedOTP.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // OTP is valid, generate a short-lived token for password reset
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' }); // Token expires in 15 minutes

    // Optionally, you can remove the OTP from storage here if you don't need it later
    delete otpStorage[email];

    res.status(200).json({ message: 'Verification successful', resetToken });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ message: 'Something went wrong during verification' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, password, resetToken } = req.body;

  try {
    // Verify the reset token
    jwt.verify(resetToken, process.env.JWT_SECRET);

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const encryptedPassword = await bcrypt.hash(password, 10);
    admin.password = encryptedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: 'Invalid or expired token' });
  }
};