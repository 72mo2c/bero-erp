// ======================================
// SystemSettingsManager Component - إدارة إعدادات النظام
// ======================================

import React, { createContext, useContext } from 'react';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useAuth } from '../context/AuthContext';
import Loading from './Common/Loading';

/**
 * Context للإعدادات - يوفر الوصول لإعدادات النظام في أي مكان في التطبيق
 */
const SystemSettingsContext = createContext();

/**
 * Hook لاستخدام إعدادات النظام
 */
export const useSystemSettingsContext = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettingsContext must be used within SystemSettingsProvider');
  }
  return context;
};

/**
 * Provider لإعدادات النظام
 */
export const SystemSettingsProvider = ({ children }) => {
  const settings = useSystemSettings();
  const { user } = useAuth();

  // إشعار فوري بتحديث الإعدادات
  React.useEffect(() => {
    const handleSettingsUpdate = (event) => {
      // إشعار مخصص للتحديثات الفورية
      const { section, field, value } = event.detail;
      
      // إرسال حدث للصفحات المتأثرة
      const settingsEvent = new CustomEvent('settingsChanged', {
        detail: { section, field, value, user }
      });
      window.dispatchEvent(settingsEvent);
    };

    window.addEventListener('systemSettingsUpdate', handleSettingsUpdate);
    return () => window.removeEventListener('systemSettingsUpdate', handleSettingsUpdate);
  }, [user]);

  return (
    <SystemSettingsContext.Provider value={settings}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

/**
 * مكون لتحديث إعدادات محددة
 */
export const SettingsUpdater = ({ 
  section, 
  field, 
  value, 
  children, 
  className = "",
  disabled = false 
}) => {
  const { updateSettings, hasPermissionToEdit, loading } = useSystemSettingsContext();

  const handleUpdate = React.useCallback(() => {
    if (!hasPermissionToEdit()) {
      console.warn('ليس لديك صلاحية لتعديل الإعدادات');
      return;
    }
    
    if (disabled || loading) return;
    
    updateSettings(section, field, value);
    
    // إرسال حدث فوري للتحديث
    const event = new CustomEvent('systemSettingsUpdate', {
      detail: { section, field, value, user: null }
    });
    window.dispatchEvent(event);
  }, [updateSettings, hasPermissionToEdit, loading, disabled, section, field, value]);

  return (
    <div 
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleUpdate}
      title={disabled ? 'غير متاح' : 'انقر للتحديث'}
    >
      {children}
    </div>
  );
};

/**
 * مكون لحماية العناصر بناءً على الإعدادات
 */
export const SettingsGuard = ({ 
  feature, 
  children, 
  fallback = null,
  requirePermission = false 
}) => {
  const { isFeatureEnabled, hasPermissionToEdit } = useSystemSettingsContext();

  const isEnabled = isFeatureEnabled(feature);
  
  if (requirePermission) {
    return isEnabled && hasPermissionToEdit() ? children : fallback;
  }
  
  return isEnabled ? children : fallback;
};

/**
 * مكون لعرض معلومات النظام
 */
export const SystemInfo = ({ className = "" }) => {
  const { 
    settings, 
    lastSaved, 
    currentUser, 
    companyName, 
    currency, 
    language,
    theme 
  } = useSystemSettingsContext();

  const formatDate = (date) => {
    if (!date) return 'لم يتم الحفظ بعد';
    return new Date(date).toLocaleString('ar-EG');
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">معلومات النظام</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">الشركة:</span>
          <span className="mr-2 text-gray-800">{companyName}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">العملة:</span>
          <span className="mr-2 text-gray-800">{currency}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">اللغة:</span>
          <span className="mr-2 text-gray-800">{language === 'ar' ? 'العربية' : language}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">المظهر:</span>
          <span className="mr-2 text-gray-800">
            {theme === 'dark' ? 'داكن' : theme === 'light' ? 'فاتح' : theme}
          </span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">آخر حفظ:</span>
          <span className="mr-2 text-gray-800">{formatDate(lastSaved)}</span>
        </div>
        
        <div>
          <span className="font-medium text-gray-600">المستخدم الحالي:</span>
          <span className="mr-2 text-gray-800">{currentUser?.name || 'غير مسجل'}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-600 mb-2">الإعدادات السريعة:</h4>
        <div className="flex flex-wrap gap-2">
          <SettingsGuard feature="email_notifications">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              إشعارات البريد الإلكتروني
            </span>
          </SettingsGuard>
          
          <SettingsGuard feature="auto_backup">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              نسخ احتياطي تلقائي
            </span>
          </SettingsGuard>
          
          <SettingsGuard feature="barcode_scanning">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              مسح الباركود
            </span>
          </SettingsGuard>
          
          {settings.general.autoSave && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              حفظ تلقائي
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * مكون لتطبيق إعدادات المظهر
 */
export const ThemeProvider = ({ children }) => {
  const { settings } = useSystemSettingsContext();
  
  React.useEffect(() => {
    const theme = settings.general.theme;
    const compactMode = settings.ui.compactMode;
    
    // تطبيق المظهر
    document.documentElement.setAttribute('data-theme', theme);
    
    // تطبيق الوضع المدمج
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
    
    // تطبيق الألوان المخصصة
    const root = document.documentElement;
    
    // ألوان النظام
    if (settings.general.theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1f2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#d1d5db');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f9fafb');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6b7280');
    }
    
    // حجم الخط المدمج
    if (compactMode) {
      root.style.setProperty('--font-size-base', '0.875rem');
      root.style.setProperty('--spacing-base', '0.5rem');
    } else {
      root.style.setProperty('--font-size-base', '1rem');
      root.style.setProperty('--spacing-base', '1rem');
    }
  }, [settings.general.theme, settings.ui.compactMode]);
  
  return <>{children}</>;
};

/**
 * مكون لعرض إشعارات النظام
 */
export const SettingsNotifications = () => {
  const { hasChanges, lastSaved, loading, canEdit } = useSystemSettingsContext();
  
  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          جاري حفظ الإعدادات...
        </div>
      </div>
    );
  }
  
  if (hasChanges && canEdit) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          توجد تغييرات غير محفوظة
        </div>
      </div>
    );
  }
  
  if (!hasChanges && lastSaved) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          تم حفظ الإعدادات
        </div>
      </div>
    );
  }
  
  return null;
};

/**
 * Hook للاستماع لتغييرات الإعدادات
 */
export const useSettingsListener = (callback) => {
  React.useEffect(() => {
    const handleSettingsChange = (event) => {
      callback(event.detail);
    };
    
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
  }, [callback]);
};

export default {
  SystemSettingsProvider,
  useSystemSettingsContext,
  SettingsUpdater,
  SettingsGuard,
  SystemInfo,
  ThemeProvider,
  SettingsNotifications,
  useSettingsListener
};