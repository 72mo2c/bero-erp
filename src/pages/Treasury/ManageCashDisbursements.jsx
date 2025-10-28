// ======================================
// Manage Cash Disbursements - إدارة إيصالات الصرف
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import { 
  FaPlus, 
  FaEye, 
  FaTrash, 
  FaMoneyBillWave,
  FaSearch,
  FaLock
} from 'react-icons/fa';

const ManageCashDisbursements = () => {
  const navigate = useNavigate();
  const { cashDisbursements, deleteCashDisbursement, suppliers, customers } = useData();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  const { showWarning, showError, showSuccess } = useNotification();

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisbursement, setSelectedDisbursement] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  // خيارات الفئات
  const categoryLabels = {
    invoice_payment: 'سداد فاتورة مشتريات',
    return_refund: 'استرداد مرتجعات مبيعات',
    salary: 'رواتب',
    expenses: 'مصاريف عامة',
    bank: 'إيداع في بنك',
    other: 'أخرى'
  };
  
  const paymentMethodLabels = {
    cash: 'نقداً',
    check: 'شيك',
    bank_transfer: 'تحويل بنكي'
  };
  
  // الحصول على معلومات المستفيد الكاملة
  const getRecipientDetails = (disbursement) => {
    if (disbursement.toType === 'supplier') {
      return suppliers.find(s => s.id === disbursement.toId);
    } else if (disbursement.toType === 'customer') {
      return customers.find(c => c.id === disbursement.toId);
    }
    return null;
  };
  
  // الحصول على اسم المستفيد
  const getRecipientName = (disbursement) => {
    const details = getRecipientDetails(disbursement);
    return details?.name || disbursement.toName || 'غير محدد';
  };
  
  // فلترة وبحث
  const filteredDisbursements = cashDisbursements.filter(disbursement => {
    const recipientName = getRecipientName(disbursement);
    const matchesSearch = 
      disbursement.disbursementNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disbursement.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || disbursement.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // أعمدة الجدول
  const columns = [
    { key: 'disbursementNumber', label: 'رقم الإيصال' },
    { key: 'date', label: 'التاريخ' },
    { key: 'recipientName', label: 'إلى' },
    { key: 'amount', label: 'المبلغ' },
    { key: 'category', label: 'الفئة' },
    { key: 'paymentMethod', label: 'طريقة الدفع' },
  ];
  
  // تنسيق البيانات للجدول
  const tableData = filteredDisbursements.map(disbursement => ({
    id: disbursement.id,
    disbursementNumber: disbursement.disbursementNumber,
    date: new Date(disbursement.date).toLocaleDateString('ar-EG'),
    recipientName: getRecipientName(disbursement),
    amount: hasPermission('view_financial_data') ? formatCurrency(parseFloat(disbursement.amount)) : (
      <span className="flex items-center gap-1 text-gray-400">
        <FaLock className="text-xs" />
        مخفي
      </span>
    ),
    category: categoryLabels[disbursement.category] || disbursement.category,
    paymentMethod: paymentMethodLabels[disbursement.paymentMethod] || disbursement.paymentMethod
  }));
  
  const handleView = (disbursement) => {
    if (!hasPermission('view_cash_disbursements')) {
      showWarning('ليس لديك صلاحية عرض إيصالات الصرف');
      return;
    }
    
    const original = cashDisbursements.find(d => d.id === disbursement.id);
    setSelectedDisbursement(original);
    setShowViewModal(true);
  };
  
  const handleDelete = (disbursement) => {
    if (!hasPermission('delete_cash_disbursement')) {
      showWarning('ليس لديك صلاحية حذف إيصالات الصرف');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا الإيصال؟')) {
      try {
        deleteCashDisbursement(disbursement.id);
      } catch (error) {
        showError('خطأ: ' + error.message);
      }
    }
  };
  
  const handleAddNew = () => {
    if (!hasPermission('manage_cash_disbursements')) {
      showWarning('ليس لديك صلاحية إدارة إيصالات الصرف');
      return;
    }
    navigate('/treasury/disbursement/new');
  };
  
  // حساب إجمالي الصرف
  const totalDisbursements = filteredDisbursements.reduce((sum, disbursement) => 
    sum + parseFloat(disbursement.amount || 0), 0
  );
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="إدارة إيصالات الصرف"
        icon={<FaMoneyBillWave />}
        action={
          hasPermission('manage_cash_disbursements') && (
            <Button onClick={handleAddNew} icon={<FaPlus />}>
              إضافة إيصال جديد
            </Button>
          )
        }
      />
      
      {/* بطاقة الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {hasPermission('view_cash_disbursements') ? filteredDisbursements.length : (
                <span className="flex items-center justify-center gap-1 text-gray-400">
                  <FaLock className="text-sm" />
                  --
                </span>
              )}
            </div>
            <div className="text-gray-600 mt-2">إجمالي الإيصالات</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {hasPermission('view_financial_data') ? formatCurrency(totalDisbursements) : (
                <span className="flex items-center justify-center gap-1 text-gray-400">
                  <FaLock className="text-sm" />
                  --
                </span>
              )}
            </div>
            <div className="text-gray-600 mt-2">إجمالي المبالغ</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {hasPermission('view_financial_data') ? formatCurrency(filteredDisbursements.length > 0 ? (totalDisbursements / filteredDisbursements.length) : 0) : (
                <span className="flex items-center justify-center gap-1 text-gray-400">
                  <FaLock className="text-sm" />
                  --
                </span>
              )}
            </div>
            <div className="text-gray-600 mt-2">متوسط الإيصال</div>
          </div>
        </Card>
      </div>
      
      <Card>
        {/* أدوات البحث والفلترة */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم الإيصال أو المستفيد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الفئات</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        
        {/* الجدول */}
        <Table
          columns={columns}
          data={tableData}
          onView={handleView}
          onDelete={handleDelete}
        />
      </Card>
      
      {/* Modal عرض تفاصيل الإيصال */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل إيصال الصرف"
      >
        {selectedDisbursement && (() => {
          const recipientDetails = getRecipientDetails(selectedDisbursement);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">رقم الإيصال:</span>
                  <p className="mt-1">{selectedDisbursement.disbursementNumber}</p>
                </div>
                
                <div>
                  <span className="font-semibold">التاريخ:</span>
                  <p className="mt-1">{new Date(selectedDisbursement.date).toLocaleDateString('ar-EG')}</p>
                </div>
                
                <div>
                  <span className="font-semibold">المبلغ:</span>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {hasPermission('view_financial_data') ? 
                      formatCurrency(parseFloat(selectedDisbursement.amount)) : 
                      <span className="flex items-center gap-1 text-gray-400">
                        <FaLock className="text-sm" />
                        مخفي
                      </span>
                    }
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold">الفئة:</span>
                  <p className="mt-1">{categoryLabels[selectedDisbursement.category]}</p>
                </div>
                
                <div className="col-span-2">
                  <span className="font-semibold">طريقة الدفع:</span>
                  <p className="mt-1">{paymentMethodLabels[selectedDisbursement.paymentMethod]}</p>
                </div>
              </div>
              
              {/* معلومات المستفيد */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">معلومات المستفيد:</h4>
                {recipientDetails ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm text-gray-600">الاسم:</span>
                        <p className="font-medium">{recipientDetails.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">النوع:</span>
                        <p className="font-medium">
                          {selectedDisbursement.toType === 'supplier' ? 'مورد' : 
                           selectedDisbursement.toType === 'customer' ? 'عميل' : 'موظف'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">رقم الهاتف:</span>
                        <p className="font-medium">{recipientDetails.phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">البريد الإلكتروني:</span>
                        <p className="font-medium">{recipientDetails.email || '-'}</p>
                      </div>
                      {recipientDetails.address && (
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600">العنوان:</span>
                          <p className="font-medium">{recipientDetails.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p>المستفيد: {selectedDisbursement.toName || 'غير محدد'}</p>
                  </div>
                )}
              </div>
              
              {selectedDisbursement.referenceNumber && (
                <div>
                  <span className="font-semibold">رقم المرجع:</span>
                  <p className="mt-1">{selectedDisbursement.referenceNumber}</p>
                </div>
              )}
              
              {selectedDisbursement.description && (
                <div>
                  <span className="font-semibold">الوصف:</span>
                  <p className="mt-1">{selectedDisbursement.description}</p>
                </div>
              )}
              
              {selectedDisbursement.notes && (
                <div>
                  <span className="font-semibold">ملاحظات:</span>
                  <p className="mt-1 text-gray-600">{selectedDisbursement.notes}</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ManageCashDisbursements;