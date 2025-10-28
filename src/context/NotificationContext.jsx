// ======================================
// Notification Context - إدارة الإشعارات
// ======================================

import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

// Hook لاستخدام Notification Context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // إضافة إشعار جديد
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // حفظ في LocalStorage
    const stored = localStorage.getItem('bero_notifications');
    const allNotifications = stored ? JSON.parse(stored) : [];
    allNotifications.unshift(newNotification);
    localStorage.setItem('bero_notifications', JSON.stringify(allNotifications.slice(0, 100))); // حفظ آخر 100 إشعار
  }, []);

  // إضافة إشعار نجاح
  const showSuccess = useCallback((message) => {
    addNotification({
      type: 'success',
      title: 'نجاح',
      message,
      icon: 'success'
    });
  }, [addNotification]);

  // إضافة إشعار خطأ
  const showError = useCallback((message) => {
    addNotification({
      type: 'error',
      title: 'خطأ',
      message,
      icon: 'error'
    });
  }, [addNotification]);

  // إضافة إشعار تحذير
  const showWarning = useCallback((message) => {
    addNotification({
      type: 'warning',
      title: 'تحذير',
      message,
      icon: 'warning'
    });
  }, [addNotification]);

  // إضافة إشعار معلومات
  const showInfo = useCallback((message) => {
    addNotification({
      type: 'info',
      title: 'معلومة',
      message,
      icon: 'info'
    });
  }, [addNotification]);

  // وضع إشعار كمقروء
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // وضع جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // حذف إشعار
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(notif => notif.id !== id);
    });
  }, []);

  // حذف جميع الإشعارات
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('bero_notifications');
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value} style={{ zIndex: 1000 }}>
      {children}
    </NotificationContext.Provider>
  );
};
