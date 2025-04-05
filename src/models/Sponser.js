const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  logos: [{ 
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  }],
  description: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['Platinum', 'Gold'],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Sponsor', sponsorSchema);