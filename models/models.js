const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG'
  }]
}, { timestamps: true });

// PG Schema
const PGSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  weeklyCycle: {
    type: Number,
    enum: [1, 2],
    default: 1
  },
  menu: {
    week1: {
      monday: { breakfast: [String], lunch: [String], dinner: [String] },
      tuesday: { breakfast: [String], lunch: [String], dinner: [String] },
      wednesday: { breakfast: [String], lunch: [String], dinner: [String] },
      thursday: { breakfast: [String], lunch: [String], dinner: [String] },
      friday: { breakfast: [String], lunch: [String], dinner: [String] },
      saturday: { breakfast: [String], lunch: [String], dinner: [String] },
      sunday: { breakfast: [String], lunch: [String], dinner: [String] }
    },
    week2: {
      monday: { breakfast: [String], lunch: [String], dinner: [String] },
      tuesday: { breakfast: [String], lunch: [String], dinner: [String] },
      wednesday: { breakfast: [String], lunch: [String], dinner: [String] },
      thursday: { breakfast: [String], lunch: [String], dinner: [String] },
      friday: { breakfast: [String], lunch: [String], dinner: [String] },
      saturday: { breakfast: [String], lunch: [String], dinner: [String] },
      sunday: { breakfast: [String], lunch: [String], dinner: [String] }
    }
  },
  approved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Submission Schema (For New PGs & Menu Edits)
const SubmissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new', 'edit'],
    required: true
  },
  pgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    default: null
  },
  data: {
    name: String,
    weeklyCycle: Number,
    menu: Object
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: String,
    default: 'anonymous'
  }
}, { timestamps: true });

module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  PG: mongoose.models.PG || mongoose.model('PG', PGSchema),
  Submission: mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)
};
