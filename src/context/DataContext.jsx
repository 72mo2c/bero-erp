// ======================================
// Data Context - إدارة بيانات النظام
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

// ثوابت حالات المرتجعات
const RETURN_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending', 
  APPROVED: 'approved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

// ثوابت أنواع المرتجعات
const RETURN_TYPES = {
  PURCHASE: 'purchase',
  SALES: 'sales'
};

// ثوابت أنواع المستخدمين (للتحقق من الصلاحيات)
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  EMPLOYEE: 'employee'
};

// Hook لاستخدام Data Context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children, orgId }) => {
  // بيانات المخازن
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // بيانات المشتريات
  const [purchases, setPurchases] = useState([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  
  // بيانات المبيعات
  const [sales, setSales] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [salesReturns, setSalesReturns] = useState([]);
  
  // بيانات الشركات والموردين
  const [suppliers, setSuppliers] = useState([]);
  
  // بيانات العملاء
  const [customers, setCustomers] = useState([]);
  
  // بيانات الخزينة الشاملة
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [cashReceipts, setCashReceipts] = useState([]); // إيصالات الاستلام النقدي
  const [cashDisbursements, setCashDisbursements] = useState([]); // إيصالات الصرف النقدي
  
  // بيانات التحويلات بين المخازن
  const [transfers, setTransfers] = useState([]);
  
  // بيانات النظام المتقدمة
  const [auditLogs, setAuditLogs] = useState([]); // تتبع التغييرات
  const [permissions, setPermissions] = useState({}); // صلاحيات المستخدمين
  const [currentUser, setCurrentUser] = useState(null); // المستخدم الحالي

  // دالة مساعدة للحصول على مفاتيح LocalStorage مع orgId
  const getStorageKey = (key) => {
    if (!orgId) return key; // للتوافق مع النظام القديم
    return `bero_${orgId}_${key.replace('bero_', '')}`;
  };

  // ==================== دوال النظام المتقدمة ====================
  
  // تسجيل العمليات (Audit Trail)
  const addAuditLog = (action, entityType, entityId, userId, details = {}) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      userId: userId || currentUser?.id || 'anonymous',
      details,
      ipAddress: details.ipAddress || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };
    
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveData('bero_audit_logs', updatedLogs);
    
    console.log(`[AUDIT] ${action} on ${entityType} ${entityId}:`, details);
  };
  
  // التحقق من الصلاحيات
  const checkPermission = (action, resource, userRole = currentUser?.role) => {
    if (!userRole) return false;
    
    // صلاحيات المدير (جميع الصلاحيات)
    if (userRole === USER_ROLES.ADMIN) return true;
    
    // تعريف صلاحيات الأدوار
    const rolePermissions = {
      [USER_ROLES.MANAGER]: [
        'view_returns', 'create_returns', 'update_returns', 'approve_returns',
        'reject_returns', 'view_audit_logs'
      ],
      [USER_ROLES.ACCOUNTANT]: [
        'view_returns', 'create_returns', 'update_returns', 'approve_returns',
        'reject_returns', 'view_treasury'
      ],
      [USER_ROLES.EMPLOYEE]: [
        'view_returns', 'create_returns', 'update_returns'
      ]
    };
    
    const permissions = rolePermissions[userRole] || [];
    const permission = `${action}_${resource}`;
    
    return permissions.includes(permission);
  };
  
  // التحقق من صحة حالة الانتقال
  const validateStatusTransition = (fromStatus, toStatus, userRole) => {
    const validTransitions = {
      [RETURN_STATUSES.DRAFT]: [RETURN_STATUSES.PENDING, RETURN_STATUSES.CANCELLED],
      [RETURN_STATUSES.PENDING]: [RETURN_STATUSES.APPROVED, RETURN_STATUSES.REJECTED],
      [RETURN_STATUSES.APPROVED]: [RETURN_STATUSES.COMPLETED, RETURN_STATUSES.CANCELLED],
      [RETURN_STATUSES.COMPLETED]: [], // لا يمكن تغيير الحالة من مكتمل
      [RETURN_STATUSES.CANCELLED]: [], // لا يمكن تغيير الحالة من ملغي
      [RETURN_STATUSES.REJECTED]: [RETURN_STATUSES.DRAFT, RETURN_STATUSES.CANCELLED]
    };
    
    const allowedTransitions = validTransitions[fromStatus] || [];
    
    if (!allowedTransitions.includes(toStatus)) {
      throw new Error(`لا يمكن تغيير الحالة من "${getStatusText(fromStatus)}" إلى "${getStatusText(toStatus)}"`);
    }
    
    // التحقق من الصلاحيات
    const permissionMap = {
      [RETURN_STATUSES.PENDING]: 'create_returns',
      [RETURN_STATUSES.APPROVED]: 'approve_returns',
      [RETURN_STATUSES.REJECTED]: 'reject_returns',
      [RETURN_STATUSES.COMPLETED]: 'approve_returns',
      [RETURN_STATUSES.CANCELLED]: 'update_returns'
    };
    
    const requiredPermission = permissionMap[toStatus];
    if (requiredPermission && !checkPermission(requiredPermission, 'returns', userRole)) {
      throw new Error(`ليس لديك صلاحية ${getPermissionText(requiredPermission)}`);
    }
    
    return true;
  };
  
  // تحويل رمز الحالة إلى نص
  const getStatusText = (status) => {
    const statusTexts = {
      [RETURN_STATUSES.DRAFT]: 'مسودة',
      [RETURN_STATUSES.PENDING]: 'معلق',
      [RETURN_STATUSES.APPROVED]: 'معتمد',
      [RETURN_STATUSES.COMPLETED]: 'مكتمل',
      [RETURN_STATUSES.CANCELLED]: 'ملغي',
      [RETURN_STATUSES.REJECTED]: 'مرفوض'
    };
    return statusTexts[status] || status;
  };
  
  // تحويل رمز الصلاحية إلى نص
  const getPermissionText = (permission) => {
    const permissionTexts = {
      'view_returns': 'عرض المرتجعات',
      'create_returns': 'إنشاء المرتجعات',
      'update_returns': 'تحديث المرتجعات',
      'approve_returns': 'اعتماد المرتجعات',
      'reject_returns': 'رفض المرتجعات',
      'view_audit_logs': 'عرض سجل التتبع',
      'view_treasury': 'عرض الخزينة'
    };
    return permissionTexts[permission] || permission;
  };
  
  // التحقق من صحة بيانات المرتجع
  const validateReturnData = (returnData, type) => {
    const errors = [];
    
    if (!returnData.invoiceId) {
      errors.push('يجب تحديد الفاتورة');
    }
    
    if (!returnData.items || !Array.isArray(returnData.items) || returnData.items.length === 0) {
      errors.push('يجب إضافة عناصر للمرتجع');
    }
    
    if (!returnData.reason || returnData.reason.trim().length < 5) {
      errors.push('يجب تحديد سبب الإرجاع (على الأقل 5 أحرف)');
    }
    
    // التحقق من العناصر
    if (returnData.items) {
      returnData.items.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`يجب تحديد المنتج في العنصر ${index + 1}`);
        }
        
        const mainQty = parseInt(item.quantity) || 0;
        const subQty = parseInt(item.subQuantity) || 0;
        
        if (mainQty < 0 || subQty < 0) {
          errors.push(`لا يمكن أن تكون الكمية سالبة في العنصر ${index + 1}`);
        }
        
        if (mainQty === 0 && subQty === 0) {
          errors.push(`يجب تحديد كمية في العنصر ${index + 1}`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // تحديث رصيد الخزينة
  const updateTreasuryBalance = (amount, type = 'add', source = {}) => {
    try {
      let newBalance;
      
      if (type === 'add') {
        newBalance = treasuryBalance + amount;
      } else {
        newBalance = treasuryBalance - amount;
        if (newBalance < 0) {
          throw new Error('الرصيد المتوفر في الخزينة غير كافٍ');
        }
      }
      
      setTreasuryBalance(newBalance);
      saveData('bero_treasury_balance', newBalance);
      
      // تسجيل العملية في سجل التتبع
      addAuditLog(
        'TREASURY_UPDATE',
        'treasury_balance',
        'global',
        currentUser?.id,
        {
          oldBalance: treasuryBalance,
          newBalance,
          amount,
          type,
          source
        }
      );
      
      return newBalance;
    } catch (error) {
      console.error('خطأ في تحديث رصيد الخزينة:', error);
      throw error;
    }
  };
  
  // إنشاء إيصال تلقائي للخزينة
  const createAutomaticReceipt = (returnData, type, approvedBy) => {
    try {
      const isPurchaseReturn = type === RETURN_TYPES.PURCHASE;
      const amount = returnData.totalAmount;
      const receiptData = {
        amount: parseFloat(amount),
        description: `إيصال تلقائي - ${isPurchaseReturn ? 'مرتجع مشتريات' : 'مرتجع مبيعات'}`,
        reference: `RETURN-${returnData.id}`,
        date: new Date().toISOString(),
        category: isPurchaseReturn ? 'مرتجع مشتريات' : 'مرتجع مبيعات',
        source: 'automatic',
        returnId: returnData.id,
        returnType: type,
        approvedBy,
        autoGenerated: true
      };
      
      if (isPurchaseReturn) {
        // مرتجع مشتريات = إضافة للخزينة
        receiptData.fromType = 'supplier';
        receiptData.fromId = returnData.supplierId;
        return addCashReceipt(receiptData);
      } else {
        // مرتجع مبيعات = خصم من الخزينة
        receiptData.toType = 'customer';
        receiptData.toId = returnData.customerId;
        return addCashDisbursement(receiptData);
      }
    } catch (error) {
      console.error('خطأ في إنشاء الإيصال التلقائي:', error);
      throw error;
    }
  };

  // تحميل البيانات من LocalStorage
  useEffect(() => {
    if (orgId) {
      loadAllData();
    }
  }, [orgId]);

  // تحميل جميع البيانات
  const loadAllData = () => {
    const loadData = (key, setter, defaultValue = []) => {
      const stored = localStorage.getItem(getStorageKey(key));
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (error) {
          console.error(`خطأ في تحميل ${key}:`, error);
          setter(defaultValue);
        }
      }
    };

    loadData('bero_warehouses', setWarehouses);
    loadData('bero_products', setProducts);
    loadData('bero_categories', setCategories);
    loadData('bero_purchases', setPurchases);
    loadData('bero_purchase_invoices', setPurchaseInvoices);
    loadData('bero_purchase_returns', setPurchaseReturns);
    loadData('bero_sales', setSales);
    loadData('bero_sales_invoices', setSalesInvoices);
    loadData('bero_sales_returns', setSalesReturns);
    loadData('bero_suppliers', setSuppliers);
    loadData('bero_customers', setCustomers);
    loadData('bero_treasury_balance', setTreasuryBalance, 0);
    loadData('bero_cash_receipts', setCashReceipts);
    loadData('bero_cash_disbursements', setCashDisbursements);
    loadData('bero_transfers', setTransfers);
    loadData('bero_audit_logs', setAuditLogs);
    loadData('bero_permissions', setPermissions);
    loadData('bero_current_user', setCurrentUser);
  };

  // حفض البيانات في LocalStorage
  const saveData = (key, data) => {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  };

  // ==================== دوال المخازن ====================
  
  const addWarehouse = (warehouse) => {
    const newWarehouse = { id: Date.now(), ...warehouse };
    const updated = [...warehouses, newWarehouse];
    setWarehouses(updated);
    saveData('bero_warehouses', updated);
    return newWarehouse;
  };

  const updateWarehouse = (id, updatedData) => {
    const updated = warehouses.map(w => w.id === id ? { ...w, ...updatedData } : w);
    setWarehouses(updated);
    saveData('bero_warehouses', updated);
  };

  const deleteWarehouse = (id) => {
    const updated = warehouses.filter(w => w.id !== id);
    setWarehouses(updated);
    saveData('bero_warehouses', updated);
  };

  // ==================== دوال الفئات ====================
  
  const addCategory = (category) => {
    const newCategory = { id: Date.now(), createdAt: new Date().toISOString(), ...category };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveData('bero_categories', updated);
    return newCategory;
  };

  const updateCategory = (id, updatedData) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCategories(updated);
    saveData('bero_categories', updated);
  };

  const deleteCategory = (id) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveData('bero_categories', updated);
  };

  // ==================== دوال المنتجات ====================
  
  const addProduct = (product) => {
    const newProduct = { id: Date.now(), ...product };
    const updated = [...products, newProduct];
    setProducts(updated);
    saveData('bero_products', updated);
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    setProducts(updated);
    saveData('bero_products', updated);
  };

  const deleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveData('bero_products', updated);
  };

  // ==================== دوال الموردين ====================
  
  const addSupplier = (supplier) => {
    const newSupplier = { id: Date.now(), ...supplier };
    const updated = [...suppliers, newSupplier];
    setSuppliers(updated);
    saveData('bero_suppliers', updated);
    return newSupplier;
  };

  const updateSupplier = (id, updatedData) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...updatedData } : s);
    setSuppliers(updated);
    saveData('bero_suppliers', updated);
  };

  const deleteSupplier = (id) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveData('bero_suppliers', updated);
  };

  // ==================== دوال العملاء ====================
  
  const addCustomer = (customer) => {
    const newCustomer = { id: Date.now(), ...customer };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    saveData('bero_customers', updated);
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    const updated = customers.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCustomers(updated);
    saveData('bero_customers', updated);
  };

  const deleteCustomer = (id) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveData('bero_customers', updated);
  };

  // ==================== دوال فواتير المشتريات ====================
  
  const addPurchaseInvoice = (invoice) => {
    // إثراء بيانات items بأسماء المنتجات
    const enrichedItems = invoice.items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId));
      return {
        ...item,
        productName: product?.name || item.productName || 'غير محدد'
      };
    });
    
    // ضمان وجود جميع بيانات الخصم
    const discountData = {
      discountType: invoice.discountType || 'percentage',
      discountValue: parseFloat(invoice.discountValue) || 0,
      discountAmount: parseFloat(invoice.discountAmount) || 0,
      subtotal: parseFloat(invoice.subtotal) || 0,
      total: parseFloat(invoice.total) || 0
    };

    const newInvoice = { 
      id: Date.now(), 
      date: new Date().toISOString(), 
      ...invoice,
      ...discountData, // إضافة بيانات الخصم بشكل صريح
      items: enrichedItems,
      supplierId: parseInt(invoice.supplierId) // تحويل إلى رقم
    };
    const updated = [...purchaseInvoices, newInvoice];
    setPurchaseInvoices(updated);
    saveData('bero_purchase_invoices', updated);
    
    // تحديث كميات المنتجات (مع الكمية الرئيسية والفرعية)
    if (invoice.items && Array.isArray(invoice.items)) {
      const updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // حساب الكميات بشكل منفصل (الرئيسية والفرعية)
          const mainQty = parseInt(item.quantity) || 0;
          const subQty = parseInt(item.subQuantity) || 0;
          
          // التحقق من الكميات السالبة
          if (mainQty < 0 || subQty < 0) {
            throw new Error(`الكمية لا يمكن أن تكون سالبة للمنتج: ${updatedProducts[productIndex].name}`);
          }
          
          // إضافة الكميات بشكل منفصل إلى المخزون
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + mainQty,
            subQuantity: (updatedProducts[productIndex].subQuantity || 0) + subQty
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    return newInvoice;
  };

  const updatePurchaseInvoice = (invoiceId, updatedData) => {
    // إيجاد الفاتورة القديمة
    const oldInvoice = purchaseInvoices.find(inv => inv.id === invoiceId);
    if (!oldInvoice) {
      throw new Error('الفاتورة غير موجودة');
    }

    // إعادة الكميات القديمة (عكس عملية الشراء القديمة) - مع الكمية الفرعية
    if (oldInvoice.items && Array.isArray(oldInvoice.items)) {
      const updatedProducts = [...products];
      
      oldInvoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // حساب الكمية الإجمالية القديمة (الرئيسية + الفرعية)
          const oldMainQty = parseInt(item.quantity) || 0;
          const oldSubQty = parseInt(item.subQuantity) || 0;
          const oldTotalQty = oldMainQty + oldSubQty;
          
          // إعادة الكمية للمخزون
          const newQuantity = (updatedProducts[productIndex].mainQuantity || 0) - oldTotalQty;
          
          // التحقق من عدم حدوث كميات سالبة
          if (newQuantity < 0) {
            throw new Error(`لا يمكن تحديث الفاتورة: الكمية المتوفرة غير كافية للمنتج ${updatedProducts[productIndex].name}`);
          }
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: newQuantity
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }

    // تحديث الفاتورة
    const updated = purchaseInvoices.map(inv => 
      inv.id === invoiceId ? { ...inv, ...updatedData } : inv
    );
    setPurchaseInvoices(updated);
    saveData('bero_purchase_invoices', updated);

    // إضافة الكميات الجديدة - مع الكمية الفرعية
    if (updatedData.items && Array.isArray(updatedData.items)) {
      const updatedProducts = [...products];
      
      updatedData.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // حساب الكمية الإجمالية الجديدة (الرئيسية + الفرعية)
          const newMainQty = parseInt(item.quantity) || 0;
          const newSubQty = parseInt(item.subQuantity) || 0;
          const newTotalQty = newMainQty + newSubQty;
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + newTotalQty
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
  };

  const deletePurchaseInvoice = (invoiceId) => {
    // إيجاد الفاتورة المراد حذفها
    const invoice = purchaseInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }
    
    // التحقق من عدم وجود مرتجعات مرتبطة
    const hasReturns = purchaseReturns.some(ret => ret.invoiceId === invoiceId);
    if (hasReturns) {
      throw new Error('لا يمكن حذف الفاتورة: توجد مرتجعات مرتبطة بها');
    }
    
    // إعادة الكميات من المخزون (عكس عملية الشراء) - مع الكمية الفرعية
    if (invoice.items && Array.isArray(invoice.items)) {
      const updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          // حساب الكمية الإجمالية (الرئيسية + الفرعية)
          const mainQty = parseInt(item.quantity) || 0;
          const subQty = parseInt(item.subQuantity) || 0;
          const totalQty = mainQty + subQty;
          
          // خصم الكمية من المخزون (عكس عملية الشراء)
          const newQuantity = (updatedProducts[productIndex].mainQuantity || 0) - totalQty;
          
          // التحقق من عدم حدوث كميات سالبة
          if (newQuantity < 0) {
            throw new Error(`لا يمكن حذف الفاتورة: سيؤدي ذلك إلى كمية سالبة للمنتج ${updatedProducts[productIndex].name}`);
          }
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: newQuantity
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // حذف الفاتورة
    const updated = purchaseInvoices.filter(inv => inv.id !== invoiceId);
    setPurchaseInvoices(updated);
    saveData('bero_purchase_invoices', updated);
  };

  // ==================== دوال مرتجعات المشتريات المتقدمة ====================
  
  const addPurchaseReturn = (returnData) => {
    try {
      // تم نقل فحص الصلاحيات إلى طبقة UI (PurchaseReturnModal.jsx)
      // يتم التحقق من الصلاحيات باستخدام hasPermission من AuthContext
      // هذا يضمن استخدام نظام صلاحيات موحد ومحدث
      
      // التحقق من صحة البيانات
      const validation = validateReturnData(returnData, RETURN_TYPES.PURCHASE);
      if (!validation.isValid) {
        throw new Error(`خطأ في البيانات: ${validation.errors.join(', ')}`);
      }
      
      const { invoiceId, items, reason, notes } = returnData;
      
      // التحقق من وجود الفاتورة
      const invoice = purchaseInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة');
      }
      
      // حساب إجمالي المبلغ المرتجع
      let totalAmount = 0;
      const enrichedItems = [];
      
      // التحقق من الكميات المرتجعة
      items.forEach(item => {
        // البحث عن المنتج في الفاتورة الأصلية
        const originalItem = invoice.items.find(i => i.productId === parseInt(item.productId));
        if (!originalItem) {
          throw new Error(`المنتج غير موجود في الفاتورة الأصلية`);
        }
        
        // حساب الكميات المرتجعة مسبقاً (فقط المرتجعات المعتمدة والمكتملة)
        const previousReturns = purchaseReturns.filter(ret => 
          ret.invoiceId === invoiceId && 
          [RETURN_STATUSES.APPROVED, RETURN_STATUSES.COMPLETED].includes(ret.status)
        );
        
        let totalReturnedQty = 0;
        previousReturns.forEach(ret => {
          const retItem = ret.items.find(i => i.productId === parseInt(item.productId));
          if (retItem) {
            totalReturnedQty += (retItem.quantity || 0) + (retItem.subQuantity || 0);
          }
        });
        
        // الكمية المتاحة للإرجاع
        const originalQty = (originalItem.quantity || 0) + (originalItem.subQuantity || 0);
        const returnQty = (item.quantity || 0) + (item.subQuantity || 0);
        const availableQty = originalQty - totalReturnedQty;
        
        if (returnQty > availableQty) {
          throw new Error(`الكمية المرتجعة تتجاوز الكمية المتاحة للمنتج`);
        }
        
        // حساب المبلغ المرتجع
        const itemAmount = (item.quantity || 0) * (originalItem.price || 0) +
                          (item.subQuantity || 0) * (originalItem.subPrice || 0);
        totalAmount += itemAmount;
        
        // إثراء بيانات العنصر
        const product = products.find(p => p.id === parseInt(item.productId));
        enrichedItems.push({
          ...item,
          productId: parseInt(item.productId),
          productName: product?.name || originalItem.productName || 'غير محدد',
          originalPrice: originalItem.price,
          originalSubPrice: originalItem.subPrice,
          amount: itemAmount
        });
      });
      
      // إنشاء سجل المرتجع الجديد
      const newReturn = {
        id: Date.now(),
        invoiceId,
        supplierId: invoice.supplierId,
        date: new Date().toISOString(),
        createdBy: currentUser?.id || 'anonymous',
        createdAt: new Date().toISOString(),
        items: enrichedItems,
        reason: reason.trim(),
        notes: notes?.trim() || '',
        totalAmount,
        status: RETURN_STATUSES.DRAFT, // الحالة الافتراضية: مسودة
        workflowHistory: [{
          id: Date.now(),
          action: 'created',
          fromStatus: null,
          toStatus: RETURN_STATUSES.DRAFT,
          userId: currentUser?.id || 'anonymous',
          timestamp: new Date().toISOString(),
          notes: 'تم إنشاء المرتجع'
        }],
        treasuryEffect: {
          type: 'add', // إضافة للخزينة عند الاعتماد
          amount: totalAmount
        },
        inventoryEffect: {
          type: 'deduct', // خصم من المخزون عند الاعتماد
          items: enrichedItems.map(item => ({
            productId: item.productId,
            mainQuantity: item.quantity || 0,
            subQuantity: item.subQuantity || 0
          }))
        },
        metadata: {
          version: 1,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous'
        }
      };
      
      // حفظ المرتجع
      const updatedReturns = [newReturn, ...purchaseReturns];
      setPurchaseReturns(updatedReturns);
      saveData('bero_purchase_returns', updatedReturns);
      
      // تسجيل العملية في سجل التتبع
      addAuditLog(
        'CREATE_PURCHASE_RETURN',
        'purchase_return',
        newReturn.id,
        currentUser?.id,
        {
          invoiceId,
          totalAmount,
          status: newReturn.status,
          itemsCount: enrichedItems.length
        }
      );
      
      console.log('تم إنشاء مرتجع مشتريات جديد:', newReturn);
      return newReturn;
      
    } catch (error) {
      console.error('خطأ في إضافة مرتجع مشتريات:', error);
      throw error;
    }
  };

  // تقديم مرتجع مشتريات للمراجعة
  const submitPurchaseReturn = (returnId, notes = '') => {
    try {
      const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.DRAFT) {
        throw new Error(`لا يمكن تقديم المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('update', 'returns')) {
        throw new Error('ليس لديك صلاحية تحديث المرتجعات');
      }
      
      // تحديث حالة المرتجع
      const updatedReturns = purchaseReturns.map(ret => 
        ret.id === returnId 
          ? {
              ...ret,
              status: RETURN_STATUSES.PENDING,
              submittedAt: new Date().toISOString(),
              submittedBy: currentUser?.id || 'anonymous',
              workflowHistory: [
                ...ret.workflowHistory,
                {
                  id: Date.now(),
                  action: 'submitted',
                  fromStatus: RETURN_STATUSES.DRAFT,
                  toStatus: RETURN_STATUSES.PENDING,
                  userId: currentUser?.id || 'anonymous',
                  timestamp: new Date().toISOString(),
                  notes: notes || 'تم تقديم المرتجع للمراجعة'
                }
              ],
              metadata: {
                ...ret.metadata,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser?.id || 'anonymous'
              }
            }
          : ret
      );
      
      setPurchaseReturns(updatedReturns);
      saveData('bero_purchase_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'SUBMIT_PURCHASE_RETURN',
        'purchase_return',
        returnId,
        currentUser?.id,
        { fromStatus: RETURN_STATUSES.DRAFT, toStatus: RETURN_STATUSES.PENDING, notes }
      );
      
      console.log(`تم تقديم مرتجع مشتريات ${returnId} للمراجعة`);
      return updatedReturns.find(ret => ret.id === returnId);
      
    } catch (error) {
      console.error('خطأ في تقديم مرتجع مشتريات:', error);
      throw error;
    }
  };

  // اعتماد مرتجع مشتريات
  const approvePurchaseReturn = (returnId, notes = '') => {
    try {
      const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.PENDING) {
        throw new Error(`لا يمكن اعتماد المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('approve', 'returns')) {
        throw new Error('ليس لديك صلاحية اعتماد المرتجعات');
      }
      
      // تحديث المخزون (خصم الكميات)
      const updatedProducts = [...products];
      
      returnRecord.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          const currentProduct = updatedProducts[productIndex];
          const mainQtyToDeduct = item.quantity || 0;
          const subQtyToDeduct = item.subQuantity || 0;
          
          const newMainQuantity = (currentProduct.mainQuantity || 0) - mainQtyToDeduct;
          const newSubQuantity = (currentProduct.subQuantity || 0) - subQtyToDeduct;
          
          if (newMainQuantity < 0) {
            throw new Error(`الكمية الأساسية المتوفرة في المخزون غير كافية للمنتج`);
          }
          
          if (newSubQuantity < 0 && subQtyToDeduct > 0) {
            throw new Error(`الكمية الفرعية المتوفرة في المخزون غير كافية للمنتج`);
          }
          
          updatedProducts[productIndex] = {
            ...currentProduct,
            mainQuantity: newMainQuantity,
            subQuantity: newSubQuantity
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
      
      // إنشاء إيصال تلقائي للخزينة
      const receipt = createAutomaticReceipt(returnRecord, RETURN_TYPES.PURCHASE, currentUser?.id);
      
      // تحديث حالة الفاتورة الأصلية
      const updatedInvoices = purchaseInvoices.map(inv => {
        if (inv.id === returnRecord.invoiceId) {
          return { ...inv, hasReturns: true };
        }
        return inv;
      });
      setPurchaseInvoices(updatedInvoices);
      saveData('bero_purchase_invoices', updatedInvoices);
      
      // تحديث حالة المرتجع
      const approvedReturn = {
        ...returnRecord,
        status: RETURN_STATUSES.APPROVED,
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.id || 'anonymous',
        approvedNotes: notes,
        receiptId: receipt?.id,
        workflowHistory: [
          ...returnRecord.workflowHistory,
          {
            id: Date.now(),
            action: 'approved',
            fromStatus: RETURN_STATUSES.PENDING,
            toStatus: RETURN_STATUSES.APPROVED,
            userId: currentUser?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            notes: notes || 'تم اعتماد المرتجع'
          }
        ],
        metadata: {
          ...returnRecord.metadata,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous'
        }
      };
      
      const updatedReturns = purchaseReturns.map(ret => 
        ret.id === returnId ? approvedReturn : ret
      );
      
      setPurchaseReturns(updatedReturns);
      saveData('bero_purchase_returns', updatedReturns);
      
      // تسجيل العمليات
      addAuditLog(
        'APPROVE_PURCHASE_RETURN',
        'purchase_return',
        returnId,
        currentUser?.id,
        { 
          fromStatus: RETURN_STATUSES.PENDING, 
          toStatus: RETURN_STATUSES.APPROVED, 
          notes,
          receiptId: receipt?.id,
          treasuryAmount: returnRecord.totalAmount
        }
      );
      
      addAuditLog(
        'INVENTORY_UPDATE',
        'inventory',
        'purchase_return_approval',
        currentUser?.id,
        { items: returnRecord.items, action: 'deduct' }
      );
      
      console.log(`تم اعتماد مرتجع مشتريات ${returnId}`);
      return approvedReturn;
      
    } catch (error) {
      console.error('خطأ في اعتماد مرتجع مشتريات:', error);
      throw error;
    }
  };

  // رفض مرتجع مشتريات
  const rejectPurchaseReturn = (returnId, reason) => {
    try {
      const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.PENDING) {
        throw new Error(`لا يمكن رفض المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('reject', 'returns')) {
        throw new Error('ليس لديك صلاحية رفض المرتجعات');
      }
      
      if (!reason || reason.trim().length < 10) {
        throw new Error('يجب إدخال سبب الرفض (على الأقل 10 أحرف)');
      }
      
      const updatedReturns = purchaseReturns.map(ret => 
        ret.id === returnId 
          ? {
              ...ret,
              status: RETURN_STATUSES.REJECTED,
              rejectedAt: new Date().toISOString(),
              rejectedBy: currentUser?.id || 'anonymous',
              rejectionReason: reason.trim(),
              workflowHistory: [
                ...ret.workflowHistory,
                {
                  id: Date.now(),
                  action: 'rejected',
                  fromStatus: RETURN_STATUSES.PENDING,
                  toStatus: RETURN_STATUSES.REJECTED,
                  userId: currentUser?.id || 'anonymous',
                  timestamp: new Date().toISOString(),
                  notes: `سبب الرفض: ${reason.trim()}`
                }
              ],
              metadata: {
                ...ret.metadata,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser?.id || 'anonymous'
              }
            }
          : ret
      );
      
      setPurchaseReturns(updatedReturns);
      saveData('bero_purchase_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'REJECT_PURCHASE_RETURN',
        'purchase_return',
        returnId,
        currentUser?.id,
        { 
          fromStatus: RETURN_STATUSES.PENDING, 
          toStatus: RETURN_STATUSES.REJECTED, 
          reason: reason.trim()
        }
      );
      
      console.log(`تم رفض مرتجع مشتريات ${returnId}`);
      return updatedReturns.find(ret => ret.id === returnId);
      
    } catch (error) {
      console.error('خطأ في رفض مرتجع مشتريات:', error);
      throw error;
    }
  };

  // تحديث حالة مرتجع مشتريات
  const updatePurchaseReturnStatus = (returnId, newStatus, notes = '', userRole) => {
    try {
      const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      const currentStatus = returnRecord.status;
      
      // التحقق من صحة الانتقال
      validateStatusTransition(currentStatus, newStatus, userRole || currentUser?.role);
      
      const updatedReturns = purchaseReturns.map(ret => 
        ret.id === returnId 
          ? {
              ...ret,
              status: newStatus,
              statusUpdatedAt: new Date().toISOString(),
              statusUpdatedBy: currentUser?.id || 'anonymous',
              statusNotes: notes,
              workflowHistory: [
                ...ret.workflowHistory,
                {
                  id: Date.now(),
                  action: 'status_changed',
                  fromStatus: currentStatus,
                  toStatus: newStatus,
                  userId: currentUser?.id || 'anonymous',
                  timestamp: new Date().toISOString(),
                  notes: notes || `تغيير الحالة من ${getStatusText(currentStatus)} إلى ${getStatusText(newStatus)}`
                }
              ],
              metadata: {
                ...ret.metadata,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser?.id || 'anonymous'
              }
            }
          : ret
      );
      
      setPurchaseReturns(updatedReturns);
      saveData('bero_purchase_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'UPDATE_PURCHASE_RETURN_STATUS',
        'purchase_return',
        returnId,
        currentUser?.id,
        { fromStatus: currentStatus, toStatus: newStatus, notes }
      );
      
      console.log(`تم تحديث حالة مرتجع مشتريات ${returnId} من ${getStatusText(currentStatus)} إلى ${getStatusText(newStatus)}`);
      return updatedReturns.find(ret => ret.id === returnId);
      
    } catch (error) {
      console.error('خطأ في تحديث حالة مرتجع مشتريات:', error);
      throw error;
    }
  };
  
  const deletePurchaseReturn = (returnId) => {
    // البحث عن المرتجع
    const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
    if (!returnRecord) {
      throw new Error('المرتجع غير موجود');
    }
    
    // إعادة الكميات المرتجعة للمخزون بفصل الكميات الأساسية والفرعية
    const updatedProducts = [...products];
    
    returnRecord.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
      if (productIndex !== -1) {
        const currentProduct = updatedProducts[productIndex];
        const mainQtyToAdd = item.quantity || 0;
        const subQtyToAdd = item.subQuantity || 0;
        
        updatedProducts[productIndex] = {
          ...currentProduct,
          mainQuantity: (currentProduct.mainQuantity || 0) + mainQtyToAdd,
          subQuantity: (currentProduct.subQuantity || 0) + subQtyToAdd
        };
      }
    });
    
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // حذف المرتجع
    const updatedReturns = purchaseReturns.filter(ret => ret.id !== returnId);
    setPurchaseReturns(updatedReturns);
    saveData('bero_purchase_returns', updatedReturns);
    
    // تحديث حالة hasReturns في الفاتورة إذا لم تعد هناك مرتجعات
    const invoiceId = returnRecord.invoiceId;
    const remainingReturns = updatedReturns.filter(ret => 
      ret.invoiceId === invoiceId && ret.status !== 'cancelled'
    );
    
    if (remainingReturns.length === 0) {
      const updatedInvoices = purchaseInvoices.map(inv => {
        if (inv.id === invoiceId) {
          return { ...inv, hasReturns: false };
        }
        return inv;
      });
      setPurchaseInvoices(updatedInvoices);
      saveData('bero_purchase_invoices', updatedInvoices);
    }
    
    // تحديث رصيد المورد (يتم حسابه ديناميكياً في getSupplierBalance)
  };

  // ==================== دوال فواتير المبيعات ====================
  
  const addSalesInvoice = (invoice) => {
    // التحقق من توفر الكميات قبل البيع
    if (invoice.items && Array.isArray(invoice.items)) {
      for (const item of invoice.items) {
        const product = products.find(p => p.id === parseInt(item.productId));
        if (!product) {
          throw new Error(`المنتج غير موجود`);
        }
        
        const requestedQty = parseInt(item.mainQuantity || 0) + parseInt(item.subQuantity || 0);
        const availableQty = product.mainQuantity || 0;
        
        if (requestedQty > availableQty) {
          throw new Error(
            `الكمية المتوفرة غير كافية للمنتج "${product.name}".\n` +
            `المتوفر: ${availableQty}، المطلوب: ${requestedQty}`
          );
        }
      }
    }
    
    // إثراء بيانات items بأسماء المنتجات
    const enrichedItems = invoice.items.map(item => {
      const product = products.find(p => p.id === parseInt(item.productId));
      return {
        ...item,
        productName: product?.name || item.productName || 'غير محدد'
      };
    });
    
    const newInvoice = { 
      id: Date.now(), 
      date: new Date().toISOString(), 
      ...invoice,
      items: enrichedItems,
      customerId: parseInt(invoice.customerId), // تحويل إلى رقم
      // حفظ بيانات الخصم بشكل صريح
      discountType: invoice.discountType || 'percentage',
      discountValue: invoice.discountValue || 0,
      discountAmount: invoice.discountAmount || 0,
      subtotal: invoice.subtotal || 0
    };
    const updated = [...salesInvoices, newInvoice];
    setSalesInvoices(updated);
    saveData('bero_sales_invoices', updated);
    
    // تحديث كميات المنتجات (خصم الكميات المباعة من المخزون)
    if (invoice.items && Array.isArray(invoice.items)) {
      const updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          const mainQty = parseInt(item.mainQuantity || 0);
          const subQty = parseInt(item.subQuantity || 0);
          const newQuantity = (updatedProducts[productIndex].mainQuantity || 0) - mainQty - subQty;
          
          // تأكيد نهائي لمنع الكميات السالبة
          if (newQuantity < 0) {
            throw new Error(
              `خطأ: الكمية أصبحت سالبة للمنتج ${updatedProducts[productIndex].name}`
            );
          }
          
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: newQuantity
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    return newInvoice;
  };
  
  const deleteSalesInvoice = (invoiceId) => {
    // إيجاد الفاتورة المراد حذفها
    const invoice = salesInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }
    
    // التحقق من عدم وجود مرتجعات مرتبطة
    const hasReturns = salesReturns.some(ret => ret.invoiceId === invoiceId);
    if (hasReturns) {
      throw new Error('لا يمكن حذف الفاتورة: توجد مرتجعات مرتبطة بها');
    }
    
    // إعادة الكميات إلى المخزون (عكس عملية البيع)
    if (invoice.items && Array.isArray(invoice.items)) {
      const updatedProducts = [...products];
      
      invoice.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            mainQuantity: (updatedProducts[productIndex].mainQuantity || 0) + parseInt(item.quantity)
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
    }
    
    // حذف الفاتورة
    const updated = salesInvoices.filter(inv => inv.id !== invoiceId);
    setSalesInvoices(updated);
    saveData('bero_sales_invoices', updated);
  };

  // ==================== دوال مرتجعات المبيعات المتقدمة ====================
  
  const addSalesReturn = (returnData) => {
    try {
      // التحقق من الصلاحيات
      if (!checkPermission('create', 'returns')) {
        throw new Error('ليس لديك صلاحية إنشاء مرتجعات مبيعات');
      }
      
      // التحقق من صحة البيانات
      const validation = validateReturnData(returnData, RETURN_TYPES.SALES);
      if (!validation.isValid) {
        throw new Error(`خطأ في البيانات: ${validation.errors.join(', ')}`);
      }
      
      const { invoiceId, items, reason, notes } = returnData;
      
      // التحقق من وجود الفاتورة
      const invoice = salesInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        throw new Error('الفاتورة غير موجودة');
      }
      
      // حساب إجمالي المبلغ المرتجع
      let totalAmount = 0;
      const enrichedItems = [];
      
      // التحقق من الكميات المرتجعة
      items.forEach(item => {
        // البحث عن المنتج في الفاتورة الأصلية
        const originalItem = invoice.items.find(i => i.productId === parseInt(item.productId));
        if (!originalItem) {
          throw new Error(`المنتج غير موجود في الفاتورة الأصلية`);
        }
        
        // حساب الكميات المرتجعة مسبقاً (فقط المرتجعات المعتمدة والمكتملة)
        const previousReturns = salesReturns.filter(ret => 
          ret.invoiceId === invoiceId && 
          [RETURN_STATUSES.APPROVED, RETURN_STATUSES.COMPLETED].includes(ret.status)
        );
        
        let totalReturnedQty = 0;
        previousReturns.forEach(ret => {
          const retItem = ret.items.find(i => i.productId === parseInt(item.productId));
          if (retItem) {
            totalReturnedQty += (retItem.quantity || 0) + (retItem.subQuantity || 0);
          }
        });
        
        // الكمية المتاحة للإرجاع
        const originalQty = (originalItem.quantity || 0) + (originalItem.subQuantity || 0);
        const returnQty = (item.quantity || 0) + (item.subQuantity || 0);
        const availableQty = originalQty - totalReturnedQty;
        
        if (returnQty > availableQty) {
          throw new Error(`الكمية المرتجعة تتجاوز الكمية المتاحة للمنتج`);
        }
        
        // حساب المبلغ المرتجع
        const itemAmount = (item.quantity || 0) * (originalItem.price || 0) +
                          (item.subQuantity || 0) * (originalItem.subPrice || 0);
        totalAmount += itemAmount;
        
        // إثراء بيانات العنصر
        const product = products.find(p => p.id === parseInt(item.productId));
        enrichedItems.push({
          ...item,
          productId: parseInt(item.productId),
          productName: product?.name || originalItem.productName || 'غير محدد',
          originalPrice: originalItem.price,
          originalSubPrice: originalItem.subPrice,
          amount: itemAmount
        });
      });
      
      // إنشاء سجل المرتجع الجديد
      const newReturn = {
        id: Date.now(),
        invoiceId,
        customerId: invoice.customerId,
        date: new Date().toISOString(),
        createdBy: currentUser?.id || 'anonymous',
        createdAt: new Date().toISOString(),
        items: enrichedItems,
        reason: reason.trim(),
        notes: notes?.trim() || '',
        totalAmount,
        status: RETURN_STATUSES.DRAFT, // الحالة الافتراضية: مسودة
        workflowHistory: [{
          id: Date.now(),
          action: 'created',
          fromStatus: null,
          toStatus: RETURN_STATUSES.DRAFT,
          userId: currentUser?.id || 'anonymous',
          timestamp: new Date().toISOString(),
          notes: 'تم إنشاء المرتجع'
        }],
        treasuryEffect: {
          type: 'deduct', // خصم من الخزينة عند الاعتماد
          amount: totalAmount
        },
        inventoryEffect: {
          type: 'add', // إضافة للمخزون عند الاعتماد
          items: enrichedItems.map(item => ({
            productId: item.productId,
            mainQuantity: item.quantity || 0,
            subQuantity: item.subQuantity || 0
          }))
        },
        metadata: {
          version: 1,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous'
        }
      };
      
      // حفظ المرتجع
      const updatedReturns = [newReturn, ...salesReturns];
      setSalesReturns(updatedReturns);
      saveData('bero_sales_returns', updatedReturns);
      
      // تسجيل العملية في سجل التتبع
      addAuditLog(
        'CREATE_SALES_RETURN',
        'sales_return',
        newReturn.id,
        currentUser?.id,
        {
          invoiceId,
          totalAmount,
          status: newReturn.status,
          itemsCount: enrichedItems.length
        }
      );
      
      console.log('تم إنشاء مرتجع مبيعات جديد:', newReturn);
      return newReturn;
      
    } catch (error) {
      console.error('خطأ في إضافة مرتجع مبيعات:', error);
      throw error;
    }
  };

  // تقديم مرتجع مبيعات للمراجعة
  const submitSalesReturn = (returnId, notes = '') => {
    try {
      const returnRecord = salesReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.DRAFT) {
        throw new Error(`لا يمكن تقديم المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('update', 'returns')) {
        throw new Error('ليس لديك صلاحية تحديث المرتجعات');
      }
      
      // تحديث حالة المرتجع
      const updatedReturns = salesReturns.map(ret => 
        ret.id === returnId 
          ? {
              ...ret,
              status: RETURN_STATUSES.PENDING,
              submittedAt: new Date().toISOString(),
              submittedBy: currentUser?.id || 'anonymous',
              workflowHistory: [
                ...ret.workflowHistory,
                {
                  id: Date.now(),
                  action: 'submitted',
                  fromStatus: RETURN_STATUSES.DRAFT,
                  toStatus: RETURN_STATUSES.PENDING,
                  userId: currentUser?.id || 'anonymous',
                  timestamp: new Date().toISOString(),
                  notes: notes || 'تم تقديم المرتجع للمراجعة'
                }
              ],
              metadata: {
                ...ret.metadata,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser?.id || 'anonymous'
              }
            }
          : ret
      );
      
      setSalesReturns(updatedReturns);
      saveData('bero_sales_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'SUBMIT_SALES_RETURN',
        'sales_return',
        returnId,
        currentUser?.id,
        { fromStatus: RETURN_STATUSES.DRAFT, toStatus: RETURN_STATUSES.PENDING, notes }
      );
      
      console.log(`تم تقديم مرتجع مبيعات ${returnId} للمراجعة`);
      return updatedReturns.find(ret => ret.id === returnId);
      
    } catch (error) {
      console.error('خطأ في تقديم مرتجع مبيعات:', error);
      throw error;
    }
  };

  // اعتماد مرتجع مبيعات
  const approveSalesReturn = (returnId, notes = '') => {
    try {
      const returnRecord = salesReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.PENDING) {
        throw new Error(`لا يمكن اعتماد المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('approve', 'returns')) {
        throw new Error('ليس لديك صلاحية اعتماد المرتجعات');
      }
      
      // تحديث المخزون (إضافة الكميات)
      const updatedProducts = [...products];
      
      returnRecord.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
        if (productIndex !== -1) {
          const currentProduct = updatedProducts[productIndex];
          const mainQtyToAdd = item.quantity || 0;
          const subQtyToAdd = item.subQuantity || 0;
          
          updatedProducts[productIndex] = {
            ...currentProduct,
            mainQuantity: (currentProduct.mainQuantity || 0) + mainQtyToAdd,
            subQuantity: (currentProduct.subQuantity || 0) + subQtyToAdd
          };
        }
      });
      
      setProducts(updatedProducts);
      saveData('bero_products', updatedProducts);
      
      // إنشاء إيصال تلقائي للخزينة
      const receipt = createAutomaticReceipt(returnRecord, RETURN_TYPES.SALES, currentUser?.id);
      
      // تحديث حالة الفاتورة الأصلية
      const updatedInvoices = salesInvoices.map(inv => {
        if (inv.id === returnRecord.invoiceId) {
          return { ...inv, hasReturns: true };
        }
        return inv;
      });
      setSalesInvoices(updatedInvoices);
      saveData('bero_sales_invoices', updatedInvoices);
      
      // تحديث حالة المرتجع
      const approvedReturn = {
        ...returnRecord,
        status: RETURN_STATUSES.APPROVED,
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.id || 'anonymous',
        approvedNotes: notes,
        receiptId: receipt?.id,
        workflowHistory: [
          ...returnRecord.workflowHistory,
          {
            id: Date.now(),
            action: 'approved',
            fromStatus: RETURN_STATUSES.PENDING,
            toStatus: RETURN_STATUSES.APPROVED,
            userId: currentUser?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            notes: notes || 'تم اعتماد المرتجع'
          }
        ],
        metadata: {
          ...returnRecord.metadata,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous'
        }
      };
      
      const updatedReturns = salesReturns.map(ret => 
        ret.id === returnId ? approvedReturn : ret
      );
      
      setSalesReturns(updatedReturns);
      saveData('bero_sales_returns', updatedReturns);
      
      // تسجيل العمليات
      addAuditLog(
        'APPROVE_SALES_RETURN',
        'sales_return',
        returnId,
        currentUser?.id,
        { 
          fromStatus: RETURN_STATUSES.PENDING, 
          toStatus: RETURN_STATUSES.APPROVED, 
          notes,
          receiptId: receipt?.id,
          treasuryAmount: returnRecord.totalAmount
        }
      );
      
      addAuditLog(
        'INVENTORY_UPDATE',
        'inventory',
        'sales_return_approval',
        currentUser?.id,
        { items: returnRecord.items, action: 'add' }
      );
      
      console.log(`تم اعتماد مرتجع مبيعات ${returnId}`);
      return approvedReturn;
      
    } catch (error) {
      console.error('خطأ في اعتماد مرتجع مبيعات:', error);
      throw error;
    }
  };

  // رفض مرتجع مبيعات
  const rejectSalesReturn = (returnId, reason) => {
    try {
      const returnRecord = salesReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.PENDING) {
        throw new Error(`لا يمكن رفض المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('reject', 'returns')) {
        throw new Error('ليس لديك صلاحية رفض المرتجعات');
      }
      
      if (!reason || reason.trim().length < 10) {
        throw new Error('يجب إدخال سبب الرفض (على الأقل 10 أحرف)');
      }
      
      const updatedReturns = salesReturns.map(ret => 
        ret.id === returnId 
          ? {
              ...ret,
              status: RETURN_STATUSES.REJECTED,
              rejectedAt: new Date().toISOString(),
              rejectedBy: currentUser?.id || 'anonymous',
              rejectionReason: reason.trim(),
              workflowHistory: [
                ...ret.workflowHistory,
                {
                  id: Date.now(),
                  action: 'rejected',
                  fromStatus: RETURN_STATUSES.PENDING,
                  toStatus: RETURN_STATUSES.REJECTED,
                  userId: currentUser?.id || 'anonymous',
                  timestamp: new Date().toISOString(),
                  notes: `سبب الرفض: ${reason.trim()}`
                }
              ],
              metadata: {
                ...ret.metadata,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser?.id || 'anonymous'
              }
            }
          : ret
      );
      
      setSalesReturns(updatedReturns);
      saveData('bero_sales_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'REJECT_SALES_RETURN',
        'sales_return',
        returnId,
        currentUser?.id,
        { 
          fromStatus: RETURN_STATUSES.PENDING, 
          toStatus: RETURN_STATUSES.REJECTED, 
          reason: reason.trim()
        }
      );
      
      console.log(`تم رفض مرتجع مبيعات ${returnId}`);
      return updatedReturns.find(ret => ret.id === returnId);
      
    } catch (error) {
      console.error('خطأ في رفض مرتجع مبيعات:', error);
      throw error;
    }
  };

  // تحديث حالة مرتجع مبيعات
  const updateSalesReturnStatus = (returnId, newStatus, notes = '', userRole) => {
    try {
      const returnRecord = salesReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      const currentStatus = returnRecord.status;
      
      // التحقق من صحة الانتقال
      validateStatusTransition(currentStatus, newStatus, userRole || currentUser?.role);
      
      const updatedReturns = salesReturns.map(ret => 
        ret.id === returnId 
          ? {
              ...ret,
              status: newStatus,
              statusUpdatedAt: new Date().toISOString(),
              statusUpdatedBy: currentUser?.id || 'anonymous',
              statusNotes: notes,
              workflowHistory: [
                ...ret.workflowHistory,
                {
                  id: Date.now(),
                  action: 'status_changed',
                  fromStatus: currentStatus,
                  toStatus: newStatus,
                  userId: currentUser?.id || 'anonymous',
                  timestamp: new Date().toISOString(),
                  notes: notes || `تغيير الحالة من ${getStatusText(currentStatus)} إلى ${getStatusText(newStatus)}`
                }
              ],
              metadata: {
                ...ret.metadata,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser?.id || 'anonymous'
              }
            }
          : ret
      );
      
      setSalesReturns(updatedReturns);
      saveData('bero_sales_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'UPDATE_SALES_RETURN_STATUS',
        'sales_return',
        returnId,
        currentUser?.id,
        { fromStatus: currentStatus, toStatus: newStatus, notes }
      );
      
      console.log(`تم تحديث حالة مرتجع مبيعات ${returnId} من ${getStatusText(currentStatus)} إلى ${getStatusText(newStatus)}`);
      return updatedReturns.find(ret => ret.id === returnId);
      
    } catch (error) {
      console.error('خطأ في تحديث حالة مرتجع مبيعات:', error);
      throw error;
    }
  };

  // إكمال مرتجع مشتريات
  const completePurchaseReturn = (returnId, notes = '') => {
    try {
      const returnRecord = purchaseReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.APPROVED) {
        throw new Error(`لا يمكن إكمال المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('update', 'returns')) {
        throw new Error('ليس لديك صلاحية تحديث المرتجعات');
      }
      
      const completedReturn = {
        ...returnRecord,
        status: RETURN_STATUSES.COMPLETED,
        completedAt: new Date().toISOString(),
        completedBy: currentUser?.id || 'anonymous',
        completionNotes: notes,
        workflowHistory: [
          ...returnRecord.workflowHistory,
          {
            id: Date.now(),
            action: 'completed',
            fromStatus: RETURN_STATUSES.APPROVED,
            toStatus: RETURN_STATUSES.COMPLETED,
            userId: currentUser?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            notes: notes || 'تم إكمال المرتجع'
          }
        ],
        metadata: {
          ...returnRecord.metadata,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous',
          version: (returnRecord.metadata?.version || 1) + 1
        }
      };
      
      const updatedReturns = purchaseReturns.map(ret => 
        ret.id === returnId ? completedReturn : ret
      );
      
      setPurchaseReturns(updatedReturns);
      saveData('bero_purchase_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'COMPLETE_PURCHASE_RETURN',
        'purchase_return',
        returnId,
        currentUser?.id,
        { 
          fromStatus: RETURN_STATUSES.APPROVED, 
          toStatus: RETURN_STATUSES.COMPLETED, 
          notes,
          totalAmount: returnRecord.totalAmount
        }
      );
      
      console.log(`تم إكمال مرتجع مشتريات ${returnId}`);
      return completedReturn;
      
    } catch (error) {
      console.error('خطأ في إكمال مرتجع مشتريات:', error);
      throw error;
    }
  };

  // إكمال مرتجع مبيعات
  const completeSalesReturn = (returnId, notes = '') => {
    try {
      const returnRecord = salesReturns.find(ret => ret.id === returnId);
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (returnRecord.status !== RETURN_STATUSES.APPROVED) {
        throw new Error(`لا يمكن إكمال المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('update', 'returns')) {
        throw new Error('ليس لديك صلاحية تحديث المرتجعات');
      }
      
      const completedReturn = {
        ...returnRecord,
        status: RETURN_STATUSES.COMPLETED,
        completedAt: new Date().toISOString(),
        completedBy: currentUser?.id || 'anonymous',
        completionNotes: notes,
        workflowHistory: [
          ...returnRecord.workflowHistory,
          {
            id: Date.now(),
            action: 'completed',
            fromStatus: RETURN_STATUSES.APPROVED,
            toStatus: RETURN_STATUSES.COMPLETED,
            userId: currentUser?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            notes: notes || 'تم إكمال المرتجع'
          }
        ],
        metadata: {
          ...returnRecord.metadata,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous',
          version: (returnRecord.metadata?.version || 1) + 1
        }
      };
      
      const updatedReturns = salesReturns.map(ret => 
        ret.id === returnId ? completedReturn : ret
      );
      
      setSalesReturns(updatedReturns);
      saveData('bero_sales_returns', updatedReturns);
      
      // تسجيل العملية
      addAuditLog(
        'COMPLETE_SALES_RETURN',
        'sales_return',
        returnId,
        currentUser?.id,
        { 
          fromStatus: RETURN_STATUSES.APPROVED, 
          toStatus: RETURN_STATUSES.COMPLETED, 
          notes,
          totalAmount: returnRecord.totalAmount
        }
      );
      
      console.log(`تم إكمال مرتجع مبيعات ${returnId}`);
      return completedReturn;
      
    } catch (error) {
      console.error('خطأ في إكمال مرتجع مبيعات:', error);
      throw error;
    }
  };

  // إلغاء مرتجع
  const cancelReturn = (returnId, type, reason) => {
    try {
      if (!reason || reason.trim().length < 10) {
        throw new Error('يجب إدخال سبب الإلغاء (على الأقل 10 أحرف)');
      }
      
      let returnRecord, updatedReturns, setReturnsFunc, saveKey;
      
      if (type === RETURN_TYPES.PURCHASE) {
        returnRecord = purchaseReturns.find(ret => ret.id === returnId);
        setReturnsFunc = setPurchaseReturns;
        saveKey = 'bero_purchase_returns';
      } else {
        returnRecord = salesReturns.find(ret => ret.id === returnId);
        setReturnsFunc = setSalesReturns;
        saveKey = 'bero_sales_returns';
      }
      
      if (!returnRecord) {
        throw new Error('المرتجع غير موجود');
      }
      
      if (![RETURN_STATUSES.DRAFT, RETURN_STATUSES.PENDING, RETURN_STATUSES.APPROVED].includes(returnRecord.status)) {
        throw new Error(`لا يمكن إلغاء المرتجع في الحالة الحالية: ${getStatusText(returnRecord.status)}`);
      }
      
      if (!checkPermission('update', 'returns')) {
        throw new Error('ليس لديك صلاحية تحديث المرتجعات');
      }
      
      // إذا كان المرتجع معتمد، نحتاج إلى عكس العمليات
      if (returnRecord.status === RETURN_STATUSES.APPROVED) {
        // عكس عمليات المخزون
        const updatedProducts = [...products];
        returnRecord.items.forEach(item => {
          const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
          if (productIndex !== -1) {
            const currentProduct = updatedProducts[productIndex];
            const mainQty = item.quantity || 0;
            const subQty = item.subQuantity || 0;
            
            if (type === RETURN_TYPES.PURCHASE) {
              // عكس خصم مرتجع مشتريات = إضافة للمخزون
              updatedProducts[productIndex] = {
                ...currentProduct,
                mainQuantity: (currentProduct.mainQuantity || 0) + mainQty,
                subQuantity: (currentProduct.subQuantity || 0) + subQty
              };
            } else {
              // عكس إضافة مرتجع مبيعات = خصم من المخزون
              const newMainQuantity = (currentProduct.mainQuantity || 0) - mainQty;
              const newSubQuantity = (currentProduct.subQuantity || 0) - subQty;
              
              if (newMainQuantity < 0 || newSubQuantity < 0) {
                throw new Error(`لا يمكن إلغاء المرتجع: سيؤدي إلى كمية سالبة في المخزون`);
              }
              
              updatedProducts[productIndex] = {
                ...currentProduct,
                mainQuantity: newMainQuantity,
                subQuantity: newSubQuantity
              };
            }
          }
        });
        
        setProducts(updatedProducts);
        saveData('bero_products', updatedProducts);
        
        // عكس عمليات الخزينة
        if (returnRecord.receiptId) {
          try {
            const receipt = cashReceipts.find(r => r.id === returnRecord.receiptId) || 
                           cashDisbursements.find(r => r.id === returnRecord.receiptId);
            if (receipt) {
              if (type === RETURN_TYPES.PURCHASE) {
                // عكس إضافة مرتجع مشتريات = خصم من الخزينة
                updateTreasuryBalance(returnRecord.totalAmount, 'subtract', { 
                  type: 'purchase_return_cancellation',
                  returnId: returnId 
                });
              } else {
                // عكس خصم مرتجع مبيعات = إضافة للخزينة
                updateTreasuryBalance(returnRecord.totalAmount, 'add', { 
                  type: 'sales_return_cancellation',
                  returnId: returnId 
                });
              }
            }
          } catch (treasuryError) {
            console.warn('تحذير: لم يتم عكس عملية الخزينة:', treasuryError);
          }
        }
      }
      
      const cancelledReturn = {
        ...returnRecord,
        status: RETURN_STATUSES.CANCELLED,
        cancelledAt: new Date().toISOString(),
        cancelledBy: currentUser?.id || 'anonymous',
        cancellationReason: reason.trim(),
        workflowHistory: [
          ...returnRecord.workflowHistory,
          {
            id: Date.now(),
            action: 'cancelled',
            fromStatus: returnRecord.status,
            toStatus: RETURN_STATUSES.CANCELLED,
            userId: currentUser?.id || 'anonymous',
            timestamp: new Date().toISOString(),
            notes: `سبب الإلغاء: ${reason.trim()}`
          }
        ],
        metadata: {
          ...returnRecord.metadata,
          lastModified: new Date().toISOString(),
          lastModifiedBy: currentUser?.id || 'anonymous'
        }
      };
      
      const newReturns = returnRecord ? [cancelledReturn, ...purchaseReturns.filter(ret => ret.id !== returnId)] : purchaseReturns;
      if (type === RETURN_TYPES.SALES) {
        newReturns = [cancelledReturn, ...salesReturns.filter(ret => ret.id !== returnId)];
      }
      
      setReturnsFunc(newReturns);
      saveData(saveKey, newReturns);
      
      // تسجيل العملية
      addAuditLog(
        'CANCEL_RETURN',
        `${type}_return`,
        returnId,
        currentUser?.id,
        { 
          fromStatus: returnRecord.status, 
          toStatus: RETURN_STATUSES.CANCELLED, 
          reason: reason.trim(),
          hadInventoryEffect: returnRecord.status === RETURN_STATUSES.APPROVED
        }
      );
      
      console.log(`تم إلغاء مرتجع ${type} ${returnId}`);
      return cancelledReturn;
      
    } catch (error) {
      console.error(`خطأ في إلغاء مرتجع ${type}:`, error);
      throw error;
    }
  };
  
  const deleteSalesReturn = (returnId) => {
    // البحث عن المرتجع
    const returnRecord = salesReturns.find(ret => ret.id === returnId);
    if (!returnRecord) {
      throw new Error('المرتجع غير موجود');
    }
    
    // خصم الكميات المرتجعة من المخزون (لأن الإرجاع كان قد أضافها)
    const updatedProducts = [...products];
    
    returnRecord.items.forEach(item => {
      const productIndex = updatedProducts.findIndex(p => p.id === parseInt(item.productId));
      if (productIndex !== -1) {
        const currentProduct = updatedProducts[productIndex];
        const mainQtyToDeduct = item.quantity || 0;
        const subQtyToDeduct = item.subQuantity || 0;
        
        const newMainQuantity = (currentProduct.mainQuantity || 0) - mainQtyToDeduct;
        const newSubQuantity = (currentProduct.subQuantity || 0) - subQtyToDeduct;
        
        if (newMainQuantity < 0) {
          throw new Error(`الكمية الأساسية المتوفرة في المخزون غير كافية للمنتج`);
        }
        
        if (newSubQuantity < 0 && subQtyToDeduct > 0) {
          throw new Error(`الكمية الفرعية المتوفرة في المخزون غير كافية للمنتج`);
        }
        
        updatedProducts[productIndex] = {
          ...currentProduct,
          mainQuantity: newMainQuantity,
          subQuantity: newSubQuantity
        };
      }
    });
    
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // حذف المرتجع
    const updated = salesReturns.filter(ret => ret.id !== returnId);
    setSalesReturns(updated);
    saveData('bero_sales_returns', updated);
  };

  // ==================== دوال الخزينة الشاملة ====================
  
  // إضافة إيصال استلام نقدي
  const addCashReceipt = (receiptData) => {
    const newReceipt = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...receiptData,
      type: 'receipt', // receipt
      status: 'completed' // completed, pending, cancelled
    };
    
    const updatedReceipts = [newReceipt, ...cashReceipts];
    setCashReceipts(updatedReceipts);
    saveData('bero_cash_receipts', updatedReceipts);
    
    // تحديث رصيد الخزينة (إضافة)
    const newBalance = treasuryBalance + parseFloat(receiptData.amount);
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    return newReceipt;
  };
  
  // تحديث إيصال استلام نقدي
  const updateCashReceipt = (id, updatedData) => {
    const oldReceipt = cashReceipts.find(r => r.id === id);
    if (!oldReceipt) {
      throw new Error('الإيصال غير موجود');
    }
    
    // إعادة المبلغ القديم
    let newBalance = treasuryBalance - parseFloat(oldReceipt.amount);
    // إضافة المبلغ الجديد
    newBalance += parseFloat(updatedData.amount || oldReceipt.amount);
    
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashReceipts.map(r => 
      r.id === id ? { ...r, ...updatedData } : r
    );
    setCashReceipts(updated);
    saveData('bero_cash_receipts', updated);
  };
  
  // حذف إيصال استلام نقدي
  const deleteCashReceipt = (id) => {
    const receipt = cashReceipts.find(r => r.id === id);
    if (!receipt) {
      throw new Error('الإيصال غير موجود');
    }
    
    // إعادة المبلغ من الخزينة
    const newBalance = treasuryBalance - parseFloat(receipt.amount);
    
    if (newBalance < 0) {
      throw new Error('لا يمكن حذف الإيصال: سيؤدي ذلك إلى رصيد سالب في الخزينة');
    }
    
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashReceipts.filter(r => r.id !== id);
    setCashReceipts(updated);
    saveData('bero_cash_receipts', updated);
  };
  
  // إضافة إيصال صرف نقدي
  const addCashDisbursement = (disbursementData) => {
    // التحقق من الرصيد الكافي
    if (treasuryBalance < parseFloat(disbursementData.amount)) {
      throw new Error('الرصيد المتوفر في الخزينة غير كافٍ');
    }
    
    const newDisbursement = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...disbursementData,
      type: 'disbursement', // disbursement
      status: 'completed' // completed, pending, cancelled
    };
    
    const updatedDisbursements = [newDisbursement, ...cashDisbursements];
    setCashDisbursements(updatedDisbursements);
    saveData('bero_cash_disbursements', updatedDisbursements);
    
    // تحديث رصيد الخزينة (خصم)
    const newBalance = treasuryBalance - parseFloat(disbursementData.amount);
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    return newDisbursement;
  };
  
  // تحديث إيصال صرف نقدي
  const updateCashDisbursement = (id, updatedData) => {
    const oldDisbursement = cashDisbursements.find(d => d.id === id);
    if (!oldDisbursement) {
      throw new Error('الإيصال غير موجود');
    }
    
    // إعادة المبلغ القديم للخزينة
    let newBalance = treasuryBalance + parseFloat(oldDisbursement.amount);
    // خصم المبلغ الجديد
    const newAmount = parseFloat(updatedData.amount || oldDisbursement.amount);
    newBalance -= newAmount;
    
    if (newBalance < 0) {
      throw new Error('الرصيد المتوفر في الخزينة غير كافٍ للتحديث');
    }
    
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashDisbursements.map(d => 
      d.id === id ? { ...d, ...updatedData } : d
    );
    setCashDisbursements(updated);
    saveData('bero_cash_disbursements', updated);
  };
  
  // حذف إيصال صرف نقدي
  const deleteCashDisbursement = (id) => {
    const disbursement = cashDisbursements.find(d => d.id === id);
    if (!disbursement) {
      throw new Error('الإيصال غير موجود');
    }
    
    // إعادة المبلغ للخزينة
    const newBalance = treasuryBalance + parseFloat(disbursement.amount);
    setTreasuryBalance(newBalance);
    saveData('bero_treasury_balance', newBalance);
    
    const updated = cashDisbursements.filter(d => d.id !== id);
    setCashDisbursements(updated);
    saveData('bero_cash_disbursements', updated);
  };
  
  // حساب رصيد عميل معين
  const getCustomerBalance = (customerId) => {
    let balance = 0;
    
    // المبيعات (دين على العميل)
    salesInvoices.forEach(invoice => {
      if (invoice.customerId === customerId) {
        balance += parseFloat(invoice.total || 0);
      }
    });
    
    // المرتجعات (تخفض من دين العميل)
    salesReturns.forEach(returnRecord => {
      const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
      if (invoice && invoice.customerId === customerId) {
        balance -= parseFloat(returnRecord.totalAmount || 0);
      }
    });
    
    // الاستلامات من العميل (تخفض من دين العميل)
    cashReceipts.forEach(receipt => {
      if (receipt.fromType === 'customer' && receipt.fromId === customerId) {
        balance -= parseFloat(receipt.amount || 0);
      }
    });
    
    return balance;
  };
  
  // حساب رصيد مورد معين
  const getSupplierBalance = (supplierId) => {
    let balance = 0;
    
    // المشتريات (دين علينا للمورد)
    purchaseInvoices.forEach(invoice => {
      if (invoice.supplierId === supplierId) {
        balance += parseFloat(invoice.total || 0);
      }
    });
    
    // المرتجعات (تخفض من ديوننا للمورد)
    purchaseReturns.forEach(returnRecord => {
      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
      if (invoice && invoice.supplierId === supplierId) {
        balance -= parseFloat(returnRecord.totalAmount || 0);
      }
    });
    
    // الصرف للمورد (تخفض من ديوننا للمورد)
    cashDisbursements.forEach(disbursement => {
      if (disbursement.toType === 'supplier' && disbursement.toId === supplierId) {
        balance -= parseFloat(disbursement.amount || 0);
      }
    });
    
    return balance;
  };
  
  // الحصول على جميع أرصدة العملاء
  const getAllCustomerBalances = () => {
    return customers.map(customer => ({
      ...customer,
      balance: getCustomerBalance(customer.id)
    })).filter(c => c.balance !== 0); // عرض فقط من لديهم رصيد
  };
  
  // الحصول على جميع أرصدة الموردين
  const getAllSupplierBalances = () => {
    return suppliers.map(supplier => ({
      ...supplier,
      balance: getSupplierBalance(supplier.id)
    })).filter(s => s.balance !== 0); // عرض فقط من لديهم رصيد
  };

  // ==================== دوال التحويلات بين المخازن ====================
  
  const transferProduct = (transferData) => {
    const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = transferData;
    
    // البحث عن المنتج في المخزن المصدر
    const sourceProduct = products.find(
      p => p.id === productId && p.warehouseId === fromWarehouseId
    );
    
    if (!sourceProduct) {
      throw new Error('المنتج غير موجود في المخزن المصدر');
    }
    
    if (sourceProduct.mainQuantity < quantity) {
      throw new Error('الكمية المتوفرة غير كافية');
    }
    
    // البحث عن نفس المنتج في المخزن المستهدف
    const targetProduct = products.find(
      p => p.name === sourceProduct.name && 
           p.category === sourceProduct.category && 
           p.warehouseId === toWarehouseId
    );
    
    let updatedProducts;
    
    if (targetProduct) {
      // المنتج موجود في المخزن المستهدف - نزيد الكمية
      updatedProducts = products.map(p => {
        if (p.id === sourceProduct.id) {
          return { ...p, mainQuantity: p.mainQuantity - quantity };
        }
        if (p.id === targetProduct.id) {
          return { ...p, mainQuantity: p.mainQuantity + quantity };
        }
        return p;
      });
    } else {
      // المنتج غير موجود في المخزن المستهدف - ننشئ منتج جديد
      const newProduct = {
        ...sourceProduct,
        id: Date.now(),
        warehouseId: toWarehouseId,
        mainQuantity: quantity,
        createdAt: new Date().toISOString()
      };
      
      updatedProducts = products.map(p => 
        p.id === sourceProduct.id 
          ? { ...p, mainQuantity: p.mainQuantity - quantity }
          : p
      );
      updatedProducts.push(newProduct);
    }
    
    // حذف المنتجات ذات الكمية صفر
    updatedProducts = updatedProducts.filter(p => p.mainQuantity > 0);
    
    setProducts(updatedProducts);
    saveData('bero_products', updatedProducts);
    
    // حفظ سجل التحويل
    const newTransfer = {
      id: Date.now(),
      date: new Date().toISOString(),
      productId,
      productName: sourceProduct.name,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      notes
    };
    
    const updatedTransfers = [newTransfer, ...transfers];
    setTransfers(updatedTransfers);
    saveData('bero_transfers', updatedTransfers);
    
    return newTransfer;
  };

  const value = {
    // البيانات الأساسية
    warehouses,
    products,
    categories,
    purchases,
    purchaseInvoices,
    purchaseReturns,
    sales,
    salesInvoices,
    salesReturns,
    suppliers,
    customers,
    treasuryBalance,
    cashReceipts,
    cashDisbursements,
    transfers,
    auditLogs,
    permissions,
    currentUser,
    
    // ثوابت النظام
    RETURN_STATUSES,
    RETURN_TYPES,
    USER_ROLES,
    
    // دوال إدارة المخازن
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
    
    // دوال إدارة الفئات
    addCategory,
    updateCategory,
    deleteCategory,
    
    // دوال إدارة المنتجات
    addProduct,
    updateProduct,
    deleteProduct,
    
    // دوال إدارة الموردين
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    // دوال إدارة العملاء
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // دوال فواتير المشتريات
    addPurchaseInvoice,
    updatePurchaseInvoice,
    deletePurchaseInvoice,
    
    // دوال مرتجعات المشتريات الأساسية
    addPurchaseReturn,
    deletePurchaseReturn,
    
    // دوال مرتجعات المشتريات المتقدمة
    submitPurchaseReturn,
    approvePurchaseReturn,
    rejectPurchaseReturn,
    updatePurchaseReturnStatus,
    completePurchaseReturn,
    
    // دوال فواتير المبيعات
    addSalesInvoice,
    deleteSalesInvoice,
    
    // دوال مرتجعات المبيعات الأساسية
    addSalesReturn,
    deleteSalesReturn,
    
    // دوال مرتجعات المبيعات المتقدمة
    submitSalesReturn,
    approveSalesReturn,
    rejectSalesReturn,
    updateSalesReturnStatus,
    completeSalesReturn,
    
    // دوال إلغاء المرتجعات
    cancelReturn,
    
    // دوال الخزينة
    addCashReceipt,
    updateCashReceipt,
    deleteCashReceipt,
    addCashDisbursement,
    updateCashDisbursement,
    deleteCashDisbursement,
    updateTreasuryBalance,
    createAutomaticReceipt,
    
    // دوال حسابات العملاء والموردين
    getCustomerBalance,
    getSupplierBalance,
    getAllCustomerBalances,
    getAllSupplierBalances,
    
    // دوال التحويلات
    transferProduct,
    
    // دوال النظام المتقدم
    addAuditLog,
    checkPermission,
    validateStatusTransition,
    getStatusText,
    getPermissionText,
    validateReturnData,
    
    // دوال إدارة المستخدم
    setCurrentUser,
    setPermissions
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
