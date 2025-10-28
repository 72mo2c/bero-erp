// ======================================
// Transfer Between Warehouses - تحويل بين المخازن
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Select from '../../components/Common/Select';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { 
  FaExchangeAlt, 
  FaWarehouse, 
  FaBox, 
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaChartLine,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';

const Transfer = () => {
  const { warehouses, products, transfers, transferProduct } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransfer, setLastTransfer] = useState(null);

  // الحصول على المنتجات المتوفرة في المخزن المصدر
  const availableProducts = useMemo(() => {
    if (!formData.fromWarehouseId) return [];
    
    return products.filter(p => 
      p.warehouseId === parseInt(formData.fromWarehouseId)
    );
  }, [products, formData.fromWarehouseId]);

  // إحصائيات التحويلات
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransfers = transfers.filter(t => {
      const transferDate = new Date(t.date);
      transferDate.setHours(0, 0, 0, 0);
      return transferDate.getTime() === today.getTime();
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthTransfers = transfers.filter(t => {
      const transferDate = new Date(t.date);
      return transferDate >= thisMonth;
    });

    return {
      total: transfers.length,
      today: todayTransfers.length,
      thisMonth: monthTransfers.length,
      totalQuantity: transfers.reduce((sum, t) => sum + t.quantity, 0)
    };
  }, [transfers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // عند اختيار منتج، نحفظ بياناته
    if (name === 'productId' && value) {
      const product = availableProducts.find(p => p.id === parseInt(value));
      setSelectedProduct(product);
    }

    // إعادة تعيين المنتج المختار عند تغيير المخزن المصدر
    if (name === 'fromWarehouseId') {
      setFormData(prev => ({
        ...prev,
        productId: '',
        quantity: ''
      }));
      setSelectedProduct(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من عدم التحويل لنفس المخزن
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      showError('لا يمكن التحويل إلى نفس المخزن');
      return;
    }

    // التحقق من الكمية
    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      showError('الكمية يجب أن تكون أكبر من صفر');
      return;
    }

    if (selectedProduct && quantity > selectedProduct.mainQuantity) {
      showError(`الكمية المتوفرة فقط ${selectedProduct.mainQuantity}`);
      return;
    }

    try {
      const transferData = {
        productId: parseInt(formData.productId),
        fromWarehouseId: parseInt(formData.fromWarehouseId),
        toWarehouseId: parseInt(formData.toWarehouseId),
        quantity: quantity,
        notes: formData.notes
      };

      const result = transferProduct(transferData);
      
      // حفظ بيانات التحويل لعرضها في Modal
      setLastTransfer({
        ...result,
        fromWarehouseName: warehouses.find(w => w.id === parseInt(formData.fromWarehouseId))?.name,
        toWarehouseName: warehouses.find(w => w.id === parseInt(formData.toWarehouseId))?.name
      });
      
      setShowSuccessModal(true);
      showSuccess('تم تحويل المنتج بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        productId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: '',
        notes: ''
      });
      setSelectedProduct(null);
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية التحويل');
    }
  };

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name
  }));

  const productOptions = availableProducts.map(p => ({
    value: p.id,
    label: `${p.name} - ${p.category} (متوفر: ${p.mainQuantity})`
  }));

  // دالة لحساب الوقت المنقضي
  const getTimeAgo = (date) => {
    const now = new Date();
    const transferDate = new Date(date);
    const diffInMinutes = Math.floor((now - transferDate) / 60000);
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">تحويل بين المخازن</h1>
      </div>

      {/* Modal تأكيد التحويل */}
      {showSuccessModal && lastTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl text-white relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 left-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <FaTimes size={20} />
              </button>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-4">
                  <FaCheckCircle size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center">تم التحويل بنجاح!</h2>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* اسم المنتج */}
              <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border-r-4 border-orange-500">
                <div className="flex items-center gap-3">
                  <FaBox className="text-orange-500" size={24} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">المنتج</p>
                    <p className="text-lg font-bold text-gray-800">{lastTransfer.productName}</p>
                  </div>
                </div>
              </div>

              {/* التحويل */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <FaWarehouse className="text-blue-500 mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500">من المخزن</p>
                    <p className="font-bold text-gray-800">{lastTransfer.fromWarehouseName}</p>
                  </div>
                  <FaArrowRight className="text-blue-500" size={24} />
                  <div className="text-center flex-1">
                    <FaWarehouse className="text-green-500 mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500">إلى المخزن</p>
                    <p className="font-bold text-gray-800">{lastTransfer.toWarehouseName}</p>
                  </div>
                </div>
              </div>

              {/* الكمية */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaExchangeAlt className="text-green-500" />
                  <p className="text-sm text-gray-500">الكمية المحولة</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{lastTransfer.quantity}</p>
              </div>

              {/* ملاحظات */}
              {lastTransfer.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">ملاحظات</p>
                  <p className="text-gray-800">{lastTransfer.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="primary"
                className="w-full"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي التحويلات</p>
              <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
            </div>
            <FaHistory className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">تحويلات اليوم</p>
              <h3 className="text-3xl font-bold mt-2">{stats.today}</h3>
            </div>
            <FaChartLine className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">تحويلات الشهر</p>
              <h3 className="text-3xl font-bold mt-2">{stats.thisMonth}</h3>
            </div>
            <FaExchangeAlt className="text-4xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي الكميات</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalQuantity}</h3>
            </div>
            <FaBox className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* نموذج التحويل */}
      <Card icon={<FaExchangeAlt />} title="نموذج التحويل">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار المخازن */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="من المخزن (المصدر)"
                name="fromWarehouseId"
                value={formData.fromWarehouseId}
                onChange={handleChange}
                options={warehouseOptions}
                required
                icon={<FaWarehouse />}
              />
              {formData.fromWarehouseId && (
                <p className="text-sm text-gray-500 mt-2">
                  <FaInfoCircle className="inline ml-1" />
                  المنتجات المتوفرة: {availableProducts.length}
                </p>
              )}
            </div>

            <div>
              <Select
                label="إلى المخزن (الوجهة)"
                name="toWarehouseId"
                value={formData.toWarehouseId}
                onChange={handleChange}
                options={warehouseOptions}
                required
                icon={<FaWarehouse />}
              />
            </div>
          </div>

          {/* اختيار المنتج */}
          {formData.fromWarehouseId && (
            <div>
              <Select
                label="اختر المنتج"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                options={productOptions}
                required
                icon={<FaBox />}
              />
              {availableProducts.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-600" />
                  <p className="text-sm text-yellow-700">لا توجد منتجات في هذا المخزن</p>
                </div>
              )}
            </div>
          )}

          {/* معلومات المنتج المختار */}
          {selectedProduct && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                معلومات المنتج
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">الاسم</p>
                  <p className="font-semibold text-gray-800">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الفئة</p>
                  <p className="font-semibold text-gray-800">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الكمية المتوفرة</p>
                  <p className="font-bold text-green-600 text-lg">{selectedProduct.mainQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">السعر</p>
                  <p className="font-semibold text-gray-800">{selectedProduct.mainPrice} ج.م</p>
                </div>
              </div>
            </div>
          )}

          {/* الكمية والملاحظات */}
          {formData.productId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="الكمية المراد تحويلها"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="أدخل الكمية"
                  min="1"
                  max={selectedProduct?.mainQuantity}
                  required
                />
              </div>

              <div>
                <label className="label">ملاحظات (اختياري)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                  placeholder="أدخل ملاحظات حول عملية التحويل..."
                />
              </div>
            </>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-4">
            <Button 
              type="submit" 
              variant="primary" 
              icon={<FaExchangeAlt />}
              disabled={!formData.productId || !formData.fromWarehouseId || !formData.toWarehouseId}
            >
              تنفيذ التحويل
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => {
                setFormData({
                  productId: '',
                  fromWarehouseId: '',
                  toWarehouseId: '',
                  quantity: '',
                  notes: ''
                });
                setSelectedProduct(null);
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      {/* سجل التحويلات الأخيرة */}
      <Card icon={<FaHistory />} title="سجل التحويلات الأخيرة">
        {transfers.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد تحويلات بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-white border-b-2 border-blue-200">
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">المنتج</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">من المخزن</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">إلى المخزن</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">الكمية</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {transfers.slice(0, 10).map((transfer) => (
                  <tr key={transfer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(transfer.date).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="text-xs text-gray-500">{getTimeAgo(transfer.date)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FaBox className="text-orange-500" />
                        <span className="font-semibold text-gray-800">{transfer.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {warehouses.find(w => w.id === transfer.toWarehouseId)?.name || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-blue-600">{transfer.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{transfer.notes || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transfer;
