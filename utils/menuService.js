const fs = require('fs');
const path = require('path');

let menuData = null;

/**
 * Load menu data from JSON file
 * @returns {Object} Menu data object
 */
function loadMenuData() {
  if (menuData) {
    return menuData;
  }

  const menuPath = path.join(__dirname, '..', 'menu.json');
  
  try {
    const menuFile = fs.readFileSync(menuPath, 'utf8');
    menuData = JSON.parse(menuFile);
    return menuData;
  } catch (error) {
    console.error('Error loading menu.json:', error);
    throw new Error('Failed to load menu data');
  }
}

/**
 * Get menu items for a specific day and meal
 * @param {string} day - Day of week (monday, tuesday, etc.)
 * @param {string} meal - Meal type (breakfast, lunch, dinner)
 * @returns {Array} Array of food items
 */
function getMenuItems(day, meal) {
  const menu = loadMenuData();
  
  if (!menu[day]) {
    throw new Error(`Menu data not found for ${day}`);
  }
  
  if (!menu[day][meal]) {
    throw new Error(`Menu data not found for ${day} - ${meal}`);
  }
  
  return menu[day][meal];
}

module.exports = {
  loadMenuData,
  getMenuItems
};

