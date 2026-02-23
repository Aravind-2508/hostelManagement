const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

/**
 * Middleware to protect student-only routes.
 * Students receive a JWT on login — this verifies it and attaches req.student.
 * Completely separate from the admin `protect` middleware.
 */
const studentProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const student = await Student.findById(decoded.id).select('-password');
            if (!student) {
                return res.status(401).json({ message: 'Student not found' });
            }
            if (student.status === 'Inactive') {
                return res.status(401).json({ message: 'Your account is inactive' });
            }

            req.student = student;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized — invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized — no token' });
    }
};

module.exports = { studentProtect };
