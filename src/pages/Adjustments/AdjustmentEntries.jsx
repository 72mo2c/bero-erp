// ======================================
// Adjustment Entries - قيود التسوية
// ======================================

import React, { useState } from 'react';
import { FaFileInvoice, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';

const AdjustmentEntries = () => {
  const { showWarning, showSuccess } = useNotification();
  const [entries, setEntries] = useState([
    { id: 1, account: '', debit: '', credit: '', description: '' }
  ]);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const addEntry = () => {
    const newEntry = {
      id: entries.length + 1,
      account: '',
      debit: '',
      credit: '',
      description: ''
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const updateEntry = (id, field, value) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const getTotalDebit = () => {
    return entries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
  };

  const getTotalCredit = () => {
    return entries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);
  };

  const isBalanced = () => {
    const diff = Math.abs(getTotalDebit() - getTotalCredit());
    return diff < 0.01; // للتعامل مع الأخطاء العشرية
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isBalanced()) {
      showWarning('القيد غير متوازن! يجب أن يكون مجموع المدين مساوياً لمجموع الدائن');
      return;
    }

    const entry = {
      type: 'adjustment_entry',
      date: entryDate,
      description,
      notes,
      entries: entries.filter(e => e.account && (e.debit || e.credit)),
      totalDebit: getTotalDebit(),
      totalCredit: getTotalCredit(),
      createdAt: new Date().toISOString(),
    };

    console.log('قيد تسوية:', entry);
    showSuccess('تم حفظ قيد التسوية بنجاح');
    
    // Reset form
    setEntries([{ id: 1, account: '', debit: '', credit: '', description: '' }]);
    setDescription('');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
              <FaFileInvoice className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">قيود التسوية</h1>
              <p className="text-gray-500 mt-1">قيود محاسبية للتسويات</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entry Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">معلومات القيد</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">التاريخ *</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">وصف القيد *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:outline-none"
                  placeholder="أدخل وصف القيد..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">تفاصيل القيد</h3>
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <FaPlus />
                إضافة سطر
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 text-gray-700">
                    <th className="px-4 py-3 text-center rounded-tr-lg">#</th>
                    <th className="px-4 py-3 text-right">الحساب</th>
                    <th className="px-4 py-3 text-right">البيان</th>
                    <th className="px-4 py-3 text-right">مدين</th>
                    <th className="px-4 py-3 text-right">دائن</th>
                    <th className="px-4 py-3 text-center rounded-tl-lg">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.account}
                          onChange={(e) => updateEntry(entry.id, 'account', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none"
                        >
                          <option value="">اختر الحساب...</option>
                          <option value="البضائع">البضائع</option>
                          <option value="العملاء">العملاء</option>
                          <option value="الموردين">الموردين</option>
                          <option value="الخزينة">الخزينة</option>
                          <option value="المصروفات">المصروفات</option>
                          <option value="الإيرادات">الإيرادات</option>
                          <option value="أرباح_وخسائر">أرباح وخسائر</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none"
                          placeholder="البيان..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={entry.debit}
                          onChange={(e) => updateEntry(entry.id, 'debit', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={entry.credit}
                          onChange={(e) => updateEntry(entry.id, 'credit', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-slate-500 focus:outline-none text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          disabled={entries.length === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            entries.length === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right rounded-br-lg">الإجمالي</td>
                    <td className="px-4 py-3 text-right text-blue-600">
                      {getTotalDebit().toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {getTotalCredit().toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center rounded-bl-lg">
                      {isBalanced() ? (
                        <span className="text-green-600">✔</span>
                      ) : (
                        <span className="text-red-600">✖</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Balance Warning */}
            {!isBalanced() && getTotalDebit() > 0 && getTotalCredit() > 0 && (
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700">
                <span className="font-semibold">⚠️ القيد غير متوازن!</span>
                <span>الفرق: {Math.abs(getTotalDebit() - getTotalCredit()).toFixed(2)} ر.س</span>
              </div>
            )}

            {/* Balance Success */}
            {isBalanced() && getTotalDebit() > 0 && (
              <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700 text-center font-semibold">
                ✅ القيد متوازن
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:outline-none resize-none"
              placeholder="أضف ملاحظات إضافية..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isBalanced() || getTotalDebit() === 0}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isBalanced() && getTotalDebit() > 0
                ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FaSave />
            حفظ قيد التسوية
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdjustmentEntries;