const Sponsor = require('../models/Sponser');
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sponsors" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

exports.createSponsor = async (req, res) => {
  try {
    const { companyName, description, level } = req.body;

    if (!req.files || req.files.length !== 2) { // Handle multiple files
      return res.status(400).json({ message: "Two logo images are required!" });
    }

    const logoUploads = req.files.map(file => streamUpload(file));
    const logoResults = await Promise.all(logoUploads);

    const logos = logoResults.map(result => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
    }));

    const sponsor = new Sponsor({
      companyName,
      description,
      level,
      logos,
    });
    await sponsor.save();
    res.status(201).json(sponsor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await Sponsor.find();
    res.status(200).json(sponsors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });
    res.status(200).json(sponsor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSponsor = async (req, res) => {
    try {
        const { companyName, description, level } = req.body;
        const sponsor = await Sponsor.findById(req.params.id);

        if (!sponsor) {
            return res.status(404).json({ message: "Sponsor not found!" });
        }

        let logos = sponsor.logos;

        if (req.files && req.files.length > 0) {
            const logoUploads = req.files.map(file => streamUpload(file));
            const logoResults = await Promise.all(logoUploads);
            logos = logoResults.map(result => ({
                secure_url: result.secure_url,
                public_id: result.public_id,
            }));
            sponsor.logos.forEach(async logo =>{
                await cloudinary.uploader.destroy(logo.public_id);
            })
        }

        const updatedSponsor = await Sponsor.findByIdAndUpdate(
            req.params.id,
            { companyName, description, level, logos },
            { new: true }
        );

        res.status(200).json(updatedSponsor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndDelete(req.params.id);
    if (!sponsor) return res.status(404).json({ message: 'Sponsor not found' });

    if (sponsor.logos && sponsor.logos.length > 0) {
        sponsor.logos.forEach(async logo=>{
            await cloudinary.uploader.destroy(logo.public_id);
        })
    }

    res.status(200).json({ message: 'Sponsor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};