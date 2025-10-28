// ======================================
// ProtectedRoute Component - حماية الصفحات
// ======================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystemSettings } from '../hooks/useSystemSettings';
import Loading from './Common/Loading';

/**
 * مكون لحماية الصفحات بناءً على الصلاحيات
 * @param {Object} props
 * @param {React.Component} props.component - المكون المراد حمايته
 * @param {string[]} props.allowedRoles - الأدوار المسموحة
 * @param {string[]} props.requiredPermissions - الصلاحيات المطلوبة
 * @param {boolean} props.requireAuth - يتطلب مصادقة (افتراضي: true)
 * @param {boolean} props.requireActiveUser - يتطلب مستخدم نشط (افتراضي: true)
 * @param {boolean} props.requireAdminOnly - يتطلب مدير فقط (للإعدادات الحساسة)
 */
const ProtectedRoute = ({
  component: Component,
  allowedRoles = [],
  requiredPermissions = [],
  requireAuth = true,
  requireActiveUser = true,
  requireAdminOnly = false,
  ...props
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { settings, isFeatureEnabled } = useSystemSettings();
  const location = useLocation();

  // عرض شاشة التحميل أثناء تحميل بيانات المصادقة
  if (authLoading) {
    return <Loading message="جاري التحقق من الصلاحيات..." />;
  }

  // التحقق من المصادقة
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // التحقق من أن المستخدم نشط
  if (requireActiveUser && user && user.status === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">حساب غير نشط</h3>
          <p className="text-gray-600 mb-4">
            هذا الحساب غير نشط حالياً. يرجى الاتصال بالمدير لتفعيل الحساب.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // التحقق من انتهاء صلاحية الجلسة
  const sessionTimeout = parseInt(settings.security?.sessionTimeout || '30');
  if (sessionTimeout > 0 && user?.loginAt) {
    const loginTime = new Date(user.loginAt);
    const now = new Date();
    const elapsedMinutes = (now - loginTime) / (1000 * 60);
    
    if (elapsedMinutes > sessionTimeout) {
      return <Navigate to="/login" state={{ reason: 'session_expired', from: location }} replace />;
    }
  }

  // التحقق من الأدوار المسموحة
  if (allowedRoles.length > 0 && user) {
    const hasAllowedRole = allowedRoles.includes(user.role);
    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">غير مخول للوصول</h3>
            <p className="text-gray-600 mb-4">
              ليس لديك صلاحية للوصول إلى هذه الصفحة.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              الدور المطلوب: {allowedRoles.join(' أو ')}<br />
              دورك الحالي: {user.role}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mr-2"
            >
              العودة للخلف
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              لوحة التحكم
            </button>
          </div>
        </div>
      );
    }
  }

  // التحقق من الصلاحيات المطلوبة
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = checkPermissions(user, requiredPermissions, settings);
    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">صلاحية غير متوفرة</h3>
            <p className="text-gray-600 mb-4">
              ليس لديك الصلاحيات المطلوبة لهذه العملية.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              الصلاحيات المطلوبة: {requiredPermissions.join('، ')}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors mr-2"
            >
              العودة للخلف
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              لوحة التحكم
            </button>
          </div>
        </div>
      );
    }
  }

  // فحص خاص للمدير فقط (للإعدادات الحساسة)
  if (requireAdminOnly && user) {
    const isSettingsPath = location.pathname.includes('/settings') || 
                          location.pathname.includes('/system') ||
                          location.pathname.includes('/users') ||
                          location.pathname.includes('/permissions') ||
                          location.pathname.includes('/integrations') ||
                          location.pathname.includes('/backup');
    
    if (isSettingsPath && user.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">مدير فقط</h3>
            <p className="text-gray-600 mb-4">
              هذه الصفحة مخصصة للمدير العام فقط. لا يمكن للمستخدمين الآخرين الوصول إليها.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              دورك الحالي: {user.role} - مطلوب: admin
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              العودة للوحة التحكم
            </button>
          </div>
        </div>
      );
    }
  }

  // إذا كان كل شيء صحيح، عرض المكون المحمي
  return <Component {...props} />;
};

/**
 * التحقق من الصلاحيات
 */
function checkPermissions(user, requiredPermissions, settings) {
  if (!user) return false;

  // إذا كان المدير، له جميع الصلاحيات
  if (user.role === 'admin') {
    return true;
  }

  // الحصول على مصفوفة الصلاحيات
  const permissionsMatrix = settings.permissions?.matrix || getDefaultPermissionsMatrix();
  
  // التحقق من كل صلاحية مطلوبة
  return requiredPermissions.every(permission => {
    const permissionConfig = permissionsMatrix[permission];
    if (!permissionConfig) return false;
    
    // التحقق من صلاحية الدور
    return permissionConfig.roles && permissionConfig.roles.includes(user.role);
  });
}

/**
 * مصفوفة الصلاحيات الافتراضية
 */
function getDefaultPermissionsMatrix() {
  return {
    // إدارة المخزون
    'inventory.view': { 
      roles: ['admin', 'manager', 'user'], 
      description: 'عرض المخزون' 
    },
    'inventory.add': { 
      roles: ['admin', 'manager'], 
      description: 'إضافة منتجات' 
    },
    'inventory.edit': { 
      roles: ['admin', 'manager'], 
      description: 'تعديل المنتجات' 
    },
    'inventory.delete': { 
      roles: ['admin'], 
      description: 'حذف المنتجات' 
    },
    
    // إدارة المعاملات
    'transactions.view': { 
      roles: ['admin', 'manager', 'user'], 
      description: 'عرض المعاملات' 
    },
    'transactions.add': { 
      roles: ['admin', 'manager', 'user'], 
      description: 'إضافة معاملات' 
    },
    'transactions.edit': { 
      roles: ['admin', 'manager'], 
      description: 'تعديل المعاملات' 
    },
    'transactions.delete': { 
      roles: ['admin'], 
      description: 'حذف المعاملات' 
    },
    
    // إدارة جهات الاتصال
    'contacts.view': { 
      roles: ['admin', 'manager', 'user'], 
      description: 'جهات الاتصال' 
    },
    'contacts.add': { 
      roles: ['admin', 'manager'], 
      description: 'إضافة جهات اتصال' 
    },
    'contacts.edit': { 
      roles: ['admin', 'manager'], 
      description: 'تعديل جهات اتصال' 
    },
    'contacts.delete': { 
      roles: ['admin'], 
      description: 'حذف جهات اتصال' 
    },
    
    // التقارير المالية
    'finance.view': { 
      roles: ['admin', 'manager'], 
      description: 'التقارير المالية' 
    },
    'finance.edit': { 
      roles: ['admin'], 
      description: 'تعديل البيانات المالية' 
    },
    
    // التقارير والإحصائيات
    'reports.view': { 
      roles: ['admin', 'manager', 'user', 'viewer'], 
      description: 'عرض التقارير' 
    },
    'reports.export': { 
      roles: ['admin', 'manager'], 
      description: 'تصدير التقارير' 
    },
    
    // إدارة النظام
    'system.settings': { 
      roles: ['admin'], 
      description: 'إعدادات النظام' 
    },
    'system.users': { 
      roles: ['admin'], 
      description: 'إدارة المستخدمين' 
    },
    'system.permissions': { 
      roles: ['admin'], 
      description: 'إدارة الصلاحيات' 
    },
    'system.backup': { 
      roles: ['admin'], 
      description: 'النسخ الاحتياطي' 
    }
  };
}

/**
 * Hook للتحقق السريع من الصلاحيات
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const { settings } = useSystemSettings();

  const hasPermission = React.useCallback((permission) => {
    if (!user) return false;
    
    const permissionsMatrix = settings.permissions?.matrix || getDefaultPermissionsMatrix();
    const permissionConfig = permissionsMatrix[permission];
    
    if (!permissionConfig) return false;
    
    // المدير له جميع الصلاحيات
    if (user.role === 'admin') return true;
    
    return permissionConfig.roles && permissionConfig.roles.includes(user.role);
  }, [user, settings]);

  const hasAnyPermission = React.useCallback((permissions) => {
    if (!user) return false;
    
    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission]);

  const hasAllPermissions = React.useCallback((permissions) => {
    if (!user) return false;
    
    return permissions.every(permission => hasPermission(permission));
  }, [user, hasPermission]);

  const getUserRole = React.useCallback(() => {
    return user?.role || 'viewer';
  }, [user]);

  const isAdmin = React.useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  const isManager = React.useCallback(() => {
    return user?.role === 'manager';
  }, [user]);

  const canEdit = React.useCallback(() => {
    return user && (user.role === 'admin' || user.role === 'manager');
  }, [user]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserRole,
    isAdmin,
    isManager,
    canEdit,
    currentRole: getUserRole()
  };
};

export default ProtectedRoute;