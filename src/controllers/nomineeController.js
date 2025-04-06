const Nominee = require("../models/Nominees");


// Create a new nominee
exports.createNominee = async (req, res) => {
  try {
    const nominee = new Nominee(req.body);
    await nominee.save();
    res.status(201).json(nominee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all nominees
exports.getAllNominees = async (req, res) => {
  try {
    const nominees = await Nominee.find();
    res.json(nominees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single nominee by ID
exports.getNomineeById = async (req, res) => {
  try {
    const nominee = await Nominee.findById(req.params.id);
    if (!nominee) {
      return res.status(404).json({ message: 'Nominee not found' });
    }
    res.json(nominee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a nominee by ID
exports.updateNominee = async (req, res) => {
  try {
    const nominee = await Nominee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!nominee) {
      return res.status(404).json({ message: 'Nominee not found' });
    }
    res.json(nominee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a nominee by ID
exports.deleteNominee = async (req, res) => {
  try {
    const nominee = await Nominee.findByIdAndDelete(req.params.id);
    if (!nominee) {
      return res.status(404).json({ message: 'Nominee not found' });
    }
    res.json({ message: 'Nominee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};