// ======================================
// Enhanced Notification Context - إدارة الإشعارات مع الأصوات
// ======================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
  const [soundSettings, setSoundSettings] = useState({
    enabled: true,
    volume: 0.5,
    sounds: {
      success: 'success.mp3',
      error: 'error.mp3', 
      warning: 'warning.mp3',
      info: 'info.mp3',
      default: 'notification.mp3'
    }
  });

  // تحميل إعدادات الأصوات من LocalStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_sound_settings');
    if (savedSettings) {
      setSoundSettings(JSON.parse(savedSettings));
    }
  }, []);

  // حفظ إعدادات الأصوات
  const saveSoundSettings = useCallback((newSettings) => {
    setSoundSettings(newSettings);
    localStorage.setItem('notification_sound_settings', JSON.stringify(newSettings));
  }, []);

  // تشغيل الصوت
  const playSound = useCallback((type = 'default') => {
    if (!soundSettings.enabled) return;

    const soundFile = soundSettings.sounds[type] || soundSettings.sounds.default;
    
    try {
      // إنشاء عنصر صوتي
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = soundSettings.volume;
      
      // تشغيل الصوت
      audio.play().catch(error => {
        console.warn('فشل في تشغيل الصوت:', error);
      });
    } catch (error) {
      console.warn('خطأ في تشغيل الصوت:', error);
    }
  }, [soundSettings]);

  // إضافة إشعار جديد مع الصوت
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // تشغيل الصوت حسب نوع الإشعار
    playSound(notification.type);

    // حفظ في LocalStorage
    const stored = localStorage.getItem('bero_notifications');
    const allNotifications = stored ? JSON.parse(stored) : [];
    allNotifications.unshift(newNotification);
    localStorage.setItem('bero_notifications', JSON.stringify(allNotifications.slice(0, 100))); // حفظ آخر 100 إشعار
  }, [playSound]);

  // إضافة إشعار نجاح مع صوت
  const showSuccess = useCallback((message) => {
    addNotification({
      type: 'success',
      title: 'نجاح',
      message,
      icon: 'success'
    });
  }, [addNotification]);

  // إضافة إشعار خطأ مع صوت
  const showError = useCallback((message) => {
    addNotification({
      type: 'error',
      title: 'خطأ',
      message,
      icon: 'error'
    });
  }, [addNotification]);

  // إضافة إشعار تحذير مع صوت
  const showWarning = useCallback((message) => {
    addNotification({
      type: 'warning',
      title: 'تحذير',
      message,
      icon: 'warning'
    });
  }, [addNotification]);

  // إضافة إشعار معلومات مع صوت
  const showInfo = useCallback((message) => {
    addNotification({
      type: 'info',
      title: 'معلومة',
      message,
      icon: 'info'
    });
  }, [addNotification]);

  // إضافة إشعار مخصص مع صوت
  const showCustom = useCallback((type, title, message, sound = true) => {
    addNotification({
      type,
      title,
      message,
      icon: type
    });
  }, [addNotification]);

  // تشغيل صوت الاختبار
  const testSound = useCallback((type) => {
    playSound(type);
  }, [playSound]);

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
    soundSettings,
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    playSound,
    testSound,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    saveSoundSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};