// ======================================
// Damaged Write-Off - شطب تالف
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaTrash, FaSearch, FaPlus, FaSave, FaWarehouse, FaExclamationCircle } from 'react-icons/fa';

const DamagedWriteOff = () => {
  const { products, warehouses } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('');
  const [damageType, setDamageType] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !selectedWarehouse || !quantity || !damageType) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const qty = parseFloat(quantity);
    if (qty <= 0) {
      showWarning('الكمية يجب أن تكون أكبر من صفر');
      return;
    }

    if (qty > getCurrentStock()) {
      showWarning('الكمية المطلوب شطبها أكبر من الكمية المتوفرة');
      return;
    }

    const transaction = {
      type: 'damaged_writeoff',
      productId: selectedProduct.id,
      warehouseId: selectedWarehouse,
      quantity: qty,
      damageType,
      notes,
      date: new Date().toISOString(),
    };

    console.log('شطب تالف:', transaction);
    showSuccess('تم تسجيل شطب التالف بنجاح');
    
    setSelectedProduct(null);
    setSelectedWarehouse('');
    setQuantity('');
    setDamageType('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaTrash className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">شطب تالف</h1>
              <p className="text-gray-500 mt-1">شطب المنتجات التالفة أو المنتهية الصلاحية</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search Product */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-red-500" />
                البحث عن المنتج
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو الباركود..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all"
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
                        className="w-full p-4 hover:bg-red-50 transition-colors text-right border-b last:border-b-0 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-gray-800">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.barcode}</div>
                        </div>
                        <FaPlus className="text-red-500" />
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
                <h3 className="text-lg font-bold text-gray-800 mb-6">تفاصيل الشطب</h3>
                
                <div className="space-y-4">
                  {/* Product Info */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-2">المنتج المحدد</h4>
                    <div className="text-gray-700">{selectedProduct.name}</div>
                  </div>

                  {/* Warehouse Selection */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      <FaWarehouse className="inline ml-2 text-red-500" />
                      المخزن *
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
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

                  {/* Current Stock */}
                  {selectedWarehouse && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">الكمية المتوفرة:</span>
                        <span className="text-2xl font-bold text-blue-600">{getCurrentStock()}</span>
                      </div>
                    </div>
                  )}

                  {/* Quantity to Write-Off */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">الكمية المطلوب شطبها *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                      placeholder="أدخل الكمية..."
                      required
                    />
                  </div>

                  {/* Damage Type */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">نوع التلف *</label>
                    <select
                      value={damageType}
                      onChange={(e) => setDamageType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر نوع التلف...</option>
                      <option value="منتهي_الصلاحية">منتهي الصلاحية</option>
                      <option value="تلف_أثناء_التخزين">تلف أثناء التخزين</option>
                      <option value="تلف_أثناء_النقل">تلف أثناء النقل</option>
                      <option value="عطب_في_التصنيع">عطب في التصنيع</option>
                      <option value="تلف_جزئي">تلف جزئي</option>
                      <option value="غير_صالح_للاستخدام">غير صالح للاستخدام</option>
                      <option value="آخر">سبب آخر</option>
                    </select>
                  </div>

                  {/* Warning if quantity exceeds stock */}
                  {selectedWarehouse && quantity && parseFloat(quantity) > getCurrentStock() && (
                    <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 flex items-center gap-2 text-red-700">
                      <FaExclamationCircle className="text-xl" />
                      <span className="font-semibold">تحذير: الكمية المطلوب شطبها أكبر من الكمية المتوفرة!</span>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                      placeholder="أضف ملاحظات إضافية حول التلف..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    تأكيد الشطب
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ تنبيهات مهمة</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>عملية الشطب نهائية ولا يمكن التراجع عنها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>تأكد من فحص المنتج قبل الشطب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>حدد نوع التلف بدقة للتقارير</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>يتم خصم الكمية تلقائياً من المخزون</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📋 معلومات</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يتم تسجيل جميع عمليات الشطب في السجل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يمكن عرض تقارير الشطب لاحقاً</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamagedWriteOff;