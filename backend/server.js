const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
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

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
