// models/jobs.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: false,
    },
    jobLink: {
      type: String,
      required: true,
      unique: true, // ✅ ensures no duplicate job entries
      index: true,  // ✅ speeds up find/update queries
    },
    feedUrl: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      default: null,
    },
    pubDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Optional: Prevent model overwrite warning in dev environments
module.exports = mongoose.models.Jobs || mongoose.model('Jobs', JobSchema);
