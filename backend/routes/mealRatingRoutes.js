const express = require('express');
const router = express.Router();
const { submitRating, getAnalytics, getStudentRatingsToday } = require('../controllers/mealRatingController');
const { protect, protectStudent } = require('../middleware/authMiddleware');

router.post('/', protectStudent, submitRating);
router.get('/student', protectStudent, getStudentRatingsToday);
router.get('/analytics', protect, getAnalytics);

module.exports = router;
