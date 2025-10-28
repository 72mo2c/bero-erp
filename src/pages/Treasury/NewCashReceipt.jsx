// ======================================
// New Cash Receipt - إضافة إذن استلام نقدي
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { FaSave, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

const NewCashReceipt = () => {
  const navigate = useNavigate();
  const { addCashReceipt, customers, suppliers } = useData();
  const { showError, showSuccess } = useNotification();
  
  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Date.now()}`,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    fromType: 'customer', // customer, supplier, other
    fromId: '',
    fromName: '',
    category: 'invoice_payment', // invoice_payment, return_refund, capital, bank, other
    paymentMethod: 'cash', // cash, check, bank_transfer
    referenceNumber: '',
    notes: '',
    description: ''
  });
  
  const [selectedSource, setSelectedSource] = useState(null);
  
  const [errors, setErrors] = useState({});
  
  // خيارات الفئات
  const categoryOptions = [
    { value: 'invoice_payment', label: 'سداد فاتورة مبيعات' },
    { value: 'return_refund', label: 'استرداد مرتجعات مشتريات' },
    { value: 'capital', label: 'إيداع رأس مال' },
    { value: 'bank', label: 'استلام من بنك' },
    { value: 'revenue', label: 'إيرادات متنوعة' },
    { value: 'other', label: 'أخرى' }
  ];
  
  // خيارات طرق الدفع
  const paymentMethods = [
    { value: 'cash', label: 'نقداً' },
    { value: 'check', label: 'شيك' },
    { value: 'bank_transfer', label: 'تحويل بنكي' }
  ];
  
  // الحصول على قائمة المصادر بناءً على النوع
  const getSourceList = () => {
    if (formData.fromType === 'customer') {
      return customers;
    } else if (formData.fromType === 'supplier') {
      return suppliers;
    }
    return [];
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // مسح الخطأ عند التعديل
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // إعادة تعيين fromId عند تغيير النوع
    if (name === 'fromType') {
      setFormData(prev => ({
        ...prev,
        fromId: '',
        fromName: ''
      }));
    }
    
    // تحديث الاسم عند اختيار المصدر
    if (name === 'fromId') {
      const sourceList = formData.fromType === 'customer' ? customers : suppliers;
      const selected = sourceList.find(s => s.id === parseInt(value));
      if (selected) {
        setSelectedSource(selected);
        setFormData(prev => ({
          ...prev,
          fromName: selected.name
        }));
      } else {
        setSelectedSource(null);
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح';
    }
    
    if (formData.fromType !== 'other' && !formData.fromId) {
      newErrors.fromId = 'يرجى اختيار المصدر';
    }
    
    if (formData.fromType === 'other' && !formData.fromName) {
      newErrors.fromName = 'يرجى إدخال اسم المصدر';
    }
    
    if (!formData.category) {
      newErrors.category = 'يرجى اختيار الفئة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const receiptData = {
        ...formData,
        date: `${formData.date}T${formData.time}:00`
      };
      addCashReceipt(receiptData);
      showSuccess('تم إضافة إيصال الاستلام بنجاح');
      navigate('/treasury/receipts');
    } catch (error) {
      showError('خطأ: ' + error.message);
    }
  };
  
  const handleCancel = () => {
    navigate('/treasury/receipts');
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="إذن استلام نقدي جديد"
        icon={<FaMoneyBillWave />}
      />
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات الإيصال */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات الإيصال</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">رقم الإيصال</label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  المبلغ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-500' : ''
                  }`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  التاريخ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الوقت <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* معلومات المصدر */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات المصدر</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  نوع المصدر <span className="text-red-500">*</span>
                </label>
                <select
                  name="fromType"
                  value={formData.fromType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">عميل</option>
                  <option value="supplier">مورد</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              {formData.fromType !== 'other' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {formData.fromType === 'customer' ? 'العميل' : 'المورد'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fromId"
                      value={formData.fromId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.fromId ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">اختر {formData.fromType === 'customer' ? 'العميل' : 'المورد'}</option>
                      {getSourceList().map(source => (
                        <option key={source.id} value={source.id}>
                          {source.name} - {source.phone || 'لا يوجد هاتف'}
                        </option>
                      ))}
                    </select>
                    {errors.fromId && (
                      <p className="text-red-500 text-sm mt-1">{errors.fromId}</p>
                    )}
                  </div>
                  
                  {/* عرض معلومات المصدر المختار */}
                  {selectedSource && (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">معلومات {formData.fromType === 'customer' ? 'العميل' : 'المورد'}:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">الاسم:</span>
                            <p className="font-medium">{selectedSource.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">الهاتف:</span>
                            <p className="font-medium">{selectedSource.phone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">البريد الإلكتروني:</span>
                            <p className="font-medium">{selectedSource.email || '-'}</p>
                          </div>
                          {selectedSource.address && (
                            <div className="md:col-span-3">
                              <span className="text-gray-600">العنوان:</span>
                              <p className="font-medium">{selectedSource.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    اسم المصدر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fromName"
                    value={formData.fromName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.fromName ? 'border-red-500' : ''
                    }`}
                    placeholder="أدخل اسم المصدر"
                  />
                  {errors.fromName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fromName}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* معلومات إضافية */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات إضافية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  الفئة <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-500' : ''
                  }`}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">طريقة الدفع</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">رقم المرجع</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="رقم الفاتورة أو المرجع"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="وصف مختصر"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">ملاحظات</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ملاحظات إضافية..."
              />
            </div>
          </div>
          
          {/* أزرار التحكم */}
          <div className="flex gap-4 pt-4 border-t">
            <Button type="submit" variant="primary" icon={<FaSave />}>
              حفظ الإيصال
            </Button>
            <Button type="button" variant="secondary" icon={<FaTimes />} onClick={handleCancel}>
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewCashReceipt;