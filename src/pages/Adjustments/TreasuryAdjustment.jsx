// ======================================
// Treasury Adjustment - تسويات الخزينة
// ======================================

import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { FaMoneyBillWave, FaSave, FaDollarSign } from 'react-icons/fa';

const TreasuryAdjustment = () => {
  const { showWarning, showSuccess } = useNotification();
  const [adjustmentType, setAdjustmentType] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  
  // هذا رصيد وهمي للتوضيح - يجب الحصول عليه من DataContext
  const [currentBalance] = useState(50000);

  const getNewBalance = () => {
    const amt = parseFloat(amount) || 0;
    return adjustmentType === 'add' ? currentBalance + amt : currentBalance - amt;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || !reason) {
      showWarning('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const transaction = {
      type: 'treasury_adjustment',
      adjustmentType,
      amount: parseFloat(amount),
      oldBalance: currentBalance,
      newBalance: getNewBalance(),
      reason,
      notes,
      date: new Date().toISOString(),
    };

    console.log('تسوية الخزينة:', transaction);
    showSuccess('تم تسجيل تسوية الخزينة بنجاح');
    
    setAmount('');
    setReason('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaMoneyBillWave className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تسويات الخزينة</h1>
              <p className="text-gray-500 mt-1">تصحيح رصيد الخزينة</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">تفاصيل التسوية</h3>
              
              <div className="space-y-4">
                {/* Current Balance */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">رصيد الخزينة الحالي</div>
                      <div className="text-3xl font-bold text-blue-600">{currentBalance.toLocaleString()} ر.س</div>
                    </div>
                    <FaMoneyBillWave className="text-5xl text-blue-300" />
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
                    <FaDollarSign className="inline ml-2 text-yellow-500" />
                    المبلغ *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
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
                      <span className="text-gray-700 font-semibold">الرصيد بعد التسوية:</span>
                      <span className={`text-2xl font-bold ${
                        getNewBalance() >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getNewBalance().toLocaleString()} ر.س
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                    required
                  >
                    <option value="">اختر السبب...</option>
                    <option value="جرد_يومي">جرد يومي</option>
                    <option value="فرق_عد">فرق في العد</option>
                    <option value="مصروفات_غير_مسجلة">مصروفات غير مسجلة</option>
                    <option value="إيرادات_غير_مسجلة">إيرادات غير مسجلة</option>
                    <option value="تصحيح_خطأ_إدخال">تصحيح خطأ إدخال</option>
                    <option value="فقدان_أو_سرقة">فقدان أو سرقة</option>
                    <option value="رأس_مال_إضافي">رأس مال إضافي</option>
                    <option value="آخر">سبب آخر</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">ملاحظات تفصيلية</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none resize-none"
                    placeholder="أضف ملاحظات تفصيلية حول سبب التسوية..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FaSave />
                  حفظ التسوية
                </button>
              </div>
            </form>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl shadow-lg p-6 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ تنبيهات مهمة</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>يجب عمل جرد يومي للخزينة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>تأكد من الرصيد الفعلي قبل التسوية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>التسوية نهائية ولا يمكن التراجع عنها</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>أضف ملاحظات تفصيلية للتوثيق</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📝 معلومات</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يتم تسجيل جميع التسويات في السجل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>يمكن عرض تقارير التسويات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>تظهر في تقرير حركة الخزينة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryAdjustment;