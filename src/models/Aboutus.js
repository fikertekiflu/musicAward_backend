const mongoose = require("mongoose");

const AboutUsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutUs", AboutUsSchema);
