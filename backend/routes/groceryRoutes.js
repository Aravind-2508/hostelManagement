const express = require('express');
const router = express.Router();
const { getGroceries, updateStock } = require('../controllers/groceryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getGroceries).post(protect, updateStock);

module.exports = router;
