const mongoose = require('mongoose');

const PreviousWonArtistSchema = new mongoose.Schema({
    round: { type: String, required: true }, // e.g., "The 10th"
    artists: [{
        name: { type: String, required: true },
        category: { type: String, required: true },
        work: { type: String, required: true },
        description: { type: String },
        imageUrls: [{ type: String, required: true }], // Array of image URLs (up to 2)
        cloudinary_ids: [{ type: String, required: true }], // Array of Cloudinary Public IDs
    }],
});

module.exports = mongoose.model('PreviousWonArtist', PreviousWonArtistSchema);