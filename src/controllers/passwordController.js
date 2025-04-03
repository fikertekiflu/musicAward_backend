const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const secret = process.env.JWT_SECRET + admin.password;
    const token = jwt.sign({ id: admin._id, email: admin.email }, secret, { expiresIn: '1h' });

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${admin._id}/${token}`;

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
      text: `You requested a password reset.\n\nClick the link below to reset your password:\n${resetURL}\n\nIf you did not request this, ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const secret = process.env.JWT_SECRET + admin.password;
    jwt.verify(token, secret);

    const encryptedPassword = await bcrypt.hash(password, 10);
    admin.password = encryptedPassword;
    await admin.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
