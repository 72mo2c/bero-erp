// ======================================
// Enhanced Toast Component - مكون الإشعارات المنبثقة مع الأصوات
// ======================================

import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const EnhancedToast = ({ notification, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const { playSound } = useNotification();

  // تشغيل الصوت عند ظهور الإشعار
  useEffect(() => {
    playSound(notification.type);
  }, [notification.type, playSound]);

  // مؤقت الإغلاق التلقائي
  useEffect(() => {
    if (!autoClose) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          setIsVisible(false);
          setTimeout(onClose, 300); // انتظار للـ animation
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM15 17h5l-5 5v-5z"></path>
          </svg>
        );
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full bg-white border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor(notification.type)}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          
          <div className="mr-3 flex-1">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-semibold text-gray-800">
                {notification.title}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            
            {/* شريط التقدم للإغلاق التلقائي */}
            {autoClose && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div
                  className="h-1 bg-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            
            {/* مؤشر الوقت */}
            {autoClose && (
              <div className="text-xs text-gray-400 mt-1">
                {Math.ceil(progress / 10)} ثانية متبقية
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedToast;