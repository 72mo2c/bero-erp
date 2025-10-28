// ======================================
// TabContext - نظام تبويبات حقيقي ومنطقي
// ======================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TabContext = createContext();

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within TabProvider');
  }
  return context;
};

export const TabProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // التبويبات - كل تبويب له معرف فريد ومسار مستقل
  const [tabs, setTabs] = useState([
    {
      id: 'tab-1',
      path: '/dashboard',
      title: 'لوحة التحكم',
      icon: '🏠',
      isMain: true // التبويب الرئيسي لا يمكن إغلاقه
    }
  ]);

  // التبويب النشط حالياً
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // تحديث مسار التبويب النشط عند تغيير المسار
  useEffect(() => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId
          ? { ...tab, path: location.pathname, title: getPageTitle(location.pathname), icon: getPageIcon(location.pathname) }
          : tab
      )
    );
  }, [location.pathname, activeTabId]);

  // التنقل إلى مسار التبويب عند تفعيله
  useEffect(() => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab && location.pathname !== activeTab.path) {
      navigate(activeTab.path);
    }
  }, [activeTabId]);

  // الحصول على عنوان الصفحة من المسار
  const getPageTitle = (path) => {
    const titles = {
      '/dashboard': 'لوحة التحكم',
      '/warehouses/add-product': 'إضافة بضاعة',
      '/warehouses/manage-products': 'إدارة البضائع',
      '/warehouses/add-warehouse': 'إضافة مخزن',
      '/warehouses/manage-categories': 'إدارة الفئات',
      '/warehouses/transfer': 'تحويل بضاعة',
      '/warehouses/inventory': 'الجرد',
      '/warehouses/manage': 'إدارة المخازن',
      '/purchases/new-invoice': 'فاتورة مشتريات جديدة',
      '/purchases/invoices': 'سجل فواتير المشتريات',
      '/purchases/manage': 'إدارة فواتير المشتريات',
      '/purchases/returns': 'مرتجعات المشتريات',
      '/sales/new-invoice': 'فاتورة مبيعات جديدة',
      '/sales/invoices': 'سجل فواتير المبيعات',
      '/sales/manage': 'إدارة فواتير المبيعات',
      '/sales/returns': 'مرتجعات المبيعات',
      '/sales/external': 'فواتير المبيعات الخارجية',
      '/customers/add': 'إضافة عميل',
      '/customers/manage': 'إدارة العملاء',
      '/suppliers/add': 'إضافة مورد',
      '/suppliers/manage': 'إدارة الموردين',
      '/treasury/receipt/new': 'إذن استلام نقدي',
      '/treasury/receipts': 'إيصالات الاستلام',
      '/treasury/disbursement/new': 'إذن صرف نقدي',
      '/treasury/disbursements': 'إيصالات الصرف',
      '/treasury/movement': 'حركة الخزينة',
      '/treasury/customer-balances': 'أرصدة العملاء',
      '/treasury/supplier-balances': 'أرصدة الموردين',
      '/reports/inventory': 'تقرير المخزون',
      '/reports/low-stock': 'المخزون المنخفض',
      '/reports/product-movement': 'حركة المنتجات',
      '/reports/sales': 'تقرير المبيعات',
      '/reports/sales-by-customer': 'المبيعات حسب العملاء',
      '/reports/top-selling': 'المنتجات الأكثر مبيعاً',
      '/reports/purchases': 'تقرير المشتريات',
      '/reports/purchases-by-supplier': 'المشتريات حسب الموردين',
      '/reports/treasury': 'تقرير الخزينة',
      '/reports/cash-flow': 'التدفق النقدي',
      '/reports/profit-loss': 'الأرباح والخسائر',
      '/notifications': 'الإشعارات',
      '/settings/add-user': 'إضافة مستخدم',
      '/settings/permissions': 'الصلاحيات',
      '/settings/support': 'خدمة العملاء',
      '/settings/system': 'إعدادات النظام',
      '/integrations/external-platforms': 'منصات خارجية',
      '/integrations/whatsapp-business': 'واتساب الأعمال',
      '/adjustments/quantity': 'تسوية الكميات',
      '/adjustments/value': 'تسوية القيمة',
      '/adjustments/damaged': 'شطب تالف',
      '/adjustments/customer-balance': 'تسوية أرصدة العملاء',
      '/adjustments/supplier-balance': 'تسوية أرصدة الموردين',
      '/adjustments/treasury': 'تسويات الخزينة',
      '/adjustments/entries': 'قيود التسوية',
      '/adjustments/history': 'سجل التسويات',
    };
    return titles[path] || 'صفحة';
  };

  // الحصول على أيقونة من المسار
  const getPageIcon = (path) => {
    if (path === '/dashboard') return '🏠';
    if (path.includes('warehouses')) return '📦';
    if (path.includes('purchases')) return '🛒';
    if (path.includes('sales')) return '💰';
    if (path.includes('customers')) return '👥';
    if (path.includes('suppliers')) return '🚚';
    if (path.includes('treasury')) return '💵';
    if (path.includes('reports')) return '📊';
    if (path.includes('notifications')) return '🔔';
    if (path.includes('settings')) return '⚙️';
    if (path.includes('integrations')) return '🔗';
    if (path.includes('adjustments')) return '🛠️';
    return '📄';
  };

  // فتح تبويب جديد - يبدأ من لوحة التحكم
  const openNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab = {
      id: newTabId,
      path: '/dashboard',
      title: 'لوحة التحكم',
      icon: '🏠',
      isMain: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    navigate('/dashboard');
  };

  // إغلاق تبويب
  const closeTab = (tabId) => {
    // لا نسمح بإغلاق التبويب الرئيسي
    const tabToClose = tabs.find(t => t.id === tabId);
    if (tabToClose?.isMain) return;

    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // إذا كان التبويب المغلق هو النشط، نفعل التبويب السابق له أو الرئيسي
      if (activeTabId === tabId) {
        const closedTabIndex = prev.findIndex(tab => tab.id === tabId);
        const nextTab = newTabs[Math.max(0, closedTabIndex - 1)];
        setActiveTabId(nextTab.id);
        navigate(nextTab.path);
      }
      
      return newTabs;
    });
  };

  // التبديل إلى تبويب محدد
  const switchTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    setActiveTabId(tabId);
    navigate(tab.path);
  };

  // الحصول على التبويب النشط
  const getActiveTab = () => {
    return tabs.find(t => t.id === activeTabId);
  };

  const value = {
    tabs,
    activeTabId,
    openNewTab,
    closeTab,
    switchTab,
    getActiveTab,
    hasMultipleTabs: tabs.length > 1
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
};