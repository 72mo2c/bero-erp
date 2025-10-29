// ======================================
// Sales Return Modal - نافذة إرجاع فواتير المبيعات
// ======================================

import React, { useState, useEffect } from 'react';
import { FaUndo, FaSave, FaTimes, FaPlus, FaMinus, FaCalculator } from 'react-icons/fa';
import Modal from '../Common/Modal';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';

const SalesReturnModal = ({ 
  isOpen, 
  onClose, 
  invoice,
  onReturnSaved 
}) => {
  const { 
    addSalesReturn, 
    products, 
    customers, 
    warehouses,
    deleteSalesReturn,
    salesReturns,
    updateSalesReturnStatus 
  } = useData();
  
  const { showSuccess, showError } = useNotification();
  const { hasPermission } = useAuth();
  const { settings } = useSystemSettings();

  const [returnItems, setReturnItems] = useState([]);
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(false);

  // تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const formatted = new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
    
    return formatted;
  };

  // حساب الإجمالي
  const calculateTotal = () => {
    const total = returnItems.reduce((sum, item) => {
      const itemTotal = (item.returnQuantity || 0) * (item.unitPrice || 0);
      return sum + itemTotal;
    }, 0);
    
    setTotalReturnAmount(total);
    return total;
  };

  // تحديث الكمية المراد إرجاعها
  const updateReturnQuantity = (productId, newQuantity) => {
    setReturnItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, returnQuantity: Math.max(0, Math.min(newQuantity, item.soldQuantity)) }
        : item
    ));
  };

  // حساب الإجمالي عند تغيير البيانات
  useEffect(() => {
    if (calculated) {
      calculateTotal();
    }
  }, [returnItems, calculated]);

  // تهيئة البيانات عند فتح النافذة
  useEffect(() => {
    if (isOpen && invoice) {
      // تحويل عناصر الفاتورة إلى عناصر إرجاع
      const items = invoice.items?.map(item => {
        const product = products.find(p => p.id === parseInt(item.productId));
        return {
          productId: item.productId,
          productName: item.productName || product?.name || 'منتج غير معروف',
          soldQuantity: item.quantity || 0,
          returnQuantity: 0,
          unitPrice: item.unitPrice || item.price || 0,
          totalPrice: (item.quantity || 0) * (item.unitPrice || item.price || 0)
        };
      }) || [];
      
      setReturnItems(items);
      setTotalReturnAmount(0);
      setReturnReason('');
      setReturnNotes('');
      setCalculated(true);
    }
  }, [isOpen, invoice, products]);

  // التحقق من الصلاحيات
  const canReturnInvoice = hasPermission('manage_sales_returns');

  // حفظ الإرجاع
  const handleSaveReturn = async () => {
    if (!canReturnInvoice) {
      showError('ليس لديك صلاحية لإرجاع فواتير المبيعات');
      return;
    }

    // التحقق من اختيار منتجات للإرجاع
    const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      showError('يرجى اختيار منتجات للإرجاع');
      return;
    }

    if (!returnReason.trim()) {
      showError('يرجى إدخال سبب الإرجاع');
      return;
    }

    setLoading(true);

    try {
      // إنشاء سجل الإرجاع
      const returnRecord = {
        id: `return_${Date.now()}`,
        invoiceId: invoice.id,
        type: 'sales',
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        items: itemsToReturn,
        returnReason: returnReason.trim(),
        returnNotes: returnNotes.trim(),
        returnAmount: totalReturnAmount,
        originalAmount: invoice.total || 0,
        returnDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: hasPermission('admin_user_id') // يمكن تحسين هذا لاحقاً
      };

      // حفظ الإرجاع
      await addSalesReturn(returnRecord);

      showSuccess('تم حفظ عملية الإرجاع بنجاح');
      
      // إغلاق النافذة وإشعار المكون الأب
      onClose();
      onReturnSaved && onReturnSaved(returnRecord);

    } catch (error) {
      console.error('خطأ في حفظ الإرجاع:', error);
      showError('حدث خطأ أثناء حفظ الإرجاع: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // إغلاق النافذة
  const handleClose = () => {
    setCalculated(false);
    setReturnItems([]);
    setTotalReturnAmount(0);
    onClose();
  };

  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`إرجاع فاتورة مبيعات #${invoice.id}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-green-600">
              <FaCalculator className="inline ml-2" />
              إجمالي الإرجاع: {formatCurrency(totalReturnAmount)}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              <FaTimes className="inline ml-1" />
              إلغاء
            </button>
            <button
              onClick={handleSaveReturn}
              disabled={loading || !canReturnInvoice || returnItems.every(item => item.returnQuantity === 0)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <FaUndo className="animate-spin ml-2" />
                  جاري الحفظ...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaSave className="ml-2" />
                  حفظ الإرجاع
                </span>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* معلومات الفاتورة الأساسية */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">معلومات الفاتورة الأصلية</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">رقم الفاتورة:</span>
              <div className="text-blue-900">{invoice.id}</div>
            </div>
            <div>
              <span className="font-medium text-blue-700">العميل:</span>
              <div className="text-blue-900">{invoice.customerName || 'غير محدد'}</div>
            </div>
            <div>
              <span className="font-medium text-blue-700">التاريخ:</span>
              <div className="text-blue-900">{invoice.date || 'غير محدد'}</div>
            </div>
            <div>
              <span className="font-medium text-blue-700">المبلغ الإجمالي:</span>
              <div className="text-blue-900 font-bold">{formatCurrency(invoice.total)}</div>
            </div>
          </div>
        </div>

        {/* اختيار المنتجات للإرجاع */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">اختر المنتجات للإرجاع</h4>
          
          {returnItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد منتجات في هذه الفاتورة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-right">المنتج</th>
                    <th className="border border-gray-300 p-3 text-center">الكمية المباعة</th>
                    <th className="border border-gray-300 p-3 text-center">كمية الإرجاع</th>
                    <th className="border border-gray-300 p-3 text-center">سعر الوحدة</th>
                    <th className="border border-gray-300 p-3 text-center">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, index) => (
                    <tr key={`${item.productId}-${index}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium">
                        {item.productName}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {item.soldQuantity}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateReturnQuantity(item.productId, item.returnQuantity - 1)}
                            disabled={item.returnQuantity === 0}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="w-16 text-center px-2 py-1 border border-gray-300 rounded">
                            {item.returnQuantity}
                          </span>
                          <button
                            onClick={() => updateReturnQuantity(item.productId, item.returnQuantity + 1)}
                            disabled={item.returnQuantity >= item.soldQuantity}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-bold">
                        {formatCurrency(item.returnQuantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* سبب الإرجاع والملاحظات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سبب الإرجاع *
            </label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">اختر سبب الإرجاع</option>
              <option value="damaged_product">منتج تالف</option>
              <option value="wrong_item">عنصر خاطئ</option>
              <option value="customer_request">طلب العميل</option>
              <option value="expired_product">منتج منتهي الصلاحية</option>
              <option value="quality_issues">مشاكل في الجودة</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        {/* ملخص الإرجاع */}
        {returnItems.some(item => item.returnQuantity > 0) && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h5 className="text-lg font-semibold text-green-800 mb-3">ملخص الإرجاع</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">عدد المنتجات المرجعة:</span>
                <span className="font-medium text-green-900">
                  {returnItems.filter(item => item.returnQuantity > 0).length} منتج
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">إجمالي الكمية المرجعة:</span>
                <span className="font-medium text-green-900">
                  {returnItems.reduce((sum, item) => sum + item.returnQuantity, 0)} قطعة
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-green-300 pt-2">
                <span className="text-green-800">إجمالي قيمة الإرجاع:</span>
                <span className="text-green-900">{formatCurrency(totalReturnAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {!canReturnInvoice && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="text-red-800">
              <strong>تحذير:</strong> ليس لديك صلاحية لإرجاع فواتير المبيعات
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SalesReturnModal;
