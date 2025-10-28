// ======================================
// Organization Service - خدمات إدارة المؤسسات
// ======================================

const ORGANIZATIONS_KEY = 'bero_saas_organizations';
const ORG_SETTINGS_PREFIX = 'bero_org_settings_';

// الحصول على جميع المؤسسات
export const getAllOrganizations = () => {
  const data = localStorage.getItem(ORGANIZATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// الحصول على مؤسسة معينة
export const getOrganization = (orgId) => {
  const orgs = getAllOrganizations();
  return orgs.find(o => o.id === orgId);
};

// إنشاء مؤسسة جديدة
export const createOrganization = (orgData) => {
  const orgs = getAllOrganizations();
  
  const newOrg = {
    id: `org_${Date.now()}`,
    name: orgData.name,
    adminName: orgData.adminName,
    adminEmail: orgData.adminEmail,
    adminPhone: orgData.adminPhone,
    plan: orgData.plan || 'Basic',
    status: 'active', // active, suspended, expired
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 يوم
    usersCount: 1,
    maxUsers: getPlanLimits(orgData.plan).maxUsers,
    createdAt: new Date().toISOString(),
    customization: {
      logo: null,
      primaryColor: '#1e3a8a',
      secondaryColor: '#059669',
      systemName: 'Bero System'
    }
  };
  
  orgs.push(newOrg);
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(orgs));
  
  // إنشاء إعدادات المؤسسة
  initializeOrgSettings(newOrg.id);
  
  return newOrg;
};

// تحديث مؤسسة
export const updateOrganization = (orgId, updates) => {
  const orgs = getAllOrganizations();
  const updated = orgs.map(o => o.id === orgId ? { ...o, ...updates } : o);
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(updated));
  return updated.find(o => o.id === orgId);
};

// حذف مؤسسة
export const deleteOrganization = (orgId) => {
  const orgs = getAllOrganizations();
  const filtered = orgs.filter(o => o.id !== orgId);
  localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(filtered));
  
  // حذف جميع بيانات المؤسسة
  clearOrganizationData(orgId);
};

// حذف جميع بيانات المؤسسة
const clearOrganizationData = (orgId) => {
  const keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`bero_${orgId}_`)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => localStorage.removeItem(key));
};

