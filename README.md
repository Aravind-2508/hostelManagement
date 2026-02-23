# 🏨 Smart Hostel Food Management System

> A production-ready, full-stack web application that automates food planning, grocery calculations, expense tracking, and student portal management for student hostels.

---

## 📸 System Overview

The system has **two separate portals**:

| Portal | URL | Who Uses It |
|--------|-----|-------------|
| 🔐 **Admin Panel** | `http://localhost:5173/login` | Warden / Admin |
| 🎓 **Student Portal** | `http://localhost:5173/student-login` | Hostel Students |

---

## ✨ Features

### 🔐 Admin Panel
| Module | Description |~
|--------|-------------|
| **~Secure Login** | JWT-based authentication with bcrypt password hashing |
| **Dashboard** | Live stats — total students, grocery count, monthly expenses |
| **Student Management** | Add / Edit / Delete students; admin sets login password for each student |
| **Weekly Menu Planner** | Plan Breakfast, Lunch & Dinner for all 7 days with ingredient tracking |
| **Grocery Calculator** | Auto-calculates required stock based on Active students × per-student ingredient quantities |
| **Expense Tracker** | Log expenses by category with interactive pie chart & PDF export |
| **Supplier Directory** | Manage supplier contact details and supplied items |

### 🎓 Student Portal
| Feature | Description |
|---------|-------------|
| **Student Login** | Log in with Roll No + password (set by admin — no self-registration) |
| **My Profile** | View name, roll number, room, and status |
| **Weekly Meal Menu** | Browse the full 7-day menu with day tabs (today highlighted) |
| **Meal Details** | Each meal shows food items as a list + ingredient details per student |
| **Full Week Table** | At-a-glance table showing all 7 days × 3 meals in one view |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Axios, Lucide-React, Recharts |
| **Backend** | Node.js, Express v5 |
| **Database** | MongoDB (via Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens) + BcryptJS |
| **PDF Export** | jsPDF + jsPDF AutoTable |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js v18+](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally (default: `mongodb://localhost:27017`)

---

### 1️⃣ Clone & Navigate
```bash
cd HostelManagement
```

---

### 2️⃣ Setup Backend
```bash
cd backend
npm install
```

**Configure `.env`** (already present, edit if needed):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_food_db
JWT_SECRET=supersecretkey123
NODE_ENV=development
```

**Seed the database** (run once — creates admin + 3 sample students + full weekly menu):
```bash
npm run seed
```

**Start the backend server:**
```bash
npm run dev
```
> Server runs on → `http://localhost:5000`

---

### 3️⃣ Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
> App runs on → `http://localhost:5173`

---

## � Default Credentials

### Admin Login
| Field | Value |
|-------|-------|
| **URL** | `http://localhost:5173/login` |
| **Email** | `admin@hostel.com` |
| **Password** | `admin123` |

### Sample Student Logins
| Field | Student 1 | Student 2 | Student 3 |
|-------|-----------|-----------|-----------|
| **URL** | `http://localhost:5173/student-login` | ← same | ← same |
| **Roll No** | `101` | `102` | `103` |
| **Password** | `john101` | `jane102` | `bob103` |

> ℹ️ Admin creates student credentials — students never need to self-register.

---

## �📂 Project Structure

```
HostelManagement/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js     # Admin login & register
│   │   ├── studentController.js   # CRUD + student login
│   │   ├── menuController.js      # Weekly menu CRUD
│   │   ├── groceryController.js   # Grocery stock management
│   │   ├── expenseController.js   # Expense logging
│   │   └── supplierController.js  # Supplier directory
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token verification
│   │   └── errorMiddleware.js     # Global error handler
│   ├── models/
│   │   ├── Admin.js               # Admin schema (bcrypt hashed password)
│   │   ├── Student.js             # Student schema (bcrypt hashed password)
│   │   ├── Menu.js                # Meal plan schema with ingredients
│   │   ├── Grocery.js             # Grocery stock schema
│   │   ├── Expense.js             # Expense schema with categories
│   │   └── Supplier.js            # Supplier schema
│   ├── routes/
│   │   ├── adminRoutes.js         # POST /api/admin/login|register
│   │   ├── studentRoutes.js       # GET/POST/PUT/DELETE + POST /login
│   │   ├── menuRoutes.js          # GET (public) + POST (protected)
│   │   ├── groceryRoutes.js       # GET/POST (protected)
│   │   ├── expenseRoutes.js       # GET/POST (protected)
│   │   └── supplierRoutes.js      # GET/POST (protected)
│   ├── utils/
│   │   └── generateToken.js       # JWT token generator
│   ├── seeder.js                  # Demo data (admin + students + full menu)
│   ├── server.js                  # Express app entry point
│   └── .env                       # Environment variables
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx    # Global admin auth state (JWT)
        ├── components/
        │   └── Sidebar.jsx        # Admin navigation sidebar
        ├── pages/
        │   ├── Login.jsx          # Admin login page
        │   ├── Dashboard.jsx      # Admin overview (stats + alerts)
        │   ├── StudentManagement.jsx  # Admin: add/edit/delete students
        │   ├── MenuManagement.jsx     # Admin: plan weekly meals
        │   ├── GroceryCalculator.jsx  # Admin: grocery stock & auto calc
        │   ├── ExpenseTracker.jsx     # Admin: log expenses + chart + PDF
        │   ├── SupplierManagement.jsx # Admin: manage suppliers
        │   ├── StudentLogin.jsx       # Student login portal
        │   └── StudentDashboard.jsx  # Student: profile + weekly menu
        ├── App.jsx                # Routes (admin + student portals)
        ├── main.jsx               # React entry point
        └── index.css              # Tailwind CSS v4 global styles
```

---

## 🌐 API Endpoints

### Admin Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/admin/login` | Public | Admin login → returns JWT |
| POST | `/api/admin/register` | Public | Register new admin |

### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/students/login` | Public | Student login (Roll No + password) |
| GET | `/api/students` | Admin | Get all students (password excluded) |
| POST | `/api/students` | Admin | Create student (admin sets password) |
| PUT | `/api/students/:id` | Admin | Update student details / reset password |
| DELETE | `/api/students/:id` | Admin | Remove student |

### Menu
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/menu` | **Public** | Fetch full weekly menu (students can access) |
| POST | `/api/menu` | Admin | Add/update a meal for a day |

### Grocery / Expenses / Suppliers
| Method | Endpoints | Access | Description |
|--------|----------|--------|-------------|
| GET/POST | `/api/grocery` | Admin | View/update grocery stock |
| GET/POST | `/api/expenses` | Admin | View/log expenses |
| GET/POST | `/api/suppliers` | Admin | View/add suppliers |

---

## 🧠 System Design Notes

### 🔒 Security
- All passwords are **salted + hashed with BcryptJS** before storage — never stored in plain text
- Admin routes protected with **JWT Bearer token** middleware
- Student login uses a **separate endpoint** with their own JWT
- Seeder uses plain-text passwords → model's `pre('save')` hook hashes them automatically

### 🧮 Grocery Calculation Logic
The Grocery Calculator uses:
```
Required Quantity = Active Student Count × Ingredient Quantity Per Student
```
This is computed live from the `Student` (only `Active` status) and `Menu` collections — **zero-waste planning**.

### 📊 Expense Reporting
- Expenses categorized as: `Grocery`, `Maintenance`, `Electricity`, `Water`, `Other`
- Interactive donut chart (Recharts) for visual breakdown
- One-click **PDF export** via jsPDF with auto-table formatting

### 🎓 Student Portal Design
- Students **cannot self-register** — admin creates accounts during student onboarding
- Student credentials: **Roll Number + Password** (set by admin)
- Session stored in `sessionStorage` (auto-clears on browser close)
- Menu `GET` endpoint is **public** — no token needed for viewing meals

---

## 📜 License

MIT License — Free to use, fork, and enhance for educational purposes.

---

## 👨‍� Author

Built with ❤️ as a production-ready Hostel Management System.
