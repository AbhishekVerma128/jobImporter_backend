const mongoose = require('mongoose');
const ImportHistorySchema = new mongoose.Schema({
  fileName: { type: String, required: true, unique: true, index: true }, // feed URL or friendly name
  importDateTime: { type: Date, default: Date.now },
  total: { type: Number, default: 0 },
  new: { type: Number, default: 0 },
  updated: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
});

module.exports = mongoose.model('jobHistory', ImportHistorySchema);
