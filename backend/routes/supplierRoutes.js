const express = require('express');
const router = express.Router();
const { getSuppliers, addSupplier } = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSuppliers).post(protect, addSupplier);

module.exports = router;
