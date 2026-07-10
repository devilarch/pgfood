const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, PG, Submission } = require('../models/models');

const JSON_DB_DIR = path.join(__dirname, '..', 'data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

let useMongoDB = false;

// Mock UUID generator for JSON DB
function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

// Helpers for JSON DB
function readJsonDB() {
  if (!fs.existsSync(JSON_DB_PATH)) {
    if (!fs.existsSync(JSON_DB_DIR)) {
      fs.mkdirSync(JSON_DB_DIR, { recursive: true });
    }
    const initialData = { users: [], pgs: [], submissions: [] };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON DB file:', error);
    return { users: [], pgs: [], submissions: [] };
  }
}

function writeJsonDB(data) {
  try {
    if (!fs.existsSync(JSON_DB_DIR)) {
      fs.mkdirSync(JSON_DB_DIR, { recursive: true });
    }
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON DB file:', error);
  }
}

/**
 * Connects to MongoDB, falls back to JSON file on failure
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('⚠️ MONGODB_URI not specified. Using local JSON DB fallback.');
    useMongoDB = false;
    await seedDefaultData();
    return false;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('✅ Connected to MongoDB successfully.');
    useMongoDB = true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB. Using local JSON DB fallback.');
    console.error(error.message);
    useMongoDB = false;
  }

  await seedDefaultData();
  return useMongoDB;
}

/**
 * Seed default PGs and an admin user if the database is empty
 */
async function seedDefaultData() {
  const defaultPGs = [];

  if (useMongoDB) {
    try {
      // Seed PGs
      const pgCount = await PG.countDocuments();
      if (pgCount === 0) {
        await PG.insertMany(defaultPGs);
        console.log(`🏢 Seeded ${defaultPGs.length} Default PGs in MongoDB`);
      }
    } catch (error) {
      console.error('Error seeding MongoDB:', error);
    }
  } else {
    // Seed JSON DB
    const db = readJsonDB();
    let updated = false;

    // Seed PGs
    if (db.pgs.length === 0) {
      defaultPGs.forEach(pg => {
        db.pgs.push({
          _id: generateId(),
          ...pg,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      updated = true;
      console.log(`🏢 Seeded ${defaultPGs.length} Default PGs in JSON DB`);
    }

    if (updated) {
      writeJsonDB(db);
    }
  }
}

/**
 * Get all approved PGs
 */
async function getPGs() {
  if (useMongoDB) {
    return await PG.find({ approved: true });
  } else {
    const db = readJsonDB();
    return db.pgs.filter(pg => pg.approved);
  }
}

/**
 * Get PG by ID
 */
async function getPGById(id) {
  if (useMongoDB) {
    return await PG.findById(id);
  } else {
    const db = readJsonDB();
    return db.pgs.find(pg => pg._id === id.toString()) || null;
  }
}

/**
 * Create a new approved PG
 */
async function createPG(pgData) {
  if (useMongoDB) {
    return await PG.create(pgData);
  } else {
    const db = readJsonDB();
    const newPG = {
      _id: generateId(),
      approved: true,
      ...pgData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.pgs.push(newPG);
    writeJsonDB(db);
    return newPG;
  }
}

/**
 * Update PG by ID
 */
async function updatePG(id, pgData) {
  if (useMongoDB) {
    return await PG.findByIdAndUpdate(id, pgData, { new: true });
  } else {
    const db = readJsonDB();
    const index = db.pgs.findIndex(pg => pg._id === id.toString());
    if (index !== -1) {
      db.pgs[index] = {
        ...db.pgs[index],
        ...pgData,
        updatedAt: new Date()
      };
      writeJsonDB(db);
      return db.pgs[index];
    }
    return null;
  }
}

/**
 * Create a new user
 */
async function createUser(username, password, role = 'user') {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (useMongoDB) {
    return await User.create({
      username,
      password: hashedPassword,
      role,
      favorites: []
    });
  } else {
    const db = readJsonDB();
    const newUser = {
      _id: generateId(),
      username,
      password: hashedPassword,
      role,
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(newUser);
    writeJsonDB(db);
    return newUser;
  }
}

/**
 * Find user by username
 */
async function getUserByUsername(username) {
  if (useMongoDB) {
    return await User.findOne({ username });
  } else {
    const db = readJsonDB();
    return db.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }
}

/**
 * Find user by ID
 */
async function getUserById(id) {
  if (useMongoDB) {
    return await User.findById(id);
  } else {
    const db = readJsonDB();
    return db.users.find(u => u._id === id.toString()) || null;
  }
}

/**
 * Sync user favorites
 */
async function updateUserFavorites(userId, favoritesArray) {
  if (useMongoDB) {
    const user = await User.findById(userId);
    if (!user) return null;
    user.favorites = favoritesArray;
    return await user.save();
  } else {
    const db = readJsonDB();
    const user = db.users.find(u => u._id === userId.toString());
    if (user) {
      user.favorites = favoritesArray;
      user.updatedAt = new Date();
      writeJsonDB(db);
      return user;
    }
    return null;
  }
}

/**
 * Create a new submission (new PG or edit menu)
 */
async function createSubmission(submissionData) {
  if (useMongoDB) {
    return await Submission.create(submissionData);
  } else {
    const db = readJsonDB();
    const newSubmission = {
      _id: generateId(),
      status: 'pending',
      submittedBy: 'anonymous',
      ...submissionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.submissions.push(newSubmission);
    writeJsonDB(db);
    return newSubmission;
  }
}

/**
 * Get all submissions (defaults to pending, sorted by newest)
 */
async function getSubmissions() {
  if (useMongoDB) {
    return await Submission.find().sort({ createdAt: -1 });
  } else {
    const db = readJsonDB();
    return [...db.submissions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

/**
 * Get submission by ID
 */
async function getSubmissionById(id) {
  if (useMongoDB) {
    return await Submission.findById(id);
  } else {
    const db = readJsonDB();
    return db.submissions.find(s => s._id === id.toString()) || null;
  }
}

/**
 * Update submission status (Approve or Reject)
 */
async function updateSubmissionStatus(id, status) {
  if (useMongoDB) {
    return await Submission.findByIdAndUpdate(id, { status }, { new: true });
  } else {
    const db = readJsonDB();
    const index = db.submissions.findIndex(s => s._id === id.toString());
    if (index !== -1) {
      db.submissions[index].status = status;
      db.submissions[index].updatedAt = new Date();
      writeJsonDB(db);
      return db.submissions[index];
    }
    return null;
  }
}
/**
 * Delete PG by ID
 */
async function deletePG(id) {
  if (useMongoDB) {
    return await PG.findByIdAndDelete(id);
  } else {
    const db = readJsonDB();
    const index = db.pgs.findIndex(pg => pg._id === id.toString());
    if (index !== -1) {
      const deletedPG = db.pgs.splice(index, 1)[0];
      writeJsonDB(db);
      return deletedPG;
    }
    return null;
  }
}

module.exports = {
  connectDB,
  getPGs,
  getPGById,
  createPG,
  updatePG,
  deletePG,
  createUser,
  getUserByUsername,
  getUserById,
  updateUserFavorites,
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  getUseMongoDB: () => useMongoDB
};
