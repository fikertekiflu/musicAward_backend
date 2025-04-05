const cloudinary = require("../config/cloudinary");
const AboutUs = require("../models/AboutUs");
const upload = require("../middleware/upload");
const streamifier = require("streamifier");

const streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "about_us" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};
exports.getAllAboutUs = async (req, res) => {
  try {
    const aboutUsData = await AboutUs.find();
    res.status(200).json({ message: "Fetched successfully!", data: aboutUsData });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};
exports.createAboutUs = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required!" });
    }

    const result = await streamUpload(req);

    const newAboutUs = new AboutUs({
      title,
      description,
      image: result.secure_url,
      cloudinary_id: result.public_id, // save public_id here
    });

    await newAboutUs.save();
    res.status(201).json({ message: "Created successfully!", data: newAboutUs });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateAboutUs = async (req, res) => {
  try {
    const { title, description } = req.body;
    const aboutUsItem = await AboutUs.findById(req.params.id);
    if (!aboutUsItem) return res.status(404).json({ message: "About Us not found!" });

    let image = aboutUsItem.image;
    let cloudinary_id = aboutUsItem.cloudinary_id;

    if (req.file) {
      // Delete previous image
      if (cloudinary_id) {
        await cloudinary.uploader.destroy(cloudinary_id);
      }

      // Upload new image
      const result = await streamUpload(req);
      image = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const updated = await AboutUs.findByIdAndUpdate(
      req.params.id,
      { title, description, image, cloudinary_id },
      { new: true }
    );

    res.status(200).json({ message: "Updated successfully!", data: updated });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAboutUs = async (req, res) => {
  try {
    const aboutUsItem = await AboutUs.findById(req.params.id);
    if (!aboutUsItem) return res.status(404).json({ message: "About Us not found!" });

    if (aboutUsItem.cloudinary_id) {
      await cloudinary.uploader.destroy(aboutUsItem.cloudinary_id);
    }

    await AboutUs.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
