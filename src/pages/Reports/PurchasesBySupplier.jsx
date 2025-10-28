import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const PurchasesBySupplier = () => {
  const { purchaseInvoices, suppliers } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    generateReport();
  }, [purchaseInvoices, suppliers, startDate, endDate]);

  const generateReport = () => {
    const supplierPurchases = {};

    let filteredInvoices = purchaseInvoices || [];

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
      const supplierId = invoice.supplierId || 'unknown';
      if (!supplierPurchases[supplierId]) {
        supplierPurchases[supplierId] = {
          supplierId,
          invoiceCount: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
        };
      }

      supplierPurchases[supplierId].invoiceCount += 1;
      supplierPurchases[supplierId].totalAmount += invoice.total || 0;
      supplierPurchases[supplierId].totalPaid += invoice.paid || 0;
      supplierPurchases[supplierId].totalRemaining +=
        (invoice.total || 0) - (invoice.paid || 0);
    });

    const data = Object.values(supplierPurchases).map((item) => {
      const supplier = suppliers?.find((s) => s.id === item.supplierId);
      return {
        ...item,
        supplierName: supplier?.name || 'مورد غير مسجل',
      };
    });

    data.sort((a, b) => b.totalAmount - a.totalAmount);
    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['المورد', 'عدد الفواتير', 'إجمالي المشتريات', 'المدفوع', 'المتبقي'];
    const csvData = reportData.map((item) => [
      item.supplierName,
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
    link.download = `purchases_by_supplier_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير المشتريات حسب المورد"
        subtitle="تحليل مشتريات كل مورد والمبالغ المدفوعة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
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
                المورد
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد الفواتير
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجمالي المشتريات
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
                  {item.supplierName}
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

export default PurchasesBySupplier;