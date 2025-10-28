// ======================================
// New Sales Return - إرجاع فاتورة مبيعات
// ======================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaSave, FaArrowLeft, FaUndo } from 'react-icons/fa';

const NewSalesReturn = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { salesInvoices, products, customers, addSalesReturn, salesReturns } = useData();
  const { showSuccess, showError } = useNotification();

  const [invoice, setInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // تحميل الفاتورة
    const foundInvoice = salesInvoices.find(inv => inv.id === parseInt(invoiceId));
    if (!foundInvoice) {
      showError('الفاتورة غير موجودة');
      navigate('/sales/manage');
      return;
    }
    
    setInvoice(foundInvoice);
    
    // حساب الكميات المرتجعة مسبقاً لكل منتج
    const itemsWithReturnInfo = foundInvoice.items.map(item => {
      const previousReturns = salesReturns.filter(ret => 
        ret.invoiceId === foundInvoice.id && ret.status !== 'cancelled'
      );
      
      let totalReturnedQty = 0;
      previousReturns.forEach(ret => {
        const retItem = ret.items.find(i => i.productId === item.productId);
        if (retItem) {
          totalReturnedQty += (retItem.quantity || 0) + (retItem.subQuantity || 0);
        }
      });
      
      const originalQty = parseInt(item.quantity) || 0;
      const availableQty = originalQty - totalReturnedQty;
      
      // الحصول على اسم المنتج من قائمة المنتجات
      const product = products.find(p => p.id === parseInt(item.productId));
      
      return {
        productId: item.productId,
        productName: product?.name || item.productName || 'غير محدد',
        originalQuantity: originalQty,
        originalPrice: item.price || 0,
        returnedQty: totalReturnedQty,
        availableQty: availableQty,
        returnQuantity: 0,
        returnSubQuantity: 0,
        selected: false
      };
    });
    
    setReturnItems(itemsWithReturnInfo);
  }, [invoiceId, salesInvoices, salesReturns, navigate, showError, products]);

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

  const handleQuantityChange = (index, value) => {
    const updated = [...returnItems];
    const item = updated[index];
    
    updated[index].returnQuantity = Math.max(0, parseInt(value) || 0);
    
    // التحقق من عدم تجاوز الكمية المتاحة
    if (updated[index].returnQuantity > item.availableQty) {
      showError(`الكمية المرتجعة تتجاوز الكمية المتاحة (${item.availableQty})`);
      updated[index].returnQuantity = 0;
    }
    
    setReturnItems(updated);
  };

  const calculateTotalReturn = () => {
    return returnItems.reduce((total, item) => {
      if (item.selected) {
        const mainAmount = item.returnQuantity * item.originalPrice;
        return total + mainAmount;
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
      item.returnQuantity === 0
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
          subQuantity: 0
        })),
        reason,
        notes
      };

      addSalesReturn(returnData);
      showSuccess('تم إرجاع المنتجات بنجاح');
      navigate('/sales/returns');
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية الإرجاع');
    }
  };

  if (!invoice) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const customer = customers.find(c => c.id === parseInt(invoice.customerId));

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">إرجاع فاتورة مبيعات</h2>
          <p className="text-sm text-gray-600">فاتورة رقم #{invoice.id}</p>
        </div>
        <button
          onClick={() => navigate('/sales/manage')}
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
            <p className="text-xs text-gray-600 mb-1">العميل</p>
            <p className="font-semibold text-sm">{customer?.name || 'غير محدد'}</p>
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
                  const returnAmount = item.returnQuantity * item.originalPrice;
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
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-xs text-gray-500">{product?.category || '-'}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.originalQuantity}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          {item.returnedQty}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.availableQty > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {item.availableQty}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {item.selected && (
                          <input
                            type="number"
                            value={item.returnQuantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className="w-20 px-2 py-1 text-xs text-center border border-gray-300 rounded"
                            min="0"
                            max={item.availableQty}
                          />
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
                <option value="customer_request">طلب العميل</option>
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
            onClick={() => navigate('/sales/manage')}
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

export default NewSalesReturn;
