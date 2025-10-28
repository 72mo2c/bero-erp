// ======================================
// Manage Products - إدارة وسجل البضائع (محسّنة)
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { 
  FaBox, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaSearch,
  FaFilter,
  FaDownload,
  FaWarehouse,
  FaBarcode,
  FaMoneyBillWave,
  FaTags,
  FaChartBar,
  FaExclamationTriangle,
  FaTools
} from 'react-icons/fa';

const ManageProducts = () => {
  const { products, categories, warehouses, updateProduct, deleteProduct } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  
  // State للبحث والفلترة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // State للتعديل
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // دالة تنسيق العملة باستخدام إعدادات النظام
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // فحص الصلاحيات
  const canEdit = hasPermission('edit_product');
  const canDelete = hasPermission('delete_product');
  const canExport = hasPermission('export_data');
  const canViewInventory = hasPermission('view_inventory');

  // الإحصائيات
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.mainPrice * p.mainQuantity), 0);
    const lowStock = products.filter(p => p.mainQuantity < 10).length;
    const categoriesCount = [...new Set(products.map(p => p.category))].length;
    
    return {
      totalProducts,
      totalValue,
      lowStock,
      categoriesCount
    };
  }, [products]);

  // فلترة المنتجات
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = !filterCategory || product.category === filterCategory;
      const matchWarehouse = !filterWarehouse || product.warehouseId === parseInt(filterWarehouse);
      
      return matchSearch && matchCategory && matchWarehouse;
    });
  }, [products, searchTerm, filterCategory, filterWarehouse]);

  // دوال التعديل
  const handleEdit = (product) => {
    if (!canEdit) {
      showError('ليس لديك صلاحية لتعديل المنتجات');
      return;
    }
    setEditingId(product.id);
    setEditFormData({ ...product });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = () => {
    try {
      const updatedData = {
        ...editFormData,
        mainPrice: parseFloat(editFormData.mainPrice) || 0,
        subPrice: parseFloat(editFormData.subPrice) || 0,
        mainQuantity: parseInt(editFormData.mainQuantity) || 0,
        subQuantity: parseInt(editFormData.subQuantity) || 0,
        warehouseId: parseInt(editFormData.warehouseId),
      };
      
      updateProduct(editingId, updatedData);
      showSuccess('تم تحديث المنتج بنجاح');
      setEditingId(null);
      setEditFormData({});
    } catch (error) {
      showError('حدث خطأ في التحديث');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleDelete = (id, name) => {
    if (!canDelete) {
      showError('ليس لديك صلاحية لحذف المنتجات');
      return;
    }
    
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟\nسيتم حذف جميع البيانات المرتبطة به.`)) {
      try {
        deleteProduct(id);
        showSuccess('تم حذف المنتج بنجاح');
      } catch (error) {
        showError('حدث خطأ في الحذف');
      }
    }
  };

  // تصدير البيانات إلى CSV
  const exportToCSV = () => {
    if (!canExport) {
      showError('ليس لديك صلاحية لتصدير البيانات');
      return;
    }
    
    const headers = ['الاسم', 'الفئة', 'المخزن', 'الكمية الأساسية', 'السعر الأساسي', 'القيمة الإجمالية', 'الباركود'];
    
    const rows = filteredProducts.map(product => {
      const warehouse = warehouses.find(w => w.id === product.warehouseId);
      return [
        product.name,
        product.category,
        warehouse?.name || '-',
        product.mainQuantity,
        product.mainPrice,
        product.mainPrice * product.mainQuantity,
        product.barcode || '-'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toLocaleDateString('ar-EG')}.csv`;
    link.click();
    
    showSuccess('تم تصدير البيانات بنجاح');
  };

  // الحصول على اسم المخزن
  const getWarehouseName = (warehouseId) => {
    const id = typeof warehouseId === 'string' ? parseInt(warehouseId) : warehouseId;
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : '-';
  };

  // الحصول على لون الفئة
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#fb923c';
  };

  // خيارات الفلترة
  const categoryOptions = [
    { value: '', label: 'جميع الفئات' },
    ...categories.map(c => ({ value: c.name, label: c.name }))
  ];

  const warehouseOptions = [
    { value: '', label: 'جميع المخازن' },
    ...warehouses.map(w => ({ value: w.id.toString(), label: w.name }))
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">إدارة وسجل البضائع</h2>
        {canExport && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            <FaDownload /> تصدير CSV
          </button>
        )}
      </div>

      {/* الإحصائيات المحسّنة */}
      {!canViewInventory ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-yellow-600 text-xl" />
          <div>
            <p className="text-yellow-800 font-semibold">
              ليس لديك صلاحية لعرض إحصائيات المخزون
            </p>
            <p className="text-yellow-700 text-sm">يرجى التواصل مع المدير للحصول على الصلاحية</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">إجمالي المنتجات</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalProducts}</h3>
              <p className="text-blue-200 text-xs mt-1">منتج</p>
            </div>
            <FaBox className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">قيمة المخزون</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(stats.totalValue)}</h3>
              <p className="text-green-200 text-xs mt-1">{settings?.currency || 'EGP'}</p>
            </div>
            <FaMoneyBillWave className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">مخزون منخفض</p>
              <h3 className="text-3xl font-bold mt-1">{stats.lowStock}</h3>
              <p className="text-orange-200 text-xs mt-1">منتج</p>
            </div>
            <FaExclamationTriangle className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">عدد الفئات</p>
              <h3 className="text-3xl font-bold mt-1">{stats.categoriesCount}</h3>
              <p className="text-purple-200 text-xs mt-1">فئة</p>
            </div>
            <FaTags className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">كميات سالبة</p>
              <h3 className="text-3xl font-bold mt-1">
                {products.filter(p => (p.mainQuantity || 0) < 0).length}
              </h3>
              <p className="text-red-200 text-xs mt-1">منتج</p>
            </div>
            <FaExclamationTriangle className="text-4xl opacity-80" />
          </div>
        </div>
      </div>
      )}

      {/* رسائل تنبيه */}
      {stats.lowStock > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-yellow-600 text-xl" />
          <div>
            <p className="text-yellow-800 font-semibold">
              تنبيه: يوجد {stats.lowStock} منتج بمخزون منخفض
            </p>
            <p className="text-yellow-700 text-sm">يُنصح بمراجعة المخزون وإعادة التزويد</p>
          </div>
        </div>
      )}

      {products.filter(p => (p.mainQuantity || 0) < 0).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600 text-xl" />
          <div className="flex-1">
            <p className="text-red-800 font-semibold">
              خطأ حرج: يوجد منتجات بكميات سالبة
            </p>
            <p className="text-red-700 text-sm">يتطلب إصلاح فوري</p>
          </div>
          <button
            onClick={() => {
              // التنقل إلى أداة الإصلاح
              const event = new CustomEvent('navigate', { detail: '/tools/fix-negative-quantities' });
              window.dispatchEvent(event);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
          >
            <FaTools />
            أدوات الإصلاح
          </button>
        </div>
      )}
          

      {/* البحث والفلترة */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث عن منتج (الاسم، الباركود، الفئة)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <label className="block text-xs font-medium text-gray-700 mb-1">فلترة حسب الفئة</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">فلترة حسب المخزن</label>
                <select
                  value={filterWarehouse}
                  onChange={(e) => setFilterWarehouse(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  {warehouseOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>عرض {filteredProducts.length} من {products.length} منتج</span>
            {(searchTerm || filterCategory || filterWarehouse) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('');
                  setFilterWarehouse('');
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
              >
                <FaTimes /> إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 p-4">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || filterCategory || filterWarehouse 
                ? 'لا توجد منتجات مطابقة للبحث' 
                : 'لا توجد منتجات بعد، قم بإضافة منتج جديد!'}
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
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">الباركود</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  editingId === product.id ? (
                    // صف التعديل
                    <tr key={product.id} className="bg-blue-50 border-b">
                      <td className="px-3 py-3" colSpan="8">
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">اسم المنتج *</label>
                              <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الفئة *</label>
                              <select
                                name="category"
                                value={editFormData.category}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                {categories.map(c => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">المخزن *</label>
                              <select
                                name="warehouseId"
                                value={editFormData.warehouseId}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                {warehouses.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الكمية الأساسية *</label>
                              <input
                                type="number"
                                name="mainQuantity"
                                value={editFormData.mainQuantity}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الكمية الفرعية</label>
                              <input
                                type="number"
                                name="subQuantity"
                                value={editFormData.subQuantity}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الباركود</label>
                              <input
                                type="text"
                                name="barcode"
                                value={editFormData.barcode || ''}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي * ({settings?.currency || 'EGP'})</label>
                              <input
                                type="number"
                                step="0.01"
                                name="mainPrice"
                                value={editFormData.mainPrice}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي ({settings?.currency || 'EGP'})</label>
                              <input
                                type="number"
                                step="0.01"
                                name="subPrice"
                                value={editFormData.subPrice}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                              <input
                                type="text"
                                name="description"
                                value={editFormData.description || ''}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {canEdit && (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold"
                                >
                                  <FaSave /> حفظ التعديلات
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-semibold"
                                >
                                  <FaTimes /> إلغاء
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // صف عادي
                    <tr 
                      key={product.id} 
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        product.mainQuantity < 10 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded flex items-center justify-center text-white text-sm">
                            <FaBox />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-gray-500">{product.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: getCategoryColor(product.category) }}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FaWarehouse className="text-gray-400 text-xs" />
                          <span className="text-sm">{getWarehouseName(product.warehouseId)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm">{product.mainQuantity}</p>
                          {product.subQuantity > 0 && (
                            <p className="text-xs text-gray-500">+ {product.subQuantity} فرعي</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <p className="font-semibold text-sm">{formatCurrency(product.mainPrice)}</p>
                          {product.subPrice > 0 && (
                            <p className="text-xs text-gray-500">{formatCurrency(product.subPrice)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-bold text-green-600 text-sm">
                          {formatCurrency(product.mainPrice * product.mainQuantity)}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        {product.barcode ? (
                          <div className="flex items-center gap-1">
                            <FaBarcode className="text-gray-400 text-xs" />
                            <span className="text-xs font-mono">{product.barcode}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 justify-center">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="تعديل"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="حذف"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="text-xs text-gray-400">غير متوفر</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
