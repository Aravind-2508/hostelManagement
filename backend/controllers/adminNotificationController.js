const AdminNotification = require('../models/AdminNotification');

// GET /api/admin-notifications — get all (newest first)
const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await AdminNotification.find()
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// PATCH /api/admin-notifications/:id/read — mark one as read
const markAdminNotifRead = async (req, res) => {
    try {
        await AdminNotification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ message: 'Marked as read' });
    } catch (e) {
        res.status(500).json({ message: 'Error marking as read' });
    }
};

// PATCH /api/admin-notifications/mark-all-read — mark all as read
const markAllAdminNotifsRead = async (req, res) => {
    try {
        await AdminNotification.updateMany({ read: false }, { read: true });
        res.json({ message: 'All marked as read' });
    } catch (e) {
        res.status(500).json({ message: 'Error marking all as read' });
    }
};

// DELETE /api/admin-notifications/:id — dismiss one
const dismissAdminNotif = async (req, res) => {
    try {
        await AdminNotification.findByIdAndDelete(req.params.id);
        res.json({ message: 'Dismissed' });
    } catch (e) {
        res.status(500).json({ message: 'Error dismissing notification' });
    }
};

module.exports = { getAdminNotifications, markAdminNotifRead, markAllAdminNotifsRead, dismissAdminNotif };
