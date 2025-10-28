// ======================================
// Supplier Balances - أرصدة الموردين
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import { 
  FaTruck,
  FaSearch,
  FaMoneyBillWave,
  FaChartPie
} from 'react-icons/fa';

const SupplierBalances = () => {
  const { getAllSupplierBalances, suppliers } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, debit, credit
  
  // الحصول على أرصدة الموردين
  const supplierBalances = useMemo(() => {
    return getAllSupplierBalances();
  }, [getAllSupplierBalances]);
  
  // فلترة وبحث
  const filteredBalances = useMemo(() => {
    return supplierBalances.filter(supplier => {
      // بحث بالاسم
      const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.phone?.includes(searchTerm) ||
                           supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // فلتر بالنوع
      let matchesFilter = true;
      if (filterType === 'debit') {
        matchesFilter = supplier.balance > 0; // له دين علينا
      } else if (filterType === 'credit') {
        matchesFilter = supplier.balance < 0; // عليه دين
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [supplierBalances, searchTerm, filterType]);
  
  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalDebit = filteredBalances
      .filter(s => s.balance > 0)
      .reduce((sum, s) => sum + s.balance, 0);
    
    const totalCredit = Math.abs(filteredBalances
      .filter(s => s.balance < 0)
      .reduce((sum, s) => sum + s.balance, 0));
    
    const netBalance = totalDebit - totalCredit;
    
    const debitCount = filteredBalances.filter(s => s.balance > 0).length;
    const creditCount = filteredBalances.filter(s => s.balance < 0).length;
    
    return { 
      totalDebit, 
      totalCredit, 
      netBalance,
      debitCount,
      creditCount
    };
  }, [filteredBalances]);
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="أرصدة الموردين"
        icon={<FaTruck />}
      />
      
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaTruck className="text-2xl text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredBalances.length}
              </div>
              <div className="text-sm text-gray-600">إجمالي الموردين</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <FaMoneyBillWave className="text-2xl text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {stats.totalDebit.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">إجمالي المدين (جنيه)</div>
              <div className="text-xs text-gray-500">لهم دين علينا ({stats.debitCount})</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaMoneyBillWave className="text-2xl text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalCredit.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">إجمالي الدائن (جنيه)</div>
              <div className="text-xs text-gray-500">عليهم دين ({stats.creditCount})</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              stats.netBalance >= 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <FaChartPie className={`text-2xl ${
                stats.netBalance >= 0 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                stats.netBalance >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {Math.abs(stats.netBalance).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                صافي الرصيد (جنيه)
              </div>
              <div className="text-xs text-gray-500">
                {stats.netBalance >= 0 ? 'لهم علينا' : 'عليهم لنا'}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* أدوات البحث والفلترة */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الموردين</option>
            <option value="debit">لهم دين علينا (مدين)</option>
            <option value="credit">عليهم دين لنا (دائن)</option>
          </select>
        </div>
      </Card>
      
      {/* جدول الأرصدة */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold">#</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">اسم المورد</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">رقم الهاتف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">الرصيد</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                filteredBalances.map((supplier, index) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-sm">{supplier.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">{supplier.email || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${
                        supplier.balance > 0 ? 'text-red-600' : 
                        supplier.balance < 0 ? 'text-green-600' : 
                        'text-gray-600'
                      }`}>
                        {Math.abs(supplier.balance).toFixed(2)} جنيه
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {supplier.balance > 0 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          له دين علينا
                        </span>
                      ) : supplier.balance < 0 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          عليه دين لنا
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          متعادل
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredBalances.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan="4" className="px-4 py-3 text-right">الإجمالي:</td>
                  <td className="px-4 py-3 text-center" colSpan="2">
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-red-600">
                        مدين: {stats.totalDebit.toFixed(2)}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-green-600">
                        دائن: {stats.totalCredit.toFixed(2)}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className={stats.netBalance >= 0 ? 'text-red-600' : 'text-green-600'}>
                        الصافي: {Math.abs(stats.netBalance).toFixed(2)}
                      </span>
                    </div>
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

export default SupplierBalances;