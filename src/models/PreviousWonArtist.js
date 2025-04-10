const mongoose = require('mongoose');

const PreviousWonArtistSchema = new mongoose.Schema({
  round: { type: String, required: true }, 
  artists: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    work: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true }, 
    cloudinary_id: { type: String, required: true }, 
  }],
});

module.exports = mongoose.model('PreviousWonArtist', PreviousWonArtistSchema);