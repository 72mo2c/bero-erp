// ======================================
// App.jsx - الملف الرئيسي للتطبيق - SaaS Multi-Tenant (مبسط)
// ======================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DataProvider } from './context/DataContext';
import { TabProvider } from './contexts/TabContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import Layout from './components/Layout/Layout';
import Loading from './components/Common/Loading';
import Toast from './components/Common/Toast';

// Auth Pages
import Login from './pages/Auth/Login';
import FindOrganization from './pages/Auth/FindOrganization';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OrganizationsManager from './pages/Admin/OrganizationsManager';
import SubscriptionManager from './pages/Admin/SubscriptionManager';

// Organization Pages
import CustomLogin from './pages/Org/CustomLogin';
import SubscriptionEnded from './pages/Org/SubscriptionEnded';

// ==================== مكونات حماية المسارات ====================

// مكون حماية مسارات المطور
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/dev-admin-control-2025-system-super-secret/login" replace />;
  }

  return children;
};

// مكون مسار تسجيل دخول المطور
const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dev-admin-control-2025-system-super-secret/dashboard" replace />;
  }

  return children;
};

// مكون حماية مسارات المؤسسة
const OrgProtectedRoute = ({ children }) => {
  const { orgId } = useParams();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/org/${orgId}/login`} replace />;
  }

  return (
    <OrganizationProvider orgId={orgId}>
      <Layout />
    </OrganizationProvider>
  );
};

// مكون مسار تسجيل دخول المؤسسة
const OrgPublicRoute = ({ children }) => {
  const { orgId } = useParams();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={`/org/${orgId}/dashboard`} replace />;
  }

  return children;
};

// مكون المسارات المحمية القديمة (للتوافق مع النظام القديم)
const LegacyProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

// مكون المسارات العامة القديمة
const LegacyPublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="جاري التحميل..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// تم إزالة مكون SimpleLoginPage لأسباب أمنية - لا ينبغي عرض المؤسسات للاختيار
// سيكون التوجه مباشرة إلى صفحة تسجيل الدخول

// ==================== التطبيق الرئيسي ====================
function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* الصفحة الرئيسية توجه إلى تسجيل الدخول */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ================== مسارات المطور المخفية جداً ================== */}
          <Route
            path="/dev-admin-control-2025-system-super-secret/login"
            element={
              <AdminPublicRoute>
                <AdminLogin />
              </AdminPublicRoute>
            }
          />
          <Route
            path="/dev-admin-control-2025-system-super-secret/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/dev-admin-control-2025-system-super-secret/organizations"
            element={
              <AdminProtectedRoute>
                <OrganizationsManager />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/dev-admin-control-2025-system-super-secret/subscriptions"
            element={
              <AdminProtectedRoute>
                <SubscriptionManager />
              </AdminProtectedRoute>
            }
          />

          {/* ================== مسارات المؤسسات ================== */}
          {/* تسجيل دخول المؤسسة */}
          <Route
            path="/org/:orgId/login"
            element={
              <AuthProvider>
                <OrgPublicRoute>
                  <CustomLogin />
                </OrgPublicRoute>
              </AuthProvider>
            }
          />

          {/* صفحة انتهاء الاشتراك */}
          <Route
            path="/org/:orgId/subscription-ended"
            element={<SubscriptionEnded />}
          />

          {/* جميع مسارات المؤسسة المحمية */}
          <Route
            path="/org/:orgId/*"
            element={
              <AuthProvider orgId={useParams().orgId}>
                <NotificationProvider>
                  <DataProvider orgId={useParams().orgId}>
                    <TabProvider>
                      <Toast />
                      <Routes>
                        <Route path="/*" element={<OrgProtectedRoute />} />
                      </Routes>
                    </TabProvider>
                  </DataProvider>
                </NotificationProvider>
              </AuthProvider>
            }
          />

          {/* ================== المسارات القديمة (للتوافق) ================== */}
          <Route
            path="/login"
            element={
              <AuthProvider>
                <LegacyPublicRoute>
                  <Login />
                </LegacyPublicRoute>
              </AuthProvider>
            }
          />

          <Route
            path="/find-organization"
            element={
              <AuthProvider>
                <LegacyPublicRoute>
                  <FindOrganization />
                </LegacyPublicRoute>
              </AuthProvider>
            }
          />

          <Route
            path="/*"
            element={
              <AuthProvider>
                <NotificationProvider>
                  <DataProvider>
                    <TabProvider>
                      <Toast />
                      <Routes>
                        <Route path="/*" element={<LegacyProtectedRoute />} />
                      </Routes>
                    </TabProvider>
                  </DataProvider>
                </NotificationProvider>
              </AuthProvider>
            }
          />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;