const express = require('express');
const router = express.Router();
const dbService = require('../utils/dbService');
const { requireAdmin } = require('../utils/authMiddleware');

// Apply admin role middleware to all routes in this file
router.use(requireAdmin);

/**
 * @route GET /api/submissions
 * @desc Get all submissions (ordered by newest)
 */
router.get('/', async (req, res) => {
  try {
    const submissions = await dbService.getSubmissions();
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error while fetching submissions.' });
  }
});

/**
 * @route POST /api/submissions/:id/approve
 * @desc Approve a submission (either new PG or edit request)
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await dbService.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ error: `Submission has already been ${submission.status}.` });
    }

    if (submission.type === 'new') {
      // Create new PG
      const newPG = await dbService.createPG({
        name: submission.data.name,
        weeklyCycle: submission.data.weeklyCycle,
        menu: submission.data.menu,
        approved: true
      });
      
      // Update submission status
      await dbService.updateSubmissionStatus(id, 'approved');

      return res.json({
        message: 'New PG submission approved and published successfully.',
        pg: newPG
      });
    } else if (submission.type === 'edit') {
      // Check if original PG still exists
      const pg = await dbService.getPGById(submission.pgId);
      if (!pg) {
        // PG was deleted, reject the edit
        await dbService.updateSubmissionStatus(id, 'rejected');
        return res.status(404).json({ error: 'The PG being edited no longer exists. Submission rejected automatically.' });
      }

      // Update existing PG
      const updatedPG = await dbService.updatePG(submission.pgId, {
        name: submission.data.name,
        weeklyCycle: submission.data.weeklyCycle,
        menu: submission.data.menu
      });

      // Update submission status
      await dbService.updateSubmissionStatus(id, 'approved');

      return res.json({
        message: 'PG edit request approved and updates applied successfully.',
        pg: updatedPG
      });
    }

    res.status(400).json({ error: 'Unknown submission type.' });
  } catch (error) {
    console.error('Error approving submission:', error);
    res.status(500).json({ error: 'Internal server error while approving submission.' });
  }
});

/**
 * @route POST /api/submissions/:id/reject
 * @desc Reject a submission
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await dbService.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ error: `Submission has already been ${submission.status}.` });
    }

    await dbService.updateSubmissionStatus(id, 'rejected');

    res.json({
      message: 'Submission rejected successfully.'
    });
  } catch (error) {
    console.error('Error rejecting submission:', error);
    res.status(500).json({ error: 'Internal server error while rejecting submission.' });
  }
});

module.exports = router;
