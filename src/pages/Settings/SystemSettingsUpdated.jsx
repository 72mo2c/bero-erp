// ======================================
// SystemSettings - إعدادات النظام المحدثة
// ======================================

import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings, SettingsGuard, SystemInfo } from '../../components/SystemSettingsManager';
import { usePermissions } from '../../components/ProtectedRoute';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Button from '../../components/Common/Button';
import Loading from '../../components/Common/Loading';
import { 
  FaCog, 
  FaBuilding, 
  FaMoneyBillWave, 
  FaFileInvoice, 
  FaShieldAlt, 
  FaDatabase, 
  FaSave, 
  FaUndo,
  FaBell,
  FaPalette,
  FaUsers,
  FaTachometerAlt,
  FaCode,
  FaCheck
} from 'react-icons/fa';

const SystemSettingsUpdated = () => {
  const { showSuccess, showWarning, showError } = useNotification();
  const { 
    settings, 
    loading, 
    hasChanges, 
    lastSaved,
    saveSettings, 
    updateSettings, 
    updateMultipleSettings, 
    resetSettings,
    exportSettings,
    importSettings,
    canEdit,
    companyName,
    currency,
    language 
  } = useSystemSettings();
  
  const { hasPermission, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('company');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // إذا كان التطبيق في حالة تحميل
  if (loading) {
    return <Loading message="جاري تحميل إعدادات النظام..." />;
  }

  // فحص المدير فقط - لا يمكن لأي حساب آخر الوصول
  if (!isAdmin()) {
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
            إعدادات النظام متاحة للمدير العام فقط. لا يمكن للمستخدمين الآخرين الوصول إليها.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            دورك الحالي: غير مدير - مطلوب: admin
          </p>
          <button
            onClick={() => window.location.href = '#/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  // خيارات القوائم المنسدلة
  const currencyOptions = [
    { value: 'EGP', label: 'جنيه مصري (ج.م)' },
    { value: 'USD', label: 'دولار أمريكي ($)' },
    { value: 'EUR', label: 'يورو (€)' },
    { value: 'GBP', label: 'جنيه إسترليني (£)' },
    { value: 'SAR', label: 'ريال سعودي (ر.س)' },
    { value: 'AED', label: 'درهم إماراتي (د.إ)' }
  ];

  const languageOptions = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' }
  ];

  const themeOptions = [
    { value: 'light', label: 'فاتح' },
    { value: 'dark', label: 'داكن' },
    { value: 'auto', label: 'تلقائي' }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  // دوال إدارة الإعدادات
  const handleFieldChange = (section, field, value) => {
    updateSettings(section, field, value);
  };

  const handleSave = async () => {
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    const success = await saveSettings();
    if (success) {
      setShowSaveModal(false);
      showSuccess('تم حفظ الإعدادات بنجاح');
    } else {
      showError('فشل في حفظ الإعدادات');
    }
  };

  const handleReset = (section = null) => {
    const confirmed = window.confirm(
      section 
        ? `هل تريد إعادة تعيين إعدادات ${section}؟` 
        : 'هل تريد إعادة تعيين جميع الإعدادات؟'
    );
    
    if (confirmed) {
      resetSettings(section);
      showSuccess(`تم إعادة تعيين الإعدادات`);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSettings();
      showSuccess('تم تصدير الإعدادات بنجاح');
    } catch (error) {
      showError('فشل في تصدير الإعدادات');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importSettings(file).then(success => {
        if (success) {
          showSuccess('تم استيراد الإعدادات بنجاح');
        } else {
          showError('فشل في استيراد الإعدادات');
        }
      });
    }
    event.target.value = '';
  };

  // تبويبات الإعدادات
  const tabs = [
    { id: 'company', label: 'معلومات الشركة', icon: FaBuilding },
    { id: 'general', label: 'عام', icon: FaCog },
    { id: 'invoices', label: 'الفواتير', icon: FaFileInvoice },
    { id: 'security', label: 'الأمان', icon: FaShieldAlt },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: FaDatabase },
    { id: 'notifications', label: 'الإشعارات', icon: FaBell },
    { id: 'ui', label: 'الواجهة', icon: FaPalette },
    { id: 'reports', label: 'التقارير', icon: FaTachometerAlt },
    { id: 'inventory', label: 'المخزون', icon: FaUsers },
    { id: 'developer', label: 'مطور', icon: FaCode }
  ];

  // عرض تبويب معلومات الشركة
  const renderCompanyTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FaBuilding className="text-blue-600" />
        معلومات الشركة
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="اسم الشركة"
          value={settings.company.name}
          onChange={(e) => handleFieldChange('company', 'name', e.target.value)}
          placeholder="اسم شركتك"
        />
        
        <Input
          label="البريد الإلكتروني"
          type="email"
          value={settings.company.email}
          onChange={(e) => handleFieldChange('company', 'email', e.target.value)}
          placeholder="info@company.com"
        />
        
        <Input
          label="رقم الهاتف"
          value={settings.company.phone}
          onChange={(e) => handleFieldChange('company', 'phone', e.target.value)}
          placeholder="+20 XXX XXX XXXX"
        />
        
        <Input
          label="الرقم الضريبي"
          value={settings.company.tax}
          onChange={(e) => handleFieldChange('company', 'tax', e.target.value)}
          placeholder="123456789"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          value={settings.company.address}
          onChange={(e) => handleFieldChange('company', 'address', e.target.value)}
          placeholder="عنوان الشركة الكامل"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">شعار الشركة</label>
        <input
          type="file"
          accept="image/*"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleFieldChange('company', 'logo', e.target.files[0]?.name || '')}
        />
      </div>
    </div>
  );

  // عرض التبويب العام
  const renderGeneralTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FaCog className="text-blue-600" />
        الإعدادات العامة
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="العملة"
          value={settings.general.currency}
          onChange={(e) => handleFieldChange('general', 'currency', e.target.value)}
          options={currencyOptions}
        />
        
        <Select
          label="اللغة"
          value={settings.general.language}
          onChange={(e) => handleFieldChange('general', 'language', e.target.value)}
          options={languageOptions}
        />
        
        <Select
          label="تنسيق التاريخ"
          value={settings.general.dateFormat}
          onChange={(e) => handleFieldChange('general', 'dateFormat', e.target.value)}
          options={dateFormatOptions}
        />
        
        <Select
          label="المظهر"
          value={settings.general.theme}
          onChange={(e) => handleFieldChange('general', 'theme', e.target.value)}
          options={themeOptions}
        />
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.autoSave}
            onChange={(e) => handleFieldChange('general', 'autoSave', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-700">الحفظ التلقائي للإعدادات</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.notifications}
            onChange={(e) => handleFieldChange('general', 'notifications', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-700">تفعيل الإشعارات</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.general.soundEnabled}
            onChange={(e) => handleFieldChange('general', 'soundEnabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-700">تفعيل الأصوات</span>
        </label>
      </div>
    </div>
  );

  // عرض تبويب الأمان
  const renderSecurityTab = () => (
    <SettingsGuard feature="security.settings" requirePermission={true}>
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaShieldAlt className="text-blue-600" />
          إعدادات الأمان
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="مهلة انتهاء الجلسة (دقيقة)"
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleFieldChange('security', 'sessionTimeout', e.target.value)}
            min="5"
            max="480"
          />
          
          <Input
            label="الحد الأدنى لطول كلمة المرور"
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => handleFieldChange('security', 'passwordMinLength', e.target.value)}
            min="4"
            max="20"
          />
          
          <Input
            label="عدد محاولات تسجيل الدخول المسموحة"
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleFieldChange('security', 'maxLoginAttempts', e.target.value)}
            min="3"
            max="10"
          />
          
          <Input
            label="مدة قفل الحساب (دقيقة)"
            type="number"
            value={settings.security.accountLockoutDuration}
            onChange={(e) => handleFieldChange('security', 'accountLockoutDuration', e.target.value)}
            min="5"
            max="1440"
          />
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.requirePasswordChange}
              onChange={(e) => handleFieldChange('security', 'requirePasswordChange', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">طلب تغيير كلمة المرور بشكل دوري</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.enableTwoFactor}
              onChange={(e) => handleFieldChange('security', 'enableTwoFactor', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">تفعيل المصادقة الثنائية (2FA)</span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.enableAuditLog}
              onChange={(e) => handleFieldChange('security', 'enableAuditLog', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-700">تفعيل سجل المراجعة</span>
          </label>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>⚠️ تحذير:</strong> تأكد من حفظ إعدادات الأمان بعناية. قد يؤدي تغيير بعض الإعدادات إلى تسجيل خروج جميع المستخدمين.
          </p>
        </div>
      </div>
    </SettingsGuard>
  );

  // باقي التبويبات يمكن إضافتها بنفس الطريقة...

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaCog className="text-blue-600" />
                إعدادات النظام
              </h1>
              <p className="text-gray-600 mt-1">
                إدارة إعدادات النظام العامة - {companyName}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <Loading size="sm" />
                ) : (
                  <FaDownload />
                )}
                تصدير
              </Button>
              
              <label className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                <FaUpload />
                استيراد
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <Button
                onClick={() => handleReset()}
                variant="danger"
                className="flex items-center gap-2"
              >
                <FaUndo />
                إعادة تعيين
              </Button>
            </div>
          </div>
          
          {/* معلومات النظام السريعة */}
          <SystemInfo className="mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* شريط التبويبات */}
          <div className="lg:col-span-1">
            <Card className="p-0">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* محتوى التبويب */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* عرض المحتوى حسب التبويب النشط */}
              {activeTab === 'company' && renderCompanyTab()}
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'security' && renderSecurityTab()}
              
              {/* التبويبات الأخرى يمكن إضافتها هنا */}
              
              {/* رسالة للتبويبات غير المكتملة */}
              {!['company', 'general', 'security'].includes(activeTab) && (
                <div className="text-center py-12">
                  <FaCog className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">قيد التطوير</h3>
                  <p className="text-gray-500">
                    تبويب {tabs.find(t => t.id === activeTab)?.label} قيد التطوير وسيتوفر قريباً
                  </p>
                </div>
              )}

              {/* أزرار الحفظ */}
              {hasChanges && (
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <FaExclamationTriangle className="w-4 h-4" />
                    <span className="text-sm">يوجد تغييرات غير محفوظة</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReset(activeTab)}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <FaUndo />
                      إعادة تعيين هذا القسم
                    </Button>
                    
                    <Button
                      onClick={handleSave}
                      className="flex items-center gap-2"
                    >
                      <FaSave />
                      حفظ التغييرات
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* نافذة التأكيد للحفظ */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد الحفظ</h3>
              <p className="text-gray-600 mb-6">
                هل تريد حفظ جميع التغييرات؟ هذه العملية لا يمكن التراجع عنها.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setShowSaveModal(false)}
                  variant="secondary"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={confirmSave}
                  className="flex items-center gap-2"
                >
                  <FaCheck />
                  حفظ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettingsUpdated;