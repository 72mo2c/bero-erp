// ======================================
// Admin Auth Context - إدارة مصادقة المطورين
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  adminLogin as serviceAdminLogin,
  adminLogout as serviceAdminLogout,
  getAdminSession,
  isAdminAuthenticated as serviceIsAdminAuthenticated
} from '../services/adminService';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // تحميل جلسة المطور عند بدء التطبيق
  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      setAdmin(session);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // تسجيل دخول المطور
  const login = async (username, password) => {
    const result = await serviceAdminLogin(username, password);
    
    if (result.success) {
      setAdmin(result.admin);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  // تسجيل خروج المطور
  const logout = () => {
    serviceAdminLogout();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  // التحقق من الصلاحيات
  const isSuperAdmin = () => {
    return admin?.role === 'SUPER_ADMIN';
  };

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
    isSuperAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
