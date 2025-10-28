// ======================================
// API Service - خدمة الربط مع Backend
// جاهزة للربط مع API خارجي
// ======================================

// رابط الـ API الأساسي - يتم تغييره عند الربط مع الباك إند
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// دالة مساعدة للطلبات
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('bero_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('خطأ في الطلب:', error);
    throw error;
  }
};

// ==================== خدمات المصادقة ====================

export const authAPI = {
  // تسجيل الدخول
  login: async (username, password) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // تسجيل مستخدم جديد
  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // تسجيل الخروج
  logout: async () => {
    return await request('/auth/logout', {
      method: 'POST',
    });
  },
};

// ==================== خدمات المخازن ====================

export const warehouseAPI = {
  getAll: async () => await request('/warehouses'),
  getById: async (id) => await request(`/warehouses/${id}`),
  create: async (data) => await request('/warehouses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id, data) => await request(`/warehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: async (id) => await request(`/warehouses/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== خدمات المنتجات ====================

export const productAPI = {
  getAll: async () => await request('/products'),
  getById: async (id) => await request(`/products/${id}`),
  create: async (data) => await request('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id, data) => await request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: async (id) => await request(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== خدمات الموردين ====================

export const supplierAPI = {
  getAll: async () => await request('/suppliers'),
  getById: async (id) => await request(`/suppliers/${id}`),
  create: async (data) => await request('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id, data) => await request(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: async (id) => await request(`/suppliers/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== خدمات العملاء ====================

export const customerAPI = {
  getAll: async () => await request('/customers'),
  getById: async (id) => await request(`/customers/${id}`),
  create: async (data) => await request('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id, data) => await request(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: async (id) => await request(`/customers/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== خدمات فواتير المشتريات ====================

export const purchaseAPI = {
  getAll: async () => await request('/purchases'),
  getById: async (id) => await request(`/purchases/${id}`),
  create: async (data) => await request('/purchases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id, data) => await request(`/purchases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: async (id) => await request(`/purchases/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== خدمات فواتير المبيعات ====================

export const salesAPI = {
  getAll: async () => await request('/sales'),
  getById: async (id) => await request(`/sales/${id}`),
  create: async (data) => await request('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: async (id, data) => await request(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: async (id) => await request(`/sales/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== خدمات الخزينة ====================

export const treasuryAPI = {
  getBalance: async () => await request('/treasury/balance'),
  getTransactions: async () => await request('/treasury/transactions'),
  addTransaction: async (data) => await request('/treasury/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getReports: async (params) => await request(`/treasury/reports?${new URLSearchParams(params)}`),
};

// ==================== خدمات التقارير ====================

export const reportsAPI = {
  getSalesReport: async (startDate, endDate) => 
    await request(`/reports/sales?start=${startDate}&end=${endDate}`),
  
  getPurchasesReport: async (startDate, endDate) => 
    await request(`/reports/purchases?start=${startDate}&end=${endDate}`),
  
  getProfitReport: async (startDate, endDate) => 
    await request(`/reports/profit?start=${startDate}&end=${endDate}`),
  
  getInventoryReport: async () => 
    await request('/reports/inventory'),
};

export default {
  auth: authAPI,
  warehouse: warehouseAPI,
  product: productAPI,
  supplier: supplierAPI,
  customer: customerAPI,
  purchase: purchaseAPI,
  sales: salesAPI,
  treasury: treasuryAPI,
  reports: reportsAPI,
};
