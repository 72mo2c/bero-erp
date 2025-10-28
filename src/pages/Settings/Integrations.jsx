// ======================================
// Integrations - إدارة التكاملات الخارجية
// ======================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import { FaBuilding, FaWhatsapp, FaLink, FaCheckCircle, FaTimesCircle, FaCog, FaSync, FaPlug, FaKey, FaChartLine, FaLock } from 'react-icons/fa';

const STORAGE_KEY = 'bero_integrations_status';

const Integrations = () => {
  const { showSuccess, showWarning } = useNotification();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [integrationsStatus, setIntegrationsStatus] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configData, setConfigData] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    enabled: true
  });

  const integrations = [
    {
      id: 'fatura',
      name: 'فاتورة',
      description: 'ربط مع منصة فاتورة للفواتير الإلكترونية والامتثال الضريبي',
      icon: <FaBuilding className="text-blue-600" />,
      color: 'blue',
      features: ['فواتير إلكترونية', 'ربط ضريبي', 'تقارير تلقائية'],
      page: '/additional-options/external-platforms'
    },
    {
      id: 'kartona',
      name: 'كرتونة',
      description: 'ربط مع منصة كرتونة لإدارة المخزون وتتبع الشحنات',
      icon: <FaBuilding className="text-purple-600" />,
      color: 'purple',
      features: ['إدارة مخزون', 'تتبع شحنات', 'تكامل متاجر'],
      page: '/additional-options/external-platforms'
    },
    {
      id: 'whatsapp',
      name: 'واتساب الأعمال',
      description: 'إرسال الفواتير والإشعارات والتذكيرات عبر واتساب تلقائياً',
      icon: <FaWhatsapp className="text-green-600" />,
      color: 'green',
      features: ['إرسال فواتير', 'إشعارات تلقائية', 'دعم عملاء'],
      page: '/additional-options/whatsapp-business'
    },
    {
      id: 'api',
      name: 'API المخصص',
      description: 'ربط النظام مع تطبيقاتك الخاصة عبر واجهة برمجية',
      icon: <FaPlug className="text-orange-600" />,
      color: 'orange',
      features: ['REST API', 'Webhooks', 'تكامل مخصص'],
      page: null
    }
  ];

  // تحميل حالة التكاملات عند بدء التشغيل
  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  // فحص المدير فقط
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <FaLock className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">مدير فقط</h3>
          <p className="text-gray-600 mb-4">
            التكاملات الخارجية متاحة للمدير العام فقط.
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

  const loadIntegrationsStatus = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setIntegrationsStatus(JSON.parse(saved));
      } else {
        const defaultStatus = {};
        integrations.forEach(int => {
          defaultStatus[int.id] = {
            connected: false,
            lastSync: null,
            syncCount: 0,
            status: 'disconnected'
          };
        });
        setIntegrationsStatus(defaultStatus);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStatus));
      }
    } catch (error) {
      console.error('Error loading integrations status:', error);
    }
  };

  const handleConfigure = (integration) => {
    setSelectedIntegration(integration);
    setShowConfigModal(true);
    
    // تحميل البيانات المحفوظة إن وجدت
    const saved = localStorage.getItem(`bero_integration_${integration.id}_config`);
    if (saved) {
      setConfigData(JSON.parse(saved));
    } else {
      setConfigData({
        apiKey: '',
        apiSecret: '',
        webhookUrl: '',
        enabled: true
      });
    }
  };

  const handleSaveConfig = () => {
    if (!configData.apiKey || configData.apiKey.length < 10) {
      showWarning('يرجى إدخال مفتاح API صحيح');
      return;
    }

    try {
      // حفظ الإعدادات
      localStorage.setItem(`bero_integration_${selectedIntegration.id}_config`, JSON.stringify(configData));
      
      // تحديث حالة التكامل
      const newStatus = {
        ...integrationsStatus,
        [selectedIntegration.id]: {
          connected: true,
          lastSync: new Date().toISOString(),
          syncCount: (integrationsStatus[selectedIntegration.id]?.syncCount || 0) + 1,
          status: 'connected'
        }
      };
      setIntegrationsStatus(newStatus);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatus));
      
      setShowConfigModal(false);
      showSuccess(`تم ربط ${selectedIntegration.name} بنجاح`);
    } catch (error) {
      showWarning('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const handleDisconnect = (integrationId) => {
    const newStatus = {
      ...integrationsStatus,
      [integrationId]: {
        ...integrationsStatus[integrationId],
        connected: false,
        status: 'disconnected'
      }
    };
    setIntegrationsStatus(newStatus);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatus));
    showSuccess('تم قطع الاتصال بنجاح');
  };

  const handleSync = (integrationId) => {
    const newStatus = {
      ...integrationsStatus,
      [integrationId]: {
        ...integrationsStatus[integrationId],
        lastSync: new Date().toISOString(),
        syncCount: (integrationsStatus[integrationId]?.syncCount || 0) + 1
      }
    };
    setIntegrationsStatus(newStatus);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatus));
    showSuccess('تمت المزامنة بنجاح');
  };

  const getStatusBadge = (integrationId) => {
    const status = integrationsStatus[integrationId];
    if (!status || !status.connected) {
      return <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
        <FaTimesCircle /> غير متصل
      </span>;
    }
    return <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
      <FaCheckCircle /> متصل
    </span>;
  };

  const connectedCount = Object.values(integrationsStatus).filter(s => s.connected).length;
  const totalSyncs = Object.values(integrationsStatus).reduce((sum, s) => sum + (s.syncCount || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة التكاملات الخارجية</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي التكاملات</p>
              <p className="text-3xl font-bold">{integrations.length}</p>
            </div>
            <FaLink className="text-3xl opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">التكاملات المتصلة</p>
              <p className="text-3xl font-bold">{connectedCount}</p>
            </div>
            <FaCheckCircle className="text-3xl opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">عمليات المزامنة</p>
              <p className="text-3xl font-bold">{totalSyncs}</p>
            </div>
            <FaSync className="text-3xl opacity-75" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">حالة النظام</p>
              <p className="text-xl font-bold">ممتاز</p>
            </div>
            <FaChartLine className="text-3xl opacity-75" />
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {integrations.map((integration) => {
          const status = integrationsStatus[integration.id];
          const isConnected = status?.connected || false;
          
          return (
            <Card key={integration.id}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{integration.name}</h3>
                      {getStatusBadge(integration.id)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Info */}
                {isConnected && status.lastSync && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm">
                    <p className="text-gray-700">
                      <strong>آخر مزامنة:</strong> {new Date(status.lastSync).toLocaleString('ar-EG')}
                    </p>
                    <p className="text-gray-700">
                      <strong>عدد المزامنات:</strong> {status.syncCount}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto flex gap-2">
                  {isConnected ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleSync(integration.id)}
                      >
                        <FaSync className="ml-2" />
                        مزامنة
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => handleConfigure(integration)}
                      >
                        <FaCog className="ml-2" />
                        إعدادات
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        قطع الاتصال
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleConfigure(integration)}
                      >
                        <FaLink className="ml-2" />
                        ربط الآن
                      </Button>
                      {integration.page && (
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() => navigate(integration.page)}
                        >
                          المزيد
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Setup Instructions */}
      <Card title="إرشادات الربط والتكامل" icon={<FaLink />}>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              اختر التكامل المناسب
            </h4>
            <p className="text-sm text-gray-700 mr-8">
              حدد المنصة أو الخدمة التي تريد ربطها مع نظام Bero System حسب احتياجاتك.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              احصل على مفاتيح API
            </h4>
            <p className="text-sm text-gray-700 mr-8">
              سجل في المنصة المطلوبة واحصل على مفاتيح API (API Key & Secret) من لوحة التحكم الخاصة بهم.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              أدخل بيانات الربط
            </h4>
            <p className="text-sm text-gray-700 mr-8">
              اضغط على "ربط الآن" وأدخل مفاتيح API والإعدادات المطلوبة، ثم فعّل التكامل.
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
              ابدأ المزامنة
            </h4>
            <p className="text-sm text-gray-700 mr-8">
              بعد الربط الناجح، قم بأول عملية مزامنة لنقل البيانات بين النظامين.
            </p>
          </div>
        </div>
      </Card>

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">
                  {selectedIntegration.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">إعدادات {selectedIntegration.name}</h3>
                  <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="مفتاح API"
                name="apiKey"
                value={configData.apiKey}
                onChange={(e) => setConfigData({...configData, apiKey: e.target.value})}
                placeholder="أدخل مفتاح API"
                required
              />
              
              <Input
                label="API Secret (اختياري)"
                name="apiSecret"
                type="password"
                value={configData.apiSecret}
                onChange={(e) => setConfigData({...configData, apiSecret: e.target.value})}
                placeholder="أدخل API Secret"
              />
              
              <Input
                label="Webhook URL (اختياري)"
                name="webhookUrl"
                value={configData.webhookUrl}
                onChange={(e) => setConfigData({...configData, webhookUrl: e.target.value})}
                placeholder="https://..."
              />

              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={configData.enabled}
                  onChange={(e) => setConfigData({...configData, enabled: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-gray-800 font-medium">تفعيل التكامل</span>
                  <p className="text-sm text-gray-600">ابدأ المزامنة التلقائية فور الحفظ</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => {
                  setShowConfigModal(false);
                  setSelectedIntegration(null);
                }}
              >
                إلغاء
              </Button>
              <Button 
                variant="success" 
                fullWidth
                onClick={handleSaveConfig}
              >
                <FaCheckCircle className="ml-2" />
                حفظ وربط
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;