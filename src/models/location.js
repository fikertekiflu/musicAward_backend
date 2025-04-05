// location.js (Mongoose Model)
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  date: {
    type: String, 
    required: true,
  },
  place: { 
    type: String,
    required: true,
  },
  image: {
    type: String, 
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  sentence1: { 
    type: String,
    required: true,
  },
  sentence2: { 
    type: String,
    required: true,
  },
  cloudinary_id: {
    type: String,
  },
});

module.exports = mongoose.model('Location', LocationSchema);