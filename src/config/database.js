require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // Ensure the correct path to your Admin model

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully!");

    // Insert Admin Directly Here
    // const existingAdmin = await Admin.findOne({ email: "admin@example.com" });

    // if (!existingAdmin) {
    //   const hashedPassword = await bcrypt.hash("Admin@123", 10);
    //   await Admin.create({
    //     username: "Super Admin",
    //     email: "admin@example.com",
    //     password: hashedPassword
    //   });

    //   console.log("✅ Test Admin Added!");
    // } else {
    //   console.log("⚠️ Admin already exists.");
    // }

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};



module.exports = connectDB;
