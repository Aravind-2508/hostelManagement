const mongoose = require('mongoose');

const grocerySchema = mongoose.Schema(
    {
        itemName: { type: String, required: true, unique: true },
        currentStock: { type: Number, default: 0 },
        unit: { type: String, required: true },
        minStockLevel: { type: Number, default: 5 }, // Alert level
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Grocery = mongoose.model('Grocery', grocerySchema);
module.exports = Grocery;
