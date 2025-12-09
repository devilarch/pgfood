const express = require('express');
const router = express.Router();
const { getCurrentFood } = require('../controllers/foodController');

router.get('/', getCurrentFood);

module.exports = router;

