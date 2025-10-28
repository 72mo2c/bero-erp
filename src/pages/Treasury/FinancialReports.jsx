// ======================================
// Financial Reports - التقارير المالية
// ======================================

import React from 'react';
import { useData } from '../../context/DataContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { FaFileInvoice, FaChartLine, FaPrint } from 'react-icons/fa';
import { printFinancialReport } from '../../utils/printUtils';

const FinancialReports = () => {
  const { treasury, purchaseInvoices, salesInvoices } = useData();

  // حساب الإحصائيات
  const totalPurchases = purchaseInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const totalSales = salesInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  const profit = totalSales - totalPurchases;
  const profitPercentage = totalPurchases > 0 ? ((profit / totalPurchases) * 100).toFixed(2) : 0;

  const stats = [
    {
      title: 'إجمالي المبيعات',
      value: `${totalSales.toLocaleString()} د.ع`,
      color: 'bg-green-500',
      icon: <FaChartLine />
    },
    {
      title: 'إجمالي المشتريات',
      value: `${totalPurchases.toLocaleString()} د.ع`,
      color: 'bg-red-500',
      icon: <FaChartLine />
    },
    {
      title: 'الأرباح',
      value: `${profit.toLocaleString()} د.ع`,
      color: profit >= 0 ? 'bg-blue-500' : 'bg-red-600',
      icon: <FaFileInvoice />
    },
    {
      title: 'نسبة الربح',
      value: `${profitPercentage}%`,
      color: profitPercentage >= 0 ? 'bg-purple-500' : 'bg-red-600',
      icon: <FaChartLine />
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">التقارير المالية</h1>
        <Button
          onClick={() => printFinancialReport({ totalIncome: totalSales, totalExpense: totalPurchases, balance: treasury.balance })}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FaPrint /> طباعة التقرير
        </Button>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
            <div className={`${stat.color} h-1 w-full`}></div>
          </div>
        ))}
      </div>

      {/* تفاصيل التقرير */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="ملخص المبيعات">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">عدد الفواتير:</span>
              <span className="font-bold">{salesInvoices.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">الإجمالي:</span>
              <span className="font-bold text-green-600">{totalSales.toLocaleString()} د.ع</span>
            </div>
          </div>
        </Card>

        <Card title="ملخص المشتريات">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">عدد الفواتير:</span>
              <span className="font-bold">{purchaseInvoices.length}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">الإجمالي:</span>
              <span className="font-bold text-red-600">{totalPurchases.toLocaleString()} د.ع</span>
            </div>
          </div>
        </Card>
      </div>

      {/* تقرير الأرباح */}
      <Card title="تحليل الأرباح والخسائر" className="mt-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600 mb-2">صافي الربح / الخسارة</p>
            <p className={`text-5xl font-bold ${
              profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()} د.ع
            </p>
            <p className="text-gray-500 mt-2">نسبة الربح: {profitPercentage}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReports;
