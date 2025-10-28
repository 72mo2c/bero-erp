// ======================================
// Sales Returns - مرتجعات المبيعات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaUndo, FaEye, FaTrash, FaSearch, FaFilter, FaFileInvoice } from 'react-icons/fa';

const SalesReturns = () => {
  const { salesReturns, salesInvoices, customers, products, deleteSalesReturn } = useData();
  const { showSuccess, showError } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // تصفية المرتجعات
  const filteredReturns = salesReturns.filter(returnRecord => {
    const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
    const customer = customers.find(c => c.id === parseInt(invoice?.customerId));
    const customerName = customer ? customer.name : '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          returnRecord.id.toString().includes(searchQuery) ||
                          returnRecord.invoiceId.toString().includes(searchQuery);
    
    const matchesFilter = statusFilter === 'all' || returnRecord.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleView = (returnRecord) => {
    setSelectedReturn(returnRecord);
    setShowViewModal(true);
  };

  const handleDelete = (returnRecord) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل الإرجاع #${returnRecord.id}؟\nسيتم خصم الكميات من المخزون.`)) {
      try {
        deleteSalesReturn(returnRecord.id);
        showSuccess('تم حذف المرتجع بنجاح وخصم الكميات من المخزون');
      } catch (error) {
        showError(error.message || 'حدث خطأ في حذف المرتجع');
      }
    }
  };

  const getReasonText = (reason) => {
    const reasons = {
      'defective': 'منتج معيب',
      'damaged': 'منتج تالف',
      'wrong_item': 'منتج خاطئ',
      'customer_request': 'طلب العميل',
      'other': 'أخرى'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'completed': { text: 'مكتمل', class: 'bg-green-100 text-green-700' },
      'pending': { text: 'معلق', class: 'bg-yellow-100 text-yellow-700' },
      'cancelled': { text: 'ملغى', class: 'bg-red-100 text-red-700' }
    };
    const s = statuses[status] || { text: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.class}`}>{s.text}</span>;
  };

  // حساب الإحصائيات
  const totalReturns = salesReturns.length;
  const totalAmount = salesReturns.reduce((sum, ret) => sum + (ret.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">مرتجعات المبيعات</h2>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">إجمالي المرتجعات</p>
              <p className="text-3xl font-bold mt-1">{totalReturns}</p>
            </div>
            <FaUndo className="text-4xl opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">إجمالي المبلغ المرتجع</p>
              <p className="text-3xl font-bold mt-1">{totalAmount.toFixed(2)}</p>
              <p className="text-xs opacity-75">دينار عراقي</p>
            </div>
            <FaFileInvoice className="text-4xl opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">متوسط المرتجع</p>
              <p className="text-3xl font-bold mt-1">
                {totalReturns > 0 ? (totalAmount / totalReturns).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs opacity-75">دينار عراقي</p>
            </div>
            <FaSearch className="text-4xl opacity-50" />
          </div>
        </div>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* البحث */}
          <div className="col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ابحث برقم الإرجاع، رقم الفاتورة أو اسم العميل..."
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* التصفية حسب الحالة */}
          <div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="completed">مكتمل</option>
                <option value="pending">معلق</option>
                <option value="cancelled">ملغى</option>
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          عرض {filteredReturns.length} من {salesReturns.length} مرتجع
        </div>
      </div>

      {/* جدول المرتجعات */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">رقم الإرجاع</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">رقم الفاتورة</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">العميل</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">التاريخ</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">السبب</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">عدد المنتجات</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المبلغ</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الحالة</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-3 py-8 text-center text-gray-500">
                    <FaUndo className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>لا توجد مرتجعات</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((returnRecord) => {
                  const invoice = salesInvoices.find(inv => inv.id === returnRecord.invoiceId);
                  const customer = customers.find(c => c.id === parseInt(invoice?.customerId));
                  
                  return (
                    <tr key={returnRecord.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-red-600">
                        #{returnRecord.id}
                      </td>
                      <td className="px-3 py-2 font-medium text-blue-600">
                        #{returnRecord.invoiceId}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{customer?.name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500">{customer?.phone || '-'}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {new Date(returnRecord.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                          {getReasonText(returnRecord.reason)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {returnRecord.items?.length || 0}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-red-600">
                        {(returnRecord.totalAmount || 0).toFixed(2)} د.ع
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getStatusBadge(returnRecord.status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(returnRecord)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="عرض"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDelete(returnRecord)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal عرض تفاصيل الإرجاع */}
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
              {(() => {
                const invoice = salesInvoices.find(inv => inv.id === selectedReturn.invoiceId);
                const customer = customers.find(c => c.id === parseInt(invoice?.customerId));
                
                return (
                  <>
                    {/* معلومات الإرجاع */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">رقم الفاتورة الأصلية</p>
                        <p className="font-semibold text-sm">#{selectedReturn.invoiceId}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">العميل</p>
                        <p className="font-semibold text-sm">{customer?.name || 'غير محدد'}</p>
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
                              const originalItem = invoice?.items.find(i => i.productId === item.productId);
                              const itemTotal = (item.quantity || 0) * (originalItem?.price || 0);
                              
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2">{index + 1}</td>
                                  <td className="px-3 py-2">
                                    <div className="font-medium">{product?.name || 'غير محدد'}</div>
                                    <div className="text-xs text-gray-500">{product?.category || '-'}</div>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {item.quantity || 0}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {(originalItem?.price || 0).toFixed(2)}
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
                  </>
                );
              })()}
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
  );
};

export default SalesReturns;
