// ======================================
// Manage Warehouses - ضبط وإدارة المخازن
// ======================================

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaCog, FaEdit, FaTrash, FaPlus, FaWarehouse, FaBoxes, FaSearch, FaChartLine, FaLock } from 'react-icons/fa';

const ManageWarehouses = () => {
  const navigate = useNavigate();
  const { warehouses, updateWarehouse, deleteWarehouse, products } = useData();
  const { showSuccess, showError, showWarning } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const [editModal, setEditModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});

  // حساب عدد المنتجات لكل مخزن
  const getProductCountForWarehouse = (warehouseId) => {
    return products?.filter(p => p.warehouseId === warehouseId).length || 0;
  };

  // حساب قيمة المخزون لكل مخزن
  const getTotalValueForWarehouse = (warehouseId) => {
    const warehouseProducts = products?.filter(p => p.warehouseId === warehouseId) || [];
    return warehouseProducts.reduce((total, product) => {
      const quantity = product.mainQuantity || 0;
      const price = product.price || 0;
      return total + (quantity * price);
    }, 0);
  };

  // فلترة المخازن حسب البحث
  const filteredWarehouses = useMemo(() => {
    if (!warehouses) return [];
    
    return warehouses.filter(warehouse => {
      const searchLower = searchTerm.toLowerCase();
      return (
        warehouse.name?.toLowerCase().includes(searchLower) ||
        warehouse.address?.toLowerCase().includes(searchLower) ||
        warehouse.manager?.toLowerCase().includes(searchLower) ||
        warehouse.phone?.includes(searchTerm)
      );
    });
  }, [warehouses, searchTerm]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const total = warehouses?.length || 0;
    const active = warehouses?.filter(w => w.status === 'active').length || 0;
    const inactive = total - active;
    const totalProducts = products?.length || 0;
    const totalValue = products?.reduce((sum, p) => {
      return sum + ((p.mainQuantity || 0) * (p.price || 0));
    }, 0) || 0;

    return { total, active, inactive, totalProducts, totalValue };
  }, [warehouses, products]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المخزن مطلوب';
    } else {
      const duplicateName = warehouses?.some(
        w => w.id !== selectedWarehouse?.id && 
        w.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      if (duplicateName) {
        newErrors.name = 'اسم المخزن موجود مسبقاً';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\+20[0-9]{9,10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ +20 ويتكون من 9-10 أرقام';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (warehouse) => {
    if (!hasPermission('edit_warehouse')) {
      showError('ليس لديك صلاحية تعديل المخازن');
      return;
    }
    
    setSelectedWarehouse(warehouse);
    setFormData({
      name: warehouse.name || '',
      address: warehouse.address || '',
      phone: warehouse.phone || '',
      manager: warehouse.manager || '',
      description: warehouse.description || '',
      status: warehouse.status || 'active'
    });
    setErrors({});
    setEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!hasPermission('edit_warehouse')) {
      showError('ليس لديك صلاحية تعديل المخازن');
      return;
    }

    if (!validateForm()) {
      showError('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    try {
      const updatedData = {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        manager: formData.manager.trim(),
        description: formData.description.trim()
      };

      updateWarehouse(selectedWarehouse.id, updatedData);
      showSuccess('تم تحديث بيانات المخزن بنجاح');
      setEditModal(false);
      setSelectedWarehouse(null);
    } catch (error) {
      showError('حدث خطأ في تحديث المخزن');
      console.error('Error updating warehouse:', error);
    }
  };

  const handleDelete = (warehouse) => {
    if (!hasPermission('delete_warehouse')) {
      showError('ليس لديك صلاحية حذف المخازن');
      return;
    }

    // التحقق من وجود منتجات في المخزن
    const productCount = getProductCountForWarehouse(warehouse.id);
    
    if (productCount > 0) {
      showWarning(
        `لا يمكن حذف المخزن "${warehouse.name}" لأنه يحتوي على ${productCount} منتج. يجب حذف أو نقل المنتجات أولاً.`
      );
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف المخزن "${warehouse.name}"؟`)) {
      try {
        deleteWarehouse(warehouse.id);
        showSuccess('تم حذف المخزن بنجاح');
      } catch (error) {
        showError('حدث خطأ في حذف المخزن');
        console.error('Error deleting warehouse:', error);
      }
    }
  };

  const handleStatusToggle = (warehouse) => {
    if (!hasPermission('edit_warehouse')) {
      showError('ليس لديك صلاحية تعديل المخازن');
      return;
    }

    const newStatus = warehouse.status === 'active' ? 'inactive' : 'active';
    try {
      updateWarehouse(warehouse.id, { status: newStatus });
      showSuccess(`تم ${newStatus === 'active' ? 'تفعيل' : 'تعطيل'} المخزن بنجاح`);
    } catch (error) {
      showError('حدث خطأ في تغيير حالة المخزن');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* العنوان */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCog className="text-orange-500" />
            ضبط وإدارة المخازن
          </h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة جميع المخازن في النظام</p>
        </div>
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={() => navigate('/warehouses/add-warehouse')}
        >
          إضافة مخزن جديد
        </Button>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي المخازن</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <FaWarehouse className="text-4xl opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">مخازن نشطة</p>
              <p className="text-3xl font-bold mt-1">{stats.active}</p>
            </div>
            <FaChartLine className="text-4xl opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">مخازن معطلة</p>
              <p className="text-3xl font-bold mt-1">{stats.inactive}</p>
            </div>
            <FaWarehouse className="text-4xl opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي المنتجات</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <FaBoxes className="text-4xl opacity-80" />
          </div>
        </Card>

        {hasPermission('view_inventory') ? (
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">قيمة المخزون</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <FaChartLine className="text-4xl opacity-80" />
            </div>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">قيمة المخزون</p>
                <p className="text-lg font-bold mt-1 flex items-center gap-2">
                  <FaLock className="text-sm" />
                  مخفي
                </p>
              </div>
              <FaChartLine className="text-4xl opacity-80" />
            </div>
          </Card>
        )}
      </div>

      {/* شريط البحث */}
      <Card className="mb-6">
        <div className="relative">
          <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم، العنوان، المدير أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </Card>

      {/* جدول المخازن */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الهاتف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدير
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عدد المنتجات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  قيمة المخزون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWarehouses && filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((warehouse) => {
                  const productCount = getProductCountForWarehouse(warehouse.id);
                  const totalValue = getTotalValueForWarehouse(warehouse.id);

                  return (
                    <tr key={warehouse.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaWarehouse className="text-orange-500 ml-2" />
                          <div className="text-sm font-medium text-gray-900">{warehouse.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {warehouse.address || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {warehouse.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {warehouse.manager || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {productCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {hasPermission('view_inventory') ? formatCurrency(totalValue) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <FaLock className="text-xs" />
                            مخفي
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasPermission('edit_warehouse') ? (
                          <button
                            onClick={() => handleStatusToggle(warehouse)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              warehouse.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {warehouse.status === 'active' ? 'نشط' : 'معطل'}
                          </button>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            warehouse.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {warehouse.status === 'active' ? 'نشط' : 'معطل'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {hasPermission('edit_warehouse') && (
                            <button
                              onClick={() => handleEdit(warehouse)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="تعديل"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                          )}
                          {hasPermission('delete_warehouse') && (
                            <button
                              onClick={() => handleDelete(warehouse)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="حذف"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد مخازن. قم بإضافة مخزن جديد'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal}
        onClose={() => {
          setEditModal(false);
          setSelectedWarehouse(null);
          setErrors({});
        }}
        title="تعديل بيانات المخزن"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Input
              label="اسم المخزن"
              name="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              required
              error={errors.name}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Input
              label="العنوان"
              name="address"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (errors.address) setErrors({ ...errors, address: '' });
              }}
              required
              error={errors.address}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <Input
              label="رقم الهاتف"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              placeholder="+20 XXX XXX XXXX"
              error={errors.phone}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <Input
            label="مدير المخزن"
            name="manager"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="active">نشط</option>
              <option value="inactive">معطل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              وصف المخزن
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="وصف المخزن..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditModal(false);
                setSelectedWarehouse(null);
                setErrors({});
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="success">
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageWarehouses;