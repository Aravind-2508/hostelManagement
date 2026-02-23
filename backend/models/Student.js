const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        rollNo: { type: String, required: true, unique: true },
        roomNo: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        password: { type: String, required: true },
        status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    },
    { timestamps: true }
);

// Hash password before saving
studentSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match entered password with hashed password
studentSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
