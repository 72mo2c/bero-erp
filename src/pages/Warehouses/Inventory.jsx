// ======================================
// Inventory - جرد المخازن (محسّنة)
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Select from '../../components/Common/Select';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { 
  FaList, 
  FaSearch, 
  FaWarehouse, 
  FaFilter,
  FaDownload,
  FaBox,
  FaChartBar,
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';

const Inventory = () => {
  const { products, warehouses } = useData();
  const { showSuccess } = useNotification();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // تصفية المنتجات
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesWarehouse = selectedWarehouse === '' || 
                              product.warehouseId === parseInt(selectedWarehouse);

      const matchesStatus = () => {
        const quantity = product.mainQuantity || 0;
        
        if (filterStatus === 'all') return true;
        if (filterStatus === 'out') return quantity === 0;
        if (filterStatus === 'low') return quantity > 0 && quantity < 10;
        if (filterStatus === 'available') return quantity >= 10;
        return true;
      };

      return matchesSearch && matchesWarehouse && matchesStatus();
    });
  }, [products, searchQuery, selectedWarehouse, filterStatus]);

  // إحصائيات المنتجات المفلترة
  const stats = useMemo(() => {
    const available = filteredProducts.filter(p => (p.mainQuantity || 0) >= 10).length;
    const low = filteredProducts.filter(p => (p.mainQuantity || 0) > 0 && (p.mainQuantity || 0) < 10).length;
    const out = filteredProducts.filter(p => (p.mainQuantity || 0) === 0).length;
    const totalValue = filteredProducts.reduce((sum, p) => sum + ((p.mainPrice || 0) * (p.mainQuantity || 0)), 0);
    
    return { available, low, out, totalValue };
  }, [filteredProducts]);

  // دالة الحصول على اسم المخزن
  const getWarehouseName = (warehouseId) => {
    const id = typeof warehouseId === 'string' ? parseInt(warehouseId) : warehouseId;
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : '-';
  };

  // دالة إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedWarehouse('');
    setFilterStatus('all');
  };

  // دالة تصدير CSV
  const exportToCSV = () => {
    const headers = ['الاسم', 'الفئة', 'المخزن', 'الكمية الأساسية', 'السعر', 'القيمة الإجمالية', 'الحالة'];
    
    const rows = filteredProducts.map(product => {
      const quantity = product.mainQuantity || 0;
      let status = 'متاح';
      if (quantity === 0) status = 'منتهي';
      else if (quantity < 10) status = 'منخفض';
      
      return [
        product.name,
        product.category,
        getWarehouseName(product.warehouseId),
        quantity,
        product.mainPrice || 0,
        (product.mainPrice || 0) * quantity,
        status
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${new Date().toLocaleDateString('ar-EG')}.csv`;
    link.click();
    
    showSuccess('تم تصدير الجرد بنجاح');
  };

  const warehouseOptions = [
    { value: '', label: 'جميع المخازن' },
    ...warehouses.map(w => ({ value: w.id, label: w.name }))
  ];

  const statusOptions = [
    { value: 'all', label: 'جميع المنتجات' },
    { value: 'available', label: 'متاح (≥ 10)' },
    { value: 'low', label: 'منخفض (1-9)' },
    { value: 'out', label: 'منتهي (0)' },
  ];

  // دالة لتحديد اللون حسب الحالة
  const getStatusColor = (quantity) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity < 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (quantity) => {
    if (quantity === 0) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
          <FaTimesCircle /> منتهي
        </span>
      );
    }
    if (quantity < 10) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
          <FaExclamationTriangle /> منخفض
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
        <FaCheckCircle /> متاح
      </span>
    );
  };

  const hasActiveFilters = searchQuery || selectedWarehouse || filterStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">جرد المخازن</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
        >
          <FaDownload /> تصدير CSV
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">إجمالي المنتجات</p>
              <h3 className="text-2xl font-bold mt-1">{filteredProducts.length}</h3>
              <p className="text-xs opacity-75 mt-1">من {products.length} منتج</p>
            </div>
            <FaBox className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">متاح</p>
              <h3 className="text-2xl font-bold mt-1">{stats.available}</h3>
              <p className="text-xs opacity-75 mt-1">أكثر من 10 قطع</p>
            </div>
            <FaCheckCircle className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">منخفض</p>
              <h3 className="text-2xl font-bold mt-1">{stats.low}</h3>
              <p className="text-xs opacity-75 mt-1">1-9 قطع</p>
            </div>
            <FaExclamationTriangle className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">منتهي</p>
              <h3 className="text-2xl font-bold mt-1">{stats.out}</h3>
              <p className="text-xs opacity-75 mt-1">يحتاج إعادة توريد</p>
            </div>
            <FaTimesCircle className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الفئة..."
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                showFilters 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <FaFilter /> فلاتر متقدمة
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تصفية حسب المخزن</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {warehouseOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تصفية حسب الحالة</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>عرض {filteredProducts.length} من {products.length} منتج</span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <FaTimes /> إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* جدول الجرد */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 p-4">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {hasActiveFilters 
                ? 'لا توجد منتجات مطابقة للبحث' 
                : 'لا توجد منتجات في المخازن'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الفئة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المخزن</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الكمية</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">السعر</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">القيمة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const quantity = product.mainQuantity || 0;
                  const totalValue = (product.mainPrice || 0) * quantity;
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        quantity === 0 ? 'bg-red-50' : quantity < 10 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded flex items-center justify-center text-white text-sm">
                            <FaBox />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                            {product.barcode && (
                              <p className="text-xs text-gray-500 font-mono">{product.barcode}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-700">{product.category}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FaWarehouse className="text-gray-400 text-xs" />
                          <span className="text-sm text-gray-700">{getWarehouseName(product.warehouseId)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-lg font-bold ${getStatusColor(quantity)}`}>
                          {quantity}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-sm text-gray-700">
                          {(product.mainPrice || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-semibold text-green-600 text-sm">
                          {totalValue.toLocaleString('ar-EG')} ج.م
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {getStatusBadge(quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      {filteredProducts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-600">إجمالي قيمة المخزون</p>
              <p className="text-xl font-bold text-blue-600">
                {stats.totalValue.toLocaleString('ar-EG')} ج.م
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">متوسط قيمة المنتج</p>
              <p className="text-xl font-bold text-blue-600">
                {(stats.totalValue / filteredProducts.length).toFixed(2)} ج.م
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">معدل التوفر</p>
              <p className="text-xl font-bold text-blue-600">
                {((stats.available / filteredProducts.length) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
