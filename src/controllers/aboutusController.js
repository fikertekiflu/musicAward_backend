const AboutUs = require("../models/AboutUs");

// Create About Us
exports.createAboutUs = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image is required!" });

    const newAboutUs = new AboutUs({
      title,
      description,
      image: req.file.path, // Save image path
    });

    await newAboutUs.save();
    res.status(201).json({ message: "About Us section created!", data: newAboutUs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.find();
    res.status(200).json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateAboutUs = async (req, res) => {
  try {
    const { title, description } = req.body;
    const updateData = { title, description };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedAboutUs = await AboutUs.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedAboutUs) return res.status(404).json({ message: "About Us not found!" });

    res.status(200).json({ message: "Updated successfully!", data: updatedAboutUs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteAboutUs = async (req, res) => {
  try {
    const deletedAboutUs = await AboutUs.findByIdAndDelete(req.params.id);
    if (!deletedAboutUs) return res.status(404).json({ message: "About Us not found!" });

    res.status(200).json({ message: "Deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
