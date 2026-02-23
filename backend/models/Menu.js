const mongoose = require('mongoose');

const ingredientSchema = mongoose.Schema({
    name: { type: String, required: true },
    quantityPerStudent: { type: Number, required: true }, // e.g., 0.2 kg (200g)
    unit: { type: String, required: true }, // kg, ltr, pcs
});

const menuSchema = mongoose.Schema(
    {
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        mealType: {
            type: String,
            required: true,
            enum: ['Breakfast', 'Lunch', 'Dinner']
        },
        foodItems: { type: String, required: true }, // e.g., "Rice, Dal, Veg Curry"
        ingredients: [ingredientSchema], // List of ingredients and quantity per student
    },
    { timestamps: true }
);

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