// تهيئة إعدادات المؤسسة
const initializeOrgSettings = (orgId) => {
  const settings = {
    orgId,
    customization: {
      logo: null,
      primaryColor: '#1e3a8a',
      secondaryColor: '#059669',
      systemName: 'Bero System'
    },
    initialized: true,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(`${ORG_SETTINGS_PREFIX}${orgId}`, JSON.stringify(settings));
};

// الحصول على إعدادات المؤسسة
export const getOrganizationSettings = (orgId) => {
  const data = localStorage.getItem(`${ORG_SETTINGS_PREFIX}${orgId}`);
  return data ? JSON.parse(data) : null;
};

// تحديث إعدادات المؤسسة
export const updateOrganizationSettings = (orgId, settings) => {
  localStorage.setItem(`${ORG_SETTINGS_PREFIX}${orgId}`, JSON.stringify(settings));
};

// حدود الخطط
const getPlanLimits = (plan) => {
  const limits = {
    'Basic': {
      maxUsers: 5,
      maxProducts: 500,
      maxInvoices: 1000,
      price: 99
    },
    'Pro': {
      maxUsers: 15,
      maxProducts: 2000,
      maxInvoices: 5000,
      price: 199
    },
    'Enterprise': {
      maxUsers: -1, // غير محدود
      maxProducts: -1,
      maxInvoices: -1,
      price: 399
    }
  };
  
  return limits[plan] || limits['Basic'];
};

// الحصول على حدود الخطة
export const getOrganizationLimits = (orgId) => {
  const org = getOrganization(orgId);
  return org ? getPlanLimits(org.plan) : getPlanLimits('Basic');
};

// التحقق من حالة الاشتراك
export const checkSubscriptionStatus = (orgId) => {
  const org = getOrganization(orgId);
  if (!org) return { valid: false, status: 'not_found' };
  
  if (org.status === 'suspended') {
    return { valid: false, status: 'suspended' };
  }
  
  const now = new Date();
  const endDate = new Date(org.subscriptionEnd);
  
  if (now > endDate) {
    // تحديث حالة المؤسسة
    updateOrganization(orgId, { status: 'expired' });
    return { valid: false, status: 'expired', endDate };
  }
  
  return { valid: true, status: 'active', endDate };
};

// إنشاء مؤسسات تجريبية
export const createDemoOrganizations = () => {
  console.log('بدء إنشاء المؤسسات التجريبية...');
  
  // التحقق من وجود البيانات مسبقاً
  const existingOrgs = getAllOrganizations();
  if (existingOrgs.length > 0) {
    console.log('المؤسسات موجودة مسبقاً:', existingOrgs.length);
    return;
  }

  const demoOrgs = [
    {
      name: 'شركة الأمل للتجارة',
      adminName: 'أحمد محمد',
      adminEmail: 'ahmed@amal.com',
      adminPhone: '+966501234567',
      plan: 'Pro',
      status: 'active',
      usersCount: 12,
      productsCount: 450,
      monthlyRevenue: 15000,
      subscriptionEnd: '2025-12-31',
      createdAt: '2025-01-15'
    },
    {
      name: 'مؤسسة الريادة الحديثة',
      adminName: 'فاطمة أحمد',
      adminEmail: 'fatima@riyada.com',
      adminPhone: '+966502345678',
      plan: 'Basic',
      status: 'active',
      usersCount: 8,
      productsCount: 280,
      monthlyRevenue: 8500,
      subscriptionEnd: '2025-11-30',
      createdAt: '2025-02-10'
    },
    {
      name: 'شركة التميز للمواد الطبية',
      adminName: 'خالد عبدالله',
      adminEmail: 'khalid@medical.com',
      adminPhone: '+966503456789',
      plan: 'Enterprise',
      status: 'active',
      usersCount: 25,
      productsCount: 1200,
      monthlyRevenue: 35000,
      subscriptionEnd: '2025-12-31',
      createdAt: '2024-11-20'
    },
    {
      name: 'متجر الأناقة للملابس',
      adminName: 'نورا سالم',
      adminEmail: 'nora@elegance.com',
      adminPhone: '+966504567890',
      plan: 'Basic',
      status: 'suspended',
      usersCount: 5,
      productsCount: 150,
      monthlyRevenue: 4200,
      subscriptionEnd: '2025-09-15',
      createdAt: '2025-03-05'
    },
    {
      name: 'شركة سرعة التوصيل',
      adminName: 'عمر فاروق',
      adminEmail: 'omar@delivery.com',
      adminPhone: '+966505678901',
      plan: 'Pro',
      status: 'active',
      usersCount: 18,
      productsCount: 380,
      monthlyRevenue: 18000,
      subscriptionEnd: '2025-12-31',
      createdAt: '2024-12-01'
    }
  ];
  
  const createdOrgs = [];
  
  demoOrgs.forEach((orgData, index) => {
    try {
      const newOrg = {
        id: `org_${Date.now() + index}`,
        ...orgData,
        subscriptionStart: orgData.createdAt,
        maxUsers: getPlanLimits(orgData.plan).maxUsers,
        customization: {
          logo: null,
          primaryColor: getRandomColor(),
          secondaryColor: getRandomColor(),
          systemName: 'Bero System'
        }
      };
      
      createdOrgs.push(newOrg);
      
      // إنشاء إعدادات المؤسسة
      initializeOrgSettings(newOrg.id);
      
      console.log(`تم إنشاء المؤسسة: ${newOrg.name} (${newOrg.id})`);
    } catch (error) {
      console.error(`خطأ في إنشاء المؤسسة ${orgData.name}:`, error);
    }
  });
  
  // حفظ جميع المؤسسات دفعة واحدة
  try {
    localStorage.setItem(ORGANIZATIONS_KEY, JSON.stringify(createdOrgs));
    console.log(`تم حفظ ${createdOrgs.length} مؤسسات بنجاح`);
    
    // التحقق من الحفظ
    const savedOrgs = JSON.parse(localStorage.getItem(ORGANIZATIONS_KEY) || '[]');
    console.log(`تم التحقق: ${savedOrgs.length} مؤسسات محفوظة`);
    
    return createdOrgs;
  } catch (error) {
    console.error('خطأ في حفظ المؤسسات:', error);
    return [];
  }
};

// دالة لتوليد ألوان عشوائية
const getRandomColor = () => {
  const colors = ['#1e3a8a', '#059669', '#dc2626', '#d97706', '#7c3aed', '#06b6d4', '#f59e0b', '#84cc16'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// إحصائيات المؤسسات
export const getOrganizationsStats = () => {
  const orgs = getAllOrganizations();
  
  return {
    total: orgs.length,
    active: orgs.filter(o => o.status === 'active').length,
    suspended: orgs.filter(o => o.status === 'suspended').length,
    expired: orgs.filter(o => o.status === 'expired').length,
    byPlan: {
      basic: orgs.filter(o => o.plan === 'Basic').length,
      pro: orgs.filter(o => o.plan === 'Pro').length,
      enterprise: orgs.filter(o => o.plan === 'Enterprise').length
    }
  };
};
