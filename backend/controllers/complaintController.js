const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const AdminNotification = require('../models/AdminNotification');

// ─── STUDENT: Submit a complaint/suggestion ───────────────────────────────────
// POST /api/complaints
const submitComplaint = async (req, res) => {
    try {
        const { type, category, description } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'Category and description are required' });
        }
        if (description.trim().length < 10) {
            return res.status(400).json({ message: 'Description must be at least 10 characters' });
        }

        const complaint = await Complaint.create({
            student: req.student._id,
            type: type || 'Complaint',
            category: category,
            description: description.trim(),
        });

        const populated = await Complaint.findById(complaint._id)
            .populate('student', 'name rollNo roomNo');

        // ── Notify admin in their notification bell ────────────────────────
        await AdminNotification.create({
            title: `New ${complaint.type} from ${populated.student.name}`,
            body: `[${complaint.category}] ${complaint.description.substring(0, 120)}${complaint.description.length > 120 ? '...' : ''}`,
            type: complaint.type === 'Suggestion' ? 'suggestion' : 'complaint',
            refId: complaint._id,
            refModel: 'Complaint',
        });

        res.status(201).json(populated);
    } catch (error) {
        console.error('Submit complaint error:', error);
        res.status(500).json({ message: 'Error submitting complaint' });
    }
};

// ─── STUDENT: Get own complaints ──────────────────────────────────────────────
// GET /api/complaints/mine
const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.student._id })
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints' });
    }
};

// ─── ADMIN: Get all complaints with optional status filter ───────────────────
// GET /api/complaints?status=Pending&category=Food
const getAllComplaints = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.type) filter.type = req.query.type;

        const complaints = await Complaint.find(filter)
            .populate('student', 'name rollNo roomNo')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints' });
    }
};

// ─── ADMIN: Update complaint status and/or respond ───────────────────────────
// PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
    try {
        const { status, adminResponse } = req.body;
        const complaint = await Complaint.findById(req.params.id).populate('student', 'name rollNo');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const hadResponseBefore = !!complaint.adminResponse;

        if (status) complaint.status = status;
        if (adminResponse !== undefined) complaint.adminResponse = adminResponse.trim();

        await complaint.save();

        // ── Auto-create a personal notification for the student ──────────────
        // Trigger when admin writes/updates a response (not on status-only changes)
        if (adminResponse && adminResponse.trim()) {
            const notifTitle = hadResponseBefore
                ? `Response updated on your ${complaint.type}`
                : `Admin responded to your ${complaint.type}`;

            const notifMessage = `Your ${complaint.type.toLowerCase()} (${complaint.category}) has been ${status || complaint.status.toLowerCase()}.\n\n"${adminResponse.trim()}"`;

            // Create personal notification targeted only to this student
            await Notification.create({
                title: notifTitle,
                message: notifMessage,
                type: 'Response',
                student: complaint.student._id,   // ← personal: only this student sees it
                expiresAt: null,                   // never expires
            });
        }

        const updated = await Complaint.findById(complaint._id)
            .populate('student', 'name rollNo roomNo');

        res.json(updated);
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ message: 'Error updating complaint' });
    }
};

// ─── ADMIN: Get complaint stats for dashboard ─────────────────────────────────
// GET /api/complaints/stats
const getComplaintStats = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const result = { Pending: 0, 'In Progress': 0, Resolved: 0, total: 0 };
        stats.forEach(s => {
            result[s._id] = s.count;
            result.total += s.count;
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

module.exports = { submitComplaint, getMyComplaints, getAllComplaints, updateComplaint, getComplaintStats };
