const express = require('express');
const router = express.Router();
const {
    submitComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaint,
    getComplaintStats,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { studentProtect } = require('../middleware/studentAuthMiddleware');

// Student routes
router.post('/', studentProtect, submitComplaint);
router.get('/mine', studentProtect, getMyComplaints);

// Admin routes
router.get('/', protect, getAllComplaints);
router.get('/stats', protect, getComplaintStats);
router.put('/:id', protect, updateComplaint);

module.exports = router;
