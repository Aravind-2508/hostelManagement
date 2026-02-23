const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
};

// @desc    Add new supplier
// @route   POST /api/suppliers
// @access  Private
const addSupplier = async (req, res) => {
    const { name, phone, email, address, contactPerson, suppliedItems } = req.body;

    const supplier = await Supplier.create({
        name,
        phone,
        email,
        address,
        contactPerson,
        suppliedItems,
    });

    res.status(201).json(supplier);
};

module.exports = { getSuppliers, addSupplier };
