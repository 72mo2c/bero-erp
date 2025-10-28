// ======================================
// useSystemSettings Hook - إدارة إعدادات النظام
// ======================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * React Hook لإدارة إعدادات النظام الشاملة
 * يوفر الوصول لجميع إعدادات النظام ويطبقها على الواجهات المختلفة
 */
export const useSystemSettings = () => {
  const [settings, setSettings] = useState(getDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const { user } = useAuth();

  // تحميل الإعدادات عند بدء التشغيل
  useEffect(() => {
    loadSettings();
  }, []);

  // مراقبة تغييرات localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bero_system_settings') {
        const newSettings = loadSettingsFromStorage();
        setSettings(newSettings);
        setHasChanges(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // الحصول على الإعدادات الافتراضية
  function getDefaultSettings() {
    return {
      // معلومات الشركة
      company: {
        name: 'Bero System',
        address: '',
        phone: '',
        email: '',
        tax: '',
        logo: ''
      },
      
      // الإعدادات العامة
      general: {
        currency: 'EGP',
        language: 'ar',
        timezone: 'Africa/Cairo',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        autoSave: true,
        notifications: true,
        soundEnabled: true
      },
      
      // إعدادات الفواتير
      invoices: {
        prefix: 'INV',
        startNumber: '1000',
        footerText: 'شكراً لتعاملكم معنا',
        showCompanyLogo: true,
        showTaxNumber: true,
        autoCalculateTax: true,
        taxRate: '0',
        pdfQuality: 'high',
        defaultPaymentTerms: '30 يوم',
        allowPartialPayments: true,
        requireCustomerInfo: true
      },
      
      // إعدادات الأمان
      security: {
        sessionTimeout: '30', // بالدقائق
        requirePasswordChange: false,
        passwordMinLength: '6',
        passwordRequireSpecial: false,
        passwordRequireNumbers: false,
        passwordRequireUppercase: false,
        enableTwoFactor: false,
        enableAuditLog: true,
        maxLoginAttempts: '5',
        accountLockoutDuration: '15' // بالدقائق
      },
      
      // إعدادات النسخ الاحتياطي
      backup: {
        autoBackup: false,
        frequency: 'daily', // daily, weekly, monthly
        time: '00:00',
        retentionDays: '30',
        lastBackup: null,
        backupLocation: 'local',
        compressBackup: true,
        includeImages: true
      },
      
      // إعدادات الإشعارات
      notifications: {
        emailNotifications: false,
        lowStockAlerts: true,
        overduePayments: true,
        systemUpdates: true,
        dailyReports: true,
        email: '',
        smtpServer: '',
        smtpPort: '587',
        smtpUsername: '',
        smtpPassword: ''
      },
      
      // إعدادات التقارير
      reports: {
        defaultDateRange: '30', // أيام
        includeSubCategories: true,
        includeZeroValues: false,
        showPercentages: true,
        groupByMonth: false,
        defaultChartType: 'bar',
        autoRefresh: false,
        refreshInterval: '60' // ثواني
      },
      
      // إعدادات المخزون
      inventory: {
        enableBarcodeScanning: true,
        defaultWarehouse: null,
        lowStockThreshold: '10',
        enableBatchTracking: false,
        enableExpiryTracking: false,
        autoGenerateProductCodes: true,
        allowNegativeStock: false,
        roundToNearest: '1'
      },
      
      // إعدادات العملاء والموردين
      contacts: {
        requireCustomerApproval: false,
        allowCustomerSelfRegistration: false,
        defaultCreditLimit: '0',
        enableCreditLimit: false,
        paymentTermsDays: '30',
        enableSupplierPortal: false,
        requireSupplierApproval: false
      },
      
      // إعدادات الواجهة
      ui: {
        compactMode: false,
        showQuickActions: true,
        showSearchBar: true,
        enableAnimations: true,
        defaultPageSize: '25',
        enableDarkMode: false,
        sidebarCollapsed: false,
        showTooltips: true,
        enableKeyboardShortcuts: false
      },
      
      // إعدادات خاصة بالمطورين
      developer: {
        enableDebugMode: false,
        showConsoleLogs: false,
        enableApiLogging: false,
        testMode: false,
        mockData: false
      }
    };
  }

  // تحميل الإعدادات من localStorage
  function loadSettingsFromStorage() {
    try {
      const saved = localStorage.getItem('bero_system_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // دمج الإعدادات المحفوظة مع الإعدادات الافتراضية
        const defaultSettings = getDefaultSettings();
        return mergeSettings(defaultSettings, parsed);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showSystemNotification('خطأ في تحميل الإعدادات', 'error');
    }
    
    return getDefaultSettings();
  }

  // دمج الإعدادات (Deep merge)
  function mergeSettings(defaultSettings, savedSettings) {
    const merged = { ...defaultSettings };
    
    Object.keys(defaultSettings).forEach(key => {
      if (savedSettings[key] && typeof defaultSettings[key] === 'object' && !Array.isArray(defaultSettings[key])) {
        merged[key] = { ...defaultSettings[key], ...savedSettings[key] };
      } else if (savedSettings[key] !== undefined) {
        merged[key] = savedSettings[key];
      }
    });
    
    return merged;
  }

  // تحميل الإعدادات
  const loadSettings = useCallback(() => {
    const loadedSettings = loadSettingsFromStorage();
    setSettings(loadedSettings);
    setLoading(false);
    
    // تحميل آخر حفظ
    const lastSavedTime = localStorage.getItem('bero_system_settings_last_saved');
    if (lastSavedTime) {
      setLastSaved(new Date(lastSavedTime));
    }
  }, []);

  // حفظ الإعدادات
  const saveSettings = useCallback(async (newSettings = settings) => {
    if (!hasPermissionToEdit()) {
      showSystemNotification('ليس لديك صلاحية لتعديل الإعدادات', 'error');
      return false;
    }

    try {
      setLoading(true);
      
      // حفظ الإعدادات في localStorage
      localStorage.setItem('bero_system_settings', JSON.stringify(newSettings));
      localStorage.setItem('bero_system_settings_last_saved', new Date().toISOString());
      
      // حفظ إعدادات الهوية (للموافقة على التعديلات)
      localStorage.setItem('bero_system_settings_editor', JSON.stringify({
        userId: user?.id,
        username: user?.username,
        timestamp: new Date().toISOString()
      }));
      
      setSettings(newSettings);
      setHasChanges(false);
      setLastSaved(new Date());
      setLoading(false);
      
      showSystemNotification('تم حفظ الإعدادات بنجاح', 'success');
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      showSystemNotification('خطأ في حفظ الإعدادات', 'error');
      setLoading(false);
      return false;
    }
  }, [settings, user, hasChanges]);

  // تحديث إعدادات معينة
  const updateSettings = useCallback((sectionName, fieldName, value) => {
    const newSettings = {
      ...settings,
      [sectionName]: {
        ...settings[sectionName],
        [fieldName]: value
      }
    };
    
    setSettings(newSettings);
    setHasChanges(true);
    
    // حفظ تلقائي إذا كان مفعلاً
    if (settings.general.autoSave) {
      setTimeout(() => saveSettings(newSettings), 1000);
    }
  }, [settings, saveSettings]);

  // تحديث إعدادات متعددة
  const updateMultipleSettings = useCallback((updates) => {
    const newSettings = { ...settings };
    
    Object.keys(updates).forEach(section => {
      if (newSettings[section]) {
        newSettings[section] = { ...newSettings[section], ...updates[section] };
      }
    });
    
    setSettings(newSettings);
    setHasChanges(true);
    
    // حفظ تلقائي إذا كان مفعلاً
    if (settings.general.autoSave) {
      setTimeout(() => saveSettings(newSettings), 1000);
    }
  }, [settings, saveSettings]);

  // إعادة تعيين الإعدادات
  const resetSettings = useCallback((sectionName = null) => {
    if (!hasPermissionToEdit()) {
      showSystemNotification('ليس لديك صلاحية لتعديل الإعدادات', 'error');
      return false;
    }

    const defaultSettings = getDefaultSettings();
    
    if (sectionName) {
      // إعادة تعيين قسم واحد
      const newSettings = {
        ...settings,
        [sectionName]: defaultSettings[sectionName]
      };
      setSettings(newSettings);
      setHasChanges(true);
      showSystemNotification(`تم إعادة تعيين إعدادات ${sectionName}`, 'info');
    } else {
      // إعادة تعيين جميع الإعدادات
      setSettings(defaultSettings);
      setHasChanges(true);
      showSystemNotification('تم إعادة تعيين جميع الإعدادات', 'info');
    }
    
    return true;
  }, [settings, user]);

  // تصدير الإعدادات
  const exportSettings = useCallback(() => {
    try {
      const exportData = {
        settings,
        exportedBy: user?.username || 'unknown',
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `bero-system-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      showSystemNotification('تم تصدير الإعدادات بنجاح', 'success');
    } catch (error) {
      console.error('Error exporting settings:', error);
      showSystemNotification('خطأ في تصدير الإعدادات', 'error');
    }
  }, [settings, user]);

  // استيراد الإعدادات
  const importSettings = useCallback(async (file) => {
    if (!hasPermissionToEdit()) {
      showSystemNotification('ليس لديك صلاحية لتعديل الإعدادات', 'error');
      return false;
    }

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.settings) {
        const mergedSettings = mergeSettings(settings, importData.settings);
        setSettings(mergedSettings);
        setHasChanges(true);
        showSystemNotification('تم استيراد الإعدادات بنجاح', 'success');
        return true;
      } else {
        throw new Error('ملف الإعدادات غير صحيح');
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      showSystemNotification('خطأ في استيراد الإعدادات: ' + error.message, 'error');
      return false;
    }
  }, [settings, user]);

  // التحقق من الصلاحيات
  const hasPermissionToEdit = useCallback(() => {
    if (!user) return false;
    
    // المشرفون والمديرون يمكنهم تعديل الإعدادات
    return user.role === 'admin' || user.role === 'manager';
  }, [user]);

  // الحصول على إعدادات قسم معين
  const getSectionSettings = useCallback((sectionName) => {
    return settings[sectionName] || {};
  }, [settings]);

  // التحقق من تفعيل ميزة معينة
  const isFeatureEnabled = useCallback((featureName) => {
    const featureMap = {
      'barcode_scanning': 'inventory.enableBarcodeScanning',
      'batch_tracking': 'inventory.enableBatchTracking',
      'expiry_tracking': 'inventory.enableExpiryTracking',
      'audit_log': 'security.enableAuditLog',
      'two_factor': 'security.enableTwoFactor',
      'email_notifications': 'notifications.emailNotifications',
      'low_stock_alerts': 'notifications.lowStockAlerts',
      'auto_backup': 'backup.autoBackup',
      'customer_self_registration': 'contacts.allowCustomerSelfRegistration'
    };

    const settingPath = featureMap[featureName];
    if (!settingPath) return false;

    const pathParts = settingPath.split('.');
    let current = settings;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return false;
      }
    }
    
    return Boolean(current);
  }, [settings]);

  // إظهار إشعارات النظام
  const showSystemNotification = (message, type = 'info') => {
    // استخدام نظام الإشعارات الموجود
    try {
      const event = new CustomEvent('systemNotification', {
        detail: { message, type }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.log(`System Notification [${type}]: ${message}`);
    }
  };

  return {
    // البيانات
    settings,
    loading,
    hasChanges,
    lastSaved,
    
    // العمليات الأساسية
    saveSettings,
    updateSettings,
    updateMultipleSettings,
    resetSettings,
    loadSettings,
    
    // عمليات الاستيراد والتصدير
    exportSettings,
    importSettings,
    
    // عمليات مساعدة
    getSectionSettings,
    isFeatureEnabled,
    hasPermissionToEdit,
    
    // معلومات مفيدة
    currentUser: user,
    settingsVersion: '1.0',
    canEdit: hasPermissionToEdit(),
    isAutoSaveEnabled: settings.general.autoSave,
    
    // معلومات النظام
    companyName: settings.company.name,
    currency: settings.general.currency,
    language: settings.general.language,
    theme: settings.general.theme
  };
};

export default useSystemSettings;