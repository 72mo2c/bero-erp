import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const SalesByCustomer = () => {
  const { salesInvoices, customers } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    generateReport();
  }, [salesInvoices, customers, startDate, endDate]);

  const generateReport = () => {
    const customerSales = {};

    let filteredInvoices = salesInvoices || [];

    if (startDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date) <= new Date(endDate)
      );
    }

    filteredInvoices.forEach((invoice) => {
      const customerId = invoice.customerId || 'unknown';
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerId,
          invoiceCount: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
        };
      }

      customerSales[customerId].invoiceCount += 1;
      customerSales[customerId].totalAmount += invoice.total || 0;
      customerSales[customerId].totalPaid += invoice.paid || 0;
      customerSales[customerId].totalRemaining +=
        (invoice.total || 0) - (invoice.paid || 0);
    });

    const data = Object.values(customerSales).map((item) => {
      const customer = customers?.find((c) => c.id === item.customerId);
      return {
        ...item,
        customerName: customer?.name || 'عميل غير مسجل',
      };
    });

    data.sort((a, b) => b.totalAmount - a.totalAmount);
    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['العميل', 'عدد الفواتير', 'إجمالي المبيعات', 'المدفوع', 'المتبقي'];
    const csvData = reportData.map((item) => [
      item.customerName,
      item.invoiceCount,
      item.totalAmount.toFixed(2),
      item.totalPaid.toFixed(2),
      item.totalRemaining.toFixed(2),
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_by_customer_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير المبيعات حسب العميل"
        subtitle="تحليل مبيعات كل عميل والمبالغ المحصلة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        actions={[
          {
            label: 'طباعة',
            onClick: printReport,
            variant: 'secondary',
          },
          {
            label: 'تصدير Excel',
            onClick: exportToExcel,
            variant: 'primary',
          },
        ]}
      />

      <Card className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العميل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد الفواتير
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجمالي المبيعات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المدفوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المتبقي
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.invoiceCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.totalAmount.toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {item.totalPaid.toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {item.totalRemaining.toFixed(2)} ج.م
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد بيانات لعرضها
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesByCustomer;