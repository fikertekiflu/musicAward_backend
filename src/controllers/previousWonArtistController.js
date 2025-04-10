const PreviousWonArtist = require('../models/PreviousWonArtist');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const streamUpload = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'won_artists' },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

exports.createWonArtistRound = async (req, res) => {
    try {
        const { round } = req.body;
        const artistsData = JSON.parse(req.body.artists);
        const uploadedArtists = [];

        console.log("Received Files:", req.files);
        console.log("Artists Data:", artistsData);

        for (const artist of artistsData) {
            const file = req.files?.find(f => f.fieldname === artist.fileId); // Use optional chaining
            if (!file && !artist.imageUrl) { // Check if file is missing AND no existing imageUrl
                console.error(`Missing file for artist.fileId: ${artist.fileId}`);
                return res.status(400).json({ error: `Image for ${artist.name} is missing.` });
            }

            let uploadResult;
            if (file) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    uploadResult = await streamUpload(file);
                } catch (uploadError) {
                    console.error(`Error uploading image for ${artist.name}:`, uploadError);
                    return res.status(500).json({ error: `Error uploading image for ${artist.name}.` });
                }
            }

            uploadedArtists.push({
                ...artist,
                imageUrl: uploadResult?.secure_url || artist.imageUrl, // Use existing if no new upload
                cloudinary_id: uploadResult?.public_id || artist.cloudinary_id, // Use existing if no new upload
            });
        }
        const newRound = new PreviousWonArtist({ round, artists: uploadedArtists });
        await newRound.save();
        res.status(201).json(newRound);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.getWonArtistRounds = async (req, res) => {
    try {
        const rounds = await PreviousWonArtist.find();
        res.status(200).json(rounds);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateWonArtistRound = async (req, res) => {
    try {
        const { round } = req.body;
        const artistsData = JSON.parse(req.body.artists);
        const existingRound = await PreviousWonArtist.findById(req.params.id);
        if (!existingRound) return res.status(404).json({ message: 'Round not found' });

        const updatedArtists = [];

        for (const artistData of artistsData) {
            const file = req.files?.[artistData.fileId];
            let imageUrl = artistData.imageUrl;
            let cloudinary_id = artistData.cloudinary_id;

            if (file) {
                // If a new file is uploaded, handle the Cloudinary update
                if (cloudinary_id) {
                    try {
                        await cloudinary.uploader.destroy(cloudinary_id);
                    } catch (error) {
                        console.error("Error deleting previous image:", error);
                    }
                }
                const uploadResult = await streamUpload(file);
                imageUrl = uploadResult.secure_url;
                cloudinary_id = uploadResult.public_id;
                console.log("New image uploaded, new imageUrl:", imageUrl);
                console.log("New image uploaded, new cloudinary_id:", cloudinary_id);
            } 
             else {
                // If no new file, explicitly preserve the existing image details
                const existingArtist = existingRound.artists.find(artist => artist._id.toString() === artistData._id);
                if (existingArtist) {
                    imageUrl = existingArtist.imageUrl;
                    cloudinary_id = existingArtist.cloudinary_id;
                    console.log("Preserving existing imageUrl:", imageUrl);
                    console.log("Preserving existing cloudinary_id:", cloudinary_id);
                }
            }

            const updatedArtist = {
                name: artistData.name,
                category: artistData.category,
                work: artistData.work,
                description: artistData.description,
                imageUrl,
                cloudinary_id,
                _id: artistData._id,
            };

            updatedArtists.push(updatedArtist);
        }

        const updatedRound = await PreviousWonArtist.findByIdAndUpdate(
            req.params.id,
            { round, artists: updatedArtists },
            { new: true, upsert: false }
        );

        res.status(200).json(updatedRound);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.deleteWonArtistRound = async (req, res) => {
    try {
        const round = await PreviousWonArtist.findByIdAndDelete(req.params.id);
        if (!round) return res.status(404).json({ message: 'Round not found' });

        for (const artist of round.artists) {
            if (artist.cloudinary_id) {
                await cloudinary.uploader.destroy(artist.cloudinary_id);
            }
        }
        res.status(200).json({ message: 'Round deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};