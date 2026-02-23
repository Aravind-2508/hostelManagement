const mongoose = require('mongoose');

// Lightweight admin-only notification (vs Notification which is for students)
const adminNotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        body: { type: String, required: true, trim: true, maxlength: 500 },
        type: { type: String, enum: ['complaint', 'suggestion', 'info', 'warning'], default: 'info' },
        // Optional: link back to source record
        refId: { type: mongoose.Schema.Types.ObjectId, default: null },
        refModel: { type: String, default: null },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
