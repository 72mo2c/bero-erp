// ======================================
// Adjustment History - سجل التسويات
// ======================================

import React, { useState } from 'react';
import { FaHistory, FaSearch, FaEye, FaFilter, FaFileExport } from 'react-icons/fa';

const AdjustmentHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // بيانات تجريبية - يجب استبدالها ببيانات حقيقية من DataContext
  const [adjustments] = useState([
    {
      id: 1,
      type: 'quantity',
      typeName: 'تسوية كميات',
      date: '2025-01-15',
      product: 'منتج A',
      warehouse: 'المخزن الرئيسي',
      oldValue: 100,
      newValue: 95,
      reason: 'جرد دوري',
      user: 'أحمد محمد'
    },
    {
      id: 2,
      type: 'value',
      typeName: 'تسوية قيمة',
      date: '2025-01-14',
      product: 'منتج B',
      warehouse: '-',
      oldValue: 50.00,
      newValue: 55.00,
      reason: 'تغير سعر السوق',
      user: 'فاطمة علي'
    },
    {
      id: 3,
      type: 'damaged',
      typeName: 'شطب تالف',
      date: '2025-01-13',
      product: 'منتج C',
      warehouse: 'المخزن الفرعي',
      oldValue: 50,
      newValue: 45,
      reason: 'منتهي الصلاحية',
      user: 'محمد عبدالله'
    },
    {
      id: 4,
      type: 'customer_balance',
      typeName: 'تسوية رصيد عميل',
      date: '2025-01-12',
      product: 'عميل: خالد أحمد',
      warehouse: '-',
      oldValue: 5000,
      newValue: 4500,
      reason: 'تصحيح خطأ',
      user: 'سارة حسن'
    },
    {
      id: 5,
      type: 'treasury',
      typeName: 'تسوية خزينة',
      date: '2025-01-11',
      product: 'الخزينة الرئيسية',
      warehouse: '-',
      oldValue: 50000,
      newValue: 50500,
      reason: 'جرد يومي',
      user: 'أحمد محمد'
    }
  ]);

  const getTypeColor = (type) => {
    const colors = {
      quantity: 'bg-purple-100 text-purple-700 border-purple-300',
      value: 'bg-green-100 text-green-700 border-green-300',
      damaged: 'bg-red-100 text-red-700 border-red-300',
      customer_balance: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      supplier_balance: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      treasury: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      entry: 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = 
      adj.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adj.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || adj.type === filterType;
    
    const matchesDate = (!startDate || adj.date >= startDate) && (!endDate || adj.date <= endDate);
    
    return matchesSearch && matchesType && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaHistory className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">سجل التسويات</h1>
                <p className="text-gray-500 mt-1">عرض جميع التسويات السابقة</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg">
              <FaFileExport />
              تصدير Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">البحث والتصفية</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:outline-none"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:outline-none"
              >
                <option value="all">جميع الأنواع</option>
                <option value="quantity">تسوية الكميات</option>
                <option value="value">تسوية القيمة</option>
                <option value="damaged">شطب تالف</option>
                <option value="customer_balance">تسوية رصيد عميل</option>
                <option value="supplier_balance">تسوية رصيد مورد</option>
                <option value="treasury">تسوية خزينة</option>
                <option value="entry">قيود تسوية</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:outline-none"
                placeholder="من"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:outline-none"
                placeholder="إلى"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="text-sm text-gray-600">إجمالي التسويات</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{filteredAdjustments.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="text-sm text-gray-600">تسويات الكميات</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {filteredAdjustments.filter(a => a.type === 'quantity').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="text-sm text-gray-600">تسويات القيمة</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {filteredAdjustments.filter(a => a.type === 'value').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
              <div className="text-sm text-gray-600">شطب تالف</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {filteredAdjustments.filter(a => a.type === 'damaged').length}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">#</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">العنصر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المخزن</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">القيمة السابقة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">القيمة الجديدة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">السبب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المستخدم</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdjustments.length > 0 ? (
                  filteredAdjustments.map((adj, index) => (
                    <tr key={adj.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{adj.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(adj.type)}`}>
                          {adj.typeName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">{adj.product}</td>
                      <td className="px-6 py-4 text-gray-600">{adj.warehouse}</td>
                      <td className="px-6 py-4 text-gray-700">{adj.oldValue}</td>
                      <td className="px-6 py-4 text-gray-700 font-bold">{adj.newValue}</td>
                      <td className="px-6 py-4 text-gray-600">{adj.reason}</td>
                      <td className="px-6 py-4 text-gray-600">{adj.user}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaHistory className="text-5xl" />
                        <div>لا توجد تسويات مطابقة للفلاتر</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentHistory;