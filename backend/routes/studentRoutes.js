const express = require('express');
const router = express.Router();
const {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    loginStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Public route - student login (no admin token needed)
router.post('/login', loginStudent);

// Admin-protected routes
router.route('/').get(protect, getStudents).post(protect, createStudent);
router.route('/:id').put(protect, updateStudent).delete(protect, deleteStudent);

module.exports = router;
