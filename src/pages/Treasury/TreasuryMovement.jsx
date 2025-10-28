// ======================================
// Treasury Movement - حركة الخزينة
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import { 
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaCalendar
} from 'react-icons/fa';

const TreasuryMovement = () => {
  const { cashReceipts, cashDisbursements, treasuryBalance, customers, suppliers } = useData();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all'); // all, receipts, disbursements
  
  // دمج الإيصالات والمصروفات
  const allTransactions = useMemo(() => {
    const receipts = cashReceipts.map(r => ({
      ...r,
      transactionType: 'receipt',
      displayAmount: parseFloat(r.amount)
    }));
    
    const disbursements = cashDisbursements.map(d => ({
      ...d,
      transactionType: 'disbursement',
      displayAmount: -parseFloat(d.amount)
    }));
    
    return [...receipts, ...disbursements].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [cashReceipts, cashDisbursements]);
  
  // فلترة المعاملات
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      // فلتر بالتاريخ
      if (startDate && new Date(transaction.date) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(transaction.date) > new Date(endDate)) {
        return false;
      }
      
      // فلتر بالنوع
      if (transactionType === 'receipts' && transaction.transactionType !== 'receipt') {
        return false;
      }
      if (transactionType === 'disbursements' && transaction.transactionType !== 'disbursement') {
        return false;
      }
      
      return true;
    });
  }, [allTransactions, startDate, endDate, transactionType]);
  
  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalReceipts = filteredTransactions
      .filter(t => t.transactionType === 'receipt')
      .reduce((sum, t) => sum + Math.abs(t.displayAmount), 0);
    
    const totalDisbursements = filteredTransactions
      .filter(t => t.transactionType === 'disbursement')
      .reduce((sum, t) => sum + Math.abs(t.displayAmount), 0);
    
    const netMovement = totalReceipts - totalDisbursements;
    
    return { totalReceipts, totalDisbursements, netMovement };
  }, [filteredTransactions]);
  
  // الحصول على اسم الطرف
  const getPartyName = (transaction) => {
    if (transaction.transactionType === 'receipt') {
      if (transaction.fromType === 'customer') {
        const customer = customers.find(c => c.id === transaction.fromId);
        return customer?.name || transaction.fromName || 'غير محدد';
      } else if (transaction.fromType === 'supplier') {
        const supplier = suppliers.find(s => s.id === transaction.fromId);
        return supplier?.name || transaction.fromName || 'غير محدد';
      }
      return transaction.fromName || 'غير محدد';
    } else {
      if (transaction.toType === 'supplier') {
        const supplier = suppliers.find(s => s.id === transaction.toId);
        return supplier?.name || transaction.toName || 'غير محدد';
      } else if (transaction.toType === 'customer') {
        const customer = customers.find(c => c.id === transaction.toId);
        return customer?.name || transaction.toName || 'غير محدد';
      }
      return transaction.toName || 'غير محدد';
    }
  };
  
  // حساب الرصيد التراكمي
  let runningBalance = treasuryBalance;
  const transactionsWithBalance = filteredTransactions.map(transaction => {
    const balanceBeforeTransaction = runningBalance - transaction.displayAmount;
    const result = {
      ...transaction,
      balanceAfter: runningBalance
    };
    runningBalance = balanceBeforeTransaction;
    return result;
  }).reverse();
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="حركة الخزينة"
        icon={<FaChartLine />}
      />
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaWallet className="text-2xl text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {treasuryBalance.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">الرصيد الحالي (جنيه)</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaArrowUp className="text-2xl text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalReceipts.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الإيرادات (جنيه)</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <FaArrowDown className="text-2xl text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.totalDisbursements.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">إجمالي المصروفات (جنيه)</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              stats.netMovement >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <FaChartLine className={`text-2xl ${
                stats.netMovement >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                stats.netMovement >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.netMovement.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">صافي الحركة (جنيه)</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* أدوات الفلترة */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <FaCalendar className="inline ml-2" />
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <FaCalendar className="inline ml-2" />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">نوع المعاملة</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع المعاملات</option>
              <option value="receipts">الإيرادات فقط</option>
              <option value="disbursements">المصروفات فقط</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* جدول الحركات */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">رقم الإيصال</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الطرف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">الوصف</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">الوارد</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">الصادر</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactionsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    لا توجد حركات في الفترة المحددة
                  </td>
                </tr>
              ) : (
                transactionsWithBalance.map((transaction) => (
                  <tr key={`${transaction.transactionType}-${transaction.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(transaction.date).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.transactionType === 'receipt' 
                        ? transaction.receiptNumber 
                        : transaction.disbursementNumber}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getPartyName(transaction)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {transaction.transactionType === 'receipt' ? (
                        <span className="text-green-600 font-semibold">
                          {Math.abs(transaction.displayAmount).toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {transaction.transactionType === 'disbursement' ? (
                        <span className="text-red-600 font-semibold">
                          {Math.abs(transaction.displayAmount).toFixed(2)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-blue-600">
                        {transaction.balanceAfter.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {transactionsWithBalance.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">الإجمالي:</td>
                  <td className="px-4 py-3 text-center text-green-600">
                    {stats.totalReceipts.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600">
                    {stats.totalDisbursements.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-blue-600">
                    {treasuryBalance.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TreasuryMovement;