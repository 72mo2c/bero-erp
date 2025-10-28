// ======================================
// Dashboard Updated - لوحة التحكم المحدثة
// ======================================

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemSettings, SettingsGuard } from '../components/SystemSettingsManager';
import { usePermissions } from '../components/ProtectedRoute';
import { useData } from '../context/DataContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Loading from '../components/Common/Loading';
import {
  FaWarehouse, FaShoppingCart, FaMoneyBillWave, FaTruck, FaUsers,
  FaBox, FaChartLine, FaExclamationTriangle, FaArrowLeft, FaUndo,
  FaWallet, FaFileInvoice, FaClipboardList, FaChartBar, FaTools,
  FaBell, FaCog, FaDownload, FaEye, FaEyeSlash
} from 'react-icons/fa';

const DashboardUpdated = () => {
  const { user } = useAuth();
  const { settings, isFeatureEnabled, companyName, currency, theme } = useSystemSettings();
  const { hasPermission, canEdit, isAdmin } = usePermissions();
  const { 
    products, 
    purchaseInvoices, 
    salesInvoices, 
    suppliers, 
    customers,
    treasuryBalance,
    addProduct 
  } = useData();

  // إحصائيات سريعة
  const stats = React.useMemo(() => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => 
      p.mainQuantity <= (parseInt(settings.inventory.lowStockThreshold) || 10)
    ).length;
    
    const totalSales = salesInvoices.length;
    const totalPurchases = purchaseInvoices.length;
    const totalCustomers = customers.length;
    const totalSuppliers = suppliers.length;
    
    return {
      totalProducts,
      lowStockProducts,
      totalSales,
      totalPurchases,
      totalCustomers,
      totalSuppliers
    };
  }, [products, purchaseInvoices, salesInvoices, customers, suppliers, settings.inventory.lowStockThreshold]);

  // مكونات الإحصائيات
  const StatCard = ({ title, value, icon: Icon, color, onClick, show = true }) => {
    if (!show) return null;
    
    return (
      <Card className={`p-6 cursor-pointer hover:shadow-lg transition-shadow ${onClick ? 'hover:scale-105' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`text-3xl ${color} opacity-80`} />
        </div>
        {onClick && (
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
            <FaCog className="w-3 h-3" />
            انقر للتفاصيل
          </div>
        )}
      </Card>
    );
  };

  // إعدادات مخصصة
  const showLowStockAlert = isFeatureEnabled('low_stock_alerts');
  const showTreasury = hasPermission('finance.view');
  const enableBarcode = isFeatureEnabled('barcode_scanning');
  const showNotifications = settings.general.notifications;

  // تطبيق المظهر المخصص
  React.useEffect(() => {
    const root = document.documentElement;
    
    // ألوان مخصصة حسب الإعدادات
    if (theme === 'dark') {
      root.style.setProperty('--dashboard-bg', '#1f2937');
      root.style.setProperty('--dashboard-card', '#374151');
    } else {
      root.style.setProperty('--dashboard-bg', '#f9fafb');
      root.style.setProperty('--dashboard-card', '#ffffff');
    }
  }, [theme]);

  if (!user) {
    return <Loading message="جاري تحميل لوحة التحكم..." />;
  }

  return (
    <div 
      className="min-h-screen p-6 transition-colors"
      style={{ backgroundColor: 'var(--dashboard-bg, #f9fafb)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 
                className="text-3xl font-bold flex items-center gap-3"
                style={{ color: 'var(--text-primary, #111827)' }}
              >
                <FaChartLine className="text-blue-600" />
                لوحة التحكم
                {settings.general.autoSave && (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    حفظ تلقائي
                  </span>
                )}
              </h1>
              <p 
                className="text-gray-600 mt-2"
                style={{ color: 'var(--text-secondary, #6b7280)' }}
              >
                مرحباً {user.name} - {companyName} - {currency}
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* عرض/إخفاء الإشعارات */}
              {showNotifications && (
                <SettingsGuard feature="notifications">
                  <Button 
                    variant="secondary" 
                    className="flex items-center gap-2"
                  >
                    <FaBell />
                    الإشعارات
                  </Button>
                </SettingsGuard>
              )}
              
              {/* زر الإعدادات للمدير فقط */}
              {isAdmin() && (
                <Button 
                  onClick={() => window.location.href = '/settings'}
                  className="flex items-center gap-2"
                >
                  <FaCog />
                  الإعدادات
                </Button>
              )}
              
              {/* تصدير التقارير */}
              <SettingsGuard feature="reports.export">
                <Button 
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <FaDownload />
                  تصدير
                </Button>
              </SettingsGuard>
            </div>
          </div>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المنتجات"
            value={stats.totalProducts}
            icon={FaBox}
            color="text-blue-600"
            onClick={() => window.location.href = '/inventory'}
            show={hasPermission('inventory.view')}
          />
          
          <StatCard
            title="المنتجات المنخفضة المخزون"
            value={stats.lowStockProducts}
            icon={FaExclamationTriangle}
            color="text-red-600"
            show={showLowStockAlert && stats.lowStockProducts > 0}
          />
          
          <StatCard
            title="إجمالي المبيعات"
            value={stats.totalSales}
            icon={FaShoppingCart}
            color="text-green-600"
            onClick={() => window.location.href = '/sales'}
            show={hasPermission('transactions.view')}
          />
          
          <StatCard
            title="إجمالي المشتريات"
            value={stats.totalPurchases}
            icon={FaTruck}
            color="text-purple-600"
            onClick={() => window.location.href = '/purchases'}
            show={hasPermission('transactions.view')}
          />
          
          <StatCard
            title="عدد العملاء"
            value={stats.totalCustomers}
            icon={FaUsers}
            color="text-teal-600"
            onClick={() => window.location.href = '/customers'}
            show={hasPermission('contacts.view')}
          />
          
          <StatCard
            title="عدد الموردين"
            value={stats.totalSuppliers}
            icon={FaUsers}
            color="text-orange-600"
            onClick={() => window.location.href = '/suppliers'}
            show={hasPermission('contacts.view')}
          />
          
          {/* عرض الرصيد إذا كان مسموح */}
          {showTreasury && (
            <StatCard
              title={`رصيد الخزينة (${currency})`}
              value={treasuryBalance.toLocaleString()}
              icon={FaWallet}
              color="text-yellow-600"
              onClick={() => window.location.href = '/treasury'}
            />
          )}
        </div>

        {/* القسم الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* العمود الأيسر - الإجراءات السريعة */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaTools className="text-blue-600" />
                الإجراءات السريعة
              </h3>
              
              <div className="space-y-3">
                {/* إضافة منتج جديد */}
                <SettingsGuard feature="inventory.add">
                  <Button 
                    onClick={() => window.location.href = '/inventory/add-product'}
                    className="w-full flex items-center gap-2 justify-start"
                    variant="secondary"
                  >
                    <FaBox />
                    إضافة منتج جديد
                  </Button>
                </SettingsGuard>
                
                {/* فاتورة مبيعات جديدة */}
                <SettingsGuard feature="transactions.add">
                  <Button 
                    onClick={() => window.location.href = '/sales/new'}
                    className="w-full flex items-center gap-2 justify-start"
                    variant="secondary"
                  >
                    <FaFileInvoice />
                    فاتورة مبيعات جديدة
                  </Button>
                </SettingsGuard>
                
                {/* فاتورة مشتريات جديدة */}
                <SettingsGuard feature="transactions.add">
                  <Button 
                    onClick={() => window.location.href = '/purchases/new'}
                    className="w-full flex items-center gap-2 justify-start"
                    variant="secondary"
                  >
                    <FaClipboardList />
                    فاتورة مشتريات جديدة
                  </Button>
                </SettingsGuard>
                
                {/* إضافة عميل جديد */}
                <SettingsGuard feature="contacts.add">
                  <Button 
                    onClick={() => window.location.href = '/customers/add'}
                    className="w-full flex items-center gap-2 justify-start"
                    variant="secondary"
                  >
                    <FaUsers />
                    إضافة عميل جديد
                  </Button>
                </SettingsGuard>
                
                {/* إضافة مورد جديد */}
                <SettingsGuard feature="contacts.add">
                  <Button 
                    onClick={() => window.location.href = '/suppliers/add'}
                    className="w-full flex items-center gap-2 justify-start"
                    variant="secondary"
                  >
                    <FaUsers />
                    إضافة مورد جديد
                  </Button>
                </SettingsGuard>
              </div>
            </Card>

            {/* المعلومات السريعة */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">معلومات سريعة</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">العملة:</span>
                  <span className="font-medium">{currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">اللغة:</span>
                  <span className="font-medium">
                    {settings.general.language === 'ar' ? 'العربية' : 'English'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المظهر:</span>
                  <span className="font-medium">
                    {theme === 'dark' ? 'داكن' : 'فاتح'}
                  </span>
                </div>
                
                {/* المميزات المفعلة */}
                <div className="mt-4 pt-3 border-t">
                  <p className="text-gray-600 mb-2">المميزات المفعلة:</p>
                  <div className="flex flex-wrap gap-1">
                    {isFeatureEnabled('barcode_scanning') && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        مسح الباركود
                      </span>
                    )}
                    {isFeatureEnabled('email_notifications') && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        إشعارات البريد
                      </span>
                    )}
                    {isFeatureEnabled('auto_backup') && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        نسخ احتياطي
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* العمود الأيمن - التنبيهات والإحصائيات */}
          <div className="lg:col-span-2 space-y-6">
            {/* تنبيه المخزون المنخفض */}
            {showLowStockAlert && stats.lowStockProducts > 0 && (
              <Card className="p-6 border-l-4 border-red-500 bg-red-50">
                <div className="flex items-center gap-3 mb-3">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                  <h3 className="text-lg font-semibold text-red-800">
                    تنبيه: منتجات منخفضة المخزون
                  </h3>
                </div>
                <p className="text-red-700 mb-4">
                  يوجد {stats.lowStockProducts} منتج منخفض المخزون
                </p>
                <Button 
                  onClick={() => window.location.href = '/reports/low-stock'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  عرض التفاصيل
                </Button>
              </Card>
            )}

            {/* إحصائيات سريعة */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaChartBar className="text-blue-600" />
                نظرة عامة على النشاط
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {salesInvoices.filter(inv => {
                      const today = new Date().toDateString();
                      return new Date(inv.date).toDateString() === today;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">مبيعات اليوم</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {purchaseInvoices.filter(inv => {
                      const today = new Date().toDateString();
                      return new Date(inv.date).toDateString() === today;
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">مشتريات اليوم</div>
                </div>
              </div>
            </Card>

            {/* روابط سريعة للتقارير */}
            <SettingsGuard feature="reports.view">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaClipboardList className="text-blue-600" />
                  التقارير السريعة
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => window.location.href = '/reports/sales'}
                    variant="secondary"
                    className="flex items-center gap-2 justify-start"
                  >
                    <FaChartLine />
                    تقرير المبيعات
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/reports/inventory'}
                    variant="secondary"
                    className="flex items-center gap-2 justify-start"
                  >
                    <FaWarehouse />
                    تقرير المخزون
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/reports/treasury'}
                    variant="secondary"
                    className="flex items-center gap-2 justify-start"
                  >
                    <FaMoneyBillWave />
                    تقرير الخزينة
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/reports/profit-loss'}
                    variant="secondary"
                    className="flex items-center gap-2 justify-start"
                  >
                    <FaWallet />
                    الأرباح والخسائر
                  </Button>
                </div>
              </Card>
            </SettingsGuard>
          </div>
        </div>

        {/* معلومات النظام في الأسفل */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              آخر تسجيل دخول: {new Date(user.loginAt).toLocaleString('ar-EG')}
            </div>
            <div className="flex items-center gap-4">
              <span>الإصدار: 2.0</span>
              <span>•</span>
              <span>المستخدم: {user.username}</span>
              <span>•</span>
              <span>الدور: {user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUpdated;