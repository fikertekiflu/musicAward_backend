const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", admin.password);
    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("Password Match:", isMatch); 

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      token,
      admin: { id: admin._id, email: admin.email },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
