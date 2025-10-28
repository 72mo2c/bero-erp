// ======================================
// Sales Invoices List - سجل فواتير المبيعات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import { FaList, FaSearch, FaFileInvoice, FaMoneyBillWave, FaCalendar, FaBoxes, FaTimes, FaPrint } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const SalesInvoices = () => {
  const { salesInvoices, customers, products, warehouses } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // حساب الإحصائيات
  const totalSales = salesInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalInvoices = salesInvoices.length;
  const cashSales = salesInvoices.filter(inv => inv.paymentType === 'cash').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const deferredSales = salesInvoices.filter(inv => inv.paymentType === 'deferred').reduce((sum, inv) => sum + (inv.total || 0), 0);

  // فلترة الفواتير
  const filteredInvoices = salesInvoices.filter(invoice => {
    const customer = customers.find(c => c.id === parseInt(invoice.customerId));
    const customerName = customer ? customer.name : '';
    
    // فلتر البحث
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          invoice.id.toString().includes(searchQuery);
    
    // فلتر نوع الدفع
    const matchesPaymentType = paymentTypeFilter === 'all' || invoice.paymentType === paymentTypeFilter;
    
    // فلتر التاريخ
    const matchesDate = !dateFilter || new Date(invoice.date).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesPaymentType && matchesDate;
  });

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const paymentTypeOptions = [
    { value: 'all', label: 'كل الأنواع' },
    { value: 'cash', label: 'نقدي' },
    { value: 'deferred', label: 'آجل' },
    { value: 'partial', label: 'جزئي' }
  ];

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
      render: (row) => (
        <span className="flex items-center gap-2">
          <FaBoxes className="text-gray-500" />
          {row.items?.length || 0}
        </span>
      )
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
        <span className="font-bold text-green-600">{(row.total || 0).toFixed(2)} د.ع</span>
      )
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
          مكتملة
        </span>
      )
    },
    {
      header: 'إجراءات',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const invoiceData = {
                formData: row,
                items: row.items || [],
                total: row.total || 0,
                suppliers: [],
                customers,
                products,
                warehouses,
                paymentTypes: [
                  { value: 'cash', label: 'نقدي' },
                  { value: 'deferred', label: 'آجل' },
                  { value: 'partial', label: 'جزئي' }
                ],
                type: 'sales'
              };
              printInvoiceDirectly(invoiceData, 'sales');
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
            title="طباعة فورية"
          >
            <FaPrint /> طباعة
          </button>
        </div>
      )
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">سجل فواتير المبيعات</h1>

      {/* لوحة الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-gray-800">{totalInvoices}</p>
            </div>
            <FaFileInvoice className="text-4xl text-blue-600 opacity-60" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-800">{totalSales.toFixed(2)} د.ع</p>
            </div>
            <FaMoneyBillWave className="text-4xl text-green-600 opacity-60" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">مبيعات نقدية</p>
              <p className="text-2xl font-bold text-gray-800">{cashSales.toFixed(2)} د.ع</p>
            </div>
            <FaMoneyBillWave className="text-4xl text-emerald-600 opacity-60" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">مبيعات آجلة</p>
              <p className="text-2xl font-bold text-gray-800">{deferredSales.toFixed(2)} د.ع</p>
            </div>
            <FaCalendar className="text-4xl text-yellow-600 opacity-60" />
          </div>
        </Card>
      </div>

      <Card icon={<FaList />}>
        {/* الفلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          <Input
            label="التاريخ"
            name="dateFilter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {/* عدد النتائج */}
        <div className="mb-4 text-sm text-gray-600">
          عدد النتائج: <span className="font-semibold text-gray-800">{filteredInvoices.length}</span> من {totalInvoices}
        </div>

        <Table
          columns={columns}
          data={filteredInvoices}
          onView={handleViewDetails}
        />
      </Card>

      {/* نافذة تفاصيل الفاتورة */}
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
                    const warehouse = warehouses.find(w => w.id === product?.warehouseId);
                    return (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">
                            {product?.name || 'غير محدد'} - {warehouse?.name || 'غير محدد'}
                          </span>
                          <div className="text-xs text-gray-600">
                            {item.quantity} × {parseFloat(item.price).toFixed(2)} د.ع
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-green-600">
                            {(item.quantity * item.price).toFixed(2)} د.ع
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
                  {(selectedInvoice.total || 0).toFixed(2)} د.ع
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;
