// ======================================
// SecureCodeContext - إدارة المعرف الآمن
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// نوع المعرف الآمن
const SECURE_CODE_TYPES = {
  ACCESS_CODE: 'access_code',      // معرف الوصول العام
  FOUNDER_CODE: 'founder_code'     // معرف المؤسسين المحمي
};

// حالة المعرف الآمن
const SECURE_CODE_STATUS = {
  ACTIVE: 'active',        // نشط
  EXPIRED: 'expired',      // منتهي الصلاحية
  EXCEEDED: 'exceeded',    // تجاوز عدد مرات الاستخدام
  INVALID: 'invalid'       // غير صالح
};

const SecureCodeContext = createContext();

// بيانات المعرفات الآمنة الافتراضية
const DEFAULT_SECURE_CODES = {
  // معرف الوصول العام
  'ACCESS2025': {
    id: 'ACCESS2025',
    type: SECURE_CODE_TYPES.ACCESS_CODE,
    name: 'معرف الوصول العام',
    description: 'يسمح بالوصول للواجهة الأساسية',
    expirationDate: '2025-12-31T23:59:59',
    maxUses: null, // لا محدود
    usedCount: 0,
    status: SECURE_CODE_STATUS.ACTIVE,
    permissions: ['basic_access']
  },
  
  // معرف المؤسسين
  'FOUNDER2025': {
    id: 'FOUNDER2025',
    type: SECURE_CODE_TYPES.FOUNDER_CODE,
    name: 'معرف المؤسسين',
    description: 'يسمح بالوصول الكامل لجميع أجزاء النظام',
    expirationDate: '2025-12-31T23:59:59',
    maxUses: 50,
    usedCount: 0,
    status: SECURE_CODE_STATUS.ACTIVE,
    permissions: ['full_access', 'admin_access', 'founder_access']
  }
};

