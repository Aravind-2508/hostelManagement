const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 150 },
        message: { type: String, required: true, trim: true, maxlength: 1000 },
        type: { type: String, enum: ['Info', 'Alert', 'Special Meal', 'Announcement', 'Response'], default: 'Info' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        // If set → personal notification visible only to this student.
        // If null → broadcast visible to ALL students.
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
        expiresAt: { type: Date, default: null },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    },
    { timestamps: true }
);

// Virtual: check if notification is currently active (not expired)
notificationSchema.virtual('isActive').get(function () {
    if (!this.expiresAt) return true;
    return new Date() < new Date(this.expiresAt);
});

module.exports = mongoose.model('Notification', notificationSchema);
