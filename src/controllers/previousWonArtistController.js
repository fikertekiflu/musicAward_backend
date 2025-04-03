const PreviousWonArtist = require('../models/PreviousWonArtist');

exports.createPreviousWonArtist = async (req, res) => {
    try {
        const newArtist = new PreviousWonArtist(req.body);
        await newArtist.save();
        res.status(201).json(newArtist);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getPreviousWonArtists = async (req, res) => {
    try {
        const artists = await PreviousWonArtist.find().populate('category');
        res.status(200).json(artists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPreviousWonArtistById = async (req, res) => {
    try {
        const artist = await PreviousWonArtist.findById(req.params.id).populate('category');
        if (!artist) return res.status(404).json({ message: 'Artist not found' });
        res.status(200).json(artist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePreviousWonArtist = async (req, res) => {
    try {
        const updatedArtist = await PreviousWonArtist.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedArtist) return res.status(404).json({ message: 'Artist not found' });
        res.status(200).json(updatedArtist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePreviousWonArtist = async (req, res) => {
    try {
        const deletedArtist = await PreviousWonArtist.findByIdAndDelete(req.params.id);
        if (!deletedArtist) return res.status(404).json({ message: 'Artist not found' });
        res.status(200).json({ message: 'Artist deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};