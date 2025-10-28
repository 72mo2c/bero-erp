// ======================================
// Manage Sales Invoices - إدارة فواتير المبيعات
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import { FaFileInvoice, FaSearch, FaExclamationTriangle, FaTimes, FaUndo, FaEye, FaTrash, FaPrint } from 'react-icons/fa';

const ManageSalesInvoices = () => {
  const navigate = useNavigate();
  const { salesInvoices, customers, products, warehouses, deleteSalesInvoice } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // دالة تنسيق العملة باستخدام إعدادات النظام
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

  // فحص الصلاحيات
  const canViewInvoice = hasPermission('view_sales_invoices');
  const canReturnInvoice = hasPermission('return_sale');
  const canEditInvoice = hasPermission('edit_sales_invoice');
  const canDeleteInvoice = hasPermission('delete_sales_invoice');
  const canManageSales = hasPermission('manage_sales');
  const canPrintInvoice = hasPermission('print_invoices');

  // فلترة الفواتير
  const filteredInvoices = salesInvoices.filter(invoice => {
    const customer = customers.find(c => c.id === parseInt(invoice.customerId));
    const customerName = customer ? customer.name : '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          invoice.id.toString().includes(searchQuery);
    
    const matchesPaymentType = paymentTypeFilter === 'all' || invoice.paymentType === paymentTypeFilter;
    
    return matchesSearch && matchesPaymentType;
  });

  const handleView = (invoice) => {
    if (!canViewInvoice) {
      showError('ليس لديك صلاحية لعرض فواتير المبيعات');
      return;
    }
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleReturn = (invoice) => {
    if (!canReturnInvoice) {
      showError('ليس لديك صلاحية لإرجاع فواتير المبيعات');
      return;
    }
    navigate(`/sales/return/${invoice.id}`);
  };

  const handleEdit = (invoice) => {
    if (!canEditInvoice) {
      showError('ليس لديك صلاحية لتعديل فواتير المبيعات');
      return;
    }
    showSuccess('ميزة التعديل ستكون متاحة قريباً');
  };

  const handleDeleteClick = (invoice) => {
    if (!canDeleteInvoice) {
      showError('ليس لديك صلاحية لحذف فواتير المبيعات');
      return;
    }
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!canDeleteInvoice) {
      showError('ليس لديك صلاحية لحذف فواتير المبيعات');
      setShowDeleteModal(false);
      return;
    }
    
    try {
      deleteSalesInvoice(invoiceToDelete.id);
      
      const itemsCount = invoiceToDelete.items?.length || 0;
      const totalQuantity = invoiceToDelete.items?.reduce((sum, item) => sum + parseInt(item.quantity), 0) || 0;
      
      showSuccess(`تم حذف الفاتورة بنجاح!\nتمت إعادة ${itemsCount} منتج بإجمالي كمية ${totalQuantity} إلى المخزون`);
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    } catch (error) {
      showError(error.message || 'حدث خطأ في حذف الفاتورة');
      setShowDeleteModal(false);
    }
  };

  const paymentTypeOptions = [
    { value: 'all', label: 'كل الأنواع' },
    { value: 'cash', label: 'نقدي' },
    { value: 'deferred', label: 'آجل' },
    { value: 'partial', label: 'جزئي' }
  ];

  // فحص صلاحية الوصول
  if (!canManageSales && !canViewInvoice) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">وصول غير مصرح</h3>
            <p className="text-red-700">ليس لديك صلاحية لعرض أو إدارة فواتير المبيعات</p>
            <p className="text-red-600 text-sm mt-1">يرجى التواصل مع المدير للحصول على الصلاحية المطلوبة</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      header: 'رقم الفاتورة',
      accessor: 'id',
      render: (row) => (
        <span className="font-semibold text-blue-600">#{row.id}</span>
      )
    },
    {
      header: 'العميل',
      accessor: 'customerId',
      render: (row) => {
        const customer = customers.find(c => c.id === parseInt(row.customerId));
        return customer ? customer.name : '-';
      }
    },
    {
      header: 'التاريخ',
      accessor: 'date',
      render: (row) => new Date(row.date).toLocaleDateString('ar-EG')
    },
    {
      header: 'عدد المنتجات',
      accessor: 'items',
      render: (row) => row.items?.length || 0
    },
    {
      header: 'نوع الدفع',
      accessor: 'paymentType',
      render: (row) => {
        const types = {
          'cash': { label: 'نقدي', color: 'bg-green-100 text-green-700' },
          'deferred': { label: 'آجل', color: 'bg-yellow-100 text-yellow-700' },
          'partial': { label: 'جزئي', color: 'bg-blue-100 text-blue-700' }
        };
        const type = types[row.paymentType] || { label: row.paymentType, color: 'bg-gray-100 text-gray-700' };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${type.color}`}>
            {type.label}
          </span>
        );
      }
    },
    {
      header: 'المجموع',
      accessor: 'total',
      render: (row) => (
        <span className="font-bold text-green-600">{formatCurrency(row.total || 0)}</span>
      )
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إدارة فواتير المبيعات</h1>

      <Card icon={<FaFileInvoice />}>
        {/* الفلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="بحث"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الفاتورة..."
            icon={<FaSearch />}
          />

          <Select
            label="نوع الدفع"
            name="paymentTypeFilter"
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            options={paymentTypeOptions}
          />
        </div>

        {/* عدد النتائج */}
        <div className="mb-4 text-sm text-gray-600">
          عدد النتائج: <span className="font-semibold text-gray-800">{filteredInvoices.length}</span> من {salesInvoices.length}
        </div>

        <Table
          columns={columns}
          data={filteredInvoices}
          onView={handleView}
          onReturn={handleReturn}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Card>

      {/* نافذة عرض التفاصيل */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* رأس النافذة */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                تفاصيل الفاتورة #{selectedInvoice.id}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* معلومات الفاتورة */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">معلومات عامة:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">العميل: </span>
                  <span className="font-semibold text-gray-800">
                    {customers.find(c => c.id === parseInt(selectedInvoice.customerId))?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">التاريخ: </span>
                  <span className="font-semibold text-gray-800">
                    {new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">نوع الدفع: </span>
                  <span className="font-semibold text-gray-800">
                    {{
                      'cash': 'نقدي',
                      'deferred': 'آجل',
                      'partial': 'جزئي'
                    }[selectedInvoice.paymentType] || selectedInvoice.paymentType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الحالة: </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    مكتملة
                  </span>
                </div>
              </div>
            </div>

            {/* المنتجات */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">المنتجات:</h3>
              <div className="space-y-2">
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((item, index) => {
                    const product = products.find(p => p.id === parseInt(item.productId));
                    // محاولة الحصول على اسم المنتج من مصادر متعددة
                    const productName = product?.name || item.productName || 'غير محدد';
                    const warehouse = warehouses.find(w => w.id === product?.warehouseId);
                    return (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">
                            {productName} - {warehouse?.name || 'غير محدد'}
                          </span>
                          <div className="text-xs text-gray-600">
                            {item.quantity} × {formatCurrency(parseFloat(item.price))}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-green-600">
                            {formatCurrency(item.quantity * item.price)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد منتجات</p>
                )}
              </div>
            </div>

            {/* الملاحظات */}
            {selectedInvoice.notes && (
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">ملاحظات:</h3>
                <p className="text-gray-700 text-sm">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* المجموع */}
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">المجموع الإجمالي:</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(selectedInvoice.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            {/* رمز التحذير */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <FaExclamationTriangle className="text-4xl text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              تأكيد حذف الفاتورة
            </h2>

            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <p className="text-gray-700 text-center mb-2">
                هل أنت متأكد من حذف الفاتورة <span className="font-bold">#{invoiceToDelete.id}</span>؟
              </p>
              <p className="text-sm text-gray-600 text-center">
                سيتم إعادة الكميات إلى المخزون تلقائياً
              </p>
            </div>

            {/* تفاصيل الفاتورة */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">العميل: </span>
                  <span className="font-semibold">
                    {customers.find(c => c.id === parseInt(invoiceToDelete.customerId))?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">المجموع: </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(invoiceToDelete.total || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">عدد المنتجات: </span>
                  <span className="font-semibold">{invoiceToDelete.items?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">التاريخ: </span>
                  <span className="font-semibold">
                    {new Date(invoiceToDelete.date).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                نعم، احذف الفاتورة
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInvoiceToDelete(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSalesInvoices;
