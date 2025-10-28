// ======================================
// Notifications Page - صفحة الإشعارات
// ======================================

import React from 'react';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { 
  FaBell, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle,
  FaTimesCircle,
  FaTrash
} from 'react-icons/fa';

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'error': return <FaTimesCircle className="text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info': return <FaInfoCircle className="text-blue-500" />;
      default: return <FaBell className="text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">الإشعارات</h1>
        <div className="flex gap-3">
          <Button variant="primary" size="sm" onClick={markAllAsRead}>
            وضع الكل كمقروء
          </Button>
          <Button variant="danger" size="sm" onClick={clearAll}>
            حذف الكل
          </Button>
        </div>
      </div>

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
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString('ar-EG')}
                      </span>
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
    </div>
  );
};

export default Notifications;