export const SecureCodeProvider = ({ children }) => {
  const navigate = useNavigate();
  const [secureCodes, setSecureCodes] = useState(DEFAULT_SECURE_CODES);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // تحميل الجلسة المحفوظة عند بدء التشغيل
  useEffect(() => {
    loadSavedSession();
    cleanupExpiredCodes();
  }, []);

  // حفظ الجلسة في localStorage
  const saveSession = (session) => {
    try {
      localStorage.setItem('secureCodeSession', JSON.stringify({
        ...session,
        savedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('خطأ في حفظ الجلسة:', error);
    }
  };

  // تحميل الجلسة المحفوظة
  const loadSavedSession = () => {
    try {
      const savedSession = localStorage.getItem('secureCodeSession');
      if (savedSession) {
        const parsedSession = JSON.parse(savedSession);
        
        // التحقق من صلاحية الجلسة المحفوظة
        const isValid = validateSession(parsedSession);
        if (isValid) {
          setCurrentSession(parsedSession);
        } else {
          // حذف الجلسة المنتهية الصلاحية
          localStorage.removeItem('secureCodeSession');
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الجلسة:', error);
    }
  };

  // التحقق من صحة الجلسة
  const validateSession = (session) => {
    if (!session || !session.codeId) return false;
    
    const code = secureCodes[session.codeId];
    if (!code || code.status !== SECURE_CODE_STATUS.ACTIVE) {
      return false;
    }
    
    // التحقق من انتهاء الصلاحية
    if (new Date() > new Date(code.expirationDate)) {
      return false;
    }
    
    // التحقق من عدد مرات الاستخدام
    if (code.maxUses && code.usedCount >= code.maxUses) {
      return false;
    }
    
    return true;
  };

  // تنظيف المعرفات المنتهية الصلاحية
  const cleanupExpiredCodes = () => {
    const now = new Date();
    setSecureCodes(prevCodes => {
      const updatedCodes = { ...prevCodes };
      Object.keys(updatedCodes).forEach(codeId => {
        const code = updatedCodes[codeId];
        if (code.status === SECURE_CODE_STATUS.ACTIVE && 
            new Date() > new Date(code.expirationDate)) {
          updatedCodes[codeId] = {
            ...code,
            status: SECURE_CODE_STATUS.EXPIRED
          };
        }
      });
      return updatedCodes;
    });
  };

  // التحقق من صحة المعرف
  const validateSecureCode = async (codeId) => {
    setLoading(true);
    
    try {
      const code = secureCodes[codeId];
      
      if (!code) {
        return {
          valid: false,
          status: SECURE_CODE_STATUS.INVALID,
          message: 'المعرف غير موجود'
        };
      }
      
      // التحقق من الحالة
      if (code.status !== SECURE_CODE_STATUS.ACTIVE) {
        let message = 'المعرف غير نشط';
        if (code.status === SECURE_CODE_STATUS.EXPIRED) {
          message = 'انتهت صلاحية المعرف';
        } else if (code.status === SECURE_CODE_STATUS.EXCEEDED) {
          message = 'تم تجاوز عدد مرات الاستخدام المسموحة';
        }
        
        return {
          valid: false,
          status: code.status,
          message
        };
      }
      
      // التحقق من انتهاء الصلاحية
      if (new Date() > new Date(code.expirationDate)) {
        return {
          valid: false,
          status: SECURE_CODE_STATUS.EXPIRED,
          message: 'انتهت صلاحية المعرف'
        };
      }
      
      // التحقق من عدد مرات الاستخدام
      if (code.maxUses && code.usedCount >= code.maxUses) {
        return {
          valid: false,
          status: SECURE_CODE_STATUS.EXCEEDED,
          message: 'تم تجاوز عدد مرات الاستخدام المسموحة'
        };
      }
      
      return {
        valid: true,
        code: code,
        message: 'المعرف صحيح'
      };
      
    } catch (error) {
      console.error('خطأ في التحقق من المعرف:', error);
      return {
        valid: false,
        status: SECURE_CODE_STATUS.INVALID,
        message: 'خطأ في التحقق من المعرف'
      };
    } finally {
      setLoading(false);
    }
  };

  // استخدام المعرف
  const useSecureCode = async (codeId) => {
    const validation = await validateSecureCode(codeId);
    
    if (!validation.valid) {
      return validation;
    }
    
    try {
      // تحديث عدد مرات الاستخدام
      setSecureCodes(prevCodes => ({
        ...prevCodes,
        [codeId]: {
          ...prevCodes[codeId],
          usedCount: prevCodes[codeId].usedCount + 1
        }
      }));
      
      // إنشاء جلسة جديدة
      const newSession = {
        codeId: codeId,
        codeType: validation.code.type,
        permissions: validation.code.permissions,
        loginTime: new Date().toISOString(),
        expiresAt: validation.code.expirationDate,
        sessionId: generateSessionId()
      };
      
      setCurrentSession(newSession);
      saveSession(newSession);
      
      return {
        valid: true,
        session: newSession,
        message: 'تم تفعيل المعرف بنجاح'
      };
      
    } catch (error) {
      console.error('خطأ في استخدام المعرف:', error);
      return {
        valid: false,
        status: SECURE_CODE_STATUS.INVALID,
        message: 'خطأ في تفعيل المعرف'
      };
    }
  };

  // تسجيل خروج من المعرف
  const logoutSecureCode = () => {
    setCurrentSession(null);
    localStorage.removeItem('secureCodeSession');
  };

  // التحقق من صلاحية الجلسة الحالية
  const isSessionValid = () => {
    return validateSession(currentSession);
  };

  // التحقق من وجود صلاحية معينة
  const hasPermission = (permission) => {
    if (!currentSession || !currentSession.permissions) {
      return false;
    }
    return currentSession.permissions.includes(permission);
  };

  // التحقق من نوع المعرف الحالي
  const getCurrentCodeType = () => {
    if (!currentSession) return null;
    return currentSession.codeType;
  };

  // إنشاء معرف جلسة فريد
  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // قيمة السياق
  const value = {
    // البيانات
    secureCodes,
    currentSession,
    loading,
    
    // الوظائف الأساسية
    validateSecureCode,
    useSecureCode,
    logoutSecureCode,
    
    // التحققات
    isSessionValid,
    hasPermission,
    getCurrentCodeType,
    
    // الأنواع والحالات
    SECURE_CODE_TYPES,
    SECURE_CODE_STATUS
  };

  return (
    <SecureCodeContext.Provider value={value}>
      {children}
    </SecureCodeContext.Provider>
  );
};

// Hook لاستخدام السياق
export const useSecureCode = () => {
  const context = useContext(SecureCodeContext);
  if (!context) {
    throw new Error('useSecureCode يجب استخدامه داخل SecureCodeProvider');
  }
  return context;
};

export default SecureCodeContext;