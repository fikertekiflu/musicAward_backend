const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  place: { type: String, required: true },
  image: { type: String, required: true }, 
  description: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);
