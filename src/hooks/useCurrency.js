// ======================================
// useCurrency Hook - React Hook للعملة
// ======================================

import { useState, useEffect } from 'react';
import { getCurrencySettings, formatCurrency as formatCurrencyUtil } from '../utils/currency';

/**
 * React Hook للحصول على معلومات العملة من إعدادات النظام
 */
export const useCurrency = () => {
  const [currency, setCurrency] = useState({
    code: 'EGP',
    symbol: 'ج.م'
  });

  useEffect(() => {
    // تحميل إعدادات العملة
    const settings = getCurrencySettings();
    setCurrency(settings);

    // الاستماع لتغييرات localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'bero_system_settings') {
        const settings = getCurrencySettings();
        setCurrency(settings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * تنسيق المبلغ مع العملة الحالية
   */
  const formatCurrency = (amount) => {
    return formatCurrencyUtil(amount, true);
  };

  return {
    ...currency,
    formatCurrency
  };
};

export default useCurrency;
