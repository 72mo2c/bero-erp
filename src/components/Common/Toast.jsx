// ======================================
// Toast Component - مكون الإشعارات المنبثقة
// ======================================

import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';

const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  // عرض الإشعارات الحديثة فقط (آخر 3 إشعارات)
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3">
      {recentNotifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ notification, onClose }) => {
  useEffect(() => {
    // إزالة الإشعار تلقائياً بعد 5 ثواني
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle className="text-2xl text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-2xl text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-2xl text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="text-2xl text-blue-500" />;
      default:
        return <FaInfoCircle className="text-2xl text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-white border-r-4 border-green-500';
      case 'error':
        return 'bg-white border-r-4 border-red-500';
      case 'warning':
        return 'bg-white border-r-4 border-yellow-500';
      case 'info':
        return 'bg-white border-r-4 border-blue-500';
      default:
        return 'bg-white border-r-4 border-gray-500';
    }
  };

  return (
    <div
      className={`${getBgColor()} rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md animate-slideIn flex items-start gap-3`}
      style={{
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {notification.title}
        </h4>
        <p className="text-sm text-gray-700">
          {notification.message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
