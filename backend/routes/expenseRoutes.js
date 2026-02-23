const express = require('express');
const router = express.Router();
const { getExpenses, addExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, addExpense);

module.exports = router;
