const express = require('express');
const router = express.Router();
const { authAdmin, registerAdmin, updateProfile, changePassword } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authAdmin);
router.post('/register', registerAdmin);

// Protected routes
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
