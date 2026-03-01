import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import MenuManagement from './pages/MenuManagement';
import GroceryCalculator from './pages/GroceryCalculator';
import ExpenseTracker from './pages/ExpenseTracker';
import SupplierManagement from './pages/SupplierManagement';
import SettingsPage from './pages/SettingsPage';
import ComplaintManager from './pages/ComplaintManager';
import NotificationManager from './pages/NotificationManager';
import PaymentManagement from './pages/PaymentManagement';
import MealRatings from './pages/MealRatings';

// ── Protected admin layout ───────────────────────────────────────────────────
// Dark mode is handled by ThemeContext (adds .dark to <html> element).
// No props needed down to Topbar — it reads from context directly.
const AppLayout = ({ children }) => {
  const { admin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="flex bg-base min-h-screen">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-fadeInUp">
          <div className="max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// ── Redirect logged-in admins away from /login ───────────────────────────────
const PublicRoute = ({ children }) => {
  const { admin } = useAuth();
  if (admin) return <Navigate to="/" replace />;
  return children;
};

// ── Root app ─────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public / auth routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />

            {/* Protected admin routes */}
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/students" element={<AppLayout><StudentManagement /></AppLayout>} />
            <Route path="/menu" element={<AppLayout><MenuManagement /></AppLayout>} />
            <Route path="/grocery" element={<AppLayout><GroceryCalculator /></AppLayout>} />
            <Route path="/expenses" element={<AppLayout><ExpenseTracker /></AppLayout>} />
            <Route path="/suppliers" element={<AppLayout><SupplierManagement /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
            <Route path="/complaints" element={<AppLayout><ComplaintManager /></AppLayout>} />
            <Route path="/notifications" element={<AppLayout><NotificationManager /></AppLayout>} />
            <Route path="/payments" element={<AppLayout><PaymentManagement /></AppLayout>} />
            <Route path="/meal-ratings" element={<AppLayout><MealRatings /></AppLayout>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
