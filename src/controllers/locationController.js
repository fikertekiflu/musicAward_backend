const Location = require("../models/location");

exports.createLocation = async (req, res) => {
  try {
    const { place, description } = req.body;
    const image = req.file ? req.file.path : null;

    if (!place || !image || !description) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const newLocation = new Location({ place, image, description });
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
    const { place, description } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      { place, image, description },
      { new: true }
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found!" });
    }

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
    res.status(200).json({ message: "Location deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
