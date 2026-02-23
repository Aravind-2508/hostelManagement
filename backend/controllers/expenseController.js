const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    const expenses = await Expense.find({});
    res.json(expenses);
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    const expense = await Expense.create({
        title,
        amount,
        category,
        description,
        date,
    });

    res.status(201).json(expense);
};

module.exports = { getExpenses, addExpense };
