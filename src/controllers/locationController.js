const Location = require("../models/location");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "locations" }, // Adjust folder name if needed
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

exports.createLocation = async (req, res) => {
  try {
    const { date, place, description, sentence1, sentence2 } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required!" });
    }
    const result = await streamUpload(req);

    const newLocation = new Location({
      date,
      place,
      description,
      sentence1,
      sentence2,
      image: result.secure_url,
      cloudinary_id: result.public_id,
    });

    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found!" });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { date, place, description, sentence1, sentence2 } = req.body;
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found!" });
    }

    let image = location.image;
    let cloudinary_id = location.cloudinary_id;

    if (req.file) {
      if (cloudinary_id) {
        await cloudinary.uploader.destroy(cloudinary_id);
      }
      const result = await streamUpload(req);
      image = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { date, place, image, description, sentence1, sentence2, cloudinary_id },
      { new: true }
    );

    res.status(200).json(updatedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: "Location not found!" });
    }

    if (location.cloudinary_id) {
      await cloudinary.uploader.destroy(location.cloudinary_id);
    }
    res.status(200).json({ message: "Location deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};