// ======================================
// New Purchase Return - إرجاع فاتورة مشتريات
// ======================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaSave, FaArrowLeft, FaUndo } from 'react-icons/fa';

const NewPurchaseReturn = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { purchaseInvoices, products, suppliers, addPurchaseReturn, purchaseReturns } = useData();
  const { showSuccess, showError } = useNotification();

  const [invoice, setInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تأخير قصير للسماح بتحميل البيانات
    const timer = setTimeout(() => {
      // تحقق من وجود معرف الفاتورة
      if (!invoiceId) {
        console.error('❌ معرف الفاتورة غير موجود في URL');
        showError('معرف الفاتورة غير صحيح');
        navigate('/purchases/manage');
        return;
      }

      // تحقق من تحميل البيانات الأساسية
      if (!purchaseInvoices || !Array.isArray(purchaseInvoices)) {
        console.log('⏳ البيانات لم تُحمل بعد، منتظر...', {
          purchaseInvoicesExists: !!purchaseInvoices,
          purchaseInvoicesLength: purchaseInvoices?.length || 0,
          invoiceId: invoiceId,
          invoiceIdType: typeof invoiceId
        });
        return; // انتظار تحميل البيانات
      }

      if (purchaseInvoices.length === 0) {
        console.log('⚠️ لا توجد فواتير مشتريات في النظام');
        showError('لا توجد فواتير مشتريات في النظام');
        setIsLoading(false);
        navigate('/purchases/manage');
        return;
      }

      console.log('🔍 البحث عن الفاتورة...', {
        invoiceId: invoiceId,
        invoiceIdType: typeof invoiceId,
        purchaseInvoicesCount: purchaseInvoices.length,
        firstInvoiceId: purchaseInvoices[0]?.id,
        firstInvoiceIdType: typeof purchaseInvoices[0]?.id
      });

      // البحث عن الفاتورة مع مقارنة مرنة
      const foundInvoice = purchaseInvoices.find(inv => {
        const match = inv.id === parseInt(invoiceId) || 
                     inv.id.toString() === invoiceId.toString();
        if (match) {
          console.log('✅ تم العثور على الفاتورة:', inv);
        }
        return match;
      });
      
      if (!foundInvoice) {
        console.error('❌ الفاتورة غير موجودة:', {
          invoiceId: invoiceId,
          availableInvoiceIds: purchaseInvoices.map(inv => ({id: inv.id, type: typeof inv.id}))
        });
        showError('الفاتورة غير موجودة');
        setIsLoading(false);
        navigate('/purchases/manage');
        return;
      }

      console.log('✅ تم العثور على الفاتورة بنجاح:', foundInvoice.id);
      
      setInvoice(foundInvoice);
      
      // حساب الكميات المرتجعة مسبقاً لكل منتج بفصل الكميات الأساسية والفرعية
      const itemsWithReturnInfo = foundInvoice.items.map(item => {
        const previousReturns = purchaseReturns?.filter(ret => 
          ret.invoiceId === foundInvoice.id && ret.status !== 'cancelled'
        ) || [];
        
        let totalReturnedMainQty = 0;
        let totalReturnedSubQty = 0;
        previousReturns.forEach(ret => {
          const retItem = ret.items.find(i => i.productId === item.productId);
          if (retItem) {
            totalReturnedMainQty += (retItem.quantity || 0);
            totalReturnedSubQty += (retItem.subQuantity || 0);
          }
        });
        
        const originalMainQty = item.quantity || 0;
        const originalSubQty = item.subQuantity || 0;
        const availableMainQty = originalMainQty - totalReturnedMainQty;
        const availableSubQty = originalSubQty - totalReturnedSubQty;
        const totalAvailableQty = availableMainQty + availableSubQty;
        
        // الحصول على اسم المنتج من قائمة المنتجات
        const product = products?.find(p => p.id === parseInt(item.productId));
        
        return {
          productId: item.productId,
          productName: product?.name || item.productName || 'غير محدد',
          originalQuantity: originalMainQty,
          originalSubQuantity: originalSubQty,
          originalPrice: item.price || 0,
          originalSubPrice: item.subPrice || 0,
          returnedMainQty: totalReturnedMainQty,
          returnedSubQty: totalReturnedSubQty,
          availableMainQty: availableMainQty,
          availableSubQty: availableSubQty,
          availableQty: totalAvailableQty,
          returnQuantity: 0,
          returnSubQuantity: 0,
          selected: false
        };
      });
      
      setReturnItems(itemsWithReturnInfo);
      setIsLoading(false); // انتهاء التحميل
      console.log('🎉 تم تحميل صفحة المرتجعات بنجاح');
    }, 100); // تأخير 100ms

    return () => clearTimeout(timer);
  }, [invoiceId, purchaseInvoices, purchaseReturns, navigate, showError, products]);

  const handleItemSelect = (index) => {
    const updated = [...returnItems];
    updated[index].selected = !updated[index].selected;
    
    // إذا تم إلغاء التحديد، إعادة تعيين الكميات
    if (!updated[index].selected) {
      updated[index].returnQuantity = 0;
      updated[index].returnSubQuantity = 0;
    }
    
    setReturnItems(updated);
  };

  const handleQuantityChange = (index, field, value) => {
    const updated = [...returnItems];
    const item = updated[index];
    
    const newValue = Math.max(0, parseInt(value) || 0);
    
    // التحقق من عدم تجاوز الكمية المتاحة لكل نوع على حدة
    if (field === 'returnQuantity') {
      if (newValue > item.availableMainQty) {
        showError(`الكمية الأساسية المرتجعة تتجاوز المتاح (${item.availableMainQty})`);
        return;
      }
      updated[index][field] = newValue;
    } else if (field === 'returnSubQuantity') {
      if (newValue > item.availableSubQty) {
        showError(`الكمية الفرعية المرتجعة تتجاوز المتاح (${item.availableSubQty})`);
        return;
      }
      updated[index][field] = newValue;
    }
    
    setReturnItems(updated);
  };

  const calculateTotalReturn = () => {
    return returnItems.reduce((total, item) => {
      if (item.selected) {
        const mainAmount = item.returnQuantity * item.originalPrice;
        const subAmount = item.returnSubQuantity * item.originalSubPrice;
        return total + mainAmount + subAmount;
      }
      return total;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من وجود منتجات محددة
    const selectedItems = returnItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      showError('يرجى اختيار منتج واحد على الأقل للإرجاع');
      return;
    }

    // التحقق من الكميات
    const hasInvalidQuantity = selectedItems.some(item => 
      (item.returnQuantity + item.returnSubQuantity) === 0
    );
    
    if (hasInvalidQuantity) {
      showError('يرجى إدخال كمية صحيحة للمنتجات المحددة');
      return;
    }

    // التحقق من سبب الإرجاع
    if (!reason.trim()) {
      showError('يرجى إدخال سبب الإرجاع');
      return;
    }

    try {
      // إعداد بيانات الإرجاع
      const returnData = {
        invoiceId: invoice.id,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.returnQuantity,
          subQuantity: item.returnSubQuantity
        })),
        reason,
        notes
      };

      addPurchaseReturn(returnData);
      showSuccess('تم إرجاع المنتجات بنجاح');
      navigate('/purchases/returns');
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية الإرجاع');
    }
  };

  if (isLoading || !invoice) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل بيانات الفاتورة...</p>
          <p className="text-gray-400 text-sm mt-2">معرف الفاتورة: {invoiceId}</p>
          {!purchaseInvoices && (
            <p className="text-orange-500 text-sm mt-1">⏳ انتظار تحميل البيانات من النظام...</p>
          )}
          {purchaseInvoices && purchaseInvoices.length === 0 && (
            <p className="text-red-500 text-sm mt-1">⚠️ لا توجد فواتير في النظام</p>
          )}
        </div>
      </div>
    );
  }

  const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">إرجاع فاتورة مشتريات</h2>
          <p className="text-sm text-gray-600">فاتورة رقم #{invoice.id}</p>
        </div>
        <button
          onClick={() => navigate('/purchases/manage')}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaArrowLeft /> رجوع
        </button>
      </div>

      {/* معلومات الفاتورة الأصلية */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">معلومات الفاتورة الأصلية</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">المورد</p>
            <p className="font-semibold text-sm">{supplier?.name || 'غير محدد'}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">التاريخ</p>
            <p className="font-semibold text-sm">
              {new Date(invoice.date).toLocaleDateString('ar-EG')}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">نوع الدفع</p>
            <p className="font-semibold text-sm">
              {invoice.paymentType === 'cash' ? 'نقدي' : invoice.paymentType === 'deferred' ? 'آجل' : 'جزئي'}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">المجموع الكلي</p>
            <p className="font-bold text-lg text-purple-600">{invoice.total.toFixed(2)} د.ع</p>
          </div>
        </div>
      </div>

      {/* نموذج الإرجاع */}
      <form onSubmit={handleSubmit}>
        {/* جدول المنتجات */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800 mb-3">المنتجات المراد إرجاعها</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 w-10">
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
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الكمية الأصلية</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المرتجع سابقاً</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المتاح للإرجاع</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">كمية الإرجاع</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المبلغ المرتجع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {returnItems.map((item, index) => {
                  const product = products.find(p => p.id === parseInt(item.productId));
                  const returnAmount = item.returnQuantity * item.originalPrice + 
                                      item.returnSubQuantity * item.originalSubPrice;
                  const isDisabled = item.availableQty === 0;
                  
                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleItemSelect(index)}
                          disabled={isDisabled}
                          className="rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{product?.name || item.productName}</div>
                        <div className="text-xs text-gray-500">{product?.category || '-'}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div>{item.originalQuantity} أساسي</div>
                        {item.originalSubQuantity > 0 && (
                          <div className="text-xs text-gray-500">{item.originalSubQuantity} فرعي</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div>{item.returnedMainQty} أساسي</div>
                        {item.returnedSubQty > 0 && (
                          <div className="text-xs text-gray-500">{item.returnedSubQty} فرعي</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className={`text-xs font-semibold ${
                          item.availableMainQty > 0 ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {item.availableMainQty} أساسي
                        </div>
                        {item.originalSubQuantity > 0 && (
                          <div className={`text-xs font-semibold ${
                            item.availableSubQty > 0 ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {item.availableSubQty} فرعي
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {item.selected && (
                          <div className="flex gap-2 justify-center">
                            <input
                              type="number"
                              value={item.returnQuantity}
                              onChange={(e) => handleQuantityChange(index, 'returnQuantity', e.target.value)}
                              className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded"
                              min="0"
                              max={item.availableMainQty}
                              placeholder="أساسي"
                            />
                            {item.originalSubQuantity > 0 && (
                              <input
                                type="number"
                                value={item.returnSubQuantity}
                                onChange={(e) => handleQuantityChange(index, 'returnSubQuantity', e.target.value)}
                                className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded"
                                min="0"
                                max={item.availableSubQty}
                                placeholder="فرعي"
                              />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-red-600">
                        {item.selected ? returnAmount.toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* سبب الإرجاع والملاحظات */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل ملاحظات إضافية..."
              />
            </div>
          </div>
        </div>

        {/* ملخص الإرجاع */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">عدد المنتجات المحددة</p>
              <p className="text-2xl font-bold text-blue-600">
                {returnItems.filter(i => i.selected).length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">إجمالي المبلغ المرتجع</p>
              <p className="text-2xl font-bold text-red-600">
                {calculateTotalReturn().toFixed(2)} د.ع
              </p>
            </div>
          </div>
        </div>

        {/* أزرار الحفظ */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => navigate('/purchases/manage')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <FaUndo /> تنفيذ الإرجاع
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPurchaseReturn;
