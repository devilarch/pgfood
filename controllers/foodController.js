const { getCurrentISTTime, getDayOfWeek, getMealPeriod, formatISTTime } = require('../utils/timeUtils');
const { getMenuItems } = require('../utils/menuService');

/**
 * Get current food items based on IST time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentFood = (req, res) => {
  try {
    // Get current IST time
    const istTime = getCurrentISTTime();
    const hour = istTime.getHours();
    const day = getDayOfWeek(istTime);
    
    // Determine meal period
    const meal = getMealPeriod(hour);
    
    // Get food items for the current day and meal
    const items = getMenuItems(day, meal);
    
    // Return response
    res.json({
      day: day,
      meal: meal,
      items: items,
      time: formatISTTime(istTime)
    });
  } catch (error) {
    console.error('Error in getCurrentFood:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  getCurrentFood
};

