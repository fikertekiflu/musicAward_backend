const PreviousWonArtist = require('../models/PreviousWonArtist');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// previousWonArtistController.js

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
          // Find the file in the req.files array whose fieldname matches the artist's fileId
          const file = req.files.find(f => f.fieldname === artist.fileId);

          if (!file) {
              console.error(`Missing file for artist.fileId: ${artist.fileId}`);
              return res.status(400).json({ error: `Image for ${artist.name} is missing.` });
          }

          try {
              await new Promise(resolve => setTimeout(resolve, 100)); // Keep the existing delay
              const uploadResult = await streamUpload(file);
              uploadedArtists.push({
                  ...artist,
                  imageUrl: uploadResult.secure_url,
                  cloudinary_id: uploadResult.public_id,
              });
          } catch (uploadError) {
              console.error(`Error uploading image for ${artist.name}:`, uploadError);
              return res.status(500).json({ error: `Error uploading image for ${artist.name}.` });
          }
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
    const artistsData = JSON.parse(req.body.artists); // Updated artist info
    const existingRound = await PreviousWonArtist.findById(req.params.id);
    if (!existingRound) return res.status(404).json({ message: 'Round not found' });

    const updatedArtists = [];

    for (const artist of artistsData) {
      const fileKey = `file-${artist.tempId}`;
      const file = req.files[fileKey]?.[0];

      let imageUrl = artist.imageUrl;
      let cloudinary_id = artist.cloudinary_id;

      // If new image is uploaded
      if (file) {
        if (cloudinary_id) await cloudinary.uploader.destroy(cloudinary_id);
        const uploadResult = await streamUpload(file);
        imageUrl = uploadResult.secure_url;
        cloudinary_id = uploadResult.public_id;
      }

      updatedArtists.push({
        name: artist.name,
        category: artist.category,
        work: artist.work,
        description: artist.description,
        imageUrl,
        cloudinary_id
      });
    }

    const updatedRound = await PreviousWonArtist.findByIdAndUpdate(
      req.params.id,
      { round, artists: updatedArtists },
      { new: true }
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
