// ======================================
// Purchase Returns - لوحة إدارة المرتجعات المتقدمة
// ======================================

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { 
  FaUndo, 
  FaEye, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaFileInvoice,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaEdit,
  FaMoneyBillWave,
  FaChartBar,
  FaDownload,
  FaPrint,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaExclamationCircle,
  FaCalendarAlt,
  FaUser,
  FaFileContract,
  FaBox,
  FaWarehouse,
  FaDollarSign,
  FaPercent,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaThumbsUp,
  FaThumbsDown,
  FaSync,
  FaExternalLinkAlt,
  FaBell,
  FaToggleOn,
  FaToggleOff,
  FaHistory,
  FaBalanceScale,
  FaCoins,
  FaHandshake,
  FaPaperPlane,
  FaQuestion
} from 'react-icons/fa';

const PurchaseReturns = () => {
  const { 
    purchaseReturns, 
    purchaseInvoices, 
    suppliers, 
    products,
    treasuryBalance,
    cashReceipts,
    cashDisbursements,
    deletePurchaseReturn,
    approvePurchaseReturn,
    rejectPurchaseReturn,
    submitPurchaseReturn,
    completePurchaseReturn,
    cancelReturn,
    updatePurchaseReturnStatus,
    getAllSupplierBalances,
    getSupplierBalance,
    checkPermission,
    getStatusText,
    validateStatusTransition,
    RETURN_STATUSES,
    currentUser
  } = useData();
  const { showSuccess, showError } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showTreasuryModal, setShowTreasuryModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBulkReturns, setSelectedBulkReturns] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // تصفية وبحث متقدم مع الفرز والترقيم
  const filteredReturns = useMemo(() => {
    let filtered = purchaseReturns.filter(returnRecord => {
      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
      const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
      const supplierName = supplier ? supplier.name : '';
      
      // البحث الشامل
      const matchesSearch = supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            returnRecord.id.toString().includes(searchQuery) ||
                            returnRecord.invoiceId.toString().includes(searchQuery) ||
                            returnRecord.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            returnRecord.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // التصفية حسب الحالة
      const matchesStatus = statusFilter === 'all' || returnRecord.status === statusFilter;
      
      // التصفية حسب التاريخ
      const returnDate = new Date(returnRecord.date);
      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date();
        matchesDate = returnDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = returnDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = returnDate >= monthAgo;
      } else if (dateFilter === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        matchesDate = returnDate >= yearAgo;
      }
      
      // التصفية حسب المورد
      const matchesSupplier = supplierFilter === 'all' || invoice?.supplierId === parseInt(supplierFilter);
      
      // التصفية حسب المبلغ
      const amount = returnRecord.totalAmount || 0;
      const matchesAmount = (amountRange.min === '' || amount >= parseFloat(amountRange.min)) &&
                           (amountRange.max === '' || amount <= parseFloat(amountRange.max));
      
      return matchesSearch && matchesStatus && matchesDate && matchesSupplier && matchesAmount;
    });

    // الترتيب
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'supplier':
          const aInvoice = purchaseInvoices.find(inv => inv.id === a.invoiceId);
          const bInvoice = purchaseInvoices.find(inv => inv.id === b.invoiceId);
          const aSupplier = suppliers.find(s => s.id === parseInt(aInvoice?.supplierId));
          const bSupplier = suppliers.find(s => s.id === parseInt(bInvoice?.supplierId));
          aValue = aSupplier?.name || '';
          bValue = bSupplier?.name || '';
          break;
        case 'status':
          aValue = getStatusText(a.status);
          bValue = getStatusText(b.status);
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [purchaseReturns, searchQuery, statusFilter, dateFilter, supplierFilter, amountRange, sortBy, sortOrder, purchaseInvoices, suppliers, getStatusText]);

  // ترقيم الصفحات
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, startIndex + itemsPerPage);

  // إحصائيات شاملة ومتقدمة
  const statistics = useMemo(() => {
    const stats = {
      total: purchaseReturns.length,
      totalAmount: 0,
      totalItems: 0,
      byStatus: {},
      bySupplier: {},
      daily: {},
      monthly: {},
      weekly: {},
      averageAmount: 0,
      successRate: 0,
      pendingAmount: 0,
      completedAmount: 0,
      rejectedAmount: 0,
      treasuryImpact: 0,
      topSuppliers: [],
      monthlyGrowth: 0,
      trends: {
        increasing: false,
        percentage: 0
      }
    };

    // حساب الإحصائيات الأساسية
    purchaseReturns.forEach(returnRecord => {
      const amount = returnRecord.totalAmount || 0;
      const date = new Date(returnRecord.date);
      
      stats.totalAmount += amount;
      stats.totalItems += returnRecord.items?.length || 0;
      
      // إحصائيات الحالة
      stats.byStatus[returnRecord.status] = (stats.byStatus[returnRecord.status] || 0) + 1;
      
      // إحصائيات المورد
      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
      const supplierId = invoice?.supplierId;
      if (supplierId) {
        stats.bySupplier[supplierId] = (stats.bySupplier[supplierId] || 0) + amount;
      }
      
      // إحصائيات يومية
      const dayKey = date.toDateString();
      stats.daily[dayKey] = (stats.daily[dayKey] || 0) + amount;
      
      // إحصائيات شهرية
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      stats.monthly[monthKey] = (stats.monthly[monthKey] || 0) + amount;
      
      // إحصائيات أسبوعية
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toDateString();
      stats.weekly[weekKey] = (stats.weekly[weekKey] || 0) + amount;
    });

    // حساب متوسط المبلغ
    stats.averageAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

    // حساب معدل النجاح
    const approvedReturns = stats.byStatus[RETURN_STATUSES.APPROVED] || 0;
    const completedReturns = stats.byStatus[RETURN_STATUSES.COMPLETED] || 0;
    stats.successRate = stats.total > 0 ? ((approvedReturns + completedReturns) / stats.total) * 100 : 0;

    // حساب المبالغ حسب الحالة
    stats.completedAmount = purchaseReturns
      .filter(r => [RETURN_STATUSES.APPROVED, RETURN_STATUSES.COMPLETED].includes(r.status))
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    
    stats.pendingAmount = purchaseReturns
      .filter(r => r.status === RETURN_STATUSES.PENDING)
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
    
    stats.rejectedAmount = purchaseReturns
      .filter(r => r.status === RETURN_STATUSES.REJECTED)
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

    // حساب تأثير الخزينة
    stats.treasuryImpact = stats.completedAmount; // مرتجعات المشتريات تزيد الرصيد

    // أفضل الموردين
    stats.topSuppliers = Object.entries(stats.bySupplier)
      .map(([supplierId, amount]) => {
        const supplier = suppliers.find(s => s.id === parseInt(supplierId));
        return { supplier, amount };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // نمو شهري
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthKey = lastMonth.toISOString().slice(0, 7);
    
    const currentMonthAmount = stats.monthly[currentMonth] || 0;
    const lastMonthAmount = stats.monthly[lastMonthKey] || 0;
    
    if (lastMonthAmount > 0) {
      stats.monthlyGrowth = ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100;
      stats.trends.increasing = currentMonthAmount > lastMonthAmount;
      stats.trends.percentage = Math.abs(stats.monthlyGrowth);
    }

    return stats;
  }, [purchaseReturns, purchaseInvoices, suppliers, RETURN_STATUSES]);

  // الإشعارات الذكية
  const checkAndAddNotifications = useCallback(() => {
    const newNotifications = [];
    
    // إشعار المرتجعات المعلقة
    const pendingReturns = purchaseReturns.filter(r => r.status === RETURN_STATUSES.PENDING);
    if (pendingReturns.length > 0) {
      newNotifications.push({
        id: Date.now() + 1,
        type: 'warning',
        title: 'مرتجعات معلقة',
        message: `يوجد ${pendingReturns.length} مرتجع معلق في انتظار المراجعة`,
        count: pendingReturns.length,
        actions: ['مراجعة', 'تجاهل']
      });
    }

    // إشعار المبالغ الكبيرة
    const largeAmounts = purchaseReturns.filter(r => 
      r.status === RETURN_STATUSES.PENDING && (r.totalAmount || 0) > 10000
    );
    if (largeAmounts.length > 0) {
      newNotifications.push({
        id: Date.now() + 2,
        type: 'danger',
        title: 'مرتجعات بمبالغ كبيرة',
        message: `يوجد ${largeAmounts.length} مرتجع بمبالغ تتجاوز 10,000 د.ع`,
        count: largeAmounts.length,
        actions: ['مراجعة فورية', 'تأجيل']
      });
    }

    // إشعار تأثير الخزينة
    const treasuryImpact = statistics.treasuryImpact;
    if (treasuryImpact > 0) {
      newNotifications.push({
        id: Date.now() + 3,
        type: 'info',
        title: 'تأثير على الخزينة',
        message: `إجمالي تأثير المرتجعات على الخزينة: ${treasuryImpact.toFixed(2)} د.ع`,
        count: treasuryImpact,
        actions: ['عرض الخزينة', 'تقارير']
      });
    }

    setNotifications(newNotifications);
  }, [purchaseReturns, statistics.treasuryImpact, RETURN_STATUSES.PENDING]);

  useEffect(() => {
    if (autoRefresh) {
      checkAndAddNotifications();
    }
  }, [autoRefresh, checkAndAddNotifications]);

  // Auto refresh كل 30 ثانية
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        checkAndAddNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, checkAndAddNotifications]);

  // دوال الإجراءات المتقدمة
  const handleView = (returnRecord) => {
    setSelectedReturn(returnRecord);
    setShowViewModal(true);
  };

  const handleWorkflow = (returnRecord) => {
    setSelectedReturn(returnRecord);
    setShowWorkflowModal(true);
  };

  const handleTreasuryLink = (returnRecord) => {
    setSelectedReturn(returnRecord);
    setShowTreasuryModal(true);
  };

  const handleStatusUpdate = async (returnRecord, newStatus, notes = '') => {
    try {
      if (!checkPermission('update', 'returns')) {
        showError('ليس لديك صلاحية تحديث حالة المرتجعات');
        return;
      }

      await updatePurchaseReturnStatus(returnRecord.id, newStatus, notes);
      showSuccess(`تم تحديث حالة المرتجع إلى ${getStatusText(newStatus)}`);
    } catch (error) {
      showError(error.message || 'حدث خطأ في تحديث حالة المرتجع');
    }
  };

  const handleApprove = async (returnRecord) => {
    try {
      if (!checkPermission('approve', 'returns')) {
        showError('ليس لديك صلاحية اعتماد المرتجعات');
        return;
      }

      await approvePurchaseReturn(returnRecord.id, 'تم الاعتماد من لوحة المرتجعات المتقدمة');
      showSuccess('تم اعتماد المرتجع بنجاح');
    } catch (error) {
      showError(error.message || 'حدث خطأ في اعتماد المرتجع');
    }
  };

  const handleReject = async (returnRecord) => {
    const reason = prompt('أدخل سبب الرفض (على الأقل 10 أحرف):');
    if (reason && reason.trim().length >= 10) {
      try {
        if (!checkPermission('reject', 'returns')) {
          showError('ليس لديك صلاحية رفض المرتجعات');
          return;
        }

        await rejectPurchaseReturn(returnRecord.id, reason);
        showSuccess('تم رفض المرتجع بنجاح');
      } catch (error) {
        showError(error.message || 'حدث خطأ في رفض المرتجع');
      }
    } else if (reason) {
      showError('يجب إدخال سبب الرفض (على الأقل 10 أحرف)');
    }
  };

  const handleSubmit = async (returnRecord) => {
    try {
      if (!checkPermission('update', 'returns')) {
        showError('ليس لديك صلاحية تحديث المرتجعات');
        return;
      }

      await submitPurchaseReturn(returnRecord.id, 'تم التقديم من لوحة المرتجعات المتقدمة');
      showSuccess('تم تقديم المرتجع للمراجعة');
    } catch (error) {
      showError(error.message || 'حدث خطأ في تقديم المرتجع');
    }
  };

  const handleComplete = async (returnRecord) => {
    try {
      if (!checkPermission('update', 'returns')) {
        showError('ليس لديك صلاحية تحديث المرتجعات');
        return;
      }

      await completePurchaseReturn(returnRecord.id, 'تم الإكمال من لوحة المرتجعات المتقدمة');
      showSuccess('تم إكمال المرتجع بنجاح');
    } catch (error) {
      showError(error.message || 'حدث خطأ في إكمال المرتجع');
    }
  };

  const handleCancel = async (returnRecord) => {
    const reason = prompt('أدخل سبب الإلغاء (على الأقل 10 أحرف):');
    if (reason && reason.trim().length >= 10) {
      try {
        if (!checkPermission('update', 'returns')) {
          showError('ليس لديك صلاحية تحديث المرتجعات');
          return;
        }

        await cancelReturn(returnRecord.id, 'purchase', reason);
        showSuccess('تم إلغاء المرتجع بنجاح');
      } catch (error) {
        showError(error.message || 'حدث خطأ في إلغاء المرتجع');
      }
    } else if (reason) {
      showError('يجب إدخال سبب الإلغاء (على الأقل 10 أحرف)');
    }
  };

  const handleDelete = async (returnRecord) => {
    if (window.confirm(`هل أنت متأكد من حذف سجل الإرجاع #${returnRecord.id}؟\nسيتم إعادة الكميات للمخزون.`)) {
      try {
        await deletePurchaseReturn(returnRecord.id);
        showSuccess('تم حذف المرتجع بنجاح وإعادة الكميات للمخزون');
      } catch (error) {
        showError(error.message || 'حدث خطأ في حذف المرتجع');
      }
    }
  };

  // العمليات المجمعة
  const handleBulkAction = async (action, returnIds = selectedBulkReturns) => {
    if (returnIds.length === 0) {
      showError('يجب اختيار مرتجع واحد على الأقل');
      return;
    }

    try {
      switch (action) {
        case 'approve':
          for (const id of returnIds) {
            const returnRecord = purchaseReturns.find(r => r.id === id);
            if (returnRecord && returnRecord.status === RETURN_STATUSES.PENDING) {
              await approvePurchaseReturn(id, 'اعتماد جماعي من لوحة المرتجعات المتقدمة');
            }
          }
          showSuccess(`تم اعتماد ${returnIds.length} مرتجع بنجاح`);
          break;

        case 'reject':
          const reason = prompt('أدخل سبب الرفض الجماعي (على الأقل 10 أحرف):');
          if (reason && reason.trim().length >= 10) {
            for (const id of returnIds) {
              const returnRecord = purchaseReturns.find(r => r.id === id);
              if (returnRecord && returnRecord.status === RETURN_STATUSES.PENDING) {
                await rejectPurchaseReturn(id, reason);
              }
            }
            showSuccess(`تم رفض ${returnIds.length} مرتجع بنجاح`);
          }
          break;

        case 'submit':
          for (const id of returnIds) {
            const returnRecord = purchaseReturns.find(r => r.id === id);
            if (returnRecord && returnRecord.status === RETURN_STATUSES.DRAFT) {
              await submitPurchaseReturn(id, 'تقديم جماعي من لوحة المرتجعات المتقدمة');
            }
          }
          showSuccess(`تم تقديم ${returnIds.length} مرتجع للمراجعة`);
          break;

        case 'delete':
          if (window.confirm(`هل أنت متأكد من حذف ${returnIds.length} مرتجع؟`)) {
            for (const id of returnIds) {
              await deletePurchaseReturn(id);
            }
            showSuccess(`تم حذف ${returnIds.length} مرتجع بنجاح`);
          }
          break;

        default:
          showError('عملية غير مدعومة');
      }
      
      setSelectedBulkReturns([]);
      setShowBulkModal(false);
    } catch (error) {
      showError(error.message || 'حدث خطأ في تنفيذ العملية الجماعية');
    }
  };

  const toggleReturnSelection = (returnId) => {
    setSelectedBulkReturns(prev => 
      prev.includes(returnId) 
        ? prev.filter(id => id !== returnId)
        : [...prev, returnId]
    );
  };

  const selectAllReturns = () => {
    if (selectedBulkReturns.length === paginatedReturns.length) {
      setSelectedBulkReturns([]);
    } else {
      setSelectedBulkReturns(paginatedReturns.map(r => r.id));
    }
  };

  // تصدير البيانات
  const exportToExcel = () => {
    const dataToExport = filteredReturns.map(returnRecord => {
      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
      const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
      
      return {
        'رقم الإرجاع': returnRecord.id,
        'رقم الفاتورة': returnRecord.invoiceId,
        'المورد': supplier?.name || 'غير محدد',
        'التاريخ': new Date(returnRecord.date).toLocaleDateString('ar-EG'),
        'السبب': returnRecord.reason,
        'عدد المنتجات': returnRecord.items?.length || 0,
        'المبلغ': returnRecord.totalAmount || 0,
        'الحالة': getStatusText(returnRecord.status),
        'تاريخ الإنشاء': new Date(returnRecord.createdAt).toLocaleDateString('ar-EG'),
        'المؤلف': returnRecord.createdBy
      };
    });

    // تحويل إلى CSV وتحميل
    const csvContent = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `مرتجعات_المشتريات_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showSuccess('تم تصدير البيانات بنجاح');
  };

  // طباعة تقرير
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const reportContent = `
      <html dir="rtl">
        <head>
          <title>تقرير المرتجعات</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .table th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير المرتجعات - المشتريات</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>إجمالي المرتجعات</h3>
              <p style="font-size: 24px; font-weight: bold; color: #2563eb;">${statistics.total}</p>
            </div>
            <div class="stat-card">
              <h3>إجمالي المبلغ</h3>
              <p style="font-size: 24px; font-weight: bold; color: #16a34a;">${statistics.totalAmount.toFixed(2)} د.ع</p>
            </div>
            <div class="stat-card">
              <h3>معدل النجاح</h3>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${statistics.successRate.toFixed(1)}%</p>
            </div>
            <div class="stat-card">
              <h3>تأثير الخزينة</h3>
              <p style="font-size: 24px; font-weight: bold; color: #7c3aed;">${statistics.treasuryImpact.toFixed(2)} د.ع</p>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>رقم الإرجاع</th>
                <th>رقم الفاتورة</th>
                <th>المورد</th>
                <th>التاريخ</th>
                <th>السبب</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReturns.map(returnRecord => {
                const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
                const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
                return `
                  <tr>
                    <td>#${returnRecord.id}</td>
                    <td>#${returnRecord.invoiceId}</td>
                    <td>${supplier?.name || 'غير محدد'}</td>
                    <td>${new Date(returnRecord.date).toLocaleDateString('ar-EG')}</td>
                    <td>${returnRecord.reason}</td>
                    <td>${(returnRecord.totalAmount || 0).toFixed(2)} د.ع</td>
                    <td>${getStatusText(returnRecord.status)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المخازن</p>
            <p>© 2025 جميع الحقوق محفوظة</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  // دوال المساعدة المحسنة
  const getReasonText = (reason) => {
    const reasons = {
      'defective': 'منتج معيب',
      'damaged': 'منتج تالف',
      'wrong_item': 'منتج خاطئ',
      'expired': 'منتهي الصلاحية',
      'excess': 'زيادة في الكمية',
      'quality_issue': 'مشكلة جودة',
      'packaging_damage': 'تلف في التغليف',
      'specification_mismatch': 'عدم مطابقة المواصفات',
      'customer_complaint': 'شكوى عميل',
      'return_policy': 'سياسة الإرجاع',
      'other': 'أخرى'
    };
    return reasons[reason] || reason;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [RETURN_STATUSES.DRAFT]: { 
        text: 'مسودة', 
        class: 'bg-gray-100 text-gray-700 border border-gray-300',
        icon: FaEdit,
        color: 'text-gray-600'
      },
      [RETURN_STATUSES.PENDING]: { 
        text: 'معلق', 
        class: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
        icon: FaClock,
        color: 'text-yellow-600'
      },
      [RETURN_STATUSES.APPROVED]: { 
        text: 'معتمد', 
        class: 'bg-blue-100 text-blue-700 border border-blue-300',
        icon: FaCheckCircle,
        color: 'text-blue-600'
      },
      [RETURN_STATUSES.COMPLETED]: { 
        text: 'مكتمل', 
        class: 'bg-green-100 text-green-700 border border-green-300',
        icon: FaCheckCircle,
        color: 'text-green-600'
      },
      [RETURN_STATUSES.CANCELLED]: { 
        text: 'ملغي', 
        class: 'bg-red-100 text-red-700 border border-red-300',
        icon: FaBan,
        color: 'text-red-600'
      },
      [RETURN_STATUSES.REJECTED]: { 
        text: 'مرفوض', 
        class: 'bg-orange-100 text-orange-700 border border-orange-300',
        icon: FaTimes,
        color: 'text-orange-600'
      }
    };
    
    const config = statusConfig[status] || { 
      text: status, 
      class: 'bg-gray-100 text-gray-700',
      icon: FaQuestion,
      color: 'text-gray-600'
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.class}`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      [RETURN_STATUSES.DRAFT]: 'border-l-gray-400',
      [RETURN_STATUSES.PENDING]: 'border-l-yellow-400',
      [RETURN_STATUSES.APPROVED]: 'border-l-blue-400',
      [RETURN_STATUSES.COMPLETED]: 'border-l-green-400',
      [RETURN_STATUSES.CANCELLED]: 'border-l-red-400',
      [RETURN_STATUSES.REJECTED]: 'border-l-orange-400'
    };
    return colors[status] || 'border-l-gray-400';
  };

  const getActionButtons = (returnRecord) => {
    const { status } = returnRecord;
    const buttons = [];

    // زر العرض (متاح دائماً)
    buttons.push(
      <button
        key="view"
        onClick={() => handleView(returnRecord)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
        title="عرض التفاصيل"
      >
        <FaEye />
      </button>
    );

    // زر تاريخ العمليات
    buttons.push(
      <button
        key="workflow"
        onClick={() => handleWorkflow(returnRecord)}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-105"
        title="تاريخ العمليات"
      >
        <FaHistory />
      </button>
    );

    // زر الخزينة
    if (returnRecord.receiptId) {
      buttons.push(
        <button
          key="treasury"
          onClick={() => handleTreasuryLink(returnRecord)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105"
          title="عرض في الخزينة"
        >
          <FaExternalLinkAlt />
        </button>
      );
    }

    // أزرار الإجراءات حسب الحالة
    switch (status) {
      case RETURN_STATUSES.DRAFT:
        if (checkPermission('update', 'returns')) {
          buttons.push(
            <button
              key="submit"
              onClick={() => handleSubmit(returnRecord)}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="تقديم للمراجعة"
            >
              <FaPaperPlane />
            </button>
          );
          buttons.push(
            <button
              key="edit"
              onClick={() => handleView(returnRecord)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="تعديل"
            >
              <FaEdit />
            </button>
          );
        }
        break;
      
      case RETURN_STATUSES.PENDING:
        if (checkPermission('approve', 'returns')) {
          buttons.push(
            <button
              key="approve"
              onClick={() => handleApprove(returnRecord)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="اعتماد"
            >
              <FaCheck />
            </button>
          );
          buttons.push(
            <button
              key="reject"
              onClick={() => handleReject(returnRecord)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="رفض"
            >
              <FaTimes />
            </button>
          );
        }
        break;
      
      case RETURN_STATUSES.APPROVED:
        if (checkPermission('update', 'returns')) {
          buttons.push(
            <button
              key="complete"
              onClick={() => handleComplete(returnRecord)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="إكمال"
            >
              <FaCheckCircle />
            </button>
          );
          buttons.push(
            <button
              key="cancel"
              onClick={() => handleCancel(returnRecord)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-105"
              title="إلغاء"
            >
              <FaBan />
            </button>
          );
        }
        break;
    }

    // زر الحذف (مشروط بالصلاحيات)
    if (checkPermission('delete', 'returns')) {
      buttons.push(
        <button
          key="delete"
          onClick={() => handleDelete(returnRecord)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
          title="حذف"
        >
          <FaTrash />
        </button>
      );
    }

    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {buttons}
      </div>
    );
  };

  const getAmountColor = (amount) => {
    if (amount > 10000) return 'text-red-600 font-bold';
    if (amount > 5000) return 'text-orange-600 font-semibold';
    return 'text-gray-800 font-medium';
  };

  const getDateFilterLabel = (filter) => {
    const labels = {
      'all': 'جميع التواريخ',
      'today': 'اليوم',
      'week': 'هذا الأسبوع',
      'month': 'هذا الشهر',
      'year': 'هذا العام'
    };
    return labels[filter] || filter;
  };

  // دوال الترتيب
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? 
      <FaSortUp className="text-blue-600" /> : 
      <FaSortDown className="text-blue-600" />;
  };

  return (
    <ErrorBoundary componentName="لوحة إدارة المرتجعات المتقدمة">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white">
                    <FaUndo className="w-6 h-6" />
                  </div>
                  لوحة إدارة المرتجعات المتقدمة
                </h1>
                <p className="text-gray-600 mt-2">إدارة شاملة ومتقدمة لمرتجعات المشتريات مع التكامل الكامل مع الخزينة</p>
              </div>
              
              {/* أدوات التحكم */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={printReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaPrint />
                  طباعة تقرير
                </button>
                
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaDownload />
                  تصدير Excel
                </button>
                
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    autoRefresh 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {autoRefresh ? <FaToggleOn /> : <FaToggleOff />}
                  تحديث تلقائي
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* بطاقات الإحصائيات الشاملة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* إجمالي المرتجعات */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">إجمالي المرتجعات</p>
                  <p className="text-4xl font-bold mt-2">{statistics.total}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FaCheckCircle className="w-4 h-4" />
                      <span>مكتمل: {statistics.byStatus[RETURN_STATUSES.COMPLETED] || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="w-4 h-4" />
                      <span>معلق: {statistics.byStatus[RETURN_STATUSES.PENDING] || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-red-400 bg-opacity-30 rounded-xl">
                  <FaUndo className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* إجمالي المبلغ */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">إجمالي المبلغ المرتجع</p>
                  <p className="text-4xl font-bold mt-2">{statistics.totalAmount.toLocaleString()}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FaDollarSign className="w-4 h-4" />
                      <span>دينار عراقي</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaPercent className="w-4 h-4" />
                      <span>متوسط: {statistics.averageAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-400 bg-opacity-30 rounded-xl">
                  <FaMoneyBillWave className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* معدل النجاح */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">معدل النجاح</p>
                  <p className="text-4xl font-bold mt-2">{statistics.successRate.toFixed(1)}%</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FaThumbsUp className="w-4 h-4" />
                      <span>معتمد: {statistics.byStatus[RETURN_STATUSES.APPROVED] || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaChartBar className="w-4 h-4" />
                      <span>مرفوض: {statistics.byStatus[RETURN_STATUSES.REJECTED] || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-400 bg-opacity-30 rounded-xl">
                  <FaBalanceScale className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* تأثير الخزينة */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">تأثير الخزينة</p>
                  <p className="text-4xl font-bold mt-2">+{statistics.treasuryImpact.toLocaleString()}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <FaCoins className="w-4 h-4" />
                      <span>الرصيد الحالي: {treasuryBalance.toLocaleString()}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${statistics.monthlyGrowth > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      <FaChartBar className="w-4 h-4" />
                      <span>{statistics.monthlyGrowth > 0 ? '+' : ''}{statistics.monthlyGrowth.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-400 bg-opacity-30 rounded-xl">
                  <FaHandshake className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* لوحة الإشعارات الذكية */}
          {notifications.length > 0 && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <FaBell className="w-5 h-5" />
                    الإشعارات الذكية
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 rounded-lg border-r-4 ${
                        notification.type === 'danger' ? 'bg-red-50 border-red-500' :
                        notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaTimes />
                          </button>
                        </div>
                        {notification.actions && (
                          <div className="flex gap-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <button
                                key={index}
                                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                  notification.type === 'danger' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                  'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* شريط البحث والتصفية المتقدم */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              {/* البحث */}
              <div className="lg:col-span-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="ابحث برقم الإرجاع، الفاتورة، المورد، السبب، الملاحظات..."
                  />
                  <FaSearch className="absolute left-4 top-4 text-gray-400" />
                </div>
              </div>

              {/* تصفية الحالة */}
              <div className="lg:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="all">جميع الحالات</option>
                  <option value={RETURN_STATUSES.DRAFT}>مسودة</option>
                  <option value={RETURN_STATUSES.PENDING}>معلق</option>
                  <option value={RETURN_STATUSES.APPROVED}>معتمد</option>
                  <option value={RETURN_STATUSES.COMPLETED}>مكتمل</option>
                  <option value={RETURN_STATUSES.CANCELLED}>ملغي</option>
                  <option value={RETURN_STATUSES.REJECTED}>مرفوض</option>
                </select>
              </div>

              {/* تصفية التاريخ */}
              <div className="lg:col-span-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="all">{getDateFilterLabel('all')}</option>
                  <option value="today">{getDateFilterLabel('today')}</option>
                  <option value="week">{getDateFilterLabel('week')}</option>
                  <option value="month">{getDateFilterLabel('month')}</option>
                  <option value="year">{getDateFilterLabel('year')}</option>
                </select>
              </div>

              {/* تصفية المورد */}
              <div className="lg:col-span-2">
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="w-full px-4 py-3 pr-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="all">جميع الموردين</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>

              {/* نطاق المبلغ */}
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amountRange.min}
                    onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                    placeholder="من"
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={amountRange.max}
                    onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                    placeholder="إلى"
                    className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* أدوات إضافية */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  عرض <span className="font-semibold">{filteredReturns.length}</span> من <span className="font-semibold">{purchaseReturns.length}</span> مرتجع
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllReturns}
                    className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    {selectedBulkReturns.length === paginatedReturns.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                  <span className="text-xs text-gray-500">
                    محدد: {selectedBulkReturns.length}
                  </span>
                </div>
              </div>

              {selectedBulkReturns.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FaToggleOn />
                    إجراءات جماعية ({selectedBulkReturns.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* جدول المرتجعات مع الترقيم */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
                        رقم الإرجاع
                        {getSortIcon('id')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('supplier')}>
                        المورد
                        {getSortIcon('supplier')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-1 cursor-pointer justify-center" onClick={() => handleSort('date')}>
                        التاريخ
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">السبب</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">عدد المنتجات</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-1 cursor-pointer justify-center" onClick={() => handleSort('amount')}>
                        المبلغ
                        {getSortIcon('amount')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-1 cursor-pointer justify-center" onClick={() => handleSort('status')}>
                        الحالة
                        {getSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedReturns.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        <FaUndo className="mx-auto mb-2 text-3xl text-gray-300" />
                        <p>لا توجد مرتجعات تطابق معايير البحث</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedReturns.map((returnRecord) => {
                      const invoice = purchaseInvoices.find(inv => inv.id === returnRecord.invoiceId);
                      const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
                      
                      return (
                        <tr key={returnRecord.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedBulkReturns.includes(returnRecord.id)}
                                onChange={() => toggleReturnSelection(returnRecord.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-bold text-red-600">#{returnRecord.id}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">فاتورة: #{returnRecord.invoiceId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{supplier?.name || 'غير محدد'}</div>
                            <div className="text-xs text-gray-500">{supplier?.phone || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="text-sm font-medium">
                              {new Date(returnRecord.date).toLocaleDateString('ar-EG')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(returnRecord.date).toLocaleTimeString('ar-EG')}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                              {getReasonText(returnRecord.reason)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {returnRecord.items?.length || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-lg font-bold ${getAmountColor(returnRecord.totalAmount || 0)}`}>
                              {(returnRecord.totalAmount || 0).toFixed(2)} د.ع
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(returnRecord.status)}
                          </td>
                          <td className="px-4 py-3">
                            {getActionButtons(returnRecord)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ترقيم الصفحات */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    عرض {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredReturns.length)} من {filteredReturns.length} مرتجع
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      السابق
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal عرض تفاصيل الإرجاع */}
        {showViewModal && selectedReturn && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white sticky top-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">تفاصيل الإرجاع #{selectedReturn.id}</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {(() => {
                  const invoice = purchaseInvoices.find(inv => inv.id === selectedReturn.invoiceId);
                  const supplier = suppliers.find(s => s.id === parseInt(invoice?.supplierId));
                  
                  return (
                    <>
                      {/* معلومات الإرجاع */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">رقم الفاتورة الأصلية</p>
                          <p className="font-semibold text-sm">#{selectedReturn.invoiceId}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">المورد</p>
                          <p className="font-semibold text-sm">{supplier?.name || 'غير محدد'}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">تاريخ الإرجاع</p>
                          <p className="font-semibold text-sm">
                            {new Date(selectedReturn.date).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">إجمالي المبلغ</p>
                          <p className="font-bold text-lg text-purple-600">
                            {(selectedReturn.totalAmount || 0).toFixed(2)} د.ع
                          </p>
                        </div>
                      </div>

                      {/* سبب الإرجاع */}
                      <div className="bg-orange-50 p-4 rounded-lg mb-6">
                        <p className="text-xs text-gray-600 mb-1">سبب الإرجاع</p>
                        <p className="font-semibold">{getReasonText(selectedReturn.reason)}</p>
                        {selectedReturn.notes && (
                          <>
                            <p className="text-xs text-gray-600 mt-2 mb-1">ملاحظات</p>
                            <p className="text-sm">{selectedReturn.notes}</p>
                          </>
                        )}
                      </div>

                      {/* جدول المنتجات المرتجعة */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">المنتجات المرتجعة</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-right text-xs font-semibold">#</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold">المنتج</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold">الكمية</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold">السعر</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold">الإجمالي</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {(selectedReturn.items || []).map((item, index) => {
                                const product = products.find(p => p.id === parseInt(item.productId));
                                const originalItem = invoice?.items.find(i => i.productId === item.productId);
                                const itemTotal = (item.quantity || 0) * (originalItem?.price || 0) + 
                                                (item.subQuantity || 0) * (originalItem?.subPrice || 0);
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">{index + 1}</td>
                                    <td className="px-3 py-2">
                                      <div className="font-medium">{product?.name || 'غير محدد'}</div>
                                      <div className="text-xs text-gray-500">{product?.category || '-'}</div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <div>{item.quantity || 0} أساسي</div>
                                      {item.subQuantity > 0 && (
                                        <div className="text-xs text-gray-500">{item.subQuantity} فرعي</div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <div>{(originalItem?.price || 0).toFixed(2)}</div>
                                      {originalItem?.subPrice > 0 && (
                                        <div className="text-xs text-gray-500">
                                          {(originalItem?.subPrice || 0).toFixed(2)}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center font-semibold text-red-600">
                                      {itemTotal.toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-4 border-t flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PurchaseReturns;