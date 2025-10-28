import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const TopSellingProducts = () => {
  const { salesInvoices, products } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [sortBy, setSortBy] = useState('quantity'); // quantity or amount

  useEffect(() => {
    generateReport();
  }, [salesInvoices, products, startDate, endDate, sortBy]);

  const generateReport = () => {
    const productSales = {};

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
      invoice.items?.forEach((item) => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            productId,
            totalQuantity: 0,
            totalAmount: 0,
            invoiceCount: 0,
          };
        }

        productSales[productId].totalQuantity += item.quantity || 0;
        productSales[productId].totalAmount += (item.quantity || 0) * (item.price || 0);
        productSales[productId].invoiceCount += 1;
      });
    });

    const data = Object.values(productSales).map((item) => {
      const product = products?.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: product?.name || 'صنف غير معروف',
        barcode: product?.barcode || '-',
      };
    });

    if (sortBy === 'quantity') {
      data.sort((a, b) => b.totalQuantity - a.totalQuantity);
    } else {
      data.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['الباركود', 'الصنف', 'الكمية المباعة', 'إجمالي المبيعات', 'عدد الفواتير'];
    const csvData = reportData.map((item) => [
      item.barcode,
      item.productName,
      item.totalQuantity,
      item.totalAmount.toFixed(2),
      item.invoiceCount,
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `top_selling_products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير أفضل المنتجات مبيعاً"
        subtitle="ترتيب المنتجات حسب الكميات والمبالغ المباعة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الترتيب حسب
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="quantity">الكمية</option>
              <option value="amount">المبلغ</option>
            </select>
          </div>
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
                الترتيب
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الباركود
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الصنف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية المباعة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجمالي المبيعات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عدد الفواتير
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {idx + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.barcode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.totalQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {item.totalAmount.toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.invoiceCount}
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

export default TopSellingProducts;