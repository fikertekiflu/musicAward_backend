const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    image: String,
    cloudinary_id: String,
  },
  { timestamps: true } 
);

module.exports = mongoose.model("AboutUs", aboutUsSchema);
