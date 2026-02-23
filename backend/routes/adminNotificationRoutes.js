const express = require('express');
const router = express.Router();
const {
    getAdminNotifications,
    markAdminNotifRead,
    markAllAdminNotifsRead,
    dismissAdminNotif,
} = require('../controllers/adminNotificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are admin-protected
router.get('/', protect, getAdminNotifications);
router.patch('/mark-all-read', protect, markAllAdminNotifsRead);
router.patch('/:id/read', protect, markAdminNotifRead);
router.delete('/:id', protect, dismissAdminNotif);

module.exports = router;
