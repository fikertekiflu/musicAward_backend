const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require("./src/config/database")
const authRoutes = require("./src/routes/authRoute")
const aboutUsRoutes = require("./src/routes/aboutUsRoutes");
const previousWonArtistRoutes = require("./src/routes/previousWonArtistRoutes");
const app = express();
app.use(express.json());
connectDB();

app.use("/uploads", express.static("uploads"));
app.use("/api/aboutus", aboutUsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wonArtists', previousWonArtistRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
