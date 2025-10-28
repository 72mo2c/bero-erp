// ======================================
// Subscription Service - خدمات إدارة الاشتراكات
// ======================================

import { getAllOrganizations, updateOrganization } from './organizationService';

const SUBSCRIPTIONS_KEY = 'bero_saas_subscriptions';
const PAYMENTS_KEY = 'bero_saas_payments';

// خطط الاشتراك
export const SUBSCRIPTION_PLANS = {
  Basic: {
    id: 'basic',
    name: 'الخطة الأساسية',
    nameEn: 'Basic',
    price: 99,
    currency: 'USD',
    interval: 'شهرياً',
    features: [
      '5 مستخدمين كحد أقصى',
      '500 منتج',
      '1000 فاتورة شهرياً',
      'تقارير أساسية',
      'دعم فني عبر البريد'
    ],
    limits: {
      maxUsers: 5,
      maxProducts: 500,
      maxInvoices: 1000
    }
  },
  Pro: {
    id: 'pro',
    name: 'الخطة الاحترافية',
    nameEn: 'Pro',
    price: 199,
    currency: 'USD',
    interval: 'شهرياً',
    features: [
      '15 مستخدم كحد أقصى',
      '2000 منتج',
      '5000 فاتورة شهرياً',
      'تقارير متقدمة',
      'تكامل مع الأنظمة الخارجية',
      'دعم فني ذو أولوية'
    ],
    limits: {
      maxUsers: 15,
      maxProducts: 2000,
      maxInvoices: 5000
    }
  },
  Enterprise: {
    id: 'enterprise',
    name: 'خطة المؤسسات',
    nameEn: 'Enterprise',
    price: 399,
    currency: 'USD',
    interval: 'شهرياً',
    features: [
      'مستخدمين غير محدودين',
      'منتجات غير محدودة',
      'فواتير غير محدودة',
      'تقارير مخصصة',
      'API كامل',
      'مدير حساب مخصص',
      'دعم فني 24/7'
    ],
    limits: {
      maxUsers: -1,
      maxProducts: -1,
      maxInvoices: -1
    }
  }
};

// الحصول على جميع الاشتراكات
export const getAllSubscriptions = () => {
  const data = localStorage.getItem(SUBSCRIPTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// إنشاء اشتراك جديد
export const createSubscription = (orgId, planId, durationMonths = 1) => {
  const subscriptions = getAllSubscriptions();
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.Basic;
  
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  
  const subscription = {
    id: `sub_${Date.now()}`,
    orgId,
    plan: planId,
    status: 'active', // active, expired, cancelled
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    amount: plan.price * durationMonths,
    currency: plan.currency,
    autoRenew: true,
    createdAt: new Date().toISOString()
  };
  
  subscriptions.push(subscription);
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  
  // تحديث المؤسسة
  updateOrganization(orgId, {
    plan: planId,
    subscriptionEnd: endDate.toISOString(),
    status: 'active'
  });
  
  return subscription;
};

// تجديد اشتراك
export const renewSubscription = (subscriptionId, durationMonths = 1) => {
  const subscriptions = getAllSubscriptions();
  const subscription = subscriptions.find(s => s.id === subscriptionId);
  
  if (!subscription) {
    throw new Error('الاشتراك غير موجود');
  }
  
  const plan = SUBSCRIPTION_PLANS[subscription.plan];
  const newEndDate = new Date(subscription.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + durationMonths);
  
  const updated = subscriptions.map(s => 
    s.id === subscriptionId 
      ? { ...s, endDate: newEndDate.toISOString(), status: 'active' }
      : s
  );
  
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));
  
  // تحديث المؤسسة
  updateOrganization(subscription.orgId, {
    subscriptionEnd: newEndDate.toISOString(),
    status: 'active'
  });
  
  // إضافة دفعة
  addPayment({
    orgId: subscription.orgId,
    subscriptionId,
    amount: plan.price * durationMonths,
    type: 'renewal'
  });
  
  return subscription;
};

