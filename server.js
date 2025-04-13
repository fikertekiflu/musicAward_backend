const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require("./src/config/database")
const authRoutes = require("./src/routes/authRoute")
const aboutUsRoutes = require("./src/routes/aboutUsRoutes");
const previousWonArtistRoutes = require("./src/routes/previousWonArtistRoutes");
const locationRoutes = require("./src/routes/locationRoute");
const sponsorRoutes = require("./src/routes/sponsorRoute");
const galleryRoutes = require("./src/routes/galleryRoute");
const passwordRoutes = require("./src/routes/passwordRoutes");
const nomineeRoutes = require("./src/routes/nomineeRoute");
const contactRoute = require("./src/routes/contactRoute");

const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api', contactRoute);

app.use("/uploads", express.static("uploads"));
app.use("/api", passwordRoutes);
app.use("/api/aboutus", aboutUsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use('/api/wonArtists', previousWonArtistRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/nominee', nomineeRoutes);


const uploadsDir = path.join(__dirname, 'uploads');

// Check if uploads directory exists, if not create it
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
