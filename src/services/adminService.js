// ======================================
// Admin Service - خدمات إدارة المطورين
// ======================================

import { hashPassword, verifyPassword } from '../utils/security';

const ADMIN_KEY = 'bero_saas_admins';
const ADMIN_SESSION_KEY = 'bero_admin_session';

// إنشاء مطور افتراضي
const createDefaultAdmin = () => {
  const defaultAdmin = {
    id: 1,
    username: 'superadmin',
    password: hashPassword('admin@2025'),
    name: 'مطور النظام',
    email: 'dev@berosystem.com',
    role: 'SUPER_ADMIN',
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(ADMIN_KEY, JSON.stringify([defaultAdmin]));
  return defaultAdmin;
};

// الحصول على جميع المطورين
export const getAllAdmins = () => {
  const data = localStorage.getItem(ADMIN_KEY);
  if (!data) {
    createDefaultAdmin();
    return getAllAdmins();
  }
  return JSON.parse(data);
};

// تسجيل دخول المطور
export const adminLogin = async (username, password) => {
  try {
    const admins = getAllAdmins();
    const admin = admins.find(a => a.username === username);
    
    if (!admin) {
      return { success: false, message: 'اسم المستخدم غير صحيح' };
    }
    
    const isValid = verifyPassword(password, admin.password);
    if (!isValid) {
      return { success: false, message: 'كلمة المرور غير صحيحة' };
    }
    
    // حفظ الجلسة
    const session = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      loginAt: new Date().toISOString()
    };
    
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    
    return { 
      success: true, 
      message: `مرحباً ${admin.name}`,
      admin: session
    };
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
  }
};

// تسجيل خروج المطور
export const adminLogout = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

// الحصول على جلسة المطور الحالية
export const getAdminSession = () => {
  const data = localStorage.getItem(ADMIN_SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

// التحقق من تسجيل دخول المطور
export const isAdminAuthenticated = () => {
  return getAdminSession() !== null;
};

// إضافة مطور جديد
export const addAdmin = (adminData) => {
  const admins = getAllAdmins();
  const newAdmin = {
    id: Date.now(),
    ...adminData,
    password: hashPassword(adminData.password),
    createdAt: new Date().toISOString()
  };
  
  admins.push(newAdmin);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admins));
  return newAdmin;
};

// حذف مطور
export const deleteAdmin = (adminId) => {
  const admins = getAllAdmins();
  const filtered = admins.filter(a => a.id !== adminId);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(filtered));
};
