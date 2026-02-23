const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Menu = require('./models/Menu');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected for seeding...');

        // Clear existing data
        await Admin.deleteMany();
        await Student.deleteMany();
        await Menu.deleteMany();

        // ─── Create Admin ────────────────────────────────────────────────
        await Admin.create({
            name: 'Super Admin',
            email: 'admin@hostel.com',
            password: 'admin123',
        });
        console.log('✅ Admin Created: admin@hostel.com / admin123');

        // ─── Create Sample Students ──────────────────────────────────────
        await Student.create([
            { name: 'John Doe', rollNo: '101', roomNo: 'A-10', password: 'john101', status: 'Active' },
            { name: 'Jane Smith', rollNo: '102', roomNo: 'A-11', password: 'jane102', status: 'Active' },
            { name: 'Bob Wilson', rollNo: '103', roomNo: 'B-05', password: 'bob103', status: 'Active' },
        ]);
        console.log('✅ Students Created: 101/john101 | 102/jane102 | 103/bob103');

        // ─── Seed Weekly Menu (7 days × 3 meals) ─────────────────────────
        const weeklyMenu = [
            // ── MONDAY ──
            {
                day: 'Monday', mealType: 'Breakfast',
                foodItems: 'Idli, Sambar, Coconut Chutney, Banana',
                ingredients: [
                    { name: 'Rice (Idli batter)', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Toor Dal (Sambar)', quantityPerStudent: 0.03, unit: 'kg' },
                    { name: 'Coconut', quantityPerStudent: 0.05, unit: 'kg' },
                ]
            },
            {
                day: 'Monday', mealType: 'Lunch',
                foodItems: 'Steamed Rice, Dal Fry, Aloo Sabzi, Papad, Salad',
                ingredients: [
                    { name: 'Rice', quantityPerStudent: 0.2, unit: 'kg' },
                    { name: 'Toor Dal', quantityPerStudent: 0.05, unit: 'kg' },
                    { name: 'Potato', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Cooking Oil', quantityPerStudent: 0.02, unit: 'ltr' },
                ]
            },
            {
                day: 'Monday', mealType: 'Dinner',
                foodItems: 'Chapati (4 pcs), Paneer Butter Masala, Jeera Rice, Raita',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Paneer', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Rice', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Curd', quantityPerStudent: 0.1, unit: 'kg' },
                ]
            },

            // ── TUESDAY ──
            {
                day: 'Tuesday', mealType: 'Breakfast',
                foodItems: 'Poha, Masala Chai, Boiled Egg, Mixed Fruit',
                ingredients: [
                    { name: 'Poha (Flattened Rice)', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Egg', quantityPerStudent: 1, unit: 'pcs' },
                    { name: 'Milk', quantityPerStudent: 0.2, unit: 'ltr' },
                ]
            },
            {
                day: 'Tuesday', mealType: 'Lunch',
                foodItems: 'Rice, Rajma Masala, Mixed Veg Curry, Pickle, Buttermilk',
                ingredients: [
                    { name: 'Rice', quantityPerStudent: 0.2, unit: 'kg' },
                    { name: 'Rajma', quantityPerStudent: 0.08, unit: 'kg' },
                    { name: 'Mixed Veg', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Curd', quantityPerStudent: 0.1, unit: 'ltr' },
                ]
            },
            {
                day: 'Tuesday', mealType: 'Dinner',
                foodItems: 'Roti (3 pcs), Chicken Curry, Dal, Salad',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.12, unit: 'kg' },
                    { name: 'Chicken', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Toor Dal', quantityPerStudent: 0.05, unit: 'kg' },
                ]
            },

            // ── WEDNESDAY ──
            {
                day: 'Wednesday', mealType: 'Breakfast',
                foodItems: 'Upma, Green Chutney, Masala Chai, Apple',
                ingredients: [
                    { name: 'Semolina (Rava)', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Onion', quantityPerStudent: 0.05, unit: 'kg' },
                    { name: 'Milk', quantityPerStudent: 0.2, unit: 'ltr' },
                ]
            },
            {
                day: 'Wednesday', mealType: 'Lunch',
                foodItems: 'Curd Rice, Sambar, Fried Papad, Mango Pickle, Sweet (Kheer)',
                ingredients: [
                    { name: 'Rice', quantityPerStudent: 0.2, unit: 'kg' },
                    { name: 'Curd', quantityPerStudent: 0.2, unit: 'ltr' },
                    { name: 'Milk (Kheer)', quantityPerStudent: 0.15, unit: 'ltr' },
                    { name: 'Sugar', quantityPerStudent: 0.03, unit: 'kg' },
                ]
            },
            {
                day: 'Wednesday', mealType: 'Dinner',
                foodItems: 'Paratha (3 pcs), Chana Masala, Raita, Green Salad',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Chickpeas', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Curd', quantityPerStudent: 0.1, unit: 'ltr' },
                ]
            },

            // ── THURSDAY ──
            {
                day: 'Thursday', mealType: 'Breakfast',
                foodItems: 'Dosa, Sambar, Tomato Chutney, Masala Tea',
                ingredients: [
                    { name: 'Rice Batter', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Toor Dal', quantityPerStudent: 0.03, unit: 'kg' },
                    { name: 'Tomato', quantityPerStudent: 0.05, unit: 'kg' },
                ]
            },
            {
                day: 'Thursday', mealType: 'Lunch',
                foodItems: 'Veg Biryani, Raita, Boiled Egg, Papad',
                ingredients: [
                    { name: 'Basmati Rice', quantityPerStudent: 0.25, unit: 'kg' },
                    { name: 'Mixed Veg', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Curd', quantityPerStudent: 0.1, unit: 'ltr' },
                    { name: 'Egg', quantityPerStudent: 1, unit: 'pcs' },
                ]
            },
            {
                day: 'Thursday', mealType: 'Dinner',
                foodItems: 'Chapati (4 pcs), Dal Makhani, Stir-fry Veggies, Salad',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Black Dal', quantityPerStudent: 0.07, unit: 'kg' },
                    { name: 'Mixed Veggies', quantityPerStudent: 0.15, unit: 'kg' },
                ]
            },

            // ── FRIDAY ──
            {
                day: 'Friday', mealType: 'Breakfast',
                foodItems: 'Bread Toast, Omelette (2 eggs), Butter, Jam, Milk',
                ingredients: [
                    { name: 'Bread', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Egg', quantityPerStudent: 2, unit: 'pcs' },
                    { name: 'Milk', quantityPerStudent: 0.25, unit: 'ltr' },
                    { name: 'Butter', quantityPerStudent: 0.01, unit: 'kg' },
                ]
            },
            {
                day: 'Friday', mealType: 'Lunch',
                foodItems: 'Rice, Fish Curry, Dal Tadka, Salad, Papad',
                ingredients: [
                    { name: 'Rice', quantityPerStudent: 0.2, unit: 'kg' },
                    { name: 'Fish', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Toor Dal', quantityPerStudent: 0.05, unit: 'kg' },
                    { name: 'Tomato', quantityPerStudent: 0.05, unit: 'kg' },
                ]
            },
            {
                day: 'Friday', mealType: 'Dinner',
                foodItems: 'Special Chicken Biryani, Salan, Raita, Sweet (Gulab Jamun)',
                ingredients: [
                    { name: 'Basmati Rice', quantityPerStudent: 0.25, unit: 'kg' },
                    { name: 'Chicken', quantityPerStudent: 0.2, unit: 'kg' },
                    { name: 'Curd', quantityPerStudent: 0.1, unit: 'ltr' },
                    { name: 'Sugar', quantityPerStudent: 0.05, unit: 'kg' },
                ]
            },

            // ── SATURDAY ──
            {
                day: 'Saturday', mealType: 'Breakfast',
                foodItems: 'Puri (4 pcs), Aloo Sabzi, Masala Chai, Banana',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.12, unit: 'kg' },
                    { name: 'Potato', quantityPerStudent: 0.1, unit: 'kg' },
                    { name: 'Milk', quantityPerStudent: 0.2, unit: 'ltr' },
                ]
            },
            {
                day: 'Saturday', mealType: 'Lunch',
                foodItems: 'Rice, Mutton Curry, Dal, Salad, Pickle',
                ingredients: [
                    { name: 'Rice', quantityPerStudent: 0.2, unit: 'kg' },
                    { name: 'Mutton', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Dal', quantityPerStudent: 0.05, unit: 'kg' },
                ]
            },
            {
                day: 'Saturday', mealType: 'Dinner',
                foodItems: 'Naan (3 pcs), Paneer Tikka Masala, Salad, Sweet (Halwa)',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Paneer', quantityPerStudent: 0.12, unit: 'kg' },
                    { name: 'Semolina', quantityPerStudent: 0.08, unit: 'kg' },
                    { name: 'Sugar', quantityPerStudent: 0.04, unit: 'kg' },
                ]
            },

            // ── SUNDAY ──
            {
                day: 'Sunday', mealType: 'Breakfast',
                foodItems: 'Masala Dosa, Sambar, Coconut Chutney, Filter Coffee',
                ingredients: [
                    { name: 'Rice Batter', quantityPerStudent: 0.15, unit: 'kg' },
                    { name: 'Toor Dal', quantityPerStudent: 0.03, unit: 'kg' },
                    { name: 'Coconut', quantityPerStudent: 0.05, unit: 'kg' },
                    { name: 'Coffee', quantityPerStudent: 0.01, unit: 'kg' },
                ]
            },
            {
                day: 'Sunday', mealType: 'Lunch',
                foodItems: 'Special Sunday Thali: Rice, Dal, Paneer Curry, 2 Veg, Papad, Sweet',
                ingredients: [
                    { name: 'Rice', quantityPerStudent: 0.25, unit: 'kg' },
                    { name: 'Paneer', quantityPerStudent: 0.12, unit: 'kg' },
                    { name: 'Dal', quantityPerStudent: 0.06, unit: 'kg' },
                    { name: 'Sugar', quantityPerStudent: 0.04, unit: 'kg' },
                ]
            },
            {
                day: 'Sunday', mealType: 'Dinner',
                foodItems: 'Roti (3 pcs), Egg Curry, Dal, Jeera Rice, Salad',
                ingredients: [
                    { name: 'Wheat Flour', quantityPerStudent: 0.12, unit: 'kg' },
                    { name: 'Egg', quantityPerStudent: 2, unit: 'pcs' },
                    { name: 'Rice', quantityPerStudent: 0.15, unit: 'kg' },
                ]
            },
        ];

        await Menu.insertMany(weeklyMenu);
        console.log(`✅ Weekly Menu Seeded: 7 days × 3 meals = ${weeklyMenu.length} entries`);

        console.log('\n🎉 All Sample Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
