const express = require('express');
const router = express.Router();
const { getFullMenu, updateMeal } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/menu — Public (students can view without admin token)
router.get('/', getFullMenu);

// POST /api/menu — Admin only (to add/update meals)
router.post('/', protect, updateMeal);

module.exports = router;