// إلغاء اشتراك
export const cancelSubscription = (subscriptionId) => {
  const subscriptions = getAllSubscriptions();
  const updated = subscriptions.map(s => 
    s.id === subscriptionId 
      ? { ...s, status: 'cancelled', autoRenew: false }
      : s
  );
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));
};

// ترقية/تخفيض الخطة
export const changePlan = (orgId, newPlanId) => {
  const subscriptions = getAllSubscriptions();
  const currentSub = subscriptions.find(s => s.orgId === orgId && s.status === 'active');
  
  if (!currentSub) {
    // إنشاء اشتراك جديد
    return createSubscription(orgId, newPlanId);
  }
  
  // تحديث الاشتراك الحالي
  const updated = subscriptions.map(s => 
    s.id === currentSub.id 
      ? { ...s, plan: newPlanId }
      : s
  );
  
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));
  
  // تحديث المؤسسة
  updateOrganization(orgId, { plan: newPlanId });
  
  return updated.find(s => s.id === currentSub.id);
};

// إضافة دفعة
export const addPayment = (paymentData) => {
  const payments = getAllPayments();
  
  const payment = {
    id: `pay_${Date.now()}`,
    orgId: paymentData.orgId,
    subscriptionId: paymentData.subscriptionId,
    amount: paymentData.amount,
    currency: paymentData.currency || 'USD',
    type: paymentData.type || 'subscription', // subscription, renewal, upgrade
    method: paymentData.method || 'credit_card',
    status: 'completed', // completed, pending, failed
    date: new Date().toISOString()
  };
  
  payments.push(payment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  
  return payment;
};

// الحصول على جميع المدفوعات
export const getAllPayments = () => {
  const data = localStorage.getItem(PAYMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

// الحصول على مدفوعات مؤسسة معينة
export const getOrganizationPayments = (orgId) => {
  const payments = getAllPayments();
  return payments.filter(p => p.orgId === orgId);
};

// حساب الإيرادات
export const calculateRevenue = (period = 'month') => {
  const payments = getAllPayments();
  const now = new Date();
  
  const filtered = payments.filter(p => {
    const paymentDate = new Date(p.date);
    
    if (period === 'day') {
      return paymentDate.toDateString() === now.toDateString();
    } else if (period === 'month') {
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    } else if (period === 'year') {
      return paymentDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  });
  
  return filtered.reduce((total, p) => total + p.amount, 0);
};

// إحصائيات الاشتراكات
export const getSubscriptionsStats = () => {
  const subscriptions = getAllSubscriptions();
  const orgs = getAllOrganizations();
  
  return {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    revenue: {
      today: calculateRevenue('day'),
      month: calculateRevenue('month'),
      year: calculateRevenue('year')
    },
    byPlan: {
      basic: orgs.filter(o => o.plan === 'Basic').length,
      pro: orgs.filter(o => o.plan === 'Pro').length,
      enterprise: orgs.filter(o => o.plan === 'Enterprise').length
    }
  };
};

// التحقق من الحدود
export const checkLimits = (orgId, resourceType) => {
  const orgs = getAllOrganizations();
  const org = orgs.find(o => o.id === orgId);
  
  if (!org) return { allowed: false, message: 'المؤسسة غير موجودة' };
  
  const plan = SUBSCRIPTION_PLANS[org.plan];
  const limits = plan.limits;
  
  if (resourceType === 'users') {
    if (limits.maxUsers === -1) return { allowed: true };
    return { 
      allowed: org.usersCount < limits.maxUsers,
      current: org.usersCount,
      max: limits.maxUsers,
      message: org.usersCount >= limits.maxUsers 
        ? `تم الوصول للحد الأقصى (${limits.maxUsers} مستخدمين)`
        : ''
    };
  }
  
  return { allowed: true };
};
