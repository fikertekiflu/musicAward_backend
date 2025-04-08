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
            const imageUrls = [];
            const cloudinary_ids = [];

            for (let i = 0; i < 2; i++) {
                const fileId = artist.fileIds[i];
                const file = req.files.find(f => f.fieldname === fileId);

                if (file) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 100)); // Keep the existing delay
                        const uploadResult = await streamUpload(file);
                        imageUrls.push(uploadResult.secure_url);
                        cloudinary_ids.push(uploadResult.public_id);
                    } catch (uploadError) {
                        console.error(`Error uploading image ${i + 1} for ${artist.name}:`, uploadError);
                        return res.status(500).json({ error: `Error uploading image ${i + 1} for ${artist.name}.` });
                    }
                } else if (i === 0) {
                    console.error(`Missing first image for artist: ${artist.name}`);
                    return res.status(400).json({ error: `First image for ${artist.name} is missing.` });
                }
                // It's okay if the second image is missing
            }

            uploadedArtists.push({
                ...artist,
                imageUrls,
                cloudinary_ids,
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
      const artistsData = JSON.parse(req.body.artists); // Updated artist info
      const existingRound = await PreviousWonArtist.findById(req.params.id);
      if (!existingRound) return res.status(404).json({ message: 'Round not found' });

      const updatedArtists = [];

      for (const artist of artistsData) {
          const imageUrls = [...(artist.imageUrls || [null, null])];
          const cloudinary_ids = [...(artist.cloudinary_ids || [null, null])];

          for (let i = 0; i < 2; i++) {
              const fileKey = req.files[`file-${artist.tempId}-${i + 1}`]?.[0] ?
                  `file-${artist.tempId}-${i + 1}` :
                  (artist.fileIds ? artist.fileIds[i] : null);

              const file = req.files[fileKey]?.[0];

              if (file) {
                  try {
                      if (cloudinary_ids[i]) {
                          await cloudinary.uploader.destroy(cloudinary_ids[i]);
                      }
                      const uploadResult = await streamUpload(file);
                      imageUrls[i] = uploadResult.secure_url;
                      cloudinary_ids[i] = uploadResult.public_id;
                  } catch (uploadError) {
                      console.error('Cloudinary upload error:', uploadError);
                      return res.status(500).json({ message: 'Failed to upload image.' });
                  }
              }
          }

          updatedArtists.push({
              _id: artist._id || undefined, // Keep existing _id if available
              name: artist.name,
              category: artist.category,
              work: artist.work,
              description: artist.description,
              imageUrls,
              cloudinary_ids
          });
      }

      const updatedRound = await PreviousWonArtist.findByIdAndUpdate(
          req.params.id,
          { round, artists: updatedArtists },
          { new: true, runValidators: true } // Ensure schema validation runs
      );

      if (!updatedRound) {
          return res.status(500).json({ message: 'Failed to update round in database.' });
      }

      res.status(200).json(updatedRound);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

exports.deleteWonArtistRound = async (req, res) => {
    try {
        const round = await PreviousWonArtist.findByIdAndDelete(req.params.id);
        if (!round) return res.status(404).json({ message: 'Round not found' });

        for (const artist of round.artists) {
            if (artist.cloudinary_ids && artist.cloudinary_ids.length > 0) {
                for (const cid of artist.cloudinary_ids) {
                    await cloudinary.uploader.destroy(cid);
                }
            }
        }

        res.status(200).json({ message: 'Round deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};