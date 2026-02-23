const express = require('express');
const router = express.Router();
const {
    submitFeedback,
    getMyFeedback,
    getAllFeedback,
    getFeedbackAnalytics,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { studentProtect } = require('../middleware/studentAuthMiddleware');

// Student routes (requires student JWT)
router.post('/', studentProtect, submitFeedback);
router.get('/mine', studentProtect, getMyFeedback);

// Admin routes (requires admin JWT)
router.get('/', protect, getAllFeedback);
router.get('/analytics', protect, getFeedbackAnalytics);

module.exports = router;
