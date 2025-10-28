// ======================================
// WhatsApp Business Integration - الربط مع واتساب الأعمال
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaWhatsapp, FaCheck, FaTimes, FaPhone, FaKey, FaInfoCircle, FaPaperPlane, FaExclamationTriangle, FaChartLine, FaHistory } from 'react-icons/fa';

const WhatsAppBusiness = () => {
  const { showSuccess, showError } = useNotification();
  
  const [whatsappSettings, setWhatsappSettings] = useState({
    phoneNumber: '',
    apiKey: '',
    apiSecret: '',
    businessName: '',
    isConnected: false,
    connectedAt: null,
    autoSendInvoices: false,
    autoSendNotifications: true,
    messagesSent: 0,
    lastMessageDate: null
  });

  const [activityLog, setActivityLog] = useState([]);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('bero_whatsapp_settings');
    const savedLog = localStorage.getItem('bero_whatsapp_activity_log');
    
    if (savedData) {
      try {
        setWhatsappSettings(JSON.parse(savedData));
      } catch (error) {
        console.error('خطأ في تحميل بيانات واتساب:', error);
      }
    }
    
    if (savedLog) {
      try {
        setActivityLog(JSON.parse(savedLog));
      } catch (error) {
        console.error('خطأ في تحميل سجل النشاطات:', error);
      }
    }
  }, []);

  // حفظ البيانات في localStorage
  const saveToLocalStorage = (data) => {
    localStorage.setItem('bero_whatsapp_settings', JSON.stringify(data));
  };

  const saveActivityLog = (log) => {
    localStorage.setItem('bero_whatsapp_activity_log', JSON.stringify(log));
  };

  const addActivity = (action, status, details = '') => {
    const newActivity = {
      id: Date.now(),
      action,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    const updatedLog = [newActivity, ...activityLog].slice(0, 50);
    setActivityLog(updatedLog);
    saveActivityLog(updatedLog);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedSettings = {
      ...whatsappSettings,
      [name]: type === 'checkbox' ? checked : value
    };
    setWhatsappSettings(updatedSettings);
    
    // حفظ التغييرات في localStorage إذا كان متصلاً
    if (whatsappSettings.isConnected) {
      saveToLocalStorage(updatedSettings);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+964\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleConnect = () => {
    if (!whatsappSettings.phoneNumber || !whatsappSettings.apiKey) {
      showError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (!validatePhone(whatsappSettings.phoneNumber)) {
      showError('الرجاء إدخال رقم هاتف صحيح بصيغة: +964XXXXXXXXXX');
      return;
    }

    if (whatsappSettings.apiKey.length < 20) {
      showError('مفتاح API غير صحيح (يجب أن يكون 20 حرفاً على الأقل)');
      return;
    }

    const now = new Date().toISOString();
    const updatedSettings = {
      ...whatsappSettings,
      isConnected: true,
      connectedAt: now
    };
    
    setWhatsappSettings(updatedSettings);
    saveToLocalStorage(updatedSettings);
    addActivity('ربط الحساب', 'نجح', `الهاتف: ${whatsappSettings.phoneNumber}`);
    showSuccess('تم الربط مع واتساب الأعمال بنجاح ✓');
  };

  const handleDisconnectClick = () => {
    setShowDisconnectModal(true);
  };

  const confirmDisconnect = () => {
    const resetSettings = {
      phoneNumber: '',
      apiKey: '',
      apiSecret: '',
      businessName: '',
      isConnected: false,
      connectedAt: null,
      autoSendInvoices: false,
      autoSendNotifications: true,
      messagesSent: 0,
      lastMessageDate: null
    };
    
    setWhatsappSettings(resetSettings);
    saveToLocalStorage(resetSettings);
    addActivity('قطع الاتصال', 'نجح');
    showSuccess('تم قطع الاتصال مع واتساب الأعمال');
    setShowDisconnectModal(false);
  };

  const handleTestMessage = () => {
    if (!whatsappSettings.isConnected) {
      showError('الرجاء الربط مع واتساب أولاً');
      return;
    }
    setShowTestModal(true);
  };

  const confirmTestMessage = () => {
    const now = new Date().toISOString();
    const updatedSettings = {
      ...whatsappSettings,
      messagesSent: whatsappSettings.messagesSent + 1,
      lastMessageDate: now
    };
    
    setWhatsappSettings(updatedSettings);
    saveToLocalStorage(updatedSettings);
    addActivity('إرسال رسالة تجريبية', 'نجح', `إلى: ${whatsappSettings.phoneNumber}`);
    showSuccess('تم إرسال رسالة تجريبية بنجاح ✓');
    setShowTestModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ar-EG');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        الربط مع واتساب الأعمال
      </h1>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className={`${whatsappSettings.isConnected ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">حالة الاتصال</p>
              <p className="text-2xl font-bold text-gray-800">
                {whatsappSettings.isConnected ? 'متصل' : 'غير متصل'}
              </p>
            </div>
            <FaWhatsapp className={`text-4xl ${whatsappSettings.isConnected ? 'text-green-600' : 'text-gray-400'} opacity-60`} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">الرسائل المرسلة</p>
              <p className="text-3xl font-bold text-gray-800">{whatsappSettings.messagesSent}</p>
            </div>
            <FaPaperPlane className="text-4xl text-blue-600 opacity-60" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">النشاطات</p>
              <p className="text-3xl font-bold text-gray-800">{activityLog.length}</p>
            </div>
            <FaHistory className="text-4xl text-purple-600 opacity-60" />
          </div>
        </Card>
      </div>

      {/* حالة الاتصال */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${whatsappSettings.isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FaWhatsapp className={`text-4xl ${whatsappSettings.isConnected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">واتساب الأعمال API</h3>
              <p className="text-sm text-gray-600">
                {whatsappSettings.isConnected 
                  ? `متصل منذ ${formatDate(whatsappSettings.connectedAt)}` 
                  : 'إرسال الفواتير والإشعارات تلقائياً لعملائك'}
              </p>
            </div>
          </div>
          <div>
            {whatsappSettings.isConnected ? (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                <FaCheck /> متصل
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold">
                <FaTimes /> غير متصل
              </span>
            )}
          </div>
        </div>

        {whatsappSettings.isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">رقم الهاتف</p>
              <p className="text-sm font-semibold text-gray-800">{whatsappSettings.phoneNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">اسم العمل</p>
              <p className="text-sm font-semibold text-gray-800">{whatsappSettings.businessName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">آخر رسالة</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(whatsappSettings.lastMessageDate)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* إعدادات الربط */}
      <Card title="إعدادات الربط" icon={<FaKey />} className="mt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="رقم هاتف العمل"
              name="phoneNumber"
              value={whatsappSettings.phoneNumber}
              onChange={handleChange}
              placeholder="+964XXXXXXXXXX"
              icon={<FaPhone />}
              disabled={whatsappSettings.isConnected}
              required
            />

            <Input
              label="اسم العمل"
              name="businessName"
              value={whatsappSettings.businessName}
              onChange={handleChange}
              placeholder="اسم شركتك"
              disabled={whatsappSettings.isConnected}
            />

            <Input
              label="مفتاح API"
              name="apiKey"
              value={whatsappSettings.apiKey}
              onChange={handleChange}
              placeholder="أدخل مفتاح API (20 حرفاً على الأقل)"
              icon={<FaKey />}
              disabled={whatsappSettings.isConnected}
              type={whatsappSettings.isConnected ? "password" : "text"}
              required
            />

            <Input
              label="الرمز السري (اختياري)"
              name="apiSecret"
              type="password"
              value={whatsappSettings.apiSecret}
              onChange={handleChange}
              placeholder="أدخل الرمز السري"
              disabled={whatsappSettings.isConnected}
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {!whatsappSettings.isConnected ? (
              <Button 
                variant="success"
                onClick={handleConnect}
                icon={<FaWhatsapp />}
              >
                ربط واتساب
              </Button>
            ) : (
              <>
                <Button 
                  variant="primary"
                  onClick={handleTestMessage}
                  icon={<FaPaperPlane />}
                >
                  إرسال رسالة تجريبية
                </Button>
                <Button 
                  variant="danger"
                  onClick={handleDisconnectClick}
                >
                  قطع الاتصال
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* الإعدادات التلقائية */}
      {whatsappSettings.isConnected && (
        <Card title="الإعدادات التلقائية" icon={<FaChartLine />} className="mt-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-800">إرسال الفواتير تلقائياً</p>
                <p className="text-sm text-gray-600">إرسال نسخة من الفاتورة للعميل عبر واتساب فور إصدارها</p>
              </div>
              <input
                type="checkbox"
                name="autoSendInvoices"
                checked={whatsappSettings.autoSendInvoices}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <p className="font-semibold text-gray-800">إرسال الإشعارات تلقائياً</p>
                <p className="text-sm text-gray-600">إرسال إشعارات النظام المهمة (نقص المخزون، تنبيهات) عبر واتساب</p>
              </div>
              <input
                type="checkbox"
                name="autoSendNotifications"
                checked={whatsappSettings.autoSendNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
            </label>
          </div>
        </Card>
      )}

      {/* سجل النشاطات */}
      {activityLog.length > 0 && (
        <Card title="سجل النشاطات الأخيرة" icon={<FaHistory />} className="mt-6">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityLog.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'نجح' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{activity.action}</p>
                    {activity.details && (
                      <p className="text-xs text-gray-500">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${activity.status === 'نجح' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* دليل الإعداد */}
      <Card title="دليل الإعداد الكامل" icon={<FaInfoCircle />} className="mt-6">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">الخطوة 1: إنشاء حساب واتساب الأعمال</h4>
            <p className="text-sm text-gray-700">
              قم بزيارة <a href="https://business.whatsapp.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">business.whatsapp.com</a> وأنشئ حساباً جديداً لعملك.
            </p>
          </div>

          <div className="p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">الخطوة 2: التسجيل في WhatsApp Business API</h4>
            <p className="text-sm text-gray-700 mb-2">
              سجّل في خدمة WhatsApp Business API من خلال موفر معتمد:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mr-4">
              <li><a href="https://www.twilio.com/whatsapp" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Twilio</a></li>
              <li><a href="https://www.messagebird.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">MessageBird</a></li>
              <li><a href="https://www.360dialog.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">360Dialog</a></li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">الخطوة 3: الحصول على بيانات الاعتماد</h4>
            <p className="text-sm text-gray-700 mb-2">بعد التسجيل، ستحصل على:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mr-4">
              <li>رقم هاتف العمل بصيغة دولية (+964XXXXXXXXXX)</li>
              <li>مفتاح API (Access Token)</li>
              <li>الرمز السري (اختياري حسب المزود)</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">الخطوة 4: الربط والاختبار</h4>
            <p className="text-sm text-gray-700">
              أدخل جميع البيانات في الحقول أعلاه، اضغط "ربط واتساب"، ثم "إرسال رسالة تجريبية" للتأكد من الاتصال.
            </p>
          </div>
        </div>
      </Card>

      {/* ملاحظات مهمة */}
      <Card className="mt-6 bg-yellow-50 border border-yellow-200">
        <div className="flex gap-3">
          <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">ملاحظات مهمة:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>تحتاج إلى حساب واتساب أعمال معتمد (WhatsApp Business API) وليس التطبيق العادي</li>
              <li>قد تحتاج إلى دفع رسوم للموفر حسب عدد الرسائل المرسلة شهرياً</li>
              <li>تأكد من امتثالك لسياسات واتساب للأعمال وعدم إرسال رسائل غير مرغوب بها</li>
              <li>احتفظ ببيانات الاعتماد (API Keys) في مكان آمن ولا تشاركها مع أحد</li>
              <li>الرسائل التلقائية تُرسل فقط عند تفعيل الخيارات أعلاه</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* نافذة تأكيد قطع الاتصال */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <FaExclamationTriangle className="text-4xl text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              تأكيد قطع الاتصال
            </h2>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <p className="text-gray-700 text-center mb-2">
                هل أنت متأكد من قطع الاتصال مع واتساب الأعمال؟
              </p>
              <p className="text-sm text-gray-600 text-center">
                سيتم حذف جميع بيانات الاعتماد وإيقاف الإرسال التلقائي للرسائل
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmDisconnect}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                نعم، قطع الاتصال
              </button>
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الرسالة التجريبية */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-4">
                <FaPaperPlane className="text-4xl text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              إرسال رسالة تجريبية
            </h2>

            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <p className="text-gray-700 text-center mb-2">
                سيتم إرسال رسالة تجريبية إلى الرقم:
              </p>
              <p className="text-center font-bold text-lg text-blue-600">
                {whatsappSettings.phoneNumber}
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                الرسالة: "مرحباً! هذه رسالة تجريبية من نظام بيرو"
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmTestMessage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaPaperPlane />
                إرسال
              </button>
              <button
                onClick={() => setShowTestModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppBusiness;
