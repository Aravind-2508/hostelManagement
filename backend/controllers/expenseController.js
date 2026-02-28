const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({}).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ message: 'Server error fetching expenses' });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'title, amount and category are required' });
        }

        const expense = await Expense.create({
            title,
            amount: Number(amount),
            category,
            description: description || '',
            date: date || Date.now(),
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ message: error.message || 'Error adding expense' });
    }
};

module.exports = { getExpenses, addExpense };
