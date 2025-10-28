// ======================================
// External Sales Invoices - فواتير المبيعات الخارجية (محسّنة)
// مع المطابقة التلقائية والتحقق من المخزون
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaBox, 
  FaFileInvoice,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaReceipt,
  FaUserPlus,
  FaSync,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  analyzeInvoiceBeforeAcceptance,
  createCustomerFromInvoice 
} from '../../utils/autoMatching';
import { fetchAllPendingInvoices } from '../../services/externalPlatformsAPI';

const ExternalSalesInvoices = () => {
  const { customers, products, warehouses, addSalesInvoice, addCustomer } = useData();
  const { showSuccess, showError, showInfo, showWarning, addNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [acceptedInvoices, setAcceptedInvoices] = useState([]);
  const [rejectedInvoices, setRejectedInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [invoiceToReject, setInvoiceToReject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceAnalysis, setInvoiceAnalysis] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // تحميل البيانات المحفوظة محلياً عند بدء التطبيق
  useEffect(() => {
    loadLocalData();
    // محاكاة تحميل فواتير من API
    loadMockData();
    
    // في الإنتاج: استدعاء API فعلي
    // fetchInvoicesFromAPI();
  }, []);

  // تحميل البيانات المحفوظة
  const loadLocalData = () => {
    const pending = localStorage.getItem('external_pending_invoices');
    const accepted = localStorage.getItem('external_accepted_invoices');
    const rejected = localStorage.getItem('external_rejected_invoices');
    
    if (pending) setPendingInvoices(JSON.parse(pending));
    if (accepted) setAcceptedInvoices(JSON.parse(accepted));
    if (rejected) setRejectedInvoices(JSON.parse(rejected));
  };

  // حفظ البيانات محلياً
  const saveLocalData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // محاكاة استدعاء API (للاختبار)
  const loadMockData = () => {
    const mockPendingInvoices = [
      {
        id: 1,
        platform: 'invoice',
        platformName: 'منصة فاتورة',
        customerName: 'أحمد محمد',
        customerPhone: '07701234567',
        customerEmail: 'ahmed@example.com',
        receivedDate: '2025-10-23',
        receivedTime: '14:30',
        paymentType: 'cash',
        items: [
          { productName: 'منتج A', productSKU: 'SKU001', quantity: 5, mainPrice: 10000, subPrice: 500 },
          { productName: 'منتج B', productSKU: 'SKU002', quantity: 3, mainPrice: 15000, subPrice: 750 }
        ],
        total: 95000,
        notes: 'طلب مستعجل',
        agentType: 'invoice'
      },
      {
        id: 2,
        platform: 'carton',
        platformName: 'منصة كرتونة',
        customerName: 'فاطمة علي',
        customerPhone: '07809876543',
        customerEmail: 'fatima@example.com',
        receivedDate: '2025-10-23',
        receivedTime: '15:45',
        paymentType: 'deferred',
        items: [
          { productName: 'منتج C', productSKU: 'SKU003', quantity: 10, mainPrice: 8000, subPrice: 400 },
          { productName: 'منتج D', productSKU: 'SKU004', quantity: 2, mainPrice: 20000, subPrice: 1000 }
        ],
        total: 120000,
        notes: 'توصيل مساءً',
        agentType: 'carton'
      }
    ];

    setPendingInvoices(mockPendingInvoices);
    saveLocalData('external_pending_invoices', mockPendingInvoices);
  };

  // جلب الفواتير من API الفعلي (للإنتاج)
  const fetchInvoicesFromAPI = async () => {
    setIsLoading(true);
    try {
      const invoices = await fetchAllPendingInvoices();
      setPendingInvoices(invoices);
      saveLocalData('external_pending_invoices', invoices);
      
      // إرسال إشعار للمستخدم
      if (invoices.length > 0) {
        addNotification({
          type: 'info',
          title: 'فواتير جديدة',
          message: `تم استلام ${invoices.length} فاتورة جديدة من المنصات الخارجية`,
          icon: 'info'
        });
      }
    } catch (error) {
      showError('فشل في تحميل الفواتير من المنصات الخارجية');
    } finally {
      setIsLoading(false);
    }
  };

  // تحليل الفاتورة قبل القبول
  const analyzeInvoice = (invoice) => {
    const analysis = analyzeInvoiceBeforeAcceptance(invoice, customers, products);
    setInvoiceAnalysis(analysis);
    setShowAnalysisModal(true);
    return analysis;
  };

  // قبول الفاتورة مع المطابقة التلقائية
  const handleAcceptInvoice = async (invoice) => {
    try {
      setIsLoading(true);
      
      // تحليل الفاتورة
      const analysis = analyzeInvoiceBeforeAcceptance(invoice, customers, products);
      
      // التحقق من المشاكل الحرجة
      if (!analysis.inventory.allAvailable) {
        const unavailableItems = analysis.inventory.unavailable
          .map(item => `${item.productName} (مطلوب: ${item.requestedQty}, متوفر: ${item.availableQty})`)
          .join('\n');
        
        showWarning(
          `تحذير: بعض المنتجات غير متوفرة بالكمية المطلوبة:\n${unavailableItems}\n\nهل تريد المتابعة؟`
        );
        
        // في التطبيق الفعلي: انتظار تأكيد المستخدم
        // const userConfirmed = await confirmDialog();
        // if (!userConfirmed) return;
      }
      
      // إنشاء عميل جديد إذا لزم الأمر
      let customerId = analysis.customer.matched?.id;
      
      if (analysis.customer.needsCreation) {
        const newCustomer = addCustomer(analysis.customer.data);
        customerId = newCustomer.id;
        showInfo(`تم إنشاء عميل جديد: ${newCustomer.name}`);
      }
      
      // تحويل الأصناف إلى صيغة النظام
      const invoiceItems = analysis.items.matched.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.mainPrice
      }));
      
      // إنشاء الفاتورة في نظام المبيعات
      const invoiceData = {
        customerId: customerId,
        date: invoice.receivedDate,
        paymentType: invoice.paymentType,
        agentType: invoice.agentType, // تلقائياً من المنصة
        notes: `[${invoice.platformName}] ${invoice.notes}`,
        items: invoiceItems,
        total: invoice.total,
        status: 'completed',
        externalSource: invoice.platform,
        externalId: invoice.id
      };

      addSalesInvoice(invoiceData);

      // نقل الفاتورة من المعلقة للمقبولة
      const updatedPending = pendingInvoices.filter(inv => inv.id !== invoice.id);
      const acceptedInvoice = {
        ...invoice,
        acceptedDate: new Date().toISOString().split('T')[0],
        acceptedTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        analysis
      };
      
      setPendingInvoices(updatedPending);
      setAcceptedInvoices(prev => [acceptedInvoice, ...prev]);
      saveLocalData('external_pending_invoices', updatedPending);
      saveLocalData('external_accepted_invoices', [acceptedInvoice, ...acceptedInvoices]);

      // إشعار نجاح مفصّل
      showSuccess(
        `تم قبول الفاتورة من ${invoice.platformName} بنجاح!\n` +
        `العميل: ${invoice.customerName}${analysis.customer.needsCreation ? ' (جديد)' : ''}\n` +
        `الإجمالي: ${invoice.total.toLocaleString()} ج.م\n` +
        `نوع الوكيل: ${invoice.agentType === 'invoice' ? 'فاتورة' : 'كرتونة'}`
      );

      // إرسال إشعار إلى نظام الإشعارات
      addNotification({
        type: 'success',
        title: '✅ تم قبول فاتورة خارجية',
        message: `فاتورة من ${invoice.platformName} - ${invoice.customerName} - ${invoice.total.toLocaleString()} ج.م`,
        icon: 'success'
      });

    } catch (error) {
      showError('حدث خطأ في قبول الفاتورة: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // فتح نافذة الرفض
  const openRejectModal = (invoice) => {
    setInvoiceToReject(invoice);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // رفض الفاتورة
  const handleRejectInvoice = () => {
    if (!invoiceToReject) return;

    const updatedPending = pendingInvoices.filter(inv => inv.id !== invoiceToReject.id);
    const rejectedInvoice = {
      ...invoiceToReject,
      rejectedDate: new Date().toISOString().split('T')[0],
      rejectedTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      rejectionReason: rejectReason || 'لا يوجد سبب'
    };

    setPendingInvoices(updatedPending);
    setRejectedInvoices(prev => [rejectedInvoice, ...prev]);
    saveLocalData('external_pending_invoices', updatedPending);
    saveLocalData('external_rejected_invoices', [rejectedInvoice, ...rejectedInvoices]);

    showInfo(`تم رفض الفاتورة من ${invoiceToReject.platformName}`);
    
    // إرسال إشعار
    addNotification({
      type: 'warning',
      title: '❌ تم رفض فاتورة خارجية',
      message: `فاتورة من ${invoiceToReject.platformName} - السبب: ${rejectReason || 'لا يوجد سبب'}`,
      icon: 'warning'
    });

    setShowRejectModal(false);
    setInvoiceToReject(null);
    setRejectReason('');
  };

  // عرض تفاصيل الفاتورة
  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // إعادة تحميل الفواتير
  const refreshInvoices = () => {
    fetchInvoicesFromAPI();
  };

  // حساب الإحصائيات
  const stats = {
    pending: pendingInvoices.length,
    accepted: acceptedInvoices.length,
    rejected: rejectedInvoices.length,
    pendingTotal: pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)
  };

  // رسم بطاقة الفاتورة
  const InvoiceCard = ({ invoice, status }) => {
    const platformIcon = invoice.platform === 'invoice' ? <FaFileInvoice /> : <FaBox />;
    const platformColor = invoice.platform === 'invoice' ? 'blue' : 'purple';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* رأس البطاقة */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${platformColor}-500 to-${platformColor}-600 flex items-center justify-center text-white`}>
              {platformIcon}
            </div>
            <div>
              <div className="font-bold text-gray-800">{invoice.customerName}</div>
              <div className="text-xs text-gray-500">{invoice.platformName}</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-600">{invoice.receivedDate}</div>
            <div className="text-xs text-gray-500">{invoice.receivedTime}</div>
          </div>
        </div>

        {/* تفاصيل الفاتورة */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <span className="text-gray-600">عدد الأصناف:</span>
            <span className="font-semibold mr-2">{invoice.items.length}</span>
          </div>
          <div>
            <span className="text-gray-600">نوع الدفع:</span>
            <span className="font-semibold mr-2">
              {invoice.paymentType === 'cash' ? 'نقدي' : invoice.paymentType === 'deferred' ? 'آجل' : 'جزئي'}
            </span>
          </div>
        </div>

        {/* نوع الوكيل */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
            invoice.agentType === 'invoice' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-purple-100 text-purple-700'
          }`}>
            {invoice.agentType === 'invoice' ? <FaFileInvoice /> : <FaBox />}
            {invoice.agentType === 'invoice' ? 'فاتورة' : 'كرتونة'}
          </span>
        </div>

        {/* الإجمالي */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">الإجمالي</div>
          <div className="text-2xl font-bold text-green-600">
            {invoice.total.toLocaleString()} <span className="text-sm">ج.م</span>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-2">
          {status === 'pending' && (
            <>
              <button
                onClick={() => handleAcceptInvoice(invoice)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <FaCheck /> قبول
              </button>
              <button
                onClick={() => analyzeInvoice(invoice)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                title="تحليل"
              >
                <FaInfoCircle />
              </button>
              <button
                onClick={() => openRejectModal(invoice)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <FaTimes /> رفض
              </button>
            </>
          )}
          <button
            onClick={() => viewInvoiceDetails(invoice)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FaEye /> تفاصيل
          </button>
        </div>

        {/* معلومات إضافية للمقبولة والمرفوضة */}
        {status === 'accepted' && invoice.acceptedDate && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <FaCheckCircle />
              <span>تم القبول في {invoice.acceptedDate} - {invoice.acceptedTime}</span>
            </div>
          </div>
        )}
        {status === 'rejected' && invoice.rejectedDate && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
              <FaTimesCircle />
              <span>تم الرفض في {invoice.rejectedDate} - {invoice.rejectedTime}</span>
            </div>
            {invoice.rejectionReason && (
              <div className="text-xs text-gray-600 mr-5">السبب: {invoice.rejectionReason}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* العنوان والإحصائيات */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">فواتير المبيعات الخارجية</h1>
          <button
            onClick={refreshInvoices}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'جاري التحميل...' : 'تحديث'}
          </button>
        </div>
        
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaExclamationTriangle className="text-2xl" />
              <div className="text-3xl font-bold">{stats.pending}</div>
            </div>
            <div className="text-sm opacity-90">فواتير معلقة</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaCheckCircle className="text-2xl" />
              <div className="text-3xl font-bold">{stats.accepted}</div>
            </div>
            <div className="text-sm opacity-90">فواتير مقبولة</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaTimesCircle className="text-2xl" />
              <div className="text-3xl font-bold">{stats.rejected}</div>
            </div>
            <div className="text-sm opacity-90">فواتير مرفوضة</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaReceipt className="text-2xl" />
              <div className="text-xl font-bold">{stats.pendingTotal.toLocaleString()} ج.م</div>
            </div>
            <div className="text-sm opacity-90">إجمالي المعلقة</div>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            المعلقة ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'accepted'
                ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            المقبولة ({stats.accepted})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'rejected'
                ? 'bg-red-50 text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            الأرشيف المرفوض ({stats.rejected})
          </button>
        </div>

        {/* المحتوى */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <div>
              {pendingInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FaCheckCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد فواتير معلقة حالياً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingInvoices.map(invoice => (
                    <InvoiceCard key={invoice.id} invoice={invoice} status="pending" />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'accepted' && (
            <div>
              {acceptedInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد فواتير مقبولة</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acceptedInvoices.map(invoice => (
                    <InvoiceCard key={invoice.id} invoice={invoice} status="accepted" />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rejected' && (
            <div>
              {rejectedInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">لا توجد فواتير مرفوضة</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedInvoices.map(invoice => (
                    <InvoiceCard key={invoice.id} invoice={invoice} status="rejected" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* نافذة تفاصيل الفاتورة */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">تفاصيل الفاتورة</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              {/* معلومات العميل */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">معلومات العميل</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">الاسم</div>
                    <div className="font-semibold">{selectedInvoice.customerName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">الهاتف</div>
                    <div className="font-semibold" dir="ltr">{selectedInvoice.customerPhone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">المنصة</div>
                    <div className="font-semibold">{selectedInvoice.platformName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">نوع الوكيل</div>
                    <div className="font-semibold">
                      {selectedInvoice.agentType === 'invoice' ? 'فاتورة' : 'كرتونة'}
                    </div>
                  </div>
                </div>
              </div>

              {/* الأصناف */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">الأصناف</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-right font-semibold">المنتج</th>
                        <th className="px-4 py-2 text-center font-semibold">الكمية</th>
                        <th className="px-4 py-2 text-center font-semibold">السعر</th>
                        <th className="px-4 py-2 text-center font-semibold">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-3">{item.productName}</td>
                          <td className="px-4 py-3 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-center">{item.mainPrice.toLocaleString()} ج.م</td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {(item.quantity * item.mainPrice).toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* الملاحظات */}
              {selectedInvoice.notes && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">الملاحظات</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                    {selectedInvoice.notes}
                  </div>
                </div>
              )}

              {/* الإجمالي */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">الإجمالي الكلي:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {selectedInvoice.total.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة رفض الفاتورة */}
      {showRejectModal && invoiceToReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold">رفض الفاتورة</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                هل أنت متأكد من رفض الفاتورة من <strong>{invoiceToReject.platformName}</strong>؟
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">سبب الرفض (اختياري)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="اكتب سبب رفض الفاتورة..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRejectInvoice}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  تأكيد الرفض
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setInvoiceToReject(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة التحليل */}
      {showAnalysisModal && invoiceAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">تحليل الفاتورة</h2>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              {/* درجة الجاهزية */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">مستوى الجاهزية</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        invoiceAnalysis.readiness.level === 'high' ? 'bg-green-600' :
                        invoiceAnalysis.readiness.level === 'medium' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${invoiceAnalysis.readiness.score * 100}%` }}
                    />
                  </div>
                  <span className="font-bold">{Math.round(invoiceAnalysis.readiness.score * 100)}%</span>
                </div>
              </div>

              {/* المشاكل */}
              {invoiceAnalysis.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">الملاحظات</h3>
                  <ul className="space-y-2">
                    {invoiceAnalysis.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* معلومات العميل */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">العميل</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {invoiceAnalysis.customer.matched ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <FaCheckCircle />
                      <span>تم العثور على عميل مطابق: {invoiceAnalysis.customer.matched.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <FaUserPlus />
                      <span>سيتم إنشاء عميل جديد: {invoiceAnalysis.customer.data.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* المنتجات المطابقة */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">
                  المنتجات ({invoiceAnalysis.items.matched.length} من {invoiceAnalysis.items.matched.length + invoiceAnalysis.items.unmatched.length})
                </h3>
                <div className="space-y-2">
                  {invoiceAnalysis.items.matched.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <FaCheckCircle className="text-green-600" />
                      <span>{item.productName} - {item.matchedProduct.name}</span>
                    </div>
                  ))}
                  {invoiceAnalysis.items.unmatched.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <FaTimesCircle className="text-red-600" />
                      <span>{item.productName} - غير مطابق</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* المخزون */}
              {invoiceAnalysis.inventory.unavailable.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3">تحذيرات المخزون</h3>
                  <div className="space-y-2">
                    {invoiceAnalysis.inventory.unavailable.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm bg-red-50 p-3 rounded">
                        <FaExclamationTriangle className="text-red-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{item.productName}</div>
                          <div className="text-gray-600">مطلوب: {item.requestedQty} | متوفر: {item.availableQty} | نقص: {item.shortage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalSalesInvoices;
