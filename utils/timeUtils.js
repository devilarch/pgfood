const { utcToZonedTime, format } = require('date-fns-tz');

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date and time in IST
 * @returns {Date} Current date/time in IST timezone
 */
function getCurrentISTTime() {
  const now = new Date();
  return utcToZonedTime(now, IST_TIMEZONE);
}

/**
 * Get day of week in lowercase (monday, tuesday, etc.)
 * @param {Date} date - Date object
 * @returns {string} Lowercase day name
 */
function getDayOfWeek(date) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Get next day of week in lowercase
 * @param {Date} date - Date object
 * @returns {string} Lowercase day name of next day
 */
function getNextDayOfWeek(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return getDayOfWeek(nextDay);
}

/**
 * Determine meal period based on hour in IST
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {string} Meal period: 'breakfast', 'lunch', or 'dinner'
 */
function getMealPeriod(hour) {
  // Breakfast: 22:00 (10pm) to 08:00 (8am next day)
  // Lunch: 08:00 to 13:00 (1pm)
  // Dinner: 13:00 (1pm) to 22:00 (10pm)
  
  if (hour >= 22 || hour < 8) {
    return 'breakfast';
  } else if (hour >= 8 && hour < 13) {
    return 'lunch';
  } else {
    return 'dinner';
  }
}

/**
 * Format IST time as string
 * @param {Date} date - Date object
 * @returns {string} Formatted time string
 */
function formatISTTime(date) {
  return format(date, 'yyyy-MM-dd HH:mm:ss zzz', { timeZone: IST_TIMEZONE });
}

module.exports = {
  getCurrentISTTime,
  getDayOfWeek,
  getNextDayOfWeek,
  getMealPeriod,
  formatISTTime,
  IST_TIMEZONE
};

