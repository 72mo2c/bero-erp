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
import { SecureCodeProvider } from './context/SecureCodeContext';
import Layout from './components/Layout/Layout';
import Loading from './components/Common/Loading';
import Toast from './components/Common/Toast';
import ProtectedAccessRoute from './components/ProtectedAccessRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import FindOrganization from './pages/Auth/FindOrganization';
import AccessCode from './pages/Auth/AccessCode';

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

// مكون wrapper لمسارات المؤسسة لاستخدام useParams بشكل صحيح
const OrgRouteWrapper = () => {
  const { orgId } = useParams();
  
  return (
    <AuthProvider orgId={orgId}>
      <NotificationProvider>
        <DataProvider orgId={orgId}>
          <TabProvider>
            <Toast />
            <OrgProtectedRoute />
          </TabProvider>
        </DataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

// تم إزالة مكون SimpleLoginPage لأسباب أمنية - لا ينبغي عرض المؤسسات للاختيار
// سيكون التوجه مباشرة إلى صفحة تسجيل الدخول

// ==================== التطبيق الرئيسي ====================
function App() {
  return (
    <Router>
      <SecureCodeProvider>
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
            element={<OrgRouteWrapper />}
          />

          {/* ================== مسارات المعرف الآمن ================== */}
          {/* صفحة إدخال المعرف الآمن */}
          <Route path="/access-code" element={<AccessCode />} />

          {/* مسارات محمية للمعرف الآمن */}
          <Route
            path="/access/*"
            element={
              <ProtectedAccessRoute>
                <Routes>
                  {/* لوحة تحكم المؤسسين - تتطلب معرف مؤسسين */}
                  <Route
                    path="founders-dashboard"
                    element={
                      <ProtectedAccessRoute 
                        requiredPermission="founder_access"
                        redirectTo="/access-code"
                      >
                        <div className="p-8 text-center">
                          <h1 className="text-3xl font-bold mb-4" style={{ color: '#1e3a8a' }}>
                            لوحة تحكم المؤسسين
                          </h1>
                          <p className="text-gray-600 mb-8">
                            هذا المحتوى محمي ويتطلب معرف مؤسسين صالح
                          </p>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-green-800 mb-2">
                              ✅ تم التحقق من المعرف بنجاح
                            </h2>
                            <p className="text-green-700">
                              يمكنك الآن الوصول لجميع أجزاء النظام
                            </p>
                          </div>
                        </div>
                      </ProtectedAccessRoute>
                    }
                  />

                  {/* معلومات المعرف الآمن */}
                  <Route
                    path="secure-info"
                    element={
                      <ProtectedAccessRoute>
                        <div className="p-8">
                          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1e3a8a' }}>
                            معلومات المعرف الآمن
                          </h1>
                          <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">حالة المعرف الحالي</h2>
                            <div className="space-y-4">
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800">
                                  ✅ المعرف نشط وصالح للاستخدام
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ProtectedAccessRoute>
                    }
                  />
                </Routes>
              </ProtectedAccessRoute>
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
                      <LegacyProtectedRoute />
                    </TabProvider>
                  </DataProvider>
                </NotificationProvider>
              </AuthProvider>
            }
          />
        </Routes>
        </AdminAuthProvider>
      </SecureCodeProvider>
    </Router>
  );
}

export default App;