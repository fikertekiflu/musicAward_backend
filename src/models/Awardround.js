const mongoose = require("mongoose");

const awardRoundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("AwardRound", awardRoundSchema);
