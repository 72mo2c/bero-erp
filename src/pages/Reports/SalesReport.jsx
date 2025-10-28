import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const SalesReport = () => {
  const { salesInvoices, customers, products } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });

  useEffect(() => {
    generateReport();
  }, [salesInvoices, startDate, endDate, selectedCustomer]);

  const generateReport = () => {
    let data = salesInvoices || [];

    if (startDate) {
      data = data.filter((invoice) => new Date(invoice.date) >= new Date(startDate));
    }

    if (endDate) {
      data = data.filter((invoice) => new Date(invoice.date) <= new Date(endDate));
    }

    if (selectedCustomer !== 'all') {
      data = data.filter((invoice) => invoice.customerId === selectedCustomer);
    }

    const totalInvoices = data.length;
    const totalAmount = data.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = data.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const totalRemaining = totalAmount - totalPaid;

    setReportData(data);
    setStats({ totalInvoices, totalAmount, totalPaid, totalRemaining });
  };

  const getCustomerName = (customerId) => {
    const customer = customers?.find((c) => c.id === customerId);
    return customer?.name || 'عميل غير مسجل';
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['رقم الفاتورة', 'التاريخ', 'العميل', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة'];
    const csvData = reportData.map((invoice) => [
      invoice.id,
      invoice.date,
      getCustomerName(invoice.customerId),
      invoice.total?.toFixed(2) || '0.00',
      invoice.paid?.toFixed(2) || '0.00',
      (invoice.total - invoice.paid).toFixed(2),
      invoice.paid >= invoice.total ? 'مدفوع' : 'غير مدفوع',
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير المبيعات"
        subtitle="تقرير شامل لجميع المبيعات خلال فترة زمنية محددة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">عدد الفواتير</p>
            <p className="text-3xl font-bold mt-2">{stats.totalInvoices}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي المبيعات</p>
            <p className="text-3xl font-bold mt-2">{stats.totalAmount.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي المدفوع</p>
            <p className="text-3xl font-bold mt-2">{stats.totalPaid.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي المتبقي</p>
            <p className="text-3xl font-bold mt-2">{stats.totalRemaining.toFixed(2)} ج.م</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العميل
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع العملاء</option>
              {customers?.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
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
                رقم الفاتورة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العميل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجمالي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المدفوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المتبقي
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{invoice.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(invoice.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCustomerName(invoice.customerId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(invoice.total || 0).toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {(invoice.paid || 0).toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {((invoice.total || 0) - (invoice.paid || 0)).toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(invoice.paid || 0) >= (invoice.total || 0) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      مدفوع
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      غير مدفوع
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

export default SalesReport;