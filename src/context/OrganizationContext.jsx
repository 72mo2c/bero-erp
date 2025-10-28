// ======================================
// Organization Context - إدارة المؤسسة الحالية
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getOrganization,
  getOrganizationSettings,
  updateOrganizationSettings,
  checkSubscriptionStatus
} from '../services/organizationService';

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children, orgId }) => {
  const [organization, setOrganization] = useState(null);
  const [settings, setSettings] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // تحميل بيانات المؤسسة
  useEffect(() => {
    if (orgId) {
      loadOrganizationData();
    }
  }, [orgId]);

  const loadOrganizationData = () => {
    setLoading(true);
    
    // تحميل بيانات المؤسسة
    const org = getOrganization(orgId);
    setOrganization(org);
    
    // تحميل الإعدادات
    const orgSettings = getOrganizationSettings(orgId);
    setSettings(orgSettings);
    
    // التحقق من حالة الاشتراك
    const subStatus = checkSubscriptionStatus(orgId);
    setSubscriptionStatus(subStatus);
    
    setLoading(false);
  };

  // تحديث الإعدادات
  const updateSettings = (newSettings) => {
    updateOrganizationSettings(orgId, newSettings);
    setSettings(newSettings);
  };

  // الحصول على اللون الأساسي
  const getPrimaryColor = () => {
    return settings?.customization?.primaryColor || '#1e3a8a';
  };

  // الحصول على اللون الثانوي
  const getSecondaryColor = () => {
    return settings?.customization?.secondaryColor || '#059669';
  };

  // الحصول على اسم النظام
  const getSystemName = () => {
    return settings?.customization?.systemName || 'Bero System';
  };

  // الحصول على الشعار
  const getLogo = () => {
    return settings?.customization?.logo;
  };

  // التحقق من صلاحية الاشتراك
  const isSubscriptionValid = () => {
    return subscriptionStatus?.valid === true;
  };

  // الحصول على حالة الاشتراك
  const getSubscriptionStatusText = () => {
    if (!subscriptionStatus) return 'غير معروف';
    
    switch (subscriptionStatus.status) {
      case 'active':
        return 'نشط';
      case 'expired':
        return 'منتهي';
      case 'suspended':
        return 'معلق';
      default:
        return 'غير معروف';
    }
  };

  // الحصول على عدد الأيام المتبقية
  const getDaysRemaining = () => {
    if (!subscriptionStatus?.endDate) return 0;
    
    const now = new Date();
    const end = new Date(subscriptionStatus.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const value = {
    orgId,
    organization,
    settings,
    subscriptionStatus,
    loading,
    
    // دوال الإعدادات
    updateSettings,
    getPrimaryColor,
    getSecondaryColor,
    getSystemName,
    getLogo,
    
    // دوال الاشتراك
    isSubscriptionValid,
    getSubscriptionStatusText,
    getDaysRemaining,
    
    // دوال التحديث
    refreshOrganization: loadOrganizationData
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
