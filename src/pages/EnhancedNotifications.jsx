// ======================================
// Enhanced Notifications Page - صفحة الإشعارات المحسنة
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import SoundSettings from './SoundSettings';
import ToastContainer from './ToastContainer';
import { 
  FaBell, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaTimesCircle,
  FaTrash,
  FaCog,
  FaVolumeUp,
  FaPlay,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const EnhancedNotifications = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    soundSettings,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    testSound
  } = useNotification();

  const [activeTab, setActiveTab] = useState('notifications');
  const [showTestNotifications, setShowTestNotifications] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'error': return <FaTimesCircle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info': return <FaInfoCircle className="text-blue-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  // إشعارات الاختبار
  const testNotifications = [
    { type: 'success', title: 'اختبار النجاح', message: 'هذا اختبار لصوت الإشعارات الناجحة' },
    { type: 'error', title: 'اختبار الخطأ', message: 'هذا اختبار لصوت الإشعارات الخاطئة' },
    { type: 'warning', title: 'اختبار التحذير', message: 'هذا اختبار لصوت الإشعارات التحذيرية' },
    { type: 'info', title: 'اختبار المعلومات', message: 'هذا اختبار لصوت الإشعارات الإخبارية' }
  ];

  const handleTestAllSounds = () => {
    testNotifications.forEach((test, index) => {
      setTimeout(() => {
        showSuccess(`اختبار الصوت ${test.type}`);
      }, index * 1000);
    });
  };

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار الرئيسية */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">الإشعارات المحسنة</h1>
        <div className="flex gap-3">
          <Button
            variant={showTestNotifications ? 'danger' : 'primary'}
            size="sm"
            onClick={() => setShowTestNotifications(!showTestNotifications)}
            icon={showTestNotifications ? <FaEyeSlash /> : <FaEye />}
          >
            {showTestNotifications ? 'إخفاء الاختبار' : 'عرض اختبار الأصوات'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestAllSounds}
            icon={<FaPlay />}
            disabled={!soundSettings.enabled}
          >
            اختبار جميع الأصوات
          </Button>
          <Button variant="primary" size="sm" onClick={markAllAsRead}>
            وضع الكل كمقروء
          </Button>
          <Button variant="danger" size="sm" onClick={clearAll}>
            حذف الكل
          </Button>
        </div>
      </div>

      {/* شريط التبويبات */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaBell className="inline mr-2" />
            الإشعارات
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaCog className="inline mr-2" />
            إعدادات الأصوات
          </button>
        </nav>
      </div>

      {/* محتوى التبويبات */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* إعدادات سريعة */}
          <Card title="إعدادات سريعة">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaVolumeUp className={soundSettings.enabled ? 'text-green-500' : 'text-gray-400'} />
                <span className="font-medium">
                  الأصوات {soundSettings.enabled ? 'مفعلة' : 'معطلة'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  مستوى الصوت: {Math.round(soundSettings.volume * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('settings')}
                >
                  تعديل الإعدادات
                </Button>
              </div>
            </div>
          </Card>

          {/* قائمة الإشعارات */}
          <Card icon={<FaBell />}>
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaBell className="text-6xl mx-auto mb-4 opacity-30" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl mt-1">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString('ar-EG')}
                            </span>
                            {!notification.read && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600">{notification.message}</p>
                      </div>

                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="وضع كمقروء"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* إشعارات الاختبار */}
          {showTestNotifications && (
            <Card title="إشعارات اختبار الأصوات">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {testNotifications.map((test) => (
                  <Button
                    key={test.type}
                    variant="outline"
                    onClick={() => {
                      switch (test.type) {
                        case 'success':
                          showSuccess(test.message);
                          break;
                        case 'error':
                          showError(test.message);
                          break;
                        case 'warning':
                          showWarning(test.message);
                          break;
                        case 'info':
                          showInfo(test.message);
                          break;
                      }
                    }}
                    className="flex flex-col items-center gap-2 h-24"
                  >
                    {getIcon(test.type)}
                    <span className="text-xs">{test.title}</span>
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'settings' && <SoundSettings />}

      {/* Toast Container للإشعارات المنبثقة */}
      <ToastContainer
        notifications={notifications.filter(n => !n.read)}
        onRemove={removeNotification}
        position="top-right"
      />
    </div>
  );
};

export default EnhancedNotifications;