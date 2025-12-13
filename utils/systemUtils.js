const os = require('os');

/**
 * Get system uptime in seconds
 * @returns {number} System uptime in seconds
 */
function getSystemUptime() {
  return Math.floor(os.uptime());
}

/**
 * Format uptime to human readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Get memory usage information
 * @returns {Object} Memory usage stats
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // Resident Set Size in MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // Heap total in MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // Heap used in MB
    external: Math.round(usage.external / 1024 / 1024), // External in MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // Array buffers in MB
  };
}

/**
 * Get system information
 * @returns {Object} System information
 */
function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    cpuCount: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024), // Total memory in MB
    freeMemory: Math.round(os.freemem() / 1024 / 1024), // Free memory in MB
    loadAverage: os.loadavg()
  };
}

module.exports = {
  getSystemUptime,
  formatUptime,
  getMemoryUsage,
  getSystemInfo
};

