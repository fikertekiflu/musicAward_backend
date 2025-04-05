const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  images: [{
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);