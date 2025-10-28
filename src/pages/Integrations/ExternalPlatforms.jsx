// ======================================
// External Platforms Integration - الربط مع منصات خارجية
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaBuilding, FaCheck, FaTimes, FaLink, FaSync, FaHistory, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const ExternalPlatforms = () => {
  const { showSuccess, showError } = useNotification();
  
  const [platformCredentials, setPlatformCredentials] = useState({
    fatooraApiKey: '',
    fatooraConnected: false,
    fatooraConnectedAt: null,
    fatooraSyncCount: 0,
    fatooraLastSync: null,
    kartonaApiKey: '',
    kartonaConnected: false,
    kartonaConnectedAt: null,
    kartonaSyncCount: 0,
    kartonaLastSync: null
  });

  const [activityLog, setActivityLog] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [platformToDisconnect, setPlatformToDisconnect] = useState(null);

  // تحميل البيانات من localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('bero_platform_credentials');
    const savedLog = localStorage.getItem('bero_platform_activity_log');
    
    if (savedData) {
      try {
        setPlatformCredentials(JSON.parse(savedData));
      } catch (error) {
        console.error('خطأ في تحميل بيانات المنصات:', error);
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
    localStorage.setItem('bero_platform_credentials', JSON.stringify(data));
  };

  const saveActivityLog = (log) => {
    localStorage.setItem('bero_platform_activity_log', JSON.stringify(log));
  };

  const addActivity = (platform, action, status) => {
    const newActivity = {
      id: Date.now(),
      platform,
      action,
      status,
      timestamp: new Date().toISOString()
    };
    const updatedLog = [newActivity, ...activityLog].slice(0, 50); // احتفاظ بآخر 50 نشاط
    setActivityLog(updatedLog);
    saveActivityLog(updatedLog);
  };

  const handleConnect = (platform) => {
    const now = new Date().toISOString();
    
    if (platform === 'fatoora') {
      if (!platformCredentials.fatooraApiKey || platformCredentials.fatooraApiKey.length < 10) {
        showError('الرجاء إدخال معرّف API صحيح (لا يقل عن 10 أحرف)');
        return;
      }
      const updatedData = {
        ...platformCredentials,
        fatooraConnected: true,
        fatooraConnectedAt: now
      };
      setPlatformCredentials(updatedData);
      saveToLocalStorage(updatedData);
      addActivity('فاتورة', 'ربط', 'نجح');
      showSuccess('تم الربط مع منصة فاتورة بنجاح ✓');
    } else if (platform === 'kartona') {
      if (!platformCredentials.kartonaApiKey || platformCredentials.kartonaApiKey.length < 10) {
        showError('الرجاء إدخال معرّف API صحيح (لا يقل عن 10 أحرف)');
        return;
      }
      const updatedData = {
        ...platformCredentials,
        kartonaConnected: true,
        kartonaConnectedAt: now
      };
      setPlatformCredentials(updatedData);
      saveToLocalStorage(updatedData);
      addActivity('كرتونة', 'ربط', 'نجح');
      showSuccess('تم الربط مع منصة كرتونة بنجاح ✓');
    }
  };

  const handleDisconnectClick = (platform) => {
    setPlatformToDisconnect(platform);
    setShowConfirmModal(true);
  };

  const confirmDisconnect = () => {
    const platform = platformToDisconnect;
    
    if (platform === 'fatoora') {
      const updatedData = {
        ...platformCredentials,
        fatooraApiKey: '',
        fatooraConnected: false,
        fatooraConnectedAt: null
      };
      setPlatformCredentials(updatedData);
      saveToLocalStorage(updatedData);
      addActivity('فاتورة', 'قطع الاتصال', 'نجح');
      showSuccess('تم قطع الاتصال مع منصة فاتورة');
    } else if (platform === 'kartona') {
      const updatedData = {
        ...platformCredentials,
        kartonaApiKey: '',
        kartonaConnected: false,
        kartonaConnectedAt: null
      };
      setPlatformCredentials(updatedData);
      saveToLocalStorage(updatedData);
      addActivity('كرتونة', 'قطع الاتصال', 'نجح');
      showSuccess('تم قطع الاتصال مع منصة كرتونة');
    }
    
    setShowConfirmModal(false);
    setPlatformToDisconnect(null);
  };

  const handleSync = (platform) => {
    const now = new Date().toISOString();
    
    if (platform === 'fatoora') {
      const updatedData = {
        ...platformCredentials,
        fatooraSyncCount: platformCredentials.fatooraSyncCount + 1,
        fatooraLastSync: now
      };
      setPlatformCredentials(updatedData);
      saveToLocalStorage(updatedData);
      addActivity('فاتورة', 'مزامنة البيانات', 'نجح');
      showSuccess('تمت مزامنة البيانات مع فاتورة بنجاح');
    } else if (platform === 'kartona') {
      const updatedData = {
        ...platformCredentials,
        kartonaSyncCount: platformCredentials.kartonaSyncCount + 1,
        kartonaLastSync: now
      };
      setPlatformCredentials(updatedData);
      saveToLocalStorage(updatedData);
      addActivity('كرتونة', 'مزامنة البيانات', 'نجح');
      showSuccess('تمت مزامنة البيانات مع كرتونة بنجاح');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ar-EG');
  };

  const connectedCount = (platformCredentials.fatooraConnected ? 1 : 0) + (platformCredentials.kartonaConnected ? 1 : 0);
  const totalSyncs = platformCredentials.fatooraSyncCount + platformCredentials.kartonaSyncCount;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">الربط مع منصات خارجية</h1>
      
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">المنصات المتصلة</p>
              <p className="text-3xl font-bold text-gray-800">{connectedCount} / 2</p>
            </div>
            <FaBuilding className="text-4xl text-blue-600 opacity-60" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">عمليات المزامنة</p>
              <p className="text-3xl font-bold text-gray-800">{totalSyncs}</p>
            </div>
            <FaSync className="text-4xl text-green-600 opacity-60" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">النشاطات الأخيرة</p>
              <p className="text-3xl font-bold text-gray-800">{activityLog.length}</p>
            </div>
            <FaHistory className="text-4xl text-purple-600 opacity-60" />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {/* منصة فاتورة */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaBuilding className="text-3xl text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">منصة فاتورة</h3>
                <p className="text-sm text-gray-600">الفواتير الإلكترونية والضريبية</p>
              </div>
            </div>
            <div>
              {platformCredentials.fatooraConnected ? (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  <FaCheck /> متصل
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold">
                  <FaTimes /> غير متصل
                </span>
              )}
            </div>
          </div>

          {platformCredentials.fatooraConnected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">تاريخ الربط</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(platformCredentials.fatooraConnectedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">عدد المزامنات</p>
                <p className="text-sm font-semibold text-gray-800">{platformCredentials.fatooraSyncCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">آخر مزامنة</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(platformCredentials.fatooraLastSync)}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="معرّف API الخاص بمنصة فاتورة"
              name="fatooraApiKey"
              value={platformCredentials.fatooraApiKey}
              onChange={(e) => setPlatformCredentials({
                ...platformCredentials,
                fatooraApiKey: e.target.value
              })}
              placeholder="أدخل معرّف API (لا يقل عن 10 أحرف)"
              disabled={platformCredentials.fatooraConnected}
              type={platformCredentials.fatooraConnected ? "password" : "text"}
            />

            <div className="flex gap-3 flex-wrap">
              {!platformCredentials.fatooraConnected ? (
                <Button 
                  variant="primary"
                  onClick={() => handleConnect('fatoora')}
                  icon={<FaLink />}
                >
                  ربط الآن
                </Button>
              ) : (
                <>
                  <Button 
                    variant="success"
                    onClick={() => handleSync('fatoora')}
                    icon={<FaSync />}
                  >
                    مزامنة البيانات
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleDisconnectClick('fatoora')}
                  >
                    قطع الاتصال
                  </Button>
                </>
              )}
            </div>
          </div>

          {platformCredentials.fatooraConnected && (
            <div className="mt-4 p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
              <div className="flex items-start gap-3">
                <FaCheck className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 mb-1">تم الربط بنجاح!</p>
                  <p className="text-sm text-green-700">
                    يمكنك الآن إصدار الفواتير الإلكترونية المتوافقة مع متطلبات الهيئة الضريبية مباشرة من النظام.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* منصة كرتونة */}
        <Card>
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaBuilding className="text-3xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">منصة كرتونة</h3>
                <p className="text-sm text-gray-600">إدارة المخزون والطلبات</p>
              </div>
            </div>
            <div>
              {platformCredentials.kartonaConnected ? (
                <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  <FaCheck /> متصل
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold">
                  <FaTimes /> غير متصل
                </span>
              )}
            </div>
          </div>

          {platformCredentials.kartonaConnected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600">تاريخ الربط</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(platformCredentials.kartonaConnectedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">عدد المزامنات</p>
                <p className="text-sm font-semibold text-gray-800">{platformCredentials.kartonaSyncCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">آخر مزامنة</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(platformCredentials.kartonaLastSync)}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="معرّف API الخاص بمنصة كرتونة"
              name="kartonaApiKey"
              value={platformCredentials.kartonaApiKey}
              onChange={(e) => setPlatformCredentials({
                ...platformCredentials,
                kartonaApiKey: e.target.value
              })}
              placeholder="أدخل معرّف API (لا يقل عن 10 أحرف)"
              disabled={platformCredentials.kartonaConnected}
              type={platformCredentials.kartonaConnected ? "password" : "text"}
            />

            <div className="flex gap-3 flex-wrap">
              {!platformCredentials.kartonaConnected ? (
                <Button 
                  variant="primary"
                  onClick={() => handleConnect('kartona')}
                  icon={<FaLink />}
                >
                  ربط الآن
                </Button>
              ) : (
                <>
                  <Button 
                    variant="success"
                    onClick={() => handleSync('kartona')}
                    icon={<FaSync />}
                  >
                    مزامنة البيانات
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleDisconnectClick('kartona')}
                  >
                    قطع الاتصال
                  </Button>
                </>
              )}
            </div>
          </div>

          {platformCredentials.kartonaConnected && (
            <div className="mt-4 p-4 bg-purple-50 border-r-4 border-purple-500 rounded-lg">
              <div className="flex items-start gap-3">
                <FaCheck className="text-purple-600 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-800 mb-1">تم الربط بنجاح!</p>
                  <p className="text-sm text-purple-700">
                    يمكنك الآن مزامنة المخزون والطلبات مع منصة كرتونة تلقائياً في الوقت الفعلي.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* سجل النشاطات */}
        {activityLog.length > 0 && (
          <Card title="سجل النشاطات الأخيرة" icon={<FaHistory />}>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'نجح' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {activity.action} - منصة {activity.platform}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
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
        <Card title="دليل الإعداد السريع" icon={<FaChartLine />}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaBuilding className="text-blue-600" />
                  منصة فاتورة
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  <li>سجل في <a href="https://fatoora.sa" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">fatoora.sa</a></li>
                  <li>انتقل إلى الإعدادات → API</li>
                  <li>انسخ مفتاح API</li>
                  <li>الصقه أعلاه واربط</li>
                </ol>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaBuilding className="text-purple-600" />
                  منصة كرتونة
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  <li>سجل في <a href="https://kartona.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">kartona.com</a></li>
                  <li>افتح الإعدادات → مفاتيح API</li>
                  <li>أنشئ مفتاحاً جديداً</li>
                  <li>الصقه أعلاه واربط</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* نافذة تأكيد قطع الاتصال */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-4">
                <FaExclamationTriangle className="text-4xl text-yellow-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              تأكيد قطع الاتصال
            </h2>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <p className="text-gray-700 text-center">
                هل أنت متأكد من قطع الاتصال مع منصة <span className="font-bold">{platformToDisconnect === 'fatoora' ? 'فاتورة' : 'كرتونة'}</span>؟
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                سيتم حذف جميع بيانات الاعتماد المحفوظة
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
                onClick={() => {
                  setShowConfirmModal(false);
                  setPlatformToDisconnect(null);
                }}
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

export default ExternalPlatforms;
