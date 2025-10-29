// Purchase Returns - لوحة إدارة المرتجعات المتقدمة
// نسخة محدثة ومُصلحة

import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import ErrorBoundary from '../../components/ErrorBoundary';

const PurchaseReturns = () => {
  const { 
    purchaseReturns, 
    purchaseInvoices, 
    suppliers, 
    products,
    treasuryBalance,
    getStatusText,
    getReasonText,
    RETURN_STATUSES,
    checkPermission,
    currentUser,
    updatePurchaseReturnStatus,
    approvePurchaseReturn,
    rejectPurchaseReturn,
    submitPurchaseReturn,
    completePurchaseReturn,
    deletePurchaseReturn,
    cancelReturn
  } = useData();
  
  const { showSuccess, showError } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReturns = useMemo(() => {
    return purchaseReturns.filter(returnRecord => {
      if (statusFilter !== 'all' && returnRecord.status !== statusFilter) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
        const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
        
        return (
          returnRecord.id.toString().includes(query) ||
          returnRecord.invoiceId.toString().includes(query) ||
          supplier?.name?.toLowerCase().includes(query) ||
          getReasonText(returnRecord.reason)?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [purchaseReturns, purchaseInvoices, suppliers, statusFilter, searchQuery, getReasonText]);

  const handleStatusChange = useCallback(async (returnId, newStatus) => {
    try {
      switch (newStatus) {
        case RETURN_STATUSES.APPROVED:
          await approvePurchaseReturn(returnId);
          showSuccess(`تم اعتماد الإرجاع بنجاح`);
          break;
        case RETURN_STATUSES.REJECTED:
          await rejectPurchaseReturn(returnId);
          showSuccess(`تم رفض الإرجاع`);
          break;
        case RETURN_STATUSES.SUBMITTED:
          await submitPurchaseReturn(returnId);
          showSuccess(`تم تقديم الإرجاع للمراجعة`);
          break;
        case RETURN_STATUSES.COMPLETED:
          await completePurchaseReturn(returnId);
          showSuccess(`تم إكمال الإرجاع`);
          break;
        case RETURN_STATUSES.CANCELLED:
          await cancelReturn(returnId);
          showSuccess(`تم إلغاء الإرجاع`);
          break;
        default:
          showError(`حالة غير صحيحة`);
      }
    } catch (error) {
      showError(`خطأ في تحديث حالة الإرجاع: ${error.message}`);
    }
  }, [approvePurchaseReturn, rejectPurchaseReturn, submitPurchaseReturn, completePurchaseReturn, cancelReturn, showSuccess, showError]);

  const handleDelete = useCallback(async (returnRecord) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل الإرجاع #${returnRecord.id}؟`)) {
      try {
        await deletePurchaseReturn(returnRecord.id);
        showSuccess(`تم حذف سجل الإرجاع بنجاح`);
      } catch (error) {
        showError(`خطأ في حذف سجل الإرجاع: ${error.message}`);
      }
    }
  }, [deletePurchaseReturn, showSuccess, showError]);

  return (
    <ErrorBoundary componentName="لوحة إدارة المرتجعات المتقدمة">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  لوحة إدارة المرتجعات المتقدمة
                </h1>
                <p className="text-gray-600 mt-2">إدارة شاملة ومتقدمة لمرتجعات المشتريات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث برقم الإرجاع أو المورد..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الإرجاع</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">جميع الحالات</option>
                  <option value={RETURN_STATUSES.PENDING}>معلق</option>
                  <option value={RETURN_STATUSES.SUBMITTED}>تم التقديم</option>
                  <option value={RETURN_STATUSES.APPROVED}>معتمد</option>
                  <option value={RETURN_STATUSES.REJECTED}>مرفوض</option>
                  <option value={RETURN_STATUSES.COMPLETED}>مكتمل</option>
                  <option value={RETURN_STATUSES.CANCELLED}>ملغي</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  عرض <span className="font-semibold">{filteredReturns.length}</span> من <span className="font-semibold">{purchaseReturns.length}</span> مرتجع
                </div>
              </div>
            </div>
          </div>

          {/* Returns Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الإرجاع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المورد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الإرجاع</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReturns.map((returnRecord) => {
                    const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
                    const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));

                    return (
                      <tr key={returnRecord.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{returnRecord.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{returnRecord.invoiceId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{supplier?.name || 'غير محدد'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(returnRecord.date).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(returnRecord.totalAmount || 0).toFixed(2)} د.ع
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            returnRecord.status === RETURN_STATUSES.COMPLETED ? 'bg-green-100 text-green-800' :
                            returnRecord.status === RETURN_STATUSES.APPROVED ? 'bg-blue-100 text-blue-800' :
                            returnRecord.status === RETURN_STATUSES.REJECTED ? 'bg-red-100 text-red-800' :
                            returnRecord.status === RETURN_STATUSES.CANCELLED ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getStatusText(returnRecord.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReturn(returnRecord);
                                setShowViewModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            
                            {returnRecord.status === RETURN_STATUSES.PENDING && checkPermission('can_approve') && (
                              <button
                                onClick={() => handleStatusChange(returnRecord.id, RETURN_STATUSES.APPROVED)}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            
                            {returnRecord.status === RETURN_STATUSES.PENDING && checkPermission('can_reject') && (
                              <button
                                onClick={() => handleStatusChange(returnRecord.id, RETURN_STATUSES.REJECTED)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                            
                            {checkPermission('can_delete') && (
                              <button
                                onClick={() => handleDelete(returnRecord)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredReturns.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مرتجعات</h3>
              <p className="mt-1 text-sm text-gray-500">لم يتم العثور على أي مرتجعات تطابق المعايير المحددة.</p>
            </div>
          )}
        </div>

        {/* Modal لعرض تفاصيل الإرجاع */}
        {showViewModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">تفاصيل الإرجاع #{selectedReturn.id}</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">رقم الفاتورة الأصلية</p>
                    <p className="font-semibold text-sm">#{selectedReturn.invoiceId}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">المورد</p>
                    <p className="font-semibold text-sm">
                      {(() => {
                        const invoice = purchaseInvoices.find(inv => inv.id === selectedReturn.invoiceId);
                        const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
                        return supplier?.name || 'غير محدد';
                      })()}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">تاريخ الإرجاع</p>
                    <p className="font-semibold text-sm">
                      {new Date(selectedReturn.date).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">إجمالي المبلغ</p>
                    <p className="font-bold text-lg text-purple-600">
                      {(selectedReturn.totalAmount || 0).toFixed(2)} د.ع
                    </p>
                  </div>
                </div>

                {/* سبب الإرجاع */}
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <p className="text-xs text-gray-600 mb-1">سبب الإرجاع</p>
                  <p className="font-semibold">{getReasonText(selectedReturn.reason)}</p>
                  {selectedReturn.notes && (
                    <>
                      <p className="text-xs text-gray-600 mt-2 mb-1">ملاحظات</p>
                      <p className="text-sm">{selectedReturn.notes}</p>
                    </>
                  )}
                </div>

                {/* جدول المنتجات المرتجعة */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">المنتجات المرتجعة</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-right text-xs font-semibold">#</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold">المنتج</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold">الكمية</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold">السعر</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(selectedReturn.items || []).map((item, index) => {
                          const product = products.find(p => p.id === parseInt(item.productId));
                          const invoice = purchaseInvoices.find(inv => inv.id === selectedReturn.invoiceId);
                          const originalItem = invoice?.items.find(i => i.productId === item.productId);
                          const itemTotal = (item.quantity || 0) * (originalItem?.price || 0) + 
                                           (item.subQuantity || 0) * (originalItem?.subPrice || 0);
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2">{index + 1}</td>
                              <td className="px-3 py-2">
                                <div className="font-medium">{product?.name || 'غير محدد'}</div>
                                <div className="text-xs text-gray-500">{product?.category || '-'}</div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div>{item.quantity || 0} أساسي</div>
                                {item.subQuantity > 0 && (
                                  <div className="text-xs text-gray-500">{item.subQuantity} فرعي</div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div>{(originalItem?.price || 0).toFixed(2)}</div>
                                {originalItem?.subPrice > 0 && (
                                  <div className="text-xs text-gray-500">
                                    {(originalItem?.subPrice || 0).toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center font-semibold text-red-600">
                                {itemTotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PurchaseReturns;