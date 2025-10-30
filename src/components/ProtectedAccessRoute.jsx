// ======================================
// ProtectedAccessRoute - حماية مسارات المعرف الآمن
// ======================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureCode } from '../context/SecureCodeContext';
import Loading from './Common/Loading';

const ProtectedAccessRoute = ({ 
  children, 
  requiredPermission = null,
  redirectTo = '/access-code',
  showMessage = true 
}) => {
  const location = useLocation();
  const { 
    isSessionValid, 
    hasPermission, 
    getCurrentCodeType,
    loading,
    SECURE_CODE_TYPES 
  } = useSecureCode();
  
  const [sessionChecked, setSessionChecked] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const isValid = isSessionValid();
      setValidationResult(isValid);
      setSessionChecked(true);
    };

    if (!loading) {
      checkSession();
    }
  }, [loading, isSessionValid]);

  // إظهار شاشة التحميل
  if (loading || !sessionChecked) {
    return (
      <Loading 
        fullScreen 
        message="جاري التحقق من صحة المعرف..." 
      />
    );
  }

  // التحقق من صحة الجلسة
  if (!validationResult) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          reason: 'invalid_session'
        }} 
        replace 
      />
    );
  }

  // التحقق من الصلاحيات إذا كانت مطلوبة
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const currentType = getCurrentCodeType();
    
    if (showMessage) {
      // عرض رسالة خطأ مخصصة
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              صلاحية مطلوبة
            </h2>
            
            <p className="text-gray-600 mb-4">
              هذا المحتوى يتطلب معرف آمن بصلاحيات أعلى
            </p>
            
            {currentType === SECURE_CODE_TYPES.ACCESS_CODE && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>نوع المعرف الحالي:</strong> معرف الوصول العام
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  استخدم معرف المؤسسين للوصول لهذا المحتوى
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                رجوع
              </button>
              
              <a
                href="/access-code"
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#1e3a8a' }}
              >
                استخدام معرف آخر
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          reason: 'insufficient_permission',
          required: requiredPermission
        }} 
        replace 
      />
    );
  }

  // إرجاع المحتوى المحمي
  return children;
};

export default ProtectedAccessRoute;