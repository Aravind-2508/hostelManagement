const mongoose = require('mongoose');

const supplierSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        contactPerson: { type: String },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String },
        suppliedItems: [{ type: String }], // List of items they sell
    },
    { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
