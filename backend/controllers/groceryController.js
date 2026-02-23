const Grocery = require('../models/Grocery');

// @desc    Get all grocery items
// @route   GET /api/grocery
// @access  Private
const getGroceries = async (req, res) => {
    const groceries = await Grocery.find({});
    res.json(groceries);
};

// @desc    Add or update grocery stock
// @route   POST /api/grocery
// @access  Private
const updateStock = async (req, res) => {
    const { itemName, quantity, unit, minStockLevel } = req.body;

    let item = await Grocery.findOne({ itemName });

    if (item) {
        item.currentStock += Number(quantity);
        item.lastUpdated = Date.now();
        await item.save();
    } else {
        item = await Grocery.create({
            itemName,
            currentStock: quantity,
            unit,
            minStockLevel,
        });
    }

    res.status(201).json(item);
};

module.exports = { getGroceries, updateStock };
