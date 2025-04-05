const mongoose = require('mongoose');

const PreviousWonArtistSchema = new mongoose.Schema({
    artistName: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true,},
    awardRound: { type: String, required: true  },
    year: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PreviousWonArtist', PreviousWonArtistSchema);