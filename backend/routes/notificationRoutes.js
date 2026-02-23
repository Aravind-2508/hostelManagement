const express = require('express');
const router = express.Router();
const {
    createNotification,
    getAllNotificationsAdmin,
    updateNotification,
    deleteNotification,
    getStudentNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { studentProtect } = require('../middleware/studentAuthMiddleware');

// ─── Student routes ────────────────────────────────────────────────
router.get('/', studentProtect, getStudentNotifications);
router.get('/unread-count', studentProtect, getUnreadCount);
router.patch('/mark-all-read', studentProtect, markAllAsRead);
router.patch('/:id/read', studentProtect, markAsRead);

// ─── Admin routes ──────────────────────────────────────────────────
router.get('/admin/all', protect, getAllNotificationsAdmin);
router.post('/', protect, createNotification);
router.put('/:id', protect, updateNotification);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
