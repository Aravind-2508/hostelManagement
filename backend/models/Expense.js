const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        category: {
            type: String,
            required: true,
            enum: ['Grocery', 'Maintenance', 'Electricity', 'Water', 'Other']
        },
        date: { type: Date, default: Date.now },
        description: { type: String },
    },
    { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
