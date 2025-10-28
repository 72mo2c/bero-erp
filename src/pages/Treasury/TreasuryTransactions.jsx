// ======================================
// Treasury Transactions - إيداع وسحب الخزينة
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import { FaMoneyBillWave, FaPrint } from 'react-icons/fa';
import { printTreasuryTransaction } from '../../utils/printUtils';

const TreasuryTransactions = () => {
  const { treasury, addTransaction } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    type: 'deposit',
    amount: '',
    description: '',
    reference: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference: formData.reference
      };

      addTransaction(transactionData);
      showSuccess('تمت العملية بنجاح');
      
      setFormData({
        type: 'deposit',
        amount: '',
        description: '',
        reference: ''
      });
    } catch (error) {
      showError('حدث خطأ في إتمام العملية');
    }
  };

  const typeOptions = [
    { value: 'deposit', label: 'إيداع' },
    { value: 'withdrawal', label: 'سحب' }
  ];

  const columns = [
    {
      header: 'النوع',
      accessor: 'type',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.type === 'deposit' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-red-100 text-red-600'
        }`}>
          {row.type === 'deposit' ? 'إيداع' : 'سحب'}
        </span>
      )
    },
    {
      header: 'المبلغ',
      accessor: 'amount',
      render: (row) => `${row.amount.toLocaleString()} د.ع`
    },
    {
      header: 'الوصف',
      accessor: 'description'
    },
    {
      header: 'المرجع',
      accessor: 'reference'
    },
    {
      header: 'التاريخ',
      accessor: 'date',
      render: (row) => new Date(row.date).toLocaleDateString('ar-EG')
    },
    {
      header: 'إجراءات',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => printTreasuryTransaction(row)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
          title="طباعة إيصال"
        >
          <FaPrint /> طباعة
        </button>
      )
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">إيداع / سحب الخزينة</h1>

      {/* عرض الرصيد */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-8 mb-6 text-white shadow-lg">
        <p className="text-sm mb-2">رصيد الخزينة الحالي</p>
        <p className="text-4xl font-bold">{treasury.balance.toLocaleString()} د.ع</p>
      </div>

      {/* نموذج إضافة عملية */}
      <Card icon={<FaMoneyBillWave />} title="إضافة عملية جديدة">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="نوع العملية"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={typeOptions}
              required
            />

            <Input
              label="المبلغ"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />

            <Input
              label="الوصف"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="وصف العملية"
              required
            />

            <Input
              label="رقم المرجع (اختياري)"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="رقم الفاتورة أو السند"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="success">
              تنفيذ العملية
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setFormData({
                type: 'deposit', amount: '', description: '', reference: ''
              })}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Card>

      {/* سجل العمليات */}
      <Card title="سجل العمليات" className="mt-6">
        <Table
          columns={columns}
          data={treasury.transactions}
          actions={false}
        />
      </Card>
    </div>
  );
};

export default TreasuryTransactions;
