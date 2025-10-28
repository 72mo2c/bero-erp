import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const TreasuryReport = () => {
  const { treasuryTransactions } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalPayments: 0,
    balance: 0,
  });

  useEffect(() => {
    generateReport();
  }, [treasuryTransactions, startDate, endDate, transactionType]);

  const generateReport = () => {
    let data = treasuryTransactions || [];

    if (startDate) {
      data = data.filter((trans) => new Date(trans.date) >= new Date(startDate));
    }

    if (endDate) {
      data = data.filter((trans) => new Date(trans.date) <= new Date(endDate));
    }

    if (transactionType !== 'all') {
      data = data.filter((trans) => trans.type === transactionType);
    }

    const totalReceipts = data
      .filter((trans) => trans.type === 'receipt')
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);

    const totalPayments = data
      .filter((trans) => trans.type === 'payment')
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);

    const balance = totalReceipts - totalPayments;

    setReportData(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setStats({ totalReceipts, totalPayments, balance });
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['التاريخ', 'النوع', 'المبلغ', 'البيان', 'المرجع'];
    const csvData = reportData.map((trans) => [
      trans.date,
      trans.type === 'receipt' ? 'مقبوض' : 'مدفوع',
      trans.amount?.toFixed(2) || '0.00',
      trans.description || '-',
      trans.reference || '-',
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `treasury_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير حركة الخزينة"
        subtitle="عرض جميع المقبوضات والمدفوعات النقدية"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي المقبوضات</p>
            <p className="text-3xl font-bold mt-2">{stats.totalReceipts.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي المدفوعات</p>
            <p className="text-3xl font-bold mt-2">{stats.totalPayments.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className={`bg-gradient-to-r ${stats.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <div className="text-center">
            <p className="text-sm opacity-90">الرصيد النقدي</p>
            <p className="text-3xl font-bold mt-2">{stats.balance.toFixed(2)} ج.م</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الحركة
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحركات</option>
              <option value="receipt">مقبوضات</option>
              <option value="payment">مدفوعات</option>
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
                النوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المبلغ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                البيان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المرجع
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((trans, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(trans.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {trans.type === 'receipt' ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      مقبوض
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      مدفوع
                    </span>
                  )}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  trans.type === 'receipt' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(trans.amount || 0).toFixed(2)} ج.م
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {trans.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trans.reference || '-'}
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

export default TreasuryReport;