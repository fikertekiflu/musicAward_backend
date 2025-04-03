const mongoose = require('mongoose');

const PreviousWonArtistSchema = new mongoose.Schema({
    artistName: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    awardRound: { type: mongoose.Schema.Types.ObjectId, ref: 'Awardround', required: true  },
    year: { type: Number, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PreviousWonArtist', PreviousWonArtistSchema);