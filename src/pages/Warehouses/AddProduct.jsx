// ======================================
// Add Product - إضافة بضاعة إلى مخزن (محسّنة)
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaSave, FaCheckCircle, FaTimes, FaWarehouse, FaTags, FaDollarSign, FaCubes, FaBarcode, FaUndo } from 'react-icons/fa';

const AddProduct = () => {
  const navigate = useNavigate();
  const { warehouses, categories, addProduct } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    mainPrice: '',
    subPrice: '',
    mainQuantity: '',
    subQuantity: '',
    warehouseId: '',
    barcode: '',
    description: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        mainPrice: parseFloat(formData.mainPrice) || 0,
        subPrice: parseFloat(formData.subPrice) || 0,
        mainQuantity: parseInt(formData.mainQuantity) || 0,
        subQuantity: parseInt(formData.subQuantity) || 0,
        warehouseId: parseInt(formData.warehouseId),
        createdAt: new Date().toISOString()
      };

      const newProduct = addProduct(productData);
      
      // حفظ بيانات المنتج المضاف للعرض في Modal
      setAddedProduct({
        ...newProduct,
        warehouseName: warehouses.find(w => w.id === parseInt(formData.warehouseId))?.name || 'غير محدد'
      });
      
      // إظهار Modal التأكيد
      setShowSuccessModal(true);
      showSuccess('تم إضافة المنتج بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        category: '',
        mainPrice: '',
        subPrice: '',
        mainQuantity: '',
        subQuantity: '',
        warehouseId: '',
        barcode: '',
        description: ''
      });
    } catch (error) {
      showError('حدث خطأ في إضافة المنتج');
    }
  };

  const nameInputRef = useRef(null);

  // التركيز التلقائي عند التحميل
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // معالجة اختصارات الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) {
          const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
          form.dispatchEvent(submitEvent);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name
  }));

  const categoryOptions = categories.map(c => ({
    value: c.name,
    label: c.name
  }));

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      mainPrice: '',
      subPrice: '',
      mainQuantity: '',
      subQuantity: '',
      warehouseId: '',
      barcode: '',
      description: ''
    });
    nameInputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* الأزرار العلوية */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">إضافة بضاعة جديدة</h2>
        <div className="flex gap-2">
          <button
            type="submit"
            form="product-form"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            <FaSave /> حفظ المنتج
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
          >
            <FaUndo /> إعادة تعيين
          </button>
        </div>
      </div>

      {/* Modal تأكيد إضافة المنتج بنجاح */}
      {showSuccessModal && addedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl text-white relative">
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
              <h2 className="text-2xl font-bold text-center">تم إضافة المنتج بنجاح!</h2>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* اسم المنتج */}
              <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-lg border-r-4 border-orange-500">
                <div className="flex items-center gap-3">
                  <FaBox className="text-orange-500" size={24} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">اسم المنتج</p>
                    <p className="text-lg font-bold text-gray-800">{addedProduct.name}</p>
                  </div>
                </div>
              </div>

              {/* الفئة والمخزن */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTags className="text-blue-500" />
                    <p className="text-sm text-gray-500">الفئة</p>
                  </div>
                  <p className="font-semibold text-gray-800">{addedProduct.category}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaWarehouse className="text-purple-500" />
                    <p className="text-sm text-gray-500">المخزن</p>
                  </div>
                  <p className="font-semibold text-gray-800">{addedProduct.warehouseName}</p>
                </div>
              </div>

              {/* السعر والكمية */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDollarSign className="text-green-500" />
                    <p className="text-sm text-gray-500">السعر الأساسي</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{addedProduct.mainPrice.toFixed(2)} ج.م</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCubes className="text-indigo-500" />
                    <p className="text-sm text-gray-500">الكمية الأساسية</p>
                  </div>
                  <p className="text-xl font-bold text-indigo-600">{addedProduct.mainQuantity}</p>
                </div>
              </div>

              {/* معلومات إضافية */}
              {addedProduct.barcode && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">الباركود</p>
                  <p className="font-mono font-semibold text-gray-800">{addedProduct.barcode}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                إضافة منتج آخر
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // توجيه المستخدم إلى صفحة عرض البضائع
                  navigate('/warehouses/manage-products');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                عرض البضاعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* البطاقة الرئيسية */}
      <div className="bg-white rounded-lg shadow-md">
        <form id="product-form" onSubmit={handleSubmit}>
          {/* معلومات أساسية */}
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaBox className="text-orange-500" /> معلومات المنتج الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* اسم المنتج */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم المنتج *</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم المنتج"
                  required
                />
              </div>

              {/* الفئة */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الفئة *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* المخزن */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المخزن *</label>
                <select
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">اختر المخزن</option>
                  {warehouseOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* الأسعار */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaDollarSign className="text-green-500" /> الأسعار
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">السعر الأساسي *</label>
                <input
                  type="number"
                  step="0.01"
                  name="mainPrice"
                  value={formData.mainPrice}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">السعر الفرعي</label>
                <input
                  type="number"
                  step="0.01"
                  name="subPrice"
                  value={formData.subPrice}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* الكميات */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaCubes className="text-blue-500" /> الكميات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الكمية الأساسية *</label>
                <input
                  type="number"
                  name="mainQuantity"
                  value={formData.mainQuantity}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الكمية الفرعية</label>
                <input
                  type="number"
                  name="subQuantity"
                  value={formData.subQuantity}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaBarcode className="text-purple-500" /> معلومات إضافية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">رقم الباركود</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="وصف مختصر للمنتج"
                />
              </div>
            </div>
          </div>
        </form>

        {/* اختصارات الكيبورد */}
        <div className="px-4 py-3 bg-gray-100 border-t text-xs text-gray-500 text-center">
          <span className="inline-block mx-2">💡 اختصارات: </span>
          <span className="inline-block mx-2">Ctrl+S = حفظ</span>
          <span className="inline-block mx-2">Tab = التنقل</span>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
