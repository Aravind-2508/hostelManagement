const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        type: { type: String, enum: ['Complaint', 'Suggestion'], default: 'Complaint' },
        category: { type: String, enum: ['Food', 'Cleanliness', 'Maintenance', 'Other'], required: true },
        description: { type: String, required: true, maxlength: 1000, trim: true },
        status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
        adminResponse: { type: String, trim: true, default: '' },
        // Future-ready: image attachment URL
        attachmentUrl: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
