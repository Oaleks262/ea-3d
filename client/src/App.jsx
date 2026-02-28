import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { settingsAPI } from './utils/api';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ProjectCase = lazy(() => import('./pages/ProjectCase'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminProjects = lazy(() => import('./pages/Admin/AdminProjects'));
const AdminMessages = lazy(() => import('./pages/Admin/AdminMessages'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));

// Loading component
function LoadingScreen() {
  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  // Load and apply color settings on app startup
  useEffect(() => {
    const loadColors = async () => {
      try {
        const response = await settingsAPI.get();
        const settings = response.data;

        if (settings.colorPrimary) {
          document.documentElement.style.setProperty('--color-primary', settings.colorPrimary);
        }
        if (settings.colorAccent) {
          document.documentElement.style.setProperty('--color-accent', settings.colorAccent);
        }
      } catch (error) {
        console.error('Failed to load color settings:', error);
      }
    };

    loadColors();
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectCase />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AdminProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <AdminMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;
