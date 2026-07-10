const express = require('express');
const router = express.Router();
const dbService = require('../utils/dbService');
const { requireAuth, optionalAuth, requireAdmin } = require('../utils/authMiddleware');

/**
 * @route GET /api/pgs
 * @desc Get all approved PGs and their menus
 */
router.get('/', async (req, res) => {
  try {
    const pgs = await dbService.getPGs();
    res.json(pgs);
  } catch (error) {
    console.error('Error fetching PGs:', error);
    res.status(500).json({ error: 'Internal server error while fetching PGs.' });
  }
});

/**
 * @route POST /api/pgs/submit
 * @desc Submit a request to add a new PG (Public, optional auth)
 */
router.post('/submit', optionalAuth, async (req, res) => {
  try {
    const { name, weeklyCycle, menu } = req.body;

    if (!name || !weeklyCycle || !menu) {
      return res.status(400).json({ error: 'PG Name, weekly cycle (1 or 2), and menu are required.' });
    }

    if (weeklyCycle !== 1 && weeklyCycle !== 2) {
      return res.status(400).json({ error: 'Weekly cycle must be either 1 or 2.' });
    }

    // Validate menu structure briefly
    if (!menu.week1) {
      return res.status(400).json({ error: 'Menu must contain week1 items.' });
    }

    const submittedBy = req.user ? req.user.username : 'anonymous';

    const submission = await dbService.createSubmission({
      type: 'new',
      pgId: null,
      data: {
        name,
        weeklyCycle,
        menu
      },
      submittedBy
    });

    res.status(201).json({
      message: 'PG submission received. It will appear on the dashboard once approved by an admin.',
      submission
    });
  } catch (error) {
    console.error('Error creating PG submission:', error);
    res.status(500).json({ error: 'Internal server error while submitting PG.' });
  }
});

/**
 * @route POST /api/pgs/edit-request
 * @desc Request edits for an existing PG (Requires Auth)
 */
router.post('/edit-request', requireAuth, async (req, res) => {
  try {
    const { pgId, name, weeklyCycle, menu } = req.body;

    if (!pgId || !name || !weeklyCycle || !menu) {
      return res.status(400).json({ error: 'PG ID, PG Name, weekly cycle, and updated menu are required.' });
    }

    // Verify PG exists
    const pg = await dbService.getPGById(pgId);
    if (!pg) {
      return res.status(404).json({ error: 'PG not found.' });
    }

    const submission = await dbService.createSubmission({
      type: 'edit',
      pgId,
      data: {
        name,
        weeklyCycle,
        menu
      },
      submittedBy: req.user.username
    });

    res.status(201).json({
      message: 'Edit request received. The menu updates will be applied once approved by an admin.',
      submission
    });
  } catch (error) {
    console.error('Error creating PG edit submission:', error);
    res.status(500).json({ error: 'Internal server error while submitting edit request.' });
  }
});

/**
 * @route DELETE /api/pgs/:id
 * @desc Delete an approved PG (Requires Admin)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deletePG(id);
    if (!deleted) {
      return res.status(404).json({ error: 'PG not found.' });
    }
    res.json({ message: 'PG successfully deleted from the list.' });
  } catch (error) {
    console.error('Error deleting PG:', error);
    res.status(500).json({ error: 'Internal server error while deleting PG.' });
  }
});

module.exports = router;
