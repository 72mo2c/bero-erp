import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const ProfitLossReport = () => {
  const { salesInvoices, purchaseInvoices, products } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    netProfit: 0,
  });

  useEffect(() => {
    generateReport();
  }, [salesInvoices, purchaseInvoices, products, startDate, endDate]);

  const generateReport = () => {
    let filteredSales = salesInvoices || [];
    let filteredPurchases = purchaseInvoices || [];

    if (startDate) {
      filteredSales = filteredSales.filter(
        (inv) => new Date(inv.date) >= new Date(startDate)
      );
      filteredPurchases = filteredPurchases.filter(
        (inv) => new Date(inv.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredSales = filteredSales.filter(
        (inv) => new Date(inv.date) <= new Date(endDate)
      );
      filteredPurchases = filteredPurchases.filter(
        (inv) => new Date(inv.date) <= new Date(endDate)
      );
    }

    const totalRevenue = filteredSales.reduce((sum, inv) => sum + (inv.total || 0), 0);

    let totalCost = 0;
    filteredSales.forEach((invoice) => {
      invoice.items?.forEach((item) => {
        const product = products?.find((p) => p.id === item.productId);
        const costPrice = product?.costPrice || 0;
        totalCost += costPrice * (item.quantity || 0);
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netProfit = grossProfit;

    setReportData({
      totalRevenue,
      totalCost,
      grossProfit,
      grossProfitMargin,
      netProfit,
    });
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['البيان', 'المبلغ'];
    const csvData = [
      ['إجمالي المبيعات', reportData.totalRevenue.toFixed(2)],
      ['تكلفة البضاعة', reportData.totalCost.toFixed(2)],
      ['مجمل الربح', reportData.grossProfit.toFixed(2)],
      ['هامش الربح الإجمالي', reportData.grossProfitMargin.toFixed(2) + '%'],
      ['صافي الربح', reportData.netProfit.toFixed(2)],
    ];

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `profit_loss_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير الأرباح والخسائر"
        subtitle="تحليل الأرباح والخسائر خلال فترة زمنية محددة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">إجمالي المبيعات</p>
            <p className="text-3xl font-bold mt-2">{reportData.totalRevenue.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90">تكلنفة البضاعة</p>
            <p className="text-3xl font-bold mt-2">{reportData.totalCost.toFixed(2)} ج.م</p>
          </div>
        </Card>
        <Card className={`bg-gradient-to-r ${
          reportData.netProfit >= 0
            ? 'from-green-500 to-green-600'
            : 'from-red-500 to-red-600'
        } text-white`}>
          <div className="text-center">
            <p className="text-sm opacity-90">صافي الربح</p>
            <p className="text-3xl font-bold mt-2">{reportData.netProfit.toFixed(2)} ج.م</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-lg font-bold mb-4">قائمة الدخل</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold text-blue-800">الإيرادات</div>
              <div></div>
              <div className="pr-4">إجمالي المبيعات:</div>
              <div className="text-right font-bold text-blue-700">
                {reportData.totalRevenue.toFixed(2)} ج.م
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold text-orange-800">تكلفة البضاعة المباعة</div>
              <div></div>
              <div className="pr-4">تكلفة البضاعة:</div>
              <div className="text-right font-bold text-orange-700">
                ({reportData.totalCost.toFixed(2)}) ج.م
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-bold text-green-800">مجمل الربح</div>
              <div className="text-right font-bold text-green-700 text-lg">
                {reportData.grossProfit.toFixed(2)} ج.م
              </div>
              <div className="text-sm text-gray-600">هامش الربح الإجمالي:</div>
              <div className="text-right font-semibold text-green-700">
                {reportData.grossProfitMargin.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            reportData.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className="grid grid-cols-2 gap-2">
              <div className={`font-bold text-xl ${
                reportData.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                صافي الربح / (الخسارة)
              </div>
              <div className={`text-right font-bold text-2xl ${
                reportData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {reportData.netProfit >= 0 ? '' : '('}
                {Math.abs(reportData.netProfit).toFixed(2)} ج.م
                {reportData.netProfit >= 0 ? '' : ')'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="text-lg font-bold mb-4">ملاحظات</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>التقرير يعتمد على الفترة الزمنية المحددة</li>
            <li>تكلفة البضاعة تعتمد على سعر التكلفة المحدد في بيانات المنتج</li>
            <li>هامش الربح يحسب بقسمة مجمل الربح على إجمالي المبيعات</li>
            <li>التقرير لا يتضمن المصاريف التشغيلية الأخرى</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ProfitLossReport;