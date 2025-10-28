// ======================================
// Quantity Adjustment - تسوية الكميات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaBoxes, FaSearch, FaPlus, FaSave, FaWarehouse, FaExclamationTriangle } from 'react-icons/fa';

const QuantityAdjustment = () => {
  const { products, warehouses, addInventoryTransaction } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('increase'); // increase or decrease
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // البحث عن المنتجات
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchTerm('');
  };

  const getCurrentStock = () => {
    if (!selectedProduct || !selectedWarehouse) return 0;
    return selectedProduct.stock?.[selectedWarehouse] || 0;
  };

  const getNewStock = () => {
    const current = getCurrentStock();
    const qty = parseFloat(quantity) || 0;
    return adjustmentType === 'increase' ? current + qty : current - qty;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !selectedWarehouse || !quantity || !reason) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const qty = parseFloat(quantity);
    if (qty <= 0) {
      showWarning('الكمية يجب أن تكون أكبر من صفر');
      return;
    }

    const newStock = getNewStock();
    if (newStock < 0) {
      showWarning('لا يمكن أن تكون الكمية الجديدة سالبة');
      return;
    }

    // تسجيل التسوية
    const transaction = {
      type: 'adjustment',
      productId: selectedProduct.id,
      warehouseId: selectedWarehouse,
      adjustmentType,
      quantity: qty,
      oldStock: getCurrentStock(),
      newStock,
      reason,
      notes,
      date: new Date().toISOString(),
    };

    console.log('تسوية الكمية:', transaction);
    showSuccess('تم تسجيل تسوية الكمية بنجاح');
    
    // إعادة تعيين النموذج
    setSelectedProduct(null);
    setSelectedWarehouse('');
    setQuantity('');
    setReason('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaBoxes className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تسوية الكميات</h1>
              <p className="text-gray-500 mt-1">تصحيح الفروقات بين المخزون الفعلي والدفتري</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Product */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-purple-500" />
                البحث عن المنتج
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو الباركود..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-all"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Search Results */}
              {searchTerm && (
                <div className="mt-4 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full p-4 hover:bg-purple-50 transition-colors text-right border-b last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.barcode}</div>
                        </div>
                        <FaPlus className="text-purple-500" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Product Details */}
            {selectedProduct && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">المنتج المحدد</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">اسم المنتج:</span>
                    <span className="font-bold text-gray-800">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الباركود:</span>
                    <span className="font-mono text-gray-800">{selectedProduct.barcode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الفئة:</span>
                    <span className="text-gray-800">{selectedProduct.category}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Adjustment Form */}
            {selectedProduct && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">تفاصيل التسوية</h3>
                
                <div className="space-y-4">
                  {/* Warehouse Selection */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      <FaWarehouse className="inline ml-2 text-purple-500" />
                      المخزن *
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر المخزن...</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Stock Display */}
                  {selectedWarehouse && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">الكمية الحالية:</span>
                        <span className="text-2xl font-bold text-blue-600">{getCurrentStock()}</span>
                      </div>
                    </div>
                  )}

                  {/* Adjustment Type */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">نوع التسوية *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAdjustmentType('increase')}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                          adjustmentType === 'increase'
                            ? 'bg-green-500 border-green-500 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-green-500'
                        }`}
                      >
                        زيادة (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustmentType('decrease')}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                          adjustmentType === 'decrease'
                            ? 'bg-red-500 border-red-500 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-red-500'
                        }`}
                      >
                        نقص (-)
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">الكمية *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="أدخل الكمية..."
                      required
                    />
                  </div>

                  {/* New Stock Preview */}
                  {selectedWarehouse && quantity && (
                    <div className={`rounded-xl p-4 border-2 ${
                      getNewStock() < 0
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">الكمية الجديدة:</span>
                        <span className={`text-2xl font-bold ${
                          getNewStock() < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {getNewStock()}
                        </span>
                      </div>
                      {getNewStock() < 0 && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <FaExclamationTriangle />
                          <span>تحذير: الكمية الجديدة سالبة!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">السبب *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="جرد">جرد دوري</option>
                      <option value="فرق_عد">فرق في العد</option>
                      <option value="خطأ_إدخال">خطأ في الإدخال</option>
                      <option value="تلف">تلف جزئي</option>
                      <option value="فقدان">فقدان</option>
                      <option value="آخر">سبب آخر</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                      placeholder="أضف ملاحظات إضافية..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    حفظ التسوية
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📝 معلومات مهمة</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>تستخدم تسوية الكميات لتصحيح الفروقات بين المخزون الفعلي والمسجل في النظام</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يجب إجراء جرد فعلي قبل عمل التسوية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يتم تسجيل جميع التسويات في سجل التسويات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>لا يمكن التراجع عن التسوية بعد حفظها</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ تنبيهات</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>تأكد من صحة الكميات قبل الحفظ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>اختر السبب المناسب للتسوية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>أضف ملاحظات توضيحية عند الحاجة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityAdjustment;