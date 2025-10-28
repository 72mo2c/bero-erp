// ======================================
// Compact Sidebar - شريط جانبي مصغر ومميز
// ======================================

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTab } from '../../contexts/TabContext';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaWarehouse, 
  FaShoppingCart, 
  FaMoneyBillWave, 
  FaUsers, 
  FaTruck, 
  FaBell, 
  FaCog,
  FaChevronRight,
  FaBox,
  FaExchangeAlt,
  FaFileInvoice,
  FaList,
  FaPlus,
  FaUserPlus,
  FaBuilding,
  FaLink,
  FaWhatsapp,
  FaTags,
  FaChartLine,
  FaUndo,
  FaClipboardList,
  FaBoxes,
  FaChartBar,
  FaChartPie,
  FaDollarSign,
  FaCashRegister,
  FaTools,
  FaExclamationTriangle
} from 'react-icons/fa';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Check if current path matches any submenu item
  const isMenuActive = (menuItem) => {
    if (menuItem.path && location.pathname === menuItem.path) {
      return true;
    }
    if (menuItem.subItems) {
      return menuItem.subItems.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  // Auto-expand menu if current path is in its submenu
  useEffect(() => {
    const activeMenu = menuItems.find(item => 
      item.subItems && item.subItems.some(subItem => location.pathname === subItem.path)
    );
    if (activeMenu) {
      setExpandedMenu(activeMenu.id);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      icon: <FaHome />,
      path: '/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'warehouses',
      title: 'المخازن',
      icon: <FaWarehouse />,
      color: 'from-purple-500 to-purple-600',
      subItems: [
        { title: 'إضافة بضاعة', icon: <FaPlus />, path: '/warehouses/add-product' },
        { title: 'إدارة البضائع', icon: <FaBox />, path: '/warehouses/manage-products' },
        { title: 'إضافة مخزن', icon: <FaWarehouse />, path: '/warehouses/add-warehouse' },
        { title: 'إدارة الفئات', icon: <FaTags />, path: '/warehouses/manage-categories' },
        { title: 'تحويل', icon: <FaExchangeAlt />, path: '/warehouses/transfer' },
        { title: 'الجرد', icon: <FaList />, path: '/warehouses/inventory' },
        { title: 'الضبط', icon: <FaCog />, path: '/warehouses/manage' },
      ]
    },
    {
      id: 'purchases',
      title: 'المشتريات',
      icon: <FaShoppingCart />,
      color: 'from-green-500 to-green-600',
      subItems: [
        { title: 'فاتورة جديدة', icon: <FaPlus />, path: '/purchases/new-invoice' },
        { title: 'سجل الفواتير', icon: <FaList />, path: '/purchases/invoices' },
        { title: 'إدارة الفواتير', icon: <FaFileInvoice />, path: '/purchases/manage' },
        { title: 'مرتجعات المشتريات', icon: <FaUndo />, path: '/purchases/returns' },
      ]
    },
    {
      id: 'sales',
      title: 'المبيعات',
      icon: <FaChartLine />,
      color: 'from-orange-500 to-orange-600',
      subItems: [
        { title: 'فاتورة جديدة', icon: <FaPlus />, path: '/sales/new-invoice' },
        { title: 'سجل الفواتير', icon: <FaList />, path: '/sales/invoices' },
        { title: 'إدارة الفواتير', icon: <FaFileInvoice />, path: '/sales/manage' },
        { title: 'مرتجعات المبيعات', icon: <FaUndo />, path: '/sales/returns' },
        { title: 'فواتير المبيعات الخارجية', icon: <FaLink />, path: '/sales/external' },
      ]
    },
    {
      id: 'suppliers',
      title: 'الموردين',
      icon: <FaTruck />,
      color: 'from-cyan-500 to-cyan-600',
      subItems: [
        { title: 'إضافة مورد', icon: <FaPlus />, path: '/suppliers/add' },
        { title: 'إدارة الموردين', icon: <FaList />, path: '/suppliers/manage' },
      ]
    },
    {
      id: 'customers',
      title: 'العملاء',
      icon: <FaUsers />,
      color: 'from-pink-500 to-pink-600',
      subItems: [
        { title: 'إضافة عميل', icon: <FaUserPlus />, path: '/customers/add' },
        { title: 'إدارة العملاء', icon: <FaList />, path: '/customers/manage' },
      ]
    },
    {
      id: 'treasury',
      title: 'الخزينة',
      icon: <FaMoneyBillWave />,
      color: 'from-yellow-500 to-yellow-600',
      subItems: [
        { title: 'إذن استلام نقدي', icon: <FaPlus />, path: '/treasury/receipt/new' },
        { title: 'إيصالات الاستلام', icon: <FaList />, path: '/treasury/receipts' },
        { title: 'إذن صرف نقدي', icon: <FaPlus />, path: '/treasury/disbursement/new' },
        { title: 'إيصالات الصرف', icon: <FaList />, path: '/treasury/disbursements' },
        { title: 'حركة الخزينة', icon: <FaChartLine />, path: '/treasury/movement' },
        { title: 'أرصدة العملاء', icon: <FaUsers />, path: '/treasury/customer-balances' },
        { title: 'أرصدة الموردين', icon: <FaTruck />, path: '/treasury/supplier-balances' },
      ]
    },
    {
      id: 'reports',
      title: 'التقارير',
      icon: <FaClipboardList />,
      color: 'from-teal-500 to-teal-600',
      subItems: [
        { title: 'المخزون', icon: <FaBoxes />, path: '/reports/inventory' },
        { title: 'المخزون المنخفض', icon: <FaChartLine />, path: '/reports/low-stock' },
        { title: 'حركة المنتجات', icon: <FaExchangeAlt />, path: '/reports/product-movement' },
        { title: 'تقارير المبيعات', icon: <FaChartBar />, path: '/reports/sales' },
        { title: 'المبيعات حسب العملاء', icon: <FaUsers />, path: '/reports/sales-by-customer' },
        { title: 'المنتجات الأكثر مبيعاً', icon: <FaChartPie />, path: '/reports/top-selling' },
        { title: 'تقارير المشتريات', icon: <FaShoppingCart />, path: '/reports/purchases' },
        { title: 'المشتريات حسب الموردين', icon: <FaTruck />, path: '/reports/purchases-by-supplier' },
        { title: 'تقرير الخزينة', icon: <FaMoneyBillWave />, path: '/reports/treasury' },
        { title: 'التدفق النقدي', icon: <FaCashRegister />, path: '/reports/cash-flow' },
        { title: 'الأرباح والخسائر', icon: <FaDollarSign />, path: '/reports/profit-loss' },
      ]
    },
    {
      id: 'adjustments',
      title: 'التسويات',
      icon: <FaTools />,
      color: 'from-amber-500 to-amber-600',
      subItems: [
        { title: 'تسوية الكميات', icon: <FaBoxes />, path: '/adjustments/quantity' },
        { title: 'تسوية القيمة', icon: <FaDollarSign />, path: '/adjustments/value' },
        { title: 'شطب تالف', icon: <FaExclamationTriangle />, path: '/adjustments/damaged' },
        { title: 'تسوية أرصدة العملاء', icon: <FaUsers />, path: '/adjustments/customer-balance' },
        { title: 'تسوية أرصدة الموردين', icon: <FaTruck />, path: '/adjustments/supplier-balance' },
        { title: 'تسويات الخزينة', icon: <FaMoneyBillWave />, path: '/adjustments/treasury' },
        { title: 'قيود التسوية', icon: <FaFileInvoice />, path: '/adjustments/entries' },
        { title: 'سجل التسويات', icon: <FaList />, path: '/adjustments/history' },
      ]
    },
    
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: <FaBell />,
      path: '/notifications',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'integrations',
      title: 'الربط',
      icon: <FaLink />,
      color: 'from-indigo-500 to-indigo-600',
      subItems: [
        { title: 'منصات خارجية', icon: <FaBuilding />, path: '/integrations/external-platforms' },
        { title: 'واتساب الأعمال', icon: <FaWhatsapp />, path: '/integrations/whatsapp-business' },
      ]
    },
    ...(isAdmin() ? [{
      id: 'settings',
      title: 'الإعدادات',
      icon: <FaCog />,
      color: 'from-gray-500 to-gray-600',
      subItems: [
        { title: 'إضافة مستخدم', icon: <FaUserPlus />, path: '/settings/add-user' },
        { title: 'الصلاحيات', icon: <FaCog />, path: '/settings/permissions' },
        { title: 'خدمة العملاء', icon: <FaUsers />, path: '/settings/support' },
        { title: 'إعدادات النظام', icon: <FaCog />, path: '/settings/system' },
      ]
    }] : []),
  ];

  const handleMenuClick = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  // Determine if sidebar should be expanded
  const isExpanded = isOpen || isHovered;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed z-40 transition-all duration-300 overflow-hidden
          bg-white/95 backdrop-blur-md border-l border-orange-100/50 shadow-lg
          top-[40px] h-[calc(100vh-40px)]
          ${isExpanded ? 'w-56' : 'w-14'}
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
        style={{ right: 0 }}
      >
        <nav className="h-full overflow-y-auto py-2 px-1.5">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              {item.subItems ? (
                // Menu with submenu
                <div>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`
                      w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all group relative
                      ${isMenuActive(item) 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-md' 
                        : expandedMenu === item.id 
                          ? 'bg-orange-50' 
                          : 'hover:bg-orange-50'
                      }
                    `}
                    title={!isExpanded ? item.title : ''}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isMenuActive(item)
                        ? 'bg-white/20 text-white' 
                        : `bg-gradient-to-br ${item.color} text-white shadow-sm`
                    }`}>
                      <span className="text-sm">{item.icon}</span>
                    </div>
                    {isExpanded && (
                      <>
                        <span className={`flex-1 text-xs font-semibold text-right truncate ${
                          isMenuActive(item) ? 'text-white' : 'text-gray-700'
                        }`}>
                          {item.title}
                        </span>
                        <FaChevronRight 
                          className={`text-xs transition-transform ${
                            isMenuActive(item) ? 'text-white/80' : 'text-gray-400'
                          } ${expandedMenu === item.id ? 'rotate-90' : ''}`}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {expandedMenu === item.id && isExpanded && (
                    <div className="mr-4 mt-1 space-y-0.5 pr-2 border-r-2 border-orange-200">
                      {item.subItems.map((subItem, idx) => (
                        <NavLink
                          key={idx}
                          to={subItem.path}
                          onClick={() => {if (window.innerWidth < 1024) closeSidebar();}}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                            }`
                          }
                        >
                          <span className="text-xs flex-shrink-0">{subItem.icon}</span>
                          <span className="truncate font-medium text-xs">{subItem.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Simple menu item
                <NavLink
                  to={item.path}
                  onClick={() => {if (window.innerWidth < 1024) closeSidebar();}}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-md'
                        : 'hover:bg-orange-50'
                    }`
                  }
                  title={!isExpanded ? item.title : ''}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : `bg-gradient-to-br ${item.color} text-white shadow-sm`
                      }`}>
                        <span className="text-sm">{item.icon}</span>
                      </div>
                      {isExpanded && (
                        <span className={`flex-1 text-xs font-semibold text-right truncate ${
                          isActive ? 'text-white' : 'text-gray-700'
                        }`}>
                          {item.title}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Hover Indicator */}
        {!isExpanded && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-orange-400 to-orange-600 rounded-r-full opacity-50" />
        )}
      </aside>
    </>
  );
};

export default Sidebar;
