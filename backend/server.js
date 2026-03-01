const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// Allow requests from local dev and the deployed Render frontend
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hostelmanagement-bqk5.onrender.com',
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. curl, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

// ─── Core Routes ──────────────────────────────────────────────────────────────
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/grocery', require('./routes/groceryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));

// ─── New Feature Routes ───────────────────────────────────────────────────────
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/admin-notifications', require('./routes/adminNotificationRoutes'));
app.use('/api/ratings', require('./routes/mealRatingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
