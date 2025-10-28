// ======================================
// Currency Utilities - أدوات العملة
// ======================================

/**
 * الحصول على إعدادات العملة من النظام
 */
export const getCurrencySettings = () => {
  try {
    const settings = localStorage.getItem('bero_system_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        code: parsed.currency || 'EGP',
        symbol: getCurrencySymbol(parsed.currency || 'EGP')
      };
    }
  } catch (error) {
    console.error('Error loading currency settings:', error);
  }
  
  // القيم الافتراضية
  return {
    code: 'EGP',
    symbol: 'ج.م'
  };
};

/**
 * الحصول على رمز العملة بناءً على الكود
 */
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    'EGP': 'ج.م',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'IQD': 'د.ع',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'KWD': 'د.ك'
  };
  
  return symbols[currencyCode] || currencyCode;
};

/**
 * تنسيق السعر مع العملة
 * @param {number} amount - المبلغ
 * @param {boolean} useSettings - استخدام إعدادات النظام (افتراضي: true)
 * @param {string} currencyCode - كود العملة (اختياري)
 */
export const formatCurrency = (amount, useSettings = true, currencyCode = null) => {
  if (amount === null || amount === undefined) return '-';
  
  const settings = useSettings ? getCurrencySettings() : null;
  const symbol = currencyCode ? getCurrencySymbol(currencyCode) : (settings?.symbol || 'ج.م');
  
  // تنسيق الرقم بفواصل
  const formatted = Number(amount).toLocaleString('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return `${formatted} ${symbol}`;
};

/**
 * تحويل العملة (للاستخدام المستقبلي)
 * @param {number} amount - المبلغ
 * @param {string} fromCurrency - من عملة
 * @param {string} toCurrency - إلى عملة
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // معدلات تحويل تقريبية (يمكن ربطها بـ API في المستقبل)
  const rates = {
    'EGP': 1,
    'USD': 0.032,
    'EUR': 0.029,
    'GBP': 0.025,
    'IQD': 42,
    'SAR': 0.12,
    'AED': 0.12,
    'KWD': 0.0098
  };
  
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    return amount;
  }
  
  // التحويل عبر الجنيه المصري كعملة وسيطة
  const inEGP = amount / rates[fromCurrency];
  return inEGP * rates[toCurrency];
};

export default {
  getCurrencySettings,
  getCurrencySymbol,
  formatCurrency,
  convertCurrency
};
