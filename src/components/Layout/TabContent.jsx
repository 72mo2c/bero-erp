// ======================================
// TabContent - محتوى التبويبات المستقل
// يحافظ على state كل تبويب في الذاكرة
// ======================================

import React from 'react';
import { useTab } from '../../contexts/TabContext';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

// Import all page components
import Dashboard from '../../pages/Dashboard';
import Notifications from '../../pages/Notifications';

// Warehouses
import AddProduct from '../../pages/Warehouses/AddProduct';
import ManageProducts from '../../pages/Warehouses/ManageProducts';
import AddWarehouse from '../../pages/Warehouses/AddWarehouse';
import ManageCategories from '../../pages/Warehouses/ManageCategories';
import Transfer from '../../pages/Warehouses/Transfer';
import Inventory from '../../pages/Warehouses/Inventory';
import ManageWarehouses from '../../pages/Warehouses/ManageWarehouses';

// Purchases
import NewPurchaseInvoice from '../../pages/Purchases/NewPurchaseInvoice';
import PurchaseInvoices from '../../pages/Purchases/PurchaseInvoices';
import ManagePurchaseInvoices from '../../pages/Purchases/ManagePurchaseInvoices';
import NewPurchaseReturn from '../../pages/Purchases/NewPurchaseReturn';
import PurchaseReturns from '../../pages/Purchases/PurchaseReturns';

// Sales
import NewSalesInvoice from '../../pages/Sales/NewSalesInvoice';
import SalesInvoices from '../../pages/Sales/SalesInvoices';
import ManageSalesInvoices from '../../pages/Sales/ManageSalesInvoices';
import NewSalesReturn from '../../pages/Sales/NewSalesReturn';
import SalesReturns from '../../pages/Sales/SalesReturns';
import ExternalSalesInvoices from '../../pages/Sales/ExternalSalesInvoices';

// Suppliers & Customers
import AddSupplier from '../../pages/Suppliers/AddSupplier';
import ManageSuppliers from '../../pages/Suppliers/ManageSuppliers';
import AddCustomer from '../../pages/Customers/AddCustomer';
import ManageCustomers from '../../pages/Customers/ManageCustomers';

// Treasury
import NewCashReceipt from '../../pages/Treasury/NewCashReceipt';
import ManageCashReceipts from '../../pages/Treasury/ManageCashReceipts';
import NewCashDisbursement from '../../pages/Treasury/NewCashDisbursement';
import ManageCashDisbursements from '../../pages/Treasury/ManageCashDisbursements';
import TreasuryMovement from '../../pages/Treasury/TreasuryMovement';
import CustomerBalances from '../../pages/Treasury/CustomerBalances';
import SupplierBalances from '../../pages/Treasury/SupplierBalances';

// Settings
import AddUser from '../../pages/Settings/AddUser';
import Permissions from '../../pages/Settings/Permissions';
import Support from '../../pages/Settings/Support';
import SystemSettings from '../../pages/Settings/SystemSettings';
import Integrations from '../../pages/Settings/Integrations';

// Integrations
import ExternalPlatforms from '../../pages/Integrations/ExternalPlatforms';
import WhatsAppBusiness from '../../pages/Integrations/WhatsAppBusiness';

// Reports
import ReportsHome from '../../pages/Reports/ReportsHome';
import InventoryReport from '../../pages/Reports/InventoryReport';
import ProductMovementReport from '../../pages/Reports/ProductMovementReport';
import LowStockReport from '../../pages/Reports/LowStockReport';
import SalesReport from '../../pages/Reports/SalesReport';
import SalesByCustomer from '../../pages/Reports/SalesByCustomer';
import TopSellingProducts from '../../pages/Reports/TopSellingProducts';
import PurchasesReport from '../../pages/Reports/PurchasesReport';
import PurchasesBySupplier from '../../pages/Reports/PurchasesBySupplier';
import TreasuryReport from '../../pages/Reports/TreasuryReport';
import CashFlowReport from '../../pages/Reports/CashFlowReport';
import ProfitLossReport from '../../pages/Reports/ProfitLossReport';

// Adjustments
import QuantityAdjustment from '../../pages/Adjustments/QuantityAdjustment';
import ValueAdjustment from '../../pages/Adjustments/ValueAdjustment';
import DamagedWriteOff from '../../pages/Adjustments/DamagedWriteOff';
import CustomerBalanceAdjustment from '../../pages/Adjustments/CustomerBalanceAdjustment';
import SupplierBalanceAdjustment from '../../pages/Adjustments/SupplierBalanceAdjustment';
import TreasuryAdjustment from '../../pages/Adjustments/TreasuryAdjustment';
import AdjustmentEntries from '../../pages/Adjustments/AdjustmentEntries';
import AdjustmentHistory from '../../pages/Adjustments/AdjustmentHistory';

// Tools
import FixNegativeQuantities from '../../pages/Tools/FixNegativeQuantities';

// دالة للحصول على المكون بناءً على المسار
const getComponentForPath = (path) => {
  const routes = {
    '/dashboard': Dashboard,
    '/notifications': Notifications,
    
    // Warehouses
    '/warehouses/add-product': AddProduct,
    '/warehouses/manage-products': ManageProducts,
    '/warehouses/add-warehouse': AddWarehouse,
    '/warehouses/manage-categories': ManageCategories,
    '/warehouses/transfer': Transfer,
    '/warehouses/inventory': Inventory,
    '/warehouses/manage': ManageWarehouses,
    
    // Purchases
    '/purchases/new-invoice': NewPurchaseInvoice,
    '/purchases/invoices': PurchaseInvoices,
    '/purchases/manage': ManagePurchaseInvoices,
    '/purchases/returns': PurchaseReturns,
    
    // Sales
    '/sales/new-invoice': NewSalesInvoice,
    '/sales/invoices': SalesInvoices,
    '/sales/manage': ManageSalesInvoices,
    '/sales/returns': SalesReturns,
    '/sales/external': ExternalSalesInvoices,
    
    // Suppliers & Customers
    '/suppliers/add': AddSupplier,
    '/suppliers/manage': ManageSuppliers,
    '/customers/add': AddCustomer,
    '/customers/manage': ManageCustomers,
    
    // Treasury
    '/treasury/receipt/new': NewCashReceipt,
    '/treasury/receipts': ManageCashReceipts,
    '/treasury/disbursement/new': NewCashDisbursement,
    '/treasury/disbursements': ManageCashDisbursements,
    '/treasury/movement': TreasuryMovement,
    '/treasury/customer-balances': CustomerBalances,
    '/treasury/supplier-balances': SupplierBalances,
    
    // Integrations
    '/integrations/external-platforms': ExternalPlatforms,
    '/integrations/whatsapp-business': WhatsAppBusiness,
    
    // Settings
    '/settings/add-user': AddUser,
    '/settings/permissions': Permissions,
    '/settings/support': Support,
    '/settings/system': SystemSettings,
    '/settings/integrations': Integrations,
    
    // Adjustments
    '/adjustments/quantity': QuantityAdjustment,
    '/adjustments/value': ValueAdjustment,
    '/adjustments/damaged': DamagedWriteOff,
    '/adjustments/customer-balance': CustomerBalanceAdjustment,
    '/adjustments/supplier-balance': SupplierBalanceAdjustment,
    '/adjustments/treasury': TreasuryAdjustment,
    '/adjustments/entries': AdjustmentEntries,
    '/adjustments/history': AdjustmentHistory,
    
    // Tools
    '/tools/fix-negative-quantities': FixNegativeQuantities,
    
    // Reports
    '/reports': ReportsHome,
    '/reports/inventory': InventoryReport,
    '/reports/product-movement': ProductMovementReport,
    '/reports/low-stock': LowStockReport,
    '/reports/sales': SalesReport,
    '/reports/sales-by-customer': SalesByCustomer,
    '/reports/top-selling': TopSellingProducts,
    '/reports/purchases': PurchasesReport,
    '/reports/purchases-by-supplier': PurchasesBySupplier,
    '/reports/treasury': TreasuryReport,
    '/reports/cash-flow': CashFlowReport,
    '/reports/profit-loss': ProfitLossReport,
  };
  
  // للمسارات الديناميكية (مثل /purchases/return/:id)
  if (path.startsWith('/purchases/return/')) {
    return NewPurchaseReturn;
  }
  if (path.startsWith('/sales/return/')) {
    return NewSalesReturn;
  }
  
  return routes[path] || Dashboard;
};

const TabContent = () => {
  const { tabs, activeTabId } = useTab();
  const { isAdmin } = useAuth();

  // فحص ما إذا كان المسار يتطلب مدير فقط
  const isAdminOnlyPath = (path) => {
    const adminPaths = [
      '/settings/system',
      '/settings/users',
      '/settings/add-user',
      '/settings/permissions',
      '/settings/integrations',
      '/settings/support',
      '/settings/backup'
    ];
    
    return adminPaths.some(adminPath => path.startsWith(adminPath));
  };

  // إذا كان المسار يتطلب مدير فقط والمستخدم ليس مدير
  if (isAdminOnlyPath(tabs.find(tab => tab.id === activeTabId)?.path || '') && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">مدير فقط</h3>
          <p className="text-gray-600 mb-4">
            هذه الصفحة مخصصة للمدير العام فقط. لا يمكن للمستخدمين الآخرين الوصول إليها.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            دورك الحالي: غير مدير - مطلوب: admin
          </p>
          <button
            onClick={() => window.location.href = '#/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const Component = getComponentForPath(tab.path);
        
        return (
          <div
            key={tab.id}
            style={{ display: isActive ? 'block' : 'none' }}
            className="tab-content-wrapper"
          >
            <Component />
          </div>
        );
      })}
    </>
  );
};

export default TabContent;
