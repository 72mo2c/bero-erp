import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const InventoryReport = () => {
  const { products, warehouses } = useData();
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalQuantity: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    generateReport();
  }, [products, selectedWarehouse, selectedCategory, searchTerm]);

  const generateReport = () => {
    let data = [];

    products.forEach((product) => {
      if (selectedWarehouse === 'all') {
        // جمع الكميات من جميع المخازن
        let totalQuantity = 0;
        warehouses.forEach((warehouse) => {
          const stock = product.stock?.[warehouse.id] || 0;
          totalQuantity += stock;
        });

        if (totalQuantity > 0 || selectedWarehouse === 'all') {
          data.push({
            ...product,
            currentStock: totalQuantity,
            warehouse: 'جميع المخازن',
            value: totalQuantity * (product.price || 0),
          });
        }
      } else {
        // مخزن محدد
        const stock = product.stock?.[selectedWarehouse] || 0;
        const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
        data.push({
          ...product,
          currentStock: stock,
          warehouse: warehouse?.name || '',
          value: stock * (product.price || 0),
        });
      }
    });

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      data = data.filter((item) => item.category === selectedCategory);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barcode?.includes(searchTerm)
      );
    }

    // حساب الإحصائيات
    const totalProducts = data.length;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalQuantity = data.reduce((sum, item) => sum + item.currentStock, 0);
    const lowStockItems = data.filter(
      (item) => item.currentStock <= (item.minStock || 0)
    ).length;

    setReportData(data);
    setStats({ totalProducts, totalValue, totalQuantity, lowStockItems });
  };

  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    // تحويل البيانات إلى CSV
    const headers = ['الباركود', 'اسم الصنف', 'الفئة', 'المخزن', 'الكمية', 'السعر', 'القيمة'];
    const csvData = reportData.map((item) => [
      item.barcode || '-',
      item.name,
      item.category || '-',
      item.warehouse,
      item.currentStock,
      (item.price || 0).toFixed(2),
      (item.value || 0).toFixed(2),
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير الجرد"
        subtitle="عرض جميع الأصناف والكميات المتوفرة في المخازن"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي الأصناف</p>
            <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي الكميات</p>
            <p className="text-3xl font-bold mt-2">{stats.totalQuantity}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">القيمة الإجمالية</p>
            <p className="text-3xl font-bold mt-2">{stats.totalValue.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">أصناف أقل من الحد</p>
            <p className="text-3xl font-bold mt-2">{stats.lowStockItems}</p>
          </div>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              الفئة
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الباركود..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* جدول التقرير */}
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
                الفئة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزن
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                السعر
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                القيمة الإجمالية
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
                  {item.category || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.warehouse}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.currentStock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(item.price || 0).toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(item.value || 0).toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.currentStock <= (item.minStock || 0) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      أقل من الحد
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      متوفر
                    </span>
                  )}
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

export default InventoryReport;