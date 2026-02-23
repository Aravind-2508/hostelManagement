const Menu = require('../models/Menu');

// @desc    Get full weekly menu
// @route   GET /api/menu
// @access  Private
const getFullMenu = async (req, res) => {
    const menu = await Menu.find({});
    res.json(menu);
};

// @desc    Update or create a meal plan
// @route   POST /api/menu
// @access  Private
const updateMeal = async (req, res) => {
    const { day, mealType, foodItems, ingredients } = req.body;

    let menu = await Menu.findOne({ day, mealType });

    if (menu) {
        menu.foodItems = foodItems;
        menu.ingredients = ingredients;
        await menu.save();
    } else {
        menu = await Menu.create({
            day,
            mealType,
            foodItems,
            ingredients,
        });
    }

    res.status(201).json(menu);
};

module.exports = { getFullMenu, updateMeal };
