/**
 * Health check controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is working'
  });
};

module.exports = {
  healthCheck
};

