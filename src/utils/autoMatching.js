// ======================================
// Auto Matching Helper
// دوال المطابقة التلقائية
// ======================================

/**
 * حساب درجة التشابه بين نصين باستخدام Levenshtein Distance
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  // Levenshtein Distance
  const editDistance = levenshteinDistance(s1, s2);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * مطابقة عميل من بيانات الفاتورة الخارجية
 * @param {Object} invoiceCustomer - بيانات العميل من الفاتورة الخارجية
 * @param {Array} existingCustomers - قائمة العملاء الحالية
 * @returns {Object|null} - العميل المطابق أو null
 */
export const matchCustomer = (invoiceCustomer, existingCustomers) => {
  if (!invoiceCustomer || !existingCustomers || existingCustomers.length === 0) {
    return null;
  }

  const { customerName, customerPhone, customerEmail } = invoiceCustomer;
  let bestMatch = null;
  let highestScore = 0;
  const MATCH_THRESHOLD = 0.75; // حد أدنى 75% تشابه

  for (const customer of existingCustomers) {
    let score = 0;
    let matchCount = 0;

    // مطابقة رقم الهاتف (أعلى أولوية)
    if (customerPhone && customer.phone) {
      const normalizedInvoicePhone = customerPhone.replace(/\D/g, '');
      const normalizedCustomerPhone = customer.phone.replace(/\D/g, '');
      
      if (normalizedInvoicePhone === normalizedCustomerPhone) {
        return customer; // تطابق تام في رقم الهاتف
      }
      
      // تطابق جزئي في رقم الهاتف (آخر 8 أرقام)
      if (normalizedInvoicePhone.slice(-8) === normalizedCustomerPhone.slice(-8)) {
        score += 0.8;
        matchCount++;
      }
    }

    // مطابقة البريد الإلكتروني
    if (customerEmail && customer.email) {
      if (customerEmail.toLowerCase() === customer.email.toLowerCase()) {
        return customer; // تطابق تام في البريد
      }
    }

    // مطابقة الاسم
    if (customerName && customer.name) {
      const nameSimilarity = calculateSimilarity(customerName, customer.name);
      score += nameSimilarity;
      matchCount++;
    }

    // حساب المتوسط
    const avgScore = matchCount > 0 ? score / matchCount : 0;

    if (avgScore > highestScore && avgScore >= MATCH_THRESHOLD) {
      highestScore = avgScore;
      bestMatch = customer;
    }
  }

  return bestMatch;
};

/**
 * مطابقة منتج من بيانات الفاتورة الخارجية
 * @param {Object} invoiceItem - بيانات المنتج من الفاتورة
 * @param {Array} existingProducts - قائمة المنتجات الحالية
 * @returns {Object|null} - المنتج المطابق أو null
 */
export const matchProduct = (invoiceItem, existingProducts) => {
  if (!invoiceItem || !existingProducts || existingProducts.length === 0) {
    return null;
  }

  const { productName, productSKU } = invoiceItem;
  let bestMatch = null;
  let highestScore = 0;
  const MATCH_THRESHOLD = 0.75; // حد أدنى 75% تشابه

  for (const product of existingProducts) {
    // مطابقة SKU (أعلى أولوية)
    if (productSKU && product.barcode) {
      if (productSKU === product.barcode) {
        return product; // تطابق تام في SKU/Barcode
      }
    }

    // مطابقة الاسم
    if (productName && product.name) {
      const nameSimilarity = calculateSimilarity(productName, product.name);
      
      if (nameSimilarity > highestScore && nameSimilarity >= MATCH_THRESHOLD) {
        highestScore = nameSimilarity;
        bestMatch = product;
      }
    }
  }

  return bestMatch;
};

/**
 * مطابقة جميع أصناف الفاتورة
 * @param {Array} invoiceItems - قائمة الأصناف من الفاتورة
 * @param {Array} existingProducts - قائمة المنتجات الحالية
 * @returns {Object} - نتيجة المطابقة
 */
export const matchAllItems = (invoiceItems, existingProducts) => {
  const matchedItems = [];
  const unmatchedItems = [];

  for (const item of invoiceItems) {
    const matchedProduct = matchProduct(item, existingProducts);
    
    if (matchedProduct) {
      matchedItems.push({
        ...item,
        matchedProduct,
        productId: matchedProduct.id
      });
    } else {
      unmatchedItems.push(item);
    }
  }

  return {
    matchedItems,
    unmatchedItems,
    allMatched: unmatchedItems.length === 0,
    matchRate: matchedItems.length / invoiceItems.length
  };
};

/**
 * إنشاء عميل جديد من بيانات الفاتورة
 * @param {Object} invoiceCustomer - بيانات العميل من الفاتورة
 * @param {string} platform - اسم المنصة
 * @returns {Object} - بيانات العميل الجديد
 */
export const createCustomerFromInvoice = (invoiceCustomer, platform) => {
  return {
    name: invoiceCustomer.customerName || 'عميل جديد',
    phone: invoiceCustomer.customerPhone || '',
    email: invoiceCustomer.customerEmail || '',
    address: '',
    notes: `تم إنشاء هذا العميل تلقائياً من ${platform}`,
    source: platform,
    createdAt: new Date().toISOString()
  };
};

/**
 * التحقق من توفر المخزون لجميع أصناف الفاتورة
 * @param {Array} matchedItems - قائمة الأصناف المطابقة
 * @returns {Object} - نتيجة التحقق
 */
export const checkInventoryAvailability = (matchedItems) => {
  const unavailableItems = [];
  const availableItems = [];

  for (const item of matchedItems) {
    const product = item.matchedProduct;
    const requestedQty = item.quantity;
    const availableQty = (product.mainQuantity || 0) + (product.subQuantity || 0);

    if (availableQty < requestedQty) {
      unavailableItems.push({
        ...item,
        requestedQty,
        availableQty,
        shortage: requestedQty - availableQty
      });
    } else {
      availableItems.push(item);
    }
  }

  return {
    allAvailable: unavailableItems.length === 0,
    availableItems,
    unavailableItems,
    availabilityRate: availableItems.length / matchedItems.length
  };
};

/**
 * تحليل شامل للفاتورة قبل القبول
 * @param {Object} invoice - بيانات الفاتورة
 * @param {Array} existingCustomers - قائمة العملاء
 * @param {Array} existingProducts - قائمة المنتجات
 * @returns {Object} - نتيجة التحليل
 */
export const analyzeInvoiceBeforeAcceptance = (invoice, existingCustomers, existingProducts) => {
  // مطابقة العميل
  const matchedCustomer = matchCustomer(invoice, existingCustomers);
  const needsNewCustomer = !matchedCustomer;

  // مطابقة المنتجات
  const itemsMatching = matchAllItems(invoice.items, existingProducts);

  // التحقق من المخزون
  const inventoryCheck = itemsMatching.matchedItems.length > 0 
    ? checkInventoryAvailability(itemsMatching.matchedItems)
    : { allAvailable: false, unavailableItems: [], availableItems: [] };

  // حساب مستوى الجاهزية
  const readinessScore = (
    (matchedCustomer ? 0.3 : 0) +
    (itemsMatching.matchRate * 0.4) +
    (inventoryCheck.allAvailable ? 0.3 : inventoryCheck.availabilityRate * 0.3)
  );

  return {
    customer: {
      matched: matchedCustomer,
      needsCreation: needsNewCustomer,
      data: matchedCustomer || createCustomerFromInvoice(invoice, invoice.platformName)
    },
    items: {
      matched: itemsMatching.matchedItems,
      unmatched: itemsMatching.unmatchedItems,
      matchRate: itemsMatching.matchRate,
      allMatched: itemsMatching.allMatched
    },
    inventory: {
      available: inventoryCheck.availableItems,
      unavailable: inventoryCheck.unavailableItems,
      allAvailable: inventoryCheck.allAvailable,
      availabilityRate: inventoryCheck.availabilityRate || 0
    },
    readiness: {
      score: readinessScore,
      level: readinessScore >= 0.8 ? 'high' : readinessScore >= 0.5 ? 'medium' : 'low',
      canAutoAccept: readinessScore >= 0.8 && inventoryCheck.allAvailable
    },
    issues: [
      ...(needsNewCustomer ? ['سيتم إنشاء عميل جديد'] : []),
      ...(itemsMatching.unmatchedItems.length > 0 ? [`${itemsMatching.unmatchedItems.length} منتج غير مطابق`] : []),
      ...(inventoryCheck.unavailableItems.length > 0 ? [`${inventoryCheck.unavailableItems.length} منتج غير متوفر بالمخزون`] : [])
    ]
  };
};

export default {
  matchCustomer,
  matchProduct,
  matchAllItems,
  createCustomerFromInvoice,
  checkInventoryAvailability,
  analyzeInvoiceBeforeAcceptance
};
