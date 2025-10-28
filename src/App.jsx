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

const SimpleLoginPage = () => {
  const [organizations, setOrganizations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOrganizations = async () => {
      try {
        // تحميل المؤسسات الموجودة
        let orgs = JSON.parse(localStorage.getItem('bero_saas_organizations') || '[]');
        
        // إنشاء بيانات تجريبية إذا لم توجد
        if (orgs.length === 0) {
          console.log('إنشاء المؤسسات التجريبية...');
          const { createDemoOrganizations } = await import('./services/organizationService');
          createDemoOrganizations();
          orgs = JSON.parse(localStorage.getItem('bero_saas_organizations') || '[]');
          console.log('تم إنشاء المؤسسات:', orgs.length);
        }
        
        setOrganizations(orgs);
      } catch (error) {
        console.error('خطأ في تحميل المؤسسات:', error);
        setOrganizations([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* شعار النظام */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gray-900 p-4 rounded-xl mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bero System</h1>
          <p className="text-gray-600 text-sm">منصة إدارة المخازن</p>
        </div>

        {/* قائمة المؤسسات */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">اختر مؤسستك للدخول</h2>
          
          {organizations.length > 0 ? (
            organizations.map((org) => (
              <a
                key={org.id}
                href={`/org/${org.id}/login`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-600">{org.plan}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    org.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {org.status === 'active' ? 'نشط' : 'متوقف'}
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-600">لا توجد مؤسسات مسجلة</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}
        </div>

        {/* فوتر */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Bero System. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== التطبيق الرئيسي ====================
function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <Routes>
          {/* ================== الصفحة الرئيسية المبسطة ================== */}
          <Route path="/" element={<SimpleLoginPage />} />

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