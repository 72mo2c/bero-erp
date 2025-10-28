import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const LowStockReport = () => {
  const { products, warehouses } = useData();
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    generateReport();
  }, [products, selectedWarehouse]);

  const generateReport = () => {
    let data = [];

    products.forEach((product) => {
      if (selectedWarehouse === 'all') {
        warehouses.forEach((warehouse) => {
          const stock = product.stock?.[warehouse.id] || 0;
          const minStock = product.minStock || 0;
          if (stock <= minStock) {
            data.push({
              ...product,
              currentStock: stock,
              warehouse: warehouse.name,
              deficit: minStock - stock,
            });
          }
        });
      } else {
        const stock = product.stock?.[selectedWarehouse] || 0;
        const minStock = product.minStock || 0;
        if (stock <= minStock) {
          const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
          data.push({
            ...product,
            currentStock: stock,
            warehouse: warehouse?.name || '',
            deficit: minStock - stock,
          });
        }
      }
    });

    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['الباركود', 'اسم الصنف', 'المخزن', 'الكمية الحالية', 'حد الطلب', 'النقص'];
    const csvData = reportData.map((item) => [
      item.barcode || '-',
      item.name,
      item.warehouse,
      item.currentStock,
      item.minStock || 0,
      item.deficit,
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير الأصناف الأقل من حد الطلب"
        subtitle="عرض الأصناف التي وصلت لحد الطلب أو أقل"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المخزن
          </label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع المخازن</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الباركود
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الصنف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزن
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية الحالية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حد الطلب
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النقص
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.barcode || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.warehouse}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.currentStock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.minStock || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {item.deficit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.currentStock === 0 ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                      نفذت الكمية
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      أقل من الحد
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>لا توجد أصناف أقل من حد الطلب</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LowStockReport;