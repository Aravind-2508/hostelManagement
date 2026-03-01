const Payment = require('../models/Payment');

// ─── ADMIN: Get all payments ──────────────────────────────────────────────────
// GET /api/payments
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('student', 'name rollNo roomNo phone').sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

// ─── ADMIN: Add payment ───────────────────────────────────────────────────────
// POST /api/payments
const addPayment = async (req, res) => {
    try {
        const { studentId, amount, month, year, status, method, notes } = req.body;

        const payment = await Payment.create({
            student: studentId,
            amount: Number(amount),
            month,
            year: Number(year),
            status: status || 'Paid',
            method: method || 'Cash',
            notes: notes || '',
            paymentDate: new Date()
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment' });
    }
};

// ─── STUDENT: Get my payments ─────────────────────────────────────────────────
// GET /api/payments/me
const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.student._id }).sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personal payments' });
    }
};

module.exports = { getPayments, addPayment, getMyPayments };
