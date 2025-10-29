// ======================================
// Enhanced New Purchase Return - إرجاع فاتورة مشتريات محسّن
// ======================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useTab } from '../../contexts/TabContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { 
  FaSave, 
  FaArrowLeft, 
  FaUndo, 
  FaPlus, 
  FaTrash, 
  FaEdit,
  FaPercentage,
  FaMoneyBillWave,
  FaCalculator,
  FaExclamationTriangle,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const EnhancedNewPurchaseReturn = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { closeTab } = useTab();
  const { purchaseInvoices, products, suppliers, addPurchaseReturn, purchaseReturns } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();

  const [invoice, setInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState({});

  // دالة تنسيق العملة
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

  useEffect(() => {
    console.log('🚀 تم تحميل مكون EnhancedNewPurchaseReturn');
    
    let actualInvoiceId = invoiceId;
    
    if (!actualInvoiceId) {
      const hash = window.location.hash;
      if (hash && hash.includes('/return/')) {
        actualInvoiceId = hash.split('/return/')[1];
      }
      
      if (!actualInvoiceId) {
        const urlParams = new URLSearchParams(window.location.search);
        actualInvoiceId = urlParams.get('id');
      }
    }
    
    console.log('🔑 معرف الفاتورة:', actualInvoiceId);
    
    const timer = setTimeout(() => {
      if (!actualInvoiceId) {
        showError('معرف الفاتورة غير صحيح');
        navigate('/purchases/manage');
        return;
      }

      if (!purchaseInvoices || !Array.isArray(purchaseInvoices)) {
        return;
      }

      const foundInvoice = purchaseInvoices.find(inv => 
        inv.id === parseInt(actualInvoiceId) || inv.id.toString() === actualInvoiceId.toString()
      );
      
      if (!foundInvoice) {
        showError('الفاتورة غير موجودة');
        navigate('/purchases/manage');
        return;
      }

      console.log('✅ تم العثور على الفاتورة:', foundInvoice.id);
      setInvoice(foundInvoice);
      
      // إعداد المنتجات مع البيانات القابلة للتعديل
      const itemsWithReturnInfo = foundInvoice.items.map(item => {
        const previousReturns = purchaseReturns?.filter(ret => 
          ret.invoiceId === foundInvoice.id && ret.status !== 'cancelled'
        ) || [];
        
        let totalReturnedQty = 0;
        previousReturns.forEach(ret => {
          const retItem = ret.items.find(i => i.productId === item.productId);
          if (retItem) {
            totalReturnedQty += (retItem.quantity || 0) + (retItem.subQuantity || 0);
          }
        });
        
        const originalQty = (item.quantity || 0) + (item.subQuantity || 0);
        const availableQty = originalQty - totalReturnedQty;
        
        const product = products?.find(p => p.id === parseInt(item.productId));
        
        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: item.productId,
          productName: product?.name || item.productName || 'غير محدد',
          productCode: product?.barcode || product?.code || '-',
          category: product?.category || '-',
          unit: product?.unit || 'قطعة',
          
          // البيانات الأصلية
          originalQuantity: item.quantity || 0,
          originalSubQuantity: item.subQuantity || 0,
          originalPrice: item.price || 0,
          originalSubPrice: item.subPrice || 0,
          
          // البيانات المرتجعة سابقاً
          returnedQty: totalReturnedQty,
          
          // البيانات القابلة للتعديل
          availableQty: availableQty,
          returnQuantity: 0,
          discount: 0,
          discountType: 'percentage', // percentage أو fixed
          customPrice: item.price || 0, // سعر قابل للتعديل
          selected: false,
          
          // حساب الإجماليات
          subtotal: 0,
          discountAmount: 0,
          total: 0
        };
      });
      
      setReturnItems(itemsWithReturnInfo);
      setIsLoading(false);
      console.log('🎉 تم تحميل صفحة المرتجعات المحسّنة بنجاح');
    }, 100);

    return () => clearTimeout(timer);
  }, [invoiceId, purchaseInvoices, purchaseReturns, navigate, showError, products]);

  // تحديث الحسابات عند تغيير البيانات
  useEffect(() => {
    const updatedItems = returnItems.map(item => {
      const quantity = item.returnQuantity;
      const price = item.customPrice;
      const subtotal = quantity * price;
      const discountAmount = item.discountType === 'percentage' 
        ? (subtotal * item.discount) / 100
        : item.discount;
      const total = subtotal - discountAmount;
      
      return {
        ...item,
        subtotal,
        discountAmount,
        total
      };
    });
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(returnItems)) {
      setReturnItems(updatedItems);
    }
  }, [returnItems.map(item => item.returnQuantity).join(',')] + 
     returnItems.map(item => item.customPrice).join(',') + 
     returnItems.map(item => item.discount).join(',') + 
     returnItems.map(item => item.discountType).join(','));

  const handleItemSelect = (index) => {
    const updated = [...returnItems];
    updated[index].selected = !updated[index].selected;
    
    // إذا تم إلغاء التحديد، إعادة تعيين الكميات والخصومات
    if (!updated[index].selected) {
      updated[index].returnQuantity = 0;
      updated[index].discount = 0;
      updated[index].customPrice = updated[index].originalPrice;
    }
    
    setReturnItems(updated);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...returnItems];
    const newValue = Math.max(0, parseInt(value) || 0);
    
    if (newValue > updated[index].availableQty) {
      showError(`الكمية المرتجعة تتجاوز المتاح (${updated[index].availableQty})`);
      return;
    }
    
    updated[index].returnQuantity = newValue;
    setReturnItems(updated);
  };

  const handlePriceChange = (index, value) => {
    const updated = [...returnItems];
    const newValue = Math.max(0, parseFloat(value) || 0);
    updated[index].customPrice = newValue;
    setReturnItems(updated);
  };

  const handleDiscountChange = (index, value) => {
    const updated = [...returnItems];
    const newValue = Math.max(0, parseFloat(value) || 0);
    
    if (updated[index].discountType === 'percentage' && newValue > 100) {
      showError('الخصم بالنسبة المئوية لا يمكن أن يتجاوز 100%');
      return;
    }
    
    updated[index].discount = newValue;
    setReturnItems(updated);
  };

  const handleDiscountTypeChange = (index, type) => {
    const updated = [...returnItems];
    updated[index].discountType = type;
    updated[index].discount = 0; // إعادة تعيين الخصم عند تغيير النوع
    setReturnItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...returnItems];
    updated.splice(index, 1);
    setReturnItems(updated);
  };

  const toggleEditMode = (index) => {
    setEditMode(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const calculateSubtotals = () => {
    const selectedItems = returnItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = selectedItems.reduce((sum, item) => sum + item.discountAmount, 0);
    const total = selectedItems.reduce((sum, item) => sum + item.total, 0);
    
    return { subtotal, totalDiscount, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedItems = returnItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      showError('يرجى اختيار منتج واحد على الأقل للإرجاع');
      return;
    }

    const hasInvalidQuantity = selectedItems.some(item => item.returnQuantity === 0);
    if (hasInvalidQuantity) {
      showError('يرجى إدخال كمية صحيحة للمنتجات المحددة');
      return;
    }

    if (!reason.trim()) {
      showError('يرجى إدخال سبب الإرجاع');
      return;
    }

    try {
      const { subtotal, totalDiscount, total } = calculateSubtotals();
      
      const returnData = {
        invoiceId: invoice.id,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.returnQuantity,
          customPrice: item.customPrice,
          discount: item.discount,
          discountType: item.discountType,
          total: item.total
        })),
        reason,
        notes,
        subtotal,
        discountAmount: totalDiscount,
        totalAmount: total,
        date: new Date().toISOString()
      };

      addPurchaseReturn(returnData);
      showSuccess('تم إرجاع المنتجات بنجاح');
      
      // إغلاق التبويب والعودة إلى إدارة المشتريات
      if (closeTab) {
        closeTab(activeTabId);
      } else {
        navigate('/purchases/manage');
      }
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية الإرجاع');
    }
  };

  if (isLoading || !invoice) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg mb-2">جاري تحميل بيانات الفاتورة...</p>
          <p className="text-gray-300 text-xs mt-2">الوقت: {new Date().toLocaleTimeString('ar-SA')}</p>
        </div>
      </div>
    );
  }

  const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
  const { subtotal, totalDiscount, total } = calculateSubtotals();

  return (
    <ErrorBoundary componentName="إرجاع فاتورة مشتريات محسّن">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">إرجاع فاتورة مشتريات</h1>
              <p className="text-blue-100">فاتورة رقم #{invoice.id} - {supplier?.name || 'غير محدد'}</p>
            </div>
            <button
              onClick={() => navigate('/purchases/manage')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <FaArrowLeft /> رجوع
            </button>
          </div>
        </div>

        {/* معلومات الفاتورة */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalculator className="text-blue-600" />
            معلومات الفاتورة الأصلية
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">المورد</p>
              <p className="font-semibold text-sm">{supplier?.name || 'غير محدد'}</p>
              <p className="text-xs text-gray-500">{supplier?.phone || '-'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">التاريخ</p>
              <p className="font-semibold text-sm">
                {new Date(invoice.date).toLocaleDateString('ar-EG')}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">نوع الدفع</p>
              <p className="font-semibold text-sm">
                {invoice.paymentType === 'cash' ? 'نقدي' : invoice.paymentType === 'deferred' ? 'آجل' : 'جزئي'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">المجموع الكلي</p>
              <p className="font-bold text-lg text-purple-600">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </div>

        {/* نموذج الإرجاع */}
        <form onSubmit={handleSubmit}>
          {/* جدول المنتجات القابل للتعديل */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gray-50 p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaUndo className="text-red-600" />
                المنتجات المراد إرجاعها
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const updated = returnItems.map(item => ({
                            ...item,
                            selected: e.target.checked && item.availableQty > 0
                          }));
                          setReturnItems(updated);
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">المنتج</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الكمية المتاحة</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">كمية الإرجاع</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">السعر</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الخصم</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الإجمالي</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnItems.map((item, index) => {
                    const isDisabled = item.availableQty === 0;
                    const isSelected = item.selected;
                    
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleItemSelect(index)}
                            disabled={isDisabled}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                          <div className="text-xs text-gray-400">كود: {item.productCode}</div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.availableQty > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {item.availableQty} {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isSelected ? (
                            <input
                              type="number"
                              value={item.returnQuantity}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              min="1"
                              max={item.availableQty}
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isSelected ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">د.ع</span>
                              <input
                                type="number"
                                value={item.customPrice}
                                onChange={(e) => handlePriceChange(index, e.target.value)}
                                className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {isSelected ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={item.discount}
                                onChange={(e) => handleDiscountChange(index, e.target.value)}
                                className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max={item.discountType === 'percentage' ? 100 : 999999}
                                step={item.discountType === 'percentage' ? 1 : 0.01}
                              />
                              <select
                                value={item.discountType}
                                onChange={(e) => handleDiscountTypeChange(index, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="percentage">%</option>
                                <option value="fixed">د.ع</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-bold text-green-600">
                            {isSelected ? formatCurrency(item.total) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            {isSelected && (
                              <button
                                type="button"
                                onClick={() => toggleEditMode(index)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title={editMode[index] ? 'إيقاف التعديل' : 'تعديل'}
                              >
                                <FaEdit size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="حذف"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* سبب الإرجاع والملاحظات */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-600" />
              تفاصيل الإرجاع
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب الإرجاع <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر السبب...</option>
                  <option value="defective">منتج معيب</option>
                  <option value="damaged">منتج تالف</option>
                  <option value="wrong_item">منتج خاطئ</option>
                  <option value="expired">منتج منتهي الصلاحية</option>
                  <option value="excess">زيادة في الكمية</option>
                  <option value="quality_issue">مشكلة في الجودة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل ملاحظات إضافية..."
                />
              </div>
            </div>
          </div>

          {/* ملخص مالي */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              الملخص المالي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">المجموع الجزئي</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(subtotal)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">إجمالي الخصومات</p>
                <p className="text-xl font-bold text-red-600">-{formatCurrency(totalDiscount)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-1">إجمالي المبلغ المرتجع</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/purchases/manage')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaTimes /> إلغاء
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaUndo /> تنفيذ الإرجاع
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedNewPurchaseReturn;