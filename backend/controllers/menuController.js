const Menu = require('../models/Menu');

// @desc    Get full weekly menu
// @route   GET /api/menu
// @access  Public
const getFullMenu = async (req, res) => {
    try {
        const menu = await Menu.find({});
        res.json(menu);
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ message: 'Server error fetching menu' });
    }
};

// @desc    Update or create a meal plan
// @route   POST /api/menu
// @access  Private
const updateMeal = async (req, res) => {
    try {
        const { day, mealType, foodItems, ingredients } = req.body;

        if (!day || !mealType || !foodItems) {
            return res.status(400).json({ message: 'day, mealType and foodItems are required' });
        }

        // Filter out any ingredient rows that have an empty name
        const cleanIngredients = (ingredients || []).filter(
            ing => ing.name && ing.name.trim() !== ''
        );

        let menu = await Menu.findOne({ day, mealType });

        if (menu) {
            menu.foodItems = foodItems;
            menu.ingredients = cleanIngredients;
            await menu.save();
        } else {
            menu = await Menu.create({
                day,
                mealType,
                foodItems,
                ingredients: cleanIngredients,
            });
        }

        res.status(201).json(menu);
    } catch (error) {
        console.error('Save menu error:', error);
        res.status(500).json({ message: error.message || 'Error saving menu' });
    }
};

module.exports = { getFullMenu, updateMeal };
