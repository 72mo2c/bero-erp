// ======================================
// Manage Cash Receipts - إدارة إيصالات الاستلام
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

const ManageCashReceipts = () => {
  const navigate = useNavigate();
  const { cashReceipts, deleteCashReceipt, customers, suppliers } = useData();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  const { showWarning, showError } = useNotification();

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
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  // خيارات الفئات
  const categoryLabels = {
    invoice_payment: 'سداد فاتورة مبيعات',
    return_refund: 'استرداد مرتجعات مشتريات',
    capital: 'إيداع رأس مال',
    bank: 'استلام من بنك',
    revenue: 'إيرادات متنوعة',
    other: 'أخرى'
  };
  
  const paymentMethodLabels = {
    cash: 'نقداً',
    check: 'شيك',
    bank_transfer: 'تحويل بنكي'
  };
  
  // الحصول على معلومات المصدر الكاملة
  const getSourceDetails = (receipt) => {
    if (receipt.fromType === 'customer') {
      return customers.find(c => c.id === receipt.fromId);
    } else if (receipt.fromType === 'supplier') {
      return suppliers.find(s => s.id === receipt.fromId);
    }
    return null;
  };
  
  // الحصول على اسم المصدر
  const getSourceName = (receipt) => {
    const details = getSourceDetails(receipt);
    return details?.name || receipt.fromName || 'غير محدد';
  };
  
  // فلترة وبحث
  const filteredReceipts = cashReceipts.filter(receipt => {
    const sourceName = getSourceName(receipt);
    const matchesSearch = 
      receipt.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || receipt.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // أعمدة الجدول
  const columns = [
    { key: 'receiptNumber', label: 'رقم الإيصال' },
    { key: 'date', label: 'التاريخ' },
    { key: 'sourceName', label: 'من' },
    { key: 'amount', label: 'المبلغ' },
    { key: 'category', label: 'الفئة' },
    { key: 'paymentMethod', label: 'طريقة الدفع' },
  ];
  
  // تنسيق البيانات للجدول
  const tableData = filteredReceipts.map(receipt => ({
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    date: new Date(receipt.date).toLocaleDateString('ar-EG'),
    sourceName: getSourceName(receipt),
    amount: hasPermission('view_financial_data') ? formatCurrency(parseFloat(receipt.amount)) : (
      <span className="flex items-center gap-1 text-gray-400">
        <FaLock className="text-xs" />
        مخفي
      </span>
    ),
    category: categoryLabels[receipt.category] || receipt.category,
    paymentMethod: paymentMethodLabels[receipt.paymentMethod] || receipt.paymentMethod
  }));
  
  const handleView = (receipt) => {
    if (!hasPermission('view_cash_receipts')) {
      showWarning('ليس لديك صلاحية عرض إيصالات الاستلام');
      return;
    }
    
    const original = cashReceipts.find(r => r.id === receipt.id);
    setSelectedReceipt(original);
    setShowViewModal(true);
  };
  
  const handleDelete = (receipt) => {
    if (!hasPermission('delete_cash_receipt')) {
      showWarning('ليس لديك صلاحية حذف إيصالات الاستلام');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا الإيصال؟')) {
      try {
        deleteCashReceipt(receipt.id);
      } catch (error) {
        showError('خطأ: ' + error.message);
      }
    }
  };
  
  const handleAddNew = () => {
    if (!hasPermission('manage_cash_receipts')) {
      showWarning('ليس لديك صلاحية إدارة إيصالات الاستلام');
      return;
    }
    navigate('/treasury/receipt/new');
  };
  
  // حساب إجمالي الإيصالات
  const totalReceipts = filteredReceipts.reduce((sum, receipt) => 
    sum + parseFloat(receipt.amount || 0), 0
  );
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="إدارة إيصالات الاستلام"
        icon={<FaMoneyBillWave />}
        action={
          hasPermission('manage_cash_receipts') && (
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
            <div className="text-3xl font-bold text-green-600">
              {hasPermission('view_cash_receipts') ? filteredReceipts.length : (
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
            <div className="text-3xl font-bold text-blue-600">
              {hasPermission('view_financial_data') ? formatCurrency(totalReceipts) : (
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
              {hasPermission('view_financial_data') ? formatCurrency(filteredReceipts.length > 0 ? (totalReceipts / filteredReceipts.length) : 0) : (
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
              placeholder="بحث برقم الإيصال أو المصدر..."
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
        title="تفاصيل إيصال الاستلام"
      >
        {selectedReceipt && (() => {
          const sourceDetails = getSourceDetails(selectedReceipt);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">رقم الإيصال:</span>
                  <p className="mt-1">{selectedReceipt.receiptNumber}</p>
                </div>
                
                <div>
                  <span className="font-semibold">التاريخ:</span>
                  <p className="mt-1">{new Date(selectedReceipt.date).toLocaleDateString('ar-EG')}</p>
                </div>
                
                <div>
                  <span className="font-semibold">المبلغ:</span>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {hasPermission('view_financial_data') ? 
                      formatCurrency(parseFloat(selectedReceipt.amount)) : 
                      <span className="flex items-center gap-1 text-gray-400">
                        <FaLock className="text-sm" />
                        مخفي
                      </span>
                    }
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold">الفئة:</span>
                  <p className="mt-1">{categoryLabels[selectedReceipt.category]}</p>
                </div>
                
                <div className="col-span-2">
                  <span className="font-semibold">طريقة الدفع:</span>
                  <p className="mt-1">{paymentMethodLabels[selectedReceipt.paymentMethod]}</p>
                </div>
              </div>
              
              {/* معلومات المصدر */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">معلومات المصدر:</h4>
                {sourceDetails ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-sm text-gray-600">الاسم:</span>
                        <p className="font-medium">{sourceDetails.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">النوع:</span>
                        <p className="font-medium">
                          {selectedReceipt.fromType === 'customer' ? 'عميل' : 'مورد'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">رقم الهاتف:</span>
                        <p className="font-medium">{sourceDetails.phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">البريد الإلكتروني:</span>
                        <p className="font-medium">{sourceDetails.email || '-'}</p>
                      </div>
                      {sourceDetails.address && (
                        <div className="col-span-2">
                          <span className="text-sm text-gray-600">العنوان:</span>
                          <p className="font-medium">{sourceDetails.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p>المصدر: {selectedReceipt.fromName || 'غير محدد'}</p>
                  </div>
                )}
              </div>
              
              {selectedReceipt.referenceNumber && (
                <div>
                  <span className="font-semibold">رقم المرجع:</span>
                  <p className="mt-1">{selectedReceipt.referenceNumber}</p>
                </div>
              )}
              
              {selectedReceipt.description && (
                <div>
                  <span className="font-semibold">الوصف:</span>
                  <p className="mt-1">{selectedReceipt.description}</p>
                </div>
              )}
              
              {selectedReceipt.notes && (
                <div>
                  <span className="font-semibold">ملاحظات:</span>
                  <p className="mt-1 text-gray-600">{selectedReceipt.notes}</p>
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

export default ManageCashReceipts;