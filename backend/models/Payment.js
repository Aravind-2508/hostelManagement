const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        month: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Paid', 'Partial', 'Unpaid'],
            default: 'Paid'
        },
        paymentDate: {
            type: Date,
            default: Date.now
        },
        method: {
            type: String,
            enum: ['Cash', 'Online', 'UPI', 'Bank Transfer'],
            default: 'Cash'
        },
        notes: { type: String }
    },
    { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
