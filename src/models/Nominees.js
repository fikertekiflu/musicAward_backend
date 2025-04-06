const mongoose = require('mongoose');

const nomineeSchema = new mongoose.Schema({
  round: { type: String, required: true },
  stage: { type: String, required: true },
  categories: [{
    category: { type: String, required: true },
    artists: [{
      name: { type: String, required: true },
      smsNumber: { type: String, required: true },
    }],
  }],
  created: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' },
});

module.exports = mongoose.model('Nominee', nomineeSchema);