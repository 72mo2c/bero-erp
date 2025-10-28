// ======================================
// System Settings - إعدادات النظام
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Button from '../../components/Common/Button';
import { FaCog, FaBuilding, FaMoneyBillWave, FaFileInvoice, FaShieldAlt, FaDatabase, FaSave, FaUndo } from 'react-icons/fa';

const STORAGE_KEY = 'bero_system_settings';

const SystemSettings = () => {
  const { showSuccess, showWarning } = useNotification();
  
  const [activeTab, setActiveTab] = useState('company');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState({
    // معلومات الشركة
    companyName: 'Bero System',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyTax: '',
    companyLogo: '',
    
    // الإعدادات العامة
    currency: 'EGP',
    language: 'ar',
    timezone: 'Africa/Cairo',
    dateFormat: 'DD/MM/YYYY',
    
    // إعدادات الفواتير
    invoicePrefix: 'INV',
    invoiceStartNumber: '1000',
    invoiceFooterText: 'شكراً لتعاملكم معنا',
    showCompanyLogo: true,
    showTaxNumber: true,
    autoCalculateTax: true,
    taxRate: '0',
    
    // إعدادات الأمان
    sessionTimeout: '30',
    requirePasswordChange: false,
    passwordMinLength: '6',
    enableTwoFactor: false,
    
    // إعدادات النسخ الاحتياطي
    autoBackup: false,
    backupFrequency: 'daily',
    backupTime: '00:00',
    lastBackup: null
  });

  const [originalData, setOriginalData] = useState(null);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadSettings();
  }, []);

  // مراقبة التغييرات
  useEffect(() => {
    if (originalData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
      setHasChanges(changed);
    }
  }, [formData, originalData]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setFormData(data);
        setOriginalData(data);
      } else {
        setOriginalData(formData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setOriginalData(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setOriginalData(formData);
      setHasChanges(false);
      setShowSaveModal(false);
      showSuccess('تم حفظ إعدادات النظام بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      showWarning('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const handleReset = () => {
    setFormData(originalData);
    setHasChanges(false);
    showWarning('تم التراجع عن التغييرات');
  };

  const handleBackupNow = () => {
    const backupData = {
      settings: formData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bero-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    const updatedData = { ...formData, lastBackup: new Date().toISOString() };
    setFormData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    showSuccess('تم إنشاء النسخة الاحتياطية بنجاح');
  };

  const currencyOptions = [
    { value: 'EGP', label: 'جنيه مصري (EGP)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'GBP', label: 'جنيه استرليني (GBP)' },
    { value: 'IQD', label: 'دينار عراقي (IQD)' }
  ];

  const languageOptions = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' },
    { value: 'ku', label: 'كوردي' }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'يوم/شهر/سنة' },
    { value: 'MM/DD/YYYY', label: 'شهر/يوم/سنة' },
    { value: 'YYYY-MM-DD', label: 'سنة-شهر-يوم' }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: 'يومياً' },
    { value: 'weekly', label: 'أسبوعياً' },
    { value: 'monthly', label: 'شهرياً' }
  ];

  const tabs = [
    { id: 'company', label: 'معلومات الشركة', icon: <FaBuilding /> },
    { id: 'general', label: 'إعدادات عامة', icon: <FaCog /> },
    { id: 'invoice', label: 'إعدادات الفواتير', icon: <FaFileInvoice /> },
    { id: 'security', label: 'الأمان', icon: <FaShieldAlt /> },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: <FaDatabase /> }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إعدادات النظام</h1>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleReset}>
              <FaUndo className="ml-2" /> تراجع
            </Button>
            <Button variant="success" onClick={handleSave}>
              <FaSave className="ml-2" /> حفظ التغييرات
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">العملة الأساسية</p>
              <p className="text-2xl font-bold">{formData.currency}</p>
            </div>
            <FaMoneyBillWave className="text-3xl opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">اللغة</p>
              <p className="text-2xl font-bold">{formData.language === 'ar' ? 'عربي' : formData.language === 'en' ? 'English' : 'كوردي'}</p>
            </div>
            <FaCog className="text-3xl opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">الأمان</p>
              <p className="text-2xl font-bold">{formData.enableTwoFactor ? 'مفعل' : 'معطل'}</p>
            </div>
            <FaShieldAlt className="text-3xl opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">النسخ الاحتياطي</p>
              <p className="text-xl font-bold">{formData.autoBackup ? 'تلقائي' : 'يدوي'}</p>
            </div>
            <FaDatabase className="text-3xl opacity-75" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <Card>
        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              معلومات الشركة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="اسم الشركة"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="أدخل اسم الشركة"
                required
              />
              <Input
                label="عنوان الشركة"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleChange}
                placeholder="أدخل عنوان الشركة"
              />
              <Input
                label="هاتف الشركة"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="+20 XXX XXX XXXX"
              />
              <Input
                label="بريد الشركة الإلكتروني"
                name="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="info@company.com"
              />
              <Input
                label="الرقم الضريبي"
                name="companyTax"
                value={formData.companyTax}
                onChange={handleChange}
                placeholder="أدخل الرقم الضريبي"
              />
              <Input
                label="رابط شعار الشركة"
                name="companyLogo"
                value={formData.companyLogo}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCog className="text-blue-600" />
              الإعدادات العامة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="العملة الأساسية"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                options={currencyOptions}
              />
              <Select
                label="اللغة"
                name="language"
                value={formData.language}
                onChange={handleChange}
                options={languageOptions}
              />
              <Input
                label="المنطقة الزمنية"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
              />
              <Select
                label="تنسيق التاريخ"
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleChange}
                options={dateFormatOptions}
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>ملاحظة:</strong> تغيير هذه الإعدادات سيؤثر على عرض البيانات في جميع أنحاء النظام.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              إعدادات الفواتير
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="بادئة رقم الفاتورة"
                name="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={handleChange}
                placeholder="INV"
              />
              <Input
                label="رقم البداية للفواتير"
                name="invoiceStartNumber"
                type="number"
                value={formData.invoiceStartNumber}
                onChange={handleChange}
                placeholder="1000"
              />
              <div className="md:col-span-2">
                <Input
                  label="نص تذييل الفاتورة"
                  name="invoiceFooterText"
                  value={formData.invoiceFooterText}
                  onChange={handleChange}
                  placeholder="شكراً لتعاملكم معنا"
                />
              </div>
              <Input
                label="نسبة الضريبة (%)"
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showCompanyLogo"
                  checked={formData.showCompanyLogo}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">إظهار شعار الشركة في الفواتير</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showTaxNumber"
                  checked={formData.showTaxNumber}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">إظهار الرقم الضريبي في الفواتير</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoCalculateTax"
                  checked={formData.autoCalculateTax}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">حساب الضريبة تلقائياً</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-blue-600" />
              إعدادات الأمان
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="مهلة الجلسة (بالدقائق)"
                name="sessionTimeout"
                type="number"
                value={formData.sessionTimeout}
                onChange={handleChange}
                placeholder="30"
              />
              <Input
                label="الحد الأدنى لطول كلمة المرور"
                name="passwordMinLength"
                type="number"
                value={formData.passwordMinLength}
                onChange={handleChange}
                placeholder="6"
              />
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requirePasswordChange"
                  checked={formData.requirePasswordChange}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">طلب تغيير كلمة المرور بشكل دوري (كل 90 يوم)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableTwoFactor"
                  checked={formData.enableTwoFactor}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">تفعيل المصادقة الثنائية (2FA)</span>
              </label>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">
                <strong>⚠️ تحذير:</strong> تأكد من حفظ إعدادات الأمان بعناية. قد يؤدي تغيير بعض الإعدادات إلى تسجيل خروج جميع المستخدمين.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaDatabase className="text-blue-600" />
              النسخ الاحتياطي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="تكرار النسخ الاحتياطي"
                name="backupFrequency"
                value={formData.backupFrequency}
                onChange={handleChange}
                options={backupFrequencyOptions}
              />
              <Input
                label="وقت النسخ الاحتياطي"
                name="backupTime"
                type="time"
                value={formData.backupTime}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoBackup"
                  checked={formData.autoBackup}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">تفعيل النسخ الاحتياطي التلقائي</span>
              </label>
            </div>
            
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">النسخة الاحتياطية اليدوية</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.lastBackup 
                      ? `آخر نسخة احتياطية: ${new Date(formData.lastBackup).toLocaleString('ar-EG')}`
                      : 'لم يتم إنشاء نسخة احتياطية بعد'}
                  </p>
                </div>
                <Button variant="primary" onClick={handleBackupNow}>
                  <FaDatabase className="ml-2" />
                  إنشاء نسخة احتياطية الآن
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                يمكنك إنشاء نسخة احتياطية من إعدادات النظام في أي وقت. سيتم تنزيل ملف JSON يحتوي على جميع الإعدادات.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaSave className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد حفظ الإعدادات</h3>
              <p className="text-gray-600">
                هل أنت متأكد من حفظ التغييرات؟ سيتم تطبيق الإعدادات الجديدة على النظام بالكامل.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => setShowSaveModal(false)}
              >
                إلغاء
              </Button>
              <Button 
                variant="success" 
                fullWidth
                onClick={confirmSave}
              >
                <FaSave className="ml-2" />
                حفظ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
