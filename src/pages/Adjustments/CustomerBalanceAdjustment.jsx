// ======================================
// Customer Balance Adjustment - تسوية أرصدة العملاء
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { FaUsers, FaSearch, FaSave, FaDollarSign } from 'react-icons/fa';

const CustomerBalanceAdjustment = () => {
  const { customers } = useData();
  const { showWarning, showSuccess } = useNotification();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add'); // add or deduct
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm('');
  };

  const getCurrentBalance = () => {
    return selectedCustomer?.balance || 0;
  };

  const getNewBalance = () => {
    const current = getCurrentBalance();
    const amt = parseFloat(amount) || 0;
    return adjustmentType === 'add' ? current + amt : current - amt;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !amount || !reason) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const transaction = {
      type: 'customer_balance_adjustment',
      customerId: selectedCustomer.id,
      adjustmentType,
      amount: parseFloat(amount),
      oldBalance: getCurrentBalance(),
      newBalance: getNewBalance(),
      reason,
      notes,
      date: new Date().toISOString(),
    };

    console.log('تسوية رصيد عميل:', transaction);
    showSuccess('تم تسجيل تسوية رصيد العميل بنجاح');
    
    setSelectedCustomer(null);
    setAmount('');
    setReason('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUsers className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تسوية أرصدة العملاء</h1>
              <p className="text-gray-500 mt-1">تصحيح أرصدة حسابات العملاء</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search Customer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaSearch className="text-cyan-500" />
                البحث عن العميل
              </h3>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {searchTerm && (
                <div className="mt-4 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full p-4 hover:bg-cyan-50 transition-colors text-right border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-800">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">الرصيد الحالي</div>
                            <div className={`font-bold ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {customer.balance} ر.س
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>
                  )}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6">تفاصيل التسوية</h3>
                
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3">معلومات العميل</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-semibold">{selectedCustomer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الهاتف:</span>
                        <span className="font-semibold">{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Balance */}
                  <div className={`border-2 rounded-xl p-4 ${
                    getCurrentBalance() >= 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">الرصيد الحالي:</span>
                      <span className={`text-2xl font-bold ${
                        getCurrentBalance() >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getCurrentBalance()} ر.س
                      </span>
                    </div>
                  </div>

                  {/* Adjustment Type */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">نوع التسوية *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAdjustmentType('add')}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                          adjustmentType === 'add'
                            ? 'bg-green-500 border-green-500 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-green-500'
                        }`}
                      >
                        إضافة (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustmentType('deduct')}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                          adjustmentType === 'deduct'
                            ? 'bg-red-500 border-red-500 text-white shadow-lg'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-red-500'
                        }`}
                      >
                        خصم (-)
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      <FaDollarSign className="inline ml-2 text-cyan-500" />
                      المبلغ *
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                      placeholder="أدخل المبلغ..."
                      required
                    />
                  </div>

                  {/* New Balance Preview */}
                  {amount && (
                    <div className={`rounded-xl p-4 border-2 ${
                      getNewBalance() >= 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold">الرصيد الجديد:</span>
                        <span className={`text-2xl font-bold ${
                          getNewBalance() >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {getNewBalance()} ر.س
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">السبب *</label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="تصحيح_خطأ">تصحيح خطأ في الرصيد</option>
                      <option value="ديون_معدومة">شطب ديون معدومة</option>
                      <option value="خصم_خاص">خصم خاص</option>
                      <option value="مكافأة">مكافأة أو حافز</option>
                      <option value="تسوية_نزاع">تسوية نزاع</option>
                      <option value="آخر">سبب آخر</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none"
                      placeholder="أضف ملاحظات إضافية..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    حفظ التسوية
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📝 معلومات</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>تستخدم لتصحيح أرصدة حسابات العملاء</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يتم تسجيل جميع التسويات في السجل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>الرصيد الإيجابي يعني دين للعميل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>الرصيد السلبي يعني دين على العميل</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBalanceAdjustment;