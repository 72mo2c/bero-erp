// ======================================
// New Cash Disbursement - إضافة إذن صرف نقدي
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { FaSave, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

const NewCashDisbursement = () => {
  const navigate = useNavigate();
  const { addCashDisbursement, suppliers, customers, treasuryBalance } = useData();
  const { showError, showSuccess } = useNotification();
  
  const [formData, setFormData] = useState({
    disbursementNumber: `DIS-${Date.now()}`,
    amount: '',
    toType: 'supplier', // supplier, customer, employee, other
    toId: '',
    toName: '',
    category: 'invoice_payment', // invoice_payment, return_refund, salary, expenses, bank, other
    paymentMethod: 'cash', // cash, check, bank_transfer
    referenceNumber: '',
    notes: '',
    description: ''
  });
  
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  
  const [errors, setErrors] = useState({});
  
  // خيارات الفئات
  const categoryOptions = [
    { value: 'invoice_payment', label: 'سداد فاتورة مشتريات' },
    { value: 'return_refund', label: 'استرداد مرتجعات مبيعات' },
    { value: 'salary', label: 'رواتب' },
    { value: 'expenses', label: 'مصاريف عامة' },
    { value: 'bank', label: 'إيداع في بنك' },
    { value: 'other', label: 'أخرى' }
  ];
  
  // خيارات طرق الدفع
  const paymentMethods = [
    { value: 'cash', label: 'نقداً' },
    { value: 'check', label: 'شيك' },
    { value: 'bank_transfer', label: 'تحويل بنكي' }
  ];
  
  // الحصول على قائمة المستفيدين بناءً على النوع
  const getRecipientList = () => {
    if (formData.toType === 'supplier') {
      return suppliers;
    } else if (formData.toType === 'customer') {
      return customers;
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
    
    // إعادة تعيين toId عند تغيير النوع
    if (name === 'toType') {
      setFormData(prev => ({
        ...prev,
        toId: '',
        toName: ''
      }));
    }
    
    // تحديث الاسم عند اختيار المستفيد
    if (name === 'toId') {
      const recipientList = formData.toType === 'supplier' ? suppliers : 
                           formData.toType === 'customer' ? customers : [];
      const selected = recipientList.find(r => r.id === parseInt(value));
      if (selected) {
        setSelectedRecipient(selected);
        setFormData(prev => ({
          ...prev,
          toName: selected.name
        }));
      } else {
        setSelectedRecipient(null);
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'يرجى إدخال مبلغ صحيح';
    }
    
    if (parseFloat(formData.amount) > treasuryBalance) {
      newErrors.amount = 'المبلغ أكبر من رصيد الخزينة المتوفر (' + treasuryBalance.toFixed(2) + ' جنيه)';
    }
    
    if (['supplier', 'customer', 'employee'].includes(formData.toType) && !formData.toId) {
      newErrors.toId = 'يرجى اختيار المستفيد';
    }
    
    if (formData.toType === 'other' && !formData.toName) {
      newErrors.toName = 'يرجى إدخال اسم المستفيد';
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
      addCashDisbursement(formData);
      showSuccess('تم إضافة إيصال الصرف بنجاح');
      navigate('/treasury/disbursements');
    } catch (error) {
      showError('خطأ: ' + error.message);
    }
  };
  
  const handleCancel = () => {
    navigate('/treasury/disbursements');
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="إذن صرف نقدي جديد"
        icon={<FaMoneyBillWave />}
      />
      
      {/* عرض رصيد الخزينة */}
      <Card>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">رصيد الخزينة الحالي:</span>
            <span className="text-2xl font-bold text-blue-600">
              {treasuryBalance.toFixed(2)} جنيه
            </span>
          </div>
        </div>
      </Card>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات الإيصال */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات الإيصال</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">رقم الإيصال</label>
                <input
                  type="text"
                  name="disbursementNumber"
                  value={formData.disbursementNumber}
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
            </div>
          </div>
          
          {/* معلومات المستفيد */}
          <div>
            <h3 className="text-lg font-semibold mb-4">معلومات المستفيد</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  نوع المستفيد <span className="text-red-500">*</span>
                </label>
                <select
                  name="toType"
                  value={formData.toType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="supplier">مورد</option>
                  <option value="customer">عميل</option>
                  <option value="employee">موظف</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              
              {['supplier', 'customer', 'employee'].includes(formData.toType) ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {formData.toType === 'supplier' ? 'المورد' : 
                       formData.toType === 'customer' ? 'العميل' : 'الموظف'} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="toId"
                      value={formData.toId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.toId ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">اختر 
                        {formData.toType === 'supplier' ? ' المورد' : 
                         formData.toType === 'customer' ? ' العميل' : ' الموظف'}
                      </option>
                      {getRecipientList().map(recipient => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name} - {recipient.phone || 'لا يوجد هاتف'}
                        </option>
                      ))}
                    </select>
                    {errors.toId && (
                      <p className="text-red-500 text-sm mt-1">{errors.toId}</p>
                    )}
                  </div>
                  
                  {/* عرض معلومات المستفيد المختار */}
                  {selectedRecipient && (
                    <div className="md:col-span-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">معلومات {formData.toType === 'supplier' ? 'المورد' : formData.toType === 'customer' ? 'العميل' : 'الموظف'}:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">الاسم:</span>
                            <p className="font-medium">{selectedRecipient.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">الهاتف:</span>
                            <p className="font-medium">{selectedRecipient.phone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">البريد الإلكتروني:</span>
                            <p className="font-medium">{selectedRecipient.email || '-'}</p>
                          </div>
                          {selectedRecipient.address && (
                            <div className="md:col-span-3">
                              <span className="text-gray-600">العنوان:</span>
                              <p className="font-medium">{selectedRecipient.address}</p>
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
                    اسم المستفيد <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="toName"
                    value={formData.toName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.toName ? 'border-red-500' : ''
                    }`}
                    placeholder="أدخل اسم المستفيد"
                  />
                  {errors.toName && (
                    <p className="text-red-500 text-sm mt-1">{errors.toName}</p>
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

export default NewCashDisbursement;