import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const ProductMovementReport = () => {
  const { products, salesInvoices, purchaseInvoices, warehouses } = useData();
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    generateReport();
  }, [selectedProduct, selectedWarehouse, startDate, endDate]);

  const generateReport = () => {
    let data = [];

    // معالجة فواتير المبيعات (خروج)
    salesInvoices?.forEach((invoice) => {
      const invoiceDate = new Date(invoice.date);
      if (startDate && invoiceDate < new Date(startDate)) return;
      if (endDate && invoiceDate > new Date(endDate)) return;

      invoice.items?.forEach((item) => {
        if (selectedProduct !== 'all' && item.productId !== selectedProduct) return;
        if (selectedWarehouse !== 'all' && invoice.warehouseId !== selectedWarehouse) return;

        const product = products.find((p) => p.id === item.productId);
        const warehouse = warehouses.find((w) => w.id === invoice.warehouseId);

        data.push({
          date: invoice.date,
          productName: product?.name || 'غير معروف',
          type: 'خروج',
          quantity: -item.quantity,
          warehouse: warehouse?.name || 'غير معروف',
          reference: `فاتورة مبيعات #${invoice.id}`,
          notes: invoice.notes || '-',
        });
      });
    });

    // معالجة فواتير المشتريات (دخول)
    purchaseInvoices?.forEach((invoice) => {
      const invoiceDate = new Date(invoice.date);
      if (startDate && invoiceDate < new Date(startDate)) return;
      if (endDate && invoiceDate > new Date(endDate)) return;

      invoice.items?.forEach((item) => {
        if (selectedProduct !== 'all' && item.productId !== selectedProduct) return;
        if (selectedWarehouse !== 'all' && invoice.warehouseId !== selectedWarehouse) return;

        const product = products.find((p) => p.id === item.productId);
        const warehouse = warehouses.find((w) => w.id === invoice.warehouseId);

        data.push({
          date: invoice.date,
          productName: product?.name || 'غير معروف',
          type: 'دخول',
          quantity: item.quantity,
          warehouse: warehouse?.name || 'غير معروف',
          reference: `فاتورة مشتريات #${invoice.id}`,
          notes: invoice.notes || '-',
        });
      });
    });

    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['التاريخ', 'الصنف', 'النوع', 'الكمية', 'المخزن', 'المرجع', 'ملاحظات'];
    const csvData = reportData.map((item) => [
      item.date,
      item.productName,
      item.type,
      item.quantity,
      item.warehouse,
      item.reference,
      item.notes,
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `product_movement_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير حركة الأصناف"
        subtitle="تتبع حركة دخول وخروج الأصناف خلال فترة محددة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصنف
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأصناف</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المخزن
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المخازن</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
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
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصنف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزن
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المرجع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ملاحظات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.type === 'دخول' ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      دخول
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      خروج
                    </span>
                  )}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  item.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(item.quantity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.warehouse}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.reference}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.notes}
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

export default ProductMovementReport;