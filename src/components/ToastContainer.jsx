// ======================================
// Toast Container Component - حاوي الإشعارات المنبثقة
// ======================================

import React, { useState, useEffect } from 'react';
import EnhancedToast from './EnhancedToast';

const ToastContainer = ({ notifications, onRemove, position = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);
  const [maxToasts, setMaxToasts] = useState(5);

  // تحديث قائمة الإشعارات
  useEffect(() => {
    setToasts(notifications.slice(0, maxToasts));
  }, [notifications, maxToasts]);

  // إزالة إشعار
  const handleRemove = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    onRemove(id);
  };

  // تحديد موقع العرض
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()} space-y-2`}>
      {toasts.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: 1000 - index
          }}
        >
          <EnhancedToast
            notification={notification}
            onClose={() => handleRemove(notification.id)}
            autoClose={true}
            duration={5000}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;