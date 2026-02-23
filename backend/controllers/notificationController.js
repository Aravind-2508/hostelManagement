const Notification = require('../models/Notification');

// ─── ADMIN: Create notification ───────────────────────────────────────────────
// POST /api/notifications
const createNotification = async (req, res) => {
    try {
        const { title, message, type, expiresAt } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const notification = await Notification.create({
            title: title.trim(),
            message: message.trim(),
            type: type || 'Info',
            createdBy: req.admin._id,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: 'Error creating notification' });
    }
};

// ─── ADMIN: Get all notifications ────────────────────────────────────────────
// GET /api/notifications/admin
const getAllNotificationsAdmin = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        const enriched = notifications.map(n => ({
            ...n.toObject(),
            readCount: n.readBy.length,
            isActive: !n.expiresAt || new Date() < new Date(n.expiresAt),
        }));

        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// ─── ADMIN: Update notification ───────────────────────────────────────────────
// PUT /api/notifications/:id
const updateNotification = async (req, res) => {
    try {
        const { title, message, type, expiresAt } = req.body;
        const notification = await Notification.findById(req.params.id);

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        notification.title = title || notification.title;
        notification.message = message || notification.message;
        notification.type = type || notification.type;
        notification.expiresAt = expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : notification.expiresAt;

        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// ─── ADMIN: Delete notification ───────────────────────────────────────────────
// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification' });
    }
};

// ─── STUDENT: Get active notifications (not expired) ─────────────────────────
// GET /api/notifications
// Returns: broadcast notifications + personal notifications for this student
const getStudentNotifications = async (req, res) => {
    try {
        const now = new Date();
        const studentId = req.student._id;

        const notifications = await Notification.find({
            // Not expired
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
            // Either broadcast (student:null) OR personal to this student
            $and: [
                { $or: [{ student: null }, { student: studentId }] }
            ]
        }).sort({ createdAt: -1 });

        const withRead = notifications.map(n => ({
            _id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            createdAt: n.createdAt,
            expiresAt: n.expiresAt,
            isPersonal: n.student != null,
            isRead: n.readBy.some(id => id.toString() === studentId.toString()),
        }));

        res.json(withRead);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// ─── STUDENT: Get unread count ────────────────────────────────────────────────
// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
    try {
        const now = new Date();
        const count = await Notification.countDocuments({
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
            readBy: { $ne: req.student._id },
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Error counting unread' });
    }
};

// ─── STUDENT: Mark notification as read ───────────────────────────────────────
// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { readBy: req.student._id },   // addToSet prevents duplicates
        });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking as read' });
    }
};

// ─── STUDENT: Mark ALL notifications as read ──────────────────────────────────
// PATCH /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
    try {
        const now = new Date();
        await Notification.updateMany(
            { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
            { $addToSet: { readBy: req.student._id } }
        );
        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking all as read' });
    }
};

module.exports = {
    createNotification,
    getAllNotificationsAdmin,
    updateNotification,
    deleteNotification,
    getStudentNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
