import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ScanPage = lazy(() => import('./pages/ScanPage'));
const History = lazy(() => import('./pages/History'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminQR = lazy(() => import('./pages/admin/AdminQR'));
const AdminAttendance = lazy(() => import('./pages/admin/AdminAttendance'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    color: '#00ff41',
    fontFamily: 'monospace'
  }}>
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Professional Hacker Terminal Background */}
        <div className="hacker-terminal-bg"></div>
        <div className="matrix-rain"></div>
        <div className="hacker-grid"></div>
        <div className="terminal-scanlines"></div>
        <div className="data-stream"></div>
        <div className="security-hud"></div>
        
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/history" element={<History />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/qr" element={<AdminQR />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/students" element={<AdminStudents />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
