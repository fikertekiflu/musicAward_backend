const Gallery = require('../models/gallery');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'gallery' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

exports.createGallery = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Images are required!' });
    }

    const imageUploads = req.files.map((file) => streamUpload(file));
    const imageResults = await Promise.all(imageUploads);

    const images = imageResults.map((result) => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
    }));

    const gallery = new Gallery({ images });
    await gallery.save();
    res.status(201).json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find();
    res.status(200).json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found!' });
    }

    let images = gallery.images;

    if (req.files && req.files.length > 0) {
      const imageUploads = req.files.map((file) => streamUpload(file));
      const imageResults = await Promise.all(imageUploads);
      images = imageResults.map((result) => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
      }));
      gallery.images.forEach(async image =>{
          await cloudinary.uploader.destroy(image.public_id);
      })
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { images },
      { new: true }
    );

    res.status(200).json(updatedGallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    if (!gallery) return res.status(404).json({ message: 'Gallery not found' });

    if (gallery.images && gallery.images.length > 0) {
        gallery.images.forEach(async image=>{
            await cloudinary.uploader.destroy(image.public_id);
        })
    }

    res.status(200).json({ message: 'Gallery deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};