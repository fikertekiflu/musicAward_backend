const PreviousWonArtist = require("../models/PreviousWonArtist");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    console.log("streamUpload - Starting upload");
    const stream = cloudinary.uploader.upload_stream(
      { folder: "previous-won-artists" },
      (error, result) => {
        if (result) {
          console.log("streamUpload - Upload successful", result);
          resolve(result);
        } else {
          console.error("streamUpload - Upload failed", error);
          reject(error);
        }
      }
    );

    try {
      streamifier.createReadStream(req.file.buffer).pipe(stream);
      console.log("streamUpload - Stream created");
    } catch (streamError) {
      console.error("streamUpload - Stream error", streamError);
      reject(streamError);
    }
  });
};

exports.createPreviousWonArtist = async (req, res) => {
  try {
    console.log("createPreviousWonArtist - Request Body:", req.body);
    console.log("createPreviousWonArtist - Request Files:", req.files);

    const { round, artists } = req.body;

    if (!round || !artists || !Array.isArray(artists)) {
      console.error("createPreviousWonArtist - Invalid request body");
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Process each artist's image upload
    const processedArtists = await Promise.all(
      artists.map(async (artist) => {
        const fileKey = `file-${artist.tempId}`;
        console.log(`createPreviousWonArtist - Processing fileKey: ${fileKey}`);

        if (!req.files || !req.files[fileKey]) {
          console.log(`createPreviousWonArtist - Missing file for fileKey: ${fileKey}`);
          return { ...artist, imageUrl: null, cloudinary_id: null };
        }

        try {
          console.log(`createPreviousWonArtist - Attempting upload for fileKey: ${fileKey}`);
          const result = await streamUpload({ file: { buffer: req.files[fileKey][0].buffer } });
          console.log(`createPreviousWonArtist - Upload success for fileKey: ${fileKey}`, result);
          return { ...artist, imageUrl: result.secure_url, cloudinary_id: result.public_id };
        } catch (uploadError) {
          console.error(`createPreviousWonArtist - Upload error for fileKey: ${fileKey}`, uploadError);
          return { ...artist, imageUrl: null, cloudinary_id: null }; // Handle upload error
        }
      })
    );

    const newPreviousWonArtist = new PreviousWonArtist({
      round,
      artists: processedArtists,
    });

    await newPreviousWonArtist.save();
    console.log("createPreviousWonArtist - Saved newPreviousWonArtist", newPreviousWonArtist);
    res.status(201).json(newPreviousWonArtist);
  } catch (error) {
    console.error("createPreviousWonArtist - Main error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ... other controller functions ...
exports.getAllPreviousWonArtists = async (req, res) => {
  try {
    const previousWonArtists = await PreviousWonArtist.find();
    res.status(200).json(previousWonArtists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPreviousWonArtistById = async (req, res) => {
  try {
    const previousWonArtist = await PreviousWonArtist.findById(req.params.id);
    if (!previousWonArtist) {
      return res.status(404).json({ message: "Previous won artist not found!" });
    }
    res.status(200).json(previousWonArtist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePreviousWonArtist = async (req, res) => {
  try {
    const { round, artists } = req.body;
    const previousWonArtist = await PreviousWonArtist.findById(req.params.id);

    if (!previousWonArtist) {
      return res.status(404).json({ message: "Previous won artist not found!" });
    }

    // Process each artist's image update
    const updatedArtists = await Promise.all(
      artists.map(async (artist) => {
        const fileKey = `file-${artist.tempId}`;
        if (req.files && req.files[fileKey]) {
          // New image uploaded
          if (artist.cloudinary_id) {
            await cloudinary.uploader.destroy(artist.cloudinary_id);
          }
          const result = await streamUpload({ file: { buffer: req.files[fileKey][0].buffer } });
          return { ...artist, imageUrl: result.secure_url, cloudinary_id: result.public_id };
        } else {
          // No new image, keep existing
          return artist;
        }
      })
    );

    const updatedPreviousWonArtist = await PreviousWonArtist.findByIdAndUpdate(
      req.params.id,
      { round, artists: updatedArtists },
      { new: true }
    );

    res.status(200).json(updatedPreviousWonArtist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePreviousWonArtist = async (req, res) => {
  try {
    const previousWonArtist = await PreviousWonArtist.findByIdAndDelete(req.params.id);
    if (!previousWonArtist) {
      return res.status(404).json({ message: "Previous won artist not found!" });
    }

    // Delete Cloudinary images
    await Promise.all(
      previousWonArtist.artists.map(async (artist) => {
        if (artist.cloudinary_id) {
          await cloudinary.uploader.destroy(artist.cloudinary_id);
        }
      })
    );

    res.status(200).json({ message: "Previous won artist deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};