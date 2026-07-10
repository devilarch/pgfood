const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbService = require('../utils/dbService');
const { requireAuth, JWT_SECRET } = require('../utils/authMiddleware');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Check if user already exists
    const existingUser = await dbService.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Create user (role defaults to 'user')
    const user = await dbService.createUser(username, password);

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        favorites: user.favorites || []
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await dbService.getUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        favorites: user.favorites || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user details
 */
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      favorites: req.user.favorites || []
    }
  });
});

/**
 * @route POST /api/auth/favorites
 * @desc Sync user favorites list
 */
router.post('/favorites', requireAuth, async (req, res) => {
  try {
    const { favorites } = req.body;

    if (!Array.isArray(favorites)) {
      return res.status(400).json({ error: 'Favorites must be an array of PG IDs.' });
    }

    const updatedUser = await dbService.updateUserFavorites(req.user._id, favorites);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      message: 'Favorites updated successfully.',
      favorites: updatedUser.favorites || []
    });
  } catch (error) {
    console.error('Sync favorites error:', error);
    res.status(500).json({ error: 'Internal server error while syncing favorites.' });
  }
});

module.exports = router;
