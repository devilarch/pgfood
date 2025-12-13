const { getSystemUptime, formatUptime, getMemoryUsage, getSystemInfo } = require('../utils/systemUtils');

// Track application start time for uptime calculation
const startTime = Date.now();

/**
 * Health check controller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheck = (req, res) => {
  const appUptime = Math.floor((Date.now() - startTime) / 1000);
  const systemUptime = getSystemUptime();
  const memoryUsage = getMemoryUsage();
  const systemInfo = getSystemInfo();
  
  res.json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    uptime: {
      application: {
        seconds: appUptime,
        formatted: formatUptime(appUptime)
      },
      system: {
        seconds: systemUptime,
        formatted: formatUptime(systemUptime)
      }
    },
    memory: memoryUsage,
    system: systemInfo
  });
};

module.exports = {
  healthCheck
};

