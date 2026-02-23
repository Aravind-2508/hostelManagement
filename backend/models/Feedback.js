const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
        mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        liked: { type: Boolean },        // true=👍 false=👎
        comment: { type: String, maxlength: 500, trim: true, default: '' },
    },
    { timestamps: true }
);

// One feedback per student per meal — enforce at DB level
feedbackSchema.index({ student: 1, day: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
