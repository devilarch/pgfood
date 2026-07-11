const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

    // Generate JWT (Access Token) - 7 days expiry
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Generate Refresh Token - long lived (30 days)
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await dbService.saveRefreshToken(refreshToken, user._id, expiresAt);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      refreshToken,
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

    // Generate JWT (Access Token) - 7 days expiry
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Generate Refresh Token - long lived (30 days)
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await dbService.saveRefreshToken(refreshToken, user._id, expiresAt);

    res.json({
      message: 'Login successful.',
      token,
      refreshToken,
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
 * @route POST /api/auth/refresh
 * @desc Get new access token using a refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    // Find refresh token in DB
    const savedToken = await dbService.findRefreshToken(refreshToken);
    if (!savedToken) {
      return res.status(401).json({ error: 'Invalid or revoked refresh token.' });
    }

    // Check expiration
    if (new Date() > new Date(savedToken.expiresAt)) {
      await dbService.deleteRefreshToken(refreshToken);
      return res.status(401).json({ error: 'Refresh token has expired. Please login again.' });
    }

    // Get user details
    const userId = savedToken.userId;
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Generate new Access Token
    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Rotate Refresh Token: delete the old one, generate a new one
    await dbService.deleteRefreshToken(refreshToken);

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await dbService.saveRefreshToken(newRefreshToken, user._id, newExpiresAt);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error during token refresh.' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Revoke refresh token (logout)
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await dbService.deleteRefreshToken(refreshToken);
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error during logout.' });
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
