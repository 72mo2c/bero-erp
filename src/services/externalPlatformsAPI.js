// ======================================
// External Platforms API Service
// خدمة التواصل مع المنصات الخارجية
// ======================================

/**
 * ملاحظة: هذا الملف يحتوي على البنية الأساسية لـ API.
 * في الإنتاج، يجب تعديل الـ URLs وإضافة مفاتيح API الفعلية.
 */

// إعدادات API للمنصات
const API_CONFIG = {
  INVOICE_PLATFORM: {
    baseURL: process.env.REACT_APP_INVOICE_PLATFORM_URL || 'https://api.invoice-platform.com',
    apiKey: process.env.REACT_APP_INVOICE_API_KEY || '',
    webhookSecret: process.env.REACT_APP_INVOICE_WEBHOOK_SECRET || ''
  },
  CARTON_PLATFORM: {
    baseURL: process.env.REACT_APP_CARTON_PLATFORM_URL || 'https://api.carton-platform.com',
    apiKey: process.env.REACT_APP_CARTON_API_KEY || '',
    webhookSecret: process.env.REACT_APP_CARTON_WEBHOOK_SECRET || ''
  }
};

// Helper function للطلبات
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ==================== منصة فاتورة ====================

export const invoicePlatformAPI = {
  /**
   * جلب الفواتير المعلقة من منصة فاتورة
   */
  fetchPendingInvoices: async () => {
    const url = `${API_CONFIG.INVOICE_PLATFORM.baseURL}/invoices/pending`;
    return await apiRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.INVOICE_PLATFORM.apiKey}`
      }
    });
  },

  /**
   * تأكيد استلام فاتورة (قبول)
   */
  confirmInvoice: async (invoiceId) => {
    const url = `${API_CONFIG.INVOICE_PLATFORM.baseURL}/invoices/${invoiceId}/confirm`;
    return await apiRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.INVOICE_PLATFORM.apiKey}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
  },

  /**
   * رفض فاتورة
   */
  rejectInvoice: async (invoiceId, reason) => {
    const url = `${API_CONFIG.INVOICE_PLATFORM.baseURL}/invoices/${invoiceId}/reject`;
    return await apiRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.INVOICE_PLATFORM.apiKey}`
      },
      body: JSON.stringify({ 
        status: 'rejected',
        reason: reason || 'لا يوجد سبب' 
      })
    });
  },

  /**
   * الاشتراك في Webhook للحصول على إشعارات فورية
   */
  subscribeToWebhook: async (callbackUrl) => {
    const url = `${API_CONFIG.INVOICE_PLATFORM.baseURL}/webhooks/subscribe`;
    return await apiRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.INVOICE_PLATFORM.apiKey}`
      },
      body: JSON.stringify({ 
        url: callbackUrl,
        events: ['invoice.created', 'invoice.updated']
      })
    });
  }
};

// ==================== منصة كرتونة ====================

export const cartonPlatformAPI = {
  /**
   * جلب الفواتير المعلقة من منصة كرتونة
   */
  fetchPendingInvoices: async () => {
    const url = `${API_CONFIG.CARTON_PLATFORM.baseURL}/orders/pending`;
    return await apiRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.CARTON_PLATFORM.apiKey}`
      }
    });
  },

  /**
   * تأكيد استلام طلب (قبول)
   */
  confirmOrder: async (orderId) => {
    const url = `${API_CONFIG.CARTON_PLATFORM.baseURL}/orders/${orderId}/confirm`;
    return await apiRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.CARTON_PLATFORM.apiKey}`
      },
      body: JSON.stringify({ status: 'accepted' })
    });
  },

  /**
   * رفض طلب
   */
  rejectOrder: async (orderId, reason) => {
    const url = `${API_CONFIG.CARTON_PLATFORM.baseURL}/orders/${orderId}/reject`;
    return await apiRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.CARTON_PLATFORM.apiKey}`
      },
      body: JSON.stringify({ 
        status: 'rejected',
        reason: reason || 'لا يوجد سبب' 
      })
    });
  },

  /**
   * الاشتراك في Webhook للحصول على إشعارات فورية
   */
  subscribeToWebhook: async (callbackUrl) => {
    const url = `${API_CONFIG.CARTON_PLATFORM.baseURL}/webhooks/subscribe`;
    return await apiRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.CARTON_PLATFORM.apiKey}`
      },
      body: JSON.stringify({ 
        url: callbackUrl,
        events: ['order.created', 'order.updated']
      })
    });
  }
};

// ==================== دوال مساعدة ====================

/**
 * تحويل بيانات الفاتورة من منصة فاتورة إلى صيغة النظام
 */
export const transformInvoicePlatformData = (externalInvoice) => {
  return {
    id: `INV-${externalInvoice.id}`,
    platform: 'invoice',
    platformName: 'منصة فاتورة',
    externalId: externalInvoice.id,
    customerName: externalInvoice.customer?.name || 'غير محدد',
    customerPhone: externalInvoice.customer?.phone || '',
    customerEmail: externalInvoice.customer?.email || '',
    receivedDate: new Date(externalInvoice.created_at).toISOString().split('T')[0],
    receivedTime: new Date(externalInvoice.created_at).toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    paymentType: externalInvoice.payment_method === 'cash' ? 'cash' : 
                 externalInvoice.payment_method === 'deferred' ? 'deferred' : 'partial',
    items: externalInvoice.items?.map(item => ({
      productName: item.product_name,
      productSKU: item.sku || '',
      quantity: item.quantity,
      mainPrice: parseFloat(item.unit_price),
      subPrice: item.sub_price ? parseFloat(item.sub_price) : 0
    })) || [],
    total: parseFloat(externalInvoice.total_amount),
    notes: externalInvoice.notes || '',
    agentType: 'invoice' // تلقائياً من منصة فاتورة
  };
};

/**
 * تحويل بيانات الطلب من منصة كرتونة إلى صيغة النظام
 */
export const transformCartonPlatformData = (externalOrder) => {
  return {
    id: `CTN-${externalOrder.id}`,
    platform: 'carton',
    platformName: 'منصة كرتونة',
    externalId: externalOrder.id,
    customerName: externalOrder.customer?.name || 'غير محدد',
    customerPhone: externalOrder.customer?.phone || '',
    customerEmail: externalOrder.customer?.email || '',
    receivedDate: new Date(externalOrder.created_at).toISOString().split('T')[0],
    receivedTime: new Date(externalOrder.created_at).toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    paymentType: externalOrder.payment_method === 'cash' ? 'cash' : 
                 externalOrder.payment_method === 'deferred' ? 'deferred' : 'partial',
    items: externalOrder.items?.map(item => ({
      productName: item.product_name,
      productSKU: item.sku || '',
      quantity: item.quantity,
      mainPrice: parseFloat(item.unit_price),
      subPrice: item.sub_price ? parseFloat(item.sub_price) : 0
    })) || [],
    total: parseFloat(externalOrder.total_amount),
    notes: externalOrder.notes || '',
    agentType: 'carton' // تلقائياً من منصة كرتونة
  };
};

/**
 * جلب جميع الفواتير المعلقة من كل المنصات
 */
export const fetchAllPendingInvoices = async () => {
  try {
    const [invoiceData, cartonData] = await Promise.allSettled([
      invoicePlatformAPI.fetchPendingInvoices(),
      cartonPlatformAPI.fetchPendingInvoices()
    ]);

    const invoices = [];

    if (invoiceData.status === 'fulfilled' && invoiceData.value?.data) {
      invoices.push(...invoiceData.value.data.map(transformInvoicePlatformData));
    }

    if (cartonData.status === 'fulfilled' && cartonData.value?.data) {
      invoices.push(...cartonData.value.data.map(transformCartonPlatformData));
    }

    return invoices;
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
    throw error;
  }
};

/**
 * إعداد Webhook Listener
 * هذه الدالة يجب أن تُستدعى عند بدء التطبيق
 */
export const setupWebhookListeners = async (onNewInvoice) => {
  try {
    // في بيئة الإنتاج، يجب أن يكون لديك Backend Endpoint لاستقبال Webhooks
    const backendWebhookUrl = process.env.REACT_APP_WEBHOOK_ENDPOINT || 'https://your-backend.com/webhooks';

    await Promise.allSettled([
      invoicePlatformAPI.subscribeToWebhook(backendWebhookUrl + '/invoice'),
      cartonPlatformAPI.subscribeToWebhook(backendWebhookUrl + '/carton')
    ]);

    console.log('Webhook listeners setup successfully');
  } catch (error) {
    console.error('Error setting up webhook listeners:', error);
  }
};

/**
 * التحقق من صحة Webhook Signature
 * يستخدم لضمان أن الطلبات قادمة فعلاً من المنصات الخارجية
 */
export const verifyWebhookSignature = (payload, signature, platform) => {
  // في الإنتاج، استخدم crypto للتحقق من التوقيع
  const secret = platform === 'invoice' 
    ? API_CONFIG.INVOICE_PLATFORM.webhookSecret 
    : API_CONFIG.CARTON_PLATFORM.webhookSecret;

  // مثال: استخدام HMAC SHA256
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(JSON.stringify(payload))
  //   .digest('hex');
  // 
  // return signature === expectedSignature;

  return true; // للاختبار فقط
};

export default {
  invoicePlatformAPI,
  cartonPlatformAPI,
  fetchAllPendingInvoices,
  setupWebhookListeners,
  verifyWebhookSignature,
  transformInvoicePlatformData,
  transformCartonPlatformData
};
