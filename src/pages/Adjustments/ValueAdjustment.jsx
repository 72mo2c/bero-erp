// ======================================
// Value Adjustment - تسوية القيمة
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaDollarSign, FaSearch, FaPlus, FaSave, FaWarehouse } from 'react-icons/fa';

const ValueAdjustment = () => {
  const { products, warehouses } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setNewCostPrice(product.costPrice || '');
    setNewSalePrice(product.salePrice || '');
    setSearchTerm('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !reason) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const transaction = {
      type: 'value_adjustment',
      productId: selectedProduct.id,
      warehouseId: selectedWarehouse,
      oldCostPrice: selectedProduct.costPrice,
      newCostPrice: parseFloat(newCostPrice),
      oldSalePrice: selectedProduct.salePrice,
      newSalePrice: parseFloat(newSalePrice),
      reason,
      notes,
      date: new Date().toISOString(),
    };

    console.log('تسوية القيمة:', transaction);
    showSuccess('تم تسجيل تسوية القيمة بنجاح');
    
    setSelectedProduct(null);
    setSelectedWarehouse('');
    setNewCostPrice('');
    setNewSalePrice('');
    setReason('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaDollarSign className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تسوية القيمة</h1>
              <p className="text-gray-500 mt-1">إعادة تقييم أسعار المنتجات</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search Product */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-green-500" />
                البحث عن المنتج
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو الباركود..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {searchTerm && (
                <div className="mt-4 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full p-4 hover:bg-green-50 transition-colors text-right border-b last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">تكلفة: {product.costPrice} | بيع: {product.salePrice}</div>
                        </div>
                        <FaPlus className="text-green-500" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>

            {selectedProduct && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">تفاصيل التسوية</h3>
                
                <div className="space-y-4">
                  {/* Current Prices */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3">الأسعار الحالية</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">سعر التكلفة:</div>
                        <div className="text-xl font-bold text-blue-600">{selectedProduct.costPrice}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">سعر البيع:</div>
                        <div className="text-xl font-bold text-blue-600">{selectedProduct.salePrice}</div>
                      </div>
                    </div>
                  </div>

                  {/* New Prices */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">سعر التكلفة الجديد</label>
                    <input
                      type="number"
                      value={newCostPrice}
                      onChange={(e) => setNewCostPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      placeholder="أدخل سعر التكلفة الجديد..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">سعر البيع الجديد</label>
                    <input
                      type="number"
                      value={newSalePrice}
                      onChange={(e) => setNewSalePrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      placeholder="أدخل سعر البيع الجديد..."
                    />
                  </div>

                  {/* Profit Margin Preview */}
                  {newCostPrice && newSalePrice && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">هامش الربح الجديد:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {((parseFloat(newSalePrice) - parseFloat(newCostPrice)) / parseFloat(newCostPrice) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Warehouse (Optional) */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      <FaWarehouse className="inline ml-2 text-green-500" />
                      المخزن (اختياري)
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                    >
                      <option value="">جميع المخازن</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">السبب *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="إعادة_تقييم">إعادة تقييم</option>
                      <option value="تغير_سعر_السوق">تغير سعر السوق</option>
                      <option value="تصحيح_خطأ">تصحيح خطأ</option>
                      <option value="عرض_خاص">عرض خاص</option>
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                      placeholder="أضف ملاحظات إضافية..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
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
              <h3 className="text-lg font-bold text-gray-800 mb-4">📝 معلومات</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>تستخدم لإعادة تقييم أسعار المنتجات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يمكن تطبيقها على مخزن محدد أو جميع المخازن</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يتم حساب هامش الربح تلقائياً</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueAdjustment;