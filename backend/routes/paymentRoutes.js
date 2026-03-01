const express = require('express');
const router = express.Router();
const { getPayments, addPayment, getMyPayments } = require('../controllers/paymentController');
const { protect, protectStudent } = require('../middleware/authMiddleware');

router.get('/', protect, getPayments);
router.post('/', protect, addPayment);
router.get('/me', protectStudent, getMyPayments);

module.exports = router;
