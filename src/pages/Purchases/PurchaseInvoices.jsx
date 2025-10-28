// ======================================
// Purchase Invoices List - سجل فواتير المشتريات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import Input from '../../components/Common/Input';
import { FaList, FaSearch, FaPrint } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const PurchaseInvoices = () => {
  const { purchaseInvoices, suppliers, products, warehouses } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // تصفية الفواتير
  const filteredInvoices = purchaseInvoices.filter(invoice => {
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    const supplierName = supplier ? supplier.name : '';
    return supplierName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const columns = [
    {
      header: 'رقم الفاتورة',
      accessor: 'id',
      render: (row) => `#${row.id}`
    },
    {
      header: 'المورد',
      accessor: 'supplierId',
      render: (row) => {
        const supplier = suppliers.find(s => s.id === parseInt(row.supplierId));
        return supplier ? supplier.name : '-';
      }
    },
    {
      header: 'التاريخ',
      accessor: 'date',
      render: (row) => new Date(row.date).toLocaleDateString('ar-EG')
    },
    {
      header: 'نوع الدفع',
      accessor: 'paymentType',
      render: (row) => {
        const types = {
          'cash': 'نقدي',
          'deferred': 'آجل',
          'partial': 'جزئي'
        };
        return types[row.paymentType] || row.paymentType;
      }
    },
    {
      header: 'المجموع',
      accessor: 'total',
      render: (row) => `${row.total || 0} د.ع`
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
          مكتملة
        </span>
      )
    },
    {
      header: 'إجراءات',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => {
            const invoiceData = {
              formData: row,
              items: row.items || [],
              total: row.total || 0,
              suppliers,
              customers: [],
              products,
              warehouses,
              paymentTypes: [
                { value: 'cash', label: 'نقدي' },
                { value: 'deferred', label: 'آجل' },
                { value: 'partial', label: 'جزئي' }
              ],
              type: 'purchase'
            };
            printInvoiceDirectly(invoiceData, 'purchase');
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
          title="طباعة فورية"
        >
          <FaPrint /> طباعة
        </button>
      )
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">سجل فواتير المشتريات</h1>

      <Card icon={<FaList />}>
        <div className="mb-6">
          <Input
            label="بحث"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المورد..."
            icon={<FaSearch />}
          />
        </div>

        <Table
          columns={columns}
          data={filteredInvoices}
        />
      </Card>
    </div>
  );
};

export default PurchaseInvoices;
