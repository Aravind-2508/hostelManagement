const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
const getStudents = async (req, res) => {
    const students = await Student.find({}).select('-password');
    res.json(students);
};

// @desc    Create new student (Admin sets password)
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
    try {
        const { name, rollNo, roomNo, email, phone, password } = req.body;

        if (!password || password.length < 4) {
            return res.status(400).json({ message: 'Password must be at least 4 characters' });
        }

        const studentExists = await Student.findOne({ rollNo });
        if (studentExists) {
            return res.status(400).json({ message: 'Student with this Roll No already exists' });
        }

        const student = await Student.create({
            name,
            rollNo,
            roomNo,
            email,
            phone,
            password, // pre-save hook will hash this
        });

        res.status(201).json({
            _id: student._id,
            name: student.name,
            rollNo: student.rollNo,
            roomNo: student.roomNo,
            email: student.email,
            phone: student.phone,
            status: student.status,
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ message: error.message || 'Error creating student' });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
    try {
        const { name, roomNo, email, phone, status, password } = req.body;

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.name = name || student.name;
        student.roomNo = roomNo || student.roomNo;
        student.email = email || student.email;
        student.phone = phone || student.phone;
        student.status = status || student.status;

        // Only update password if provided
        if (password && password.length >= 4) {
            student.password = password; // pre-save hook will re-hash
        }

        const updatedStudent = await student.save();
        res.json({
            _id: updatedStudent._id,
            name: updatedStudent.name,
            rollNo: updatedStudent.rollNo,
            roomNo: updatedStudent.roomNo,
            email: updatedStudent.email,
            phone: updatedStudent.phone,
            status: updatedStudent.status,
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ message: 'Error updating student' });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await Student.deleteOne({ _id: student._id });
        res.json({ message: 'Student removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student' });
    }
};

// @desc    Student Login (using Roll No + Password)
// @route   POST /api/students/login
// @access  Public
const loginStudent = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        if (!rollNo || !password) {
            return res.status(400).json({ message: 'Please provide Roll No and password' });
        }

        const student = await Student.findOne({ rollNo: rollNo.trim() });

        if (!student) {
            return res.status(401).json({ message: 'Invalid Roll No or password' });
        }

        if (student.status === 'Inactive') {
            return res.status(401).json({ message: 'Your account is inactive. Contact admin.' });
        }

        const isMatch = await student.matchPassword(password);

        if (isMatch) {
            res.json({
                _id: student._id,
                name: student.name,
                rollNo: student.rollNo,
                roomNo: student.roomNo,
                email: student.email,
                status: student.status,
                role: 'student',
                token: generateToken(student._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid Roll No or password' });
        }
    } catch (error) {
        console.error('Student login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent, loginStudent };
