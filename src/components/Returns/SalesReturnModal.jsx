// ======================================
// Sales Return Modal - نافذة إرجاع فواتير المبيعات
// ======================================

import React, { useState, useEffect } from 'react';
import { FaUndo, FaSave, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
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



  // تحديث الكمية الأساسية المراد إرجاعها
  const updateReturnMainQuantity = (productId, newQuantity) => {
    setReturnItems(prev => prev.map(item => 
      item.productId === productId 
        ? { 
            ...item, 
            returnMainQuantity: Math.max(0, Math.min(newQuantity, item.soldMainQuantity))
            // إزالة totalReturnQuantity لأن الكميات الأساسية والفرعية منفصلة
          }
        : item
    ));
  };

  // تحديث الكمية الفرعية المراد إرجاعها
  const updateReturnSubQuantity = (productId, newQuantity) => {
    setReturnItems(prev => prev.map(item => 
      item.productId === productId 
        ? { 
            ...item, 
            returnSubQuantity: Math.max(0, Math.min(newQuantity, item.soldSubQuantity))
            // إزالة totalReturnQuantity لأن الكميات الأساسية والفرعية منفصلة
          }
        : item
    ));
  };

  // حساب المبلغ الإجمالي للإرجاع
  const calculateReturnAmount = () => {
    return returnItems.reduce((total, item) => {
      const mainAmount = (item.returnMainQuantity || 0) * (item.mainUnitPrice || 0);
      const subAmount = (item.returnSubQuantity || 0) * (item.subUnitPrice || 0);
      return total + mainAmount + subAmount;
    }, 0);
  };


  // تهيئة البيانات عند فتح النافذة
  useEffect(() => {
    if (isOpen && invoice) {
      console.log('🔄 فتح نافذة إرجاع الفاتورة:', invoice.id);
      
      // تحويل عناصر الفاتورة إلى عناصر إرجاع
      const items = invoice.items?.map(item => {
        const product = products.find(p => p.id === parseInt(item.productId));
        // دعم كل من الحقول القديمة (quantity) والجديدة (mainQuantity)
        const mainQuantity = parseInt(item.mainQuantity || item.quantity || 0);
        const subQuantity = parseInt(item.subQuantity || 0);
        
        console.log(`📦 تحضير منتج: ${item.productName}`);
        console.log(`  - item.mainQuantity: ${item.mainQuantity}, item.quantity: ${item.quantity}`);
        console.log(`  - الكمية النهائية: أساسية=${mainQuantity}, فرعية=${subQuantity}`);
        
        return {
          productId: item.productId,
          productName: item.productName || product?.name || 'منتج غير معروف',
          // بيانات الكميات الأصلية المباعة (منفصلة)
          soldMainQuantity: mainQuantity,
          soldSubQuantity: subQuantity,
          // إزالة totalSoldQuantity لأن الكميات منفصلة
          // بيانات الكميات المراد إرجاعها (منفصلة)
          returnMainQuantity: 0,
          returnSubQuantity: 0,
          // للعرض والحساب
          originalMainQuantity: mainQuantity,
          originalSubQuantity: subQuantity,
          // بيانات الأسعار للحساب - دعم كل من الحقول القديمة والجديدة
          mainUnitPrice: parseFloat(item.mainUnitPrice || item.price || 0),
          subUnitPrice: parseFloat(item.subUnitPrice || item.subPrice || 0)
        };
      }) || [];
      
      setReturnItems(items);

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
    const itemsToReturn = returnItems.filter(item => 
      (item.returnMainQuantity > 0) || (item.returnSubQuantity > 0)
    );
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
      // إنشاء سجل الإرجاع بالكميات المنفصلة فقط
      const itemsToReturn = returnItems
        .filter(item => (item.returnMainQuantity > 0) || (item.returnSubQuantity > 0))
        .map(item => ({
          productId: parseInt(item.productId),
          productName: item.productName,
          quantity: item.returnMainQuantity || 0, // الكمية الأساسية المرتجعة
          subQuantity: item.returnSubQuantity || 0 // الكمية الفرعية المرتجعة
        }));

      const returnRecord = {
        invoiceId: invoice.id,
        items: itemsToReturn,
        reason: returnReason.trim(),
        notes: returnNotes.trim()
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
            {/* تم إزالة عرض إجمالي الإرجاع */}
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
              disabled={loading || !canReturnInvoice || returnItems.every(item => 
                (item.returnMainQuantity || 0) === 0 && (item.returnSubQuantity || 0) === 0
              )}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                    <th className="border border-gray-300 p-3 text-center">الكمية الأساسية المباعة</th>
                    <th className="border border-gray-300 p-3 text-center">إرجاع أساسي</th>
                    <th className="border border-gray-300 p-3 text-center">الكمية الفرعية المباعة</th>
                    <th className="border border-gray-300 p-3 text-center">إرجاع فرعي</th>
                    <th className="border border-gray-300 p-3 text-center">مبلغ الإرجاع</th>
                  </tr>
                </thead>
                <tbody>
                  {returnItems.map((item, index) => (
                    <tr key={`${item.productId}-${index}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium">
                        {item.productName}
                      </td>
                      
                      {/* الكمية الأساسية المباعة */}
                      <td className="border border-gray-300 p-3 text-center font-medium text-blue-600">
                        {item.soldMainQuantity}
                      </td>
                      
                      {/* إرجاع كمية أساسية */}
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateReturnMainQuantity(item.productId, item.returnMainQuantity - 1)}
                            disabled={item.returnMainQuantity === 0}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <FaMinus size={12} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.soldMainQuantity}
                            value={item.returnMainQuantity || 0}
                            onChange={(e) => updateReturnMainQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-16 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => updateReturnMainQuantity(item.productId, item.returnMainQuantity + 1)}
                            disabled={item.returnMainQuantity >= item.soldMainQuantity}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>
                      
                      {/* الكمية الفرعية المباعة */}
                      <td className="border border-gray-300 p-3 text-center font-medium text-purple-600">
                        {item.soldSubQuantity}
                      </td>
                      
                      {/* إرجاع كمية فرعية */}
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateReturnSubQuantity(item.productId, item.returnSubQuantity - 1)}
                            disabled={item.returnSubQuantity === 0}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <FaMinus size={12} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={item.soldSubQuantity}
                            value={item.returnSubQuantity || 0}
                            onChange={(e) => updateReturnSubQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-16 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => updateReturnSubQuantity(item.productId, item.returnSubQuantity + 1)}
                            disabled={item.returnSubQuantity >= item.soldSubQuantity}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>

                      {/* عرض مبلغ الإرجاع للصف */}
                      <td className="border border-gray-300 p-3 text-center font-medium text-blue-600">
                        {formatCurrency(
                          ((item.returnMainQuantity || 0) * (item.mainUnitPrice || 0)) +
                          ((item.returnSubQuantity || 0) * (item.subUnitPrice || 0))
                        )}
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
        {returnItems.some(item => (item.returnMainQuantity > 0) || (item.returnSubQuantity > 0)) && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h5 className="text-lg font-semibold text-green-800 mb-3">ملخص الإرجاع</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">عدد المنتجات المرجعة:</span>
                <span className="font-medium text-green-900">
                  {returnItems.filter(item => (item.returnMainQuantity > 0) || (item.returnSubQuantity > 0)).length} منتج
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">إجمالي الكمية الأساسية المرجعة:</span>
                <span className="font-medium text-green-900">
                  {returnItems.reduce((sum, item) => sum + (item.returnMainQuantity || 0), 0)} قطعة
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">إجمالي الكمية الفرعية المرجعة:</span>
                <span className="font-medium text-green-900">
                  {returnItems.reduce((sum, item) => sum + (item.returnSubQuantity || 0), 0)} عبوة
                </span>
              </div>
              {/* إضافة عرض المبلغ الإجمالي للإرجاع */}
              <div className="border-t border-green-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-green-700 font-semibold">إجمالي مبلغ الإرجاع:</span>
                  <span className="font-bold text-green-900 text-lg">
                    {formatCurrency(calculateReturnAmount())}
                  </span>
                </div>
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
