// ======================================
// Enhanced New Sales Return - إرجاع فاتورة مبيعات محسن
// ======================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { 
  FaSave, 
  FaArrowLeft, 
  FaUndo, 
  FaEye, 
  FaCheck, 
  FaClock,
  FaExclamationTriangle,
  FaShoppingCart,
  FaUsers,
  FaWarehouse,
  FaFilter,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronRight,
  FaChevronDown,
  FaUser
} from 'react-icons/fa';

const NewSalesReturn = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { 
    salesInvoices, 
    products, 
    customers, 
    addSalesReturn, 
    salesReturns,
    warehouses 
  } = useData();
  const { showSuccess, showError, showWarning } = useNotification();

  // Workflow States
  const [currentStep, setCurrentStep] = useState('invoice-info'); // invoice-info, customer-analysis, product-selection, details, preview, completed
  const [workflowState, setWorkflowState] = useState('draft'); // draft, review, approved, rejected
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Main form data
  const [invoice, setInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [returnType, setReturnType] = useState('full'); // full, partial
  const [priority, setPriority] = useState('medium'); // low, medium, high
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [template, setTemplate] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('original'); // original, credit, cash
  
  // Advanced filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all'); // all, available, unavailable
  const [sortBy, setSortBy] = useState('name'); // name, category, quantity, price

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Customer analysis
  const [customerAnalysis, setCustomerAnalysis] = useState(null);

  // Return templates
  const returnTemplates = {
    defective: { name: 'إرجاع منتج معيب', items: [] },
    damaged: { name: 'إرجاع منتج تالف', items: [] },
    wrong_item: { name: 'إرجاع منتج خاطئ', items: [] },
    customer_request: { name: 'طلب العميل', items: [] },
    wrong_color: { name: 'لون خاطئ', items: [] },
    wrong_size: { name: 'مقاس خاطئ', items: [] },
    not_satisfied: { name: 'عدم الرضا', items: [] }
  };

  const steps = [
    { id: 'invoice-info', name: 'معلومات الفاتورة', icon: FaShoppingCart, completed: false },
    { id: 'customer-analysis', name: 'تحليل العميل', icon: FaUsers, completed: false },
    { id: 'product-selection', name: 'اختيار المنتجات', icon: FaWarehouse, completed: false },
    { id: 'details', name: 'تفاصيل الإرجاع', icon: FaEdit, completed: false },
    { id: 'preview', name: 'معاينة', icon: FaEye, completed: false }
  ];

  // Calculate progress
  const completedSteps = steps.filter(step => steps.indexOf(step.id) <= steps.indexOf(currentStep)).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Advanced initialization
  useEffect(() => {
    console.log('🚀 تم تحميل مكون NewSalesReturn المحسن');
    
    const initializeData = async () => {
      let actualInvoiceId = invoiceId;
      
      // Get invoiceId from various sources
      if (!actualInvoiceId) {
        const hash = window.location.hash;
        if (hash && hash.includes('/return/')) {
          actualInvoiceId = hash.split('/return/')[1];
        }
        const urlParams = new URLSearchParams(window.location.search);
        if (!actualInvoiceId) {
          actualInvoiceId = urlParams.get('id');
        }
      }
      
      if (!actualInvoiceId) {
        showError('معرف الفاتورة غير صحيح');
        navigate('/sales/manage');
        return;
      }

      // Wait for data to load
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!salesInvoices || salesInvoices.length === 0) {
        showError('لا توجد فواتير مبيعات في النظام');
        navigate('/sales/manage');
        return;
      }

      const foundInvoice = salesInvoices.find(inv => 
        inv.id === parseInt(actualInvoiceId) || inv.id.toString() === actualInvoiceId.toString()
      );

      if (!foundInvoice) {
        showError('الفاتورة غير موجودة');
        navigate('/sales/manage');
        return;
      }

      setInvoice(foundInvoice);
      initializeReturnItems(foundInvoice);
      performCustomerAnalysis(foundInvoice);
      setIsLoading(false);
    };

    initializeData();
  }, [invoiceId, salesInvoices, salesReturns, navigate, showError, products]);

  const initializeReturnItems = (foundInvoice) => {
    const itemsWithReturnInfo = foundInvoice.items.map(item => {
      const previousReturns = salesReturns.filter(ret => 
        ret.invoiceId === foundInvoice.id && ret.status !== 'cancelled'
      );
      
      let totalReturnedQty = 0;
      let totalReturnedSubQty = 0;
      previousReturns.forEach(ret => {
        const retItem = ret.items.find(i => i.productId === item.productId);
        if (retItem) {
          totalReturnedQty += (retItem.quantity || 0);
          totalReturnedSubQty += (retItem.subQuantity || 0);
        }
      });
      
      const originalMainQty = item.quantity || 0;
      const originalSubQty = item.subQuantity || 0;
      const availableMainQty = originalMainQty - totalReturnedQty;
      const availableSubQty = originalSubQty - totalReturnedSubQty;
      
      const product = products?.find(p => p.id === parseInt(item.productId));
      
      return {
        productId: item.productId,
        productName: product?.name || item.productName || 'غير محدد',
        productCode: product?.code || '',
        category: product?.category || '',
        originalQuantity: originalMainQty,
        originalSubQuantity: originalSubQty,
        originalPrice: item.price || 0,
        originalSubPrice: item.subPrice || 0,
        returnedMainQty: totalReturnedQty,
        returnedSubQty: totalReturnedSubQty,
        availableMainQty: availableMainQty,
        availableSubQty: availableSubQty,
        returnQuantity: 0,
        returnSubQuantity: 0,
        selected: false,
        notes: '',
        condition: 'good', // good, fair, poor
        customerReason: '',
        returnLocation: 'warehouse' // warehouse, store, damaged
      };
    });
    
    setReturnItems(itemsWithReturnInfo);
  };

  // Customer analysis
  const performCustomerAnalysis = (foundInvoice) => {
    const customer = customers.find(c => c.id === parseInt(foundInvoice.customerId));
    if (!customer) return;

    const customerInvoices = salesInvoices.filter(inv => inv.customerId === foundInvoice.customerId);
    const customerReturns = salesReturns.filter(ret => 
      customerInvoices.some(inv => inv.id === ret.invoiceId)
    );

    const analysis = {
      customer: customer,
      totalInvoices: customerInvoices.length,
      totalSpent: customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      totalReturns: customerReturns.length,
      returnRate: customerInvoices.length > 0 ? (customerReturns.length / customerInvoices.length * 100).toFixed(1) : 0,
      averageReturnAmount: customerReturns.length > 0 ? 
        customerReturns.reduce((sum, ret) => sum + (ret.total || 0), 0) / customerReturns.length : 0,
      lastReturnDate: customerReturns.length > 0 ? 
        Math.max(...customerReturns.map(ret => new Date(ret.date).getTime())) : null,
      riskLevel: calculateRiskLevel(customerReturns.length, customerInvoices.length)
    };

    setCustomerAnalysis(analysis);
  };

  const calculateRiskLevel = (returnsCount, invoicesCount) => {
    if (invoicesCount === 0) return 'low';
    
    const returnRate = returnsCount / invoicesCount;
    if (returnRate > 0.3) return 'high';
    if (returnRate > 0.15) return 'medium';
    return 'low';
  };

  // Advanced filtering and sorting
  const filteredItems = returnItems
    .filter(item => {
      const matchesSearch = !searchTerm || 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || item.category === filterCategory;
      
      const matchesAvailability = filterAvailable === 'all' || 
        (filterAvailable === 'available' && (item.availableMainQty > 0 || item.availableSubQty > 0)) ||
        (filterAvailable === 'unavailable' && item.availableMainQty === 0 && item.availableSubQty === 0);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'quantity':
          return (b.availableMainQty + b.availableSubQty) - (a.availableMainQty + a.availableSubQty);
        case 'price':
          return b.originalPrice - a.originalPrice;
        default:
          return 0;
      }
    });

  // Categories for filtering
  const categories = [...new Set(products?.map(p => p.category).filter(Boolean))];

  // Handle item selection with advanced logic
  const handleItemSelect = useCallback((index, isSelected) => {
    const itemIndex = returnItems.findIndex((_, i) => i === index);
    const updated = [...returnItems];
    updated[index].selected = isSelected;
    
    if (!isSelected) {
      updated[index].returnQuantity = 0;
      updated[index].returnSubQuantity = 0;
      updated[index].notes = '';
      updated[index].condition = 'good';
      updated[index].customerReason = '';
      updated[index].returnLocation = 'warehouse';
    } else {
      // Auto-select all available quantity for partial returns
      if (returnType === 'partial') {
        updated[index].returnQuantity = updated[index].availableMainQty;
        updated[index].returnSubQuantity = updated[index].availableSubQty;
      }
    }
    
    setReturnItems(updated);
    clearErrors();
  }, [returnType]);

  // Handle quantity changes with validation
  const handleQuantityChange = useCallback((index, field, value) => {
    const updated = [...returnItems];
    const item = updated[index];
    
    const newValue = Math.max(0, parseInt(value) || 0);
    
    if (field === 'returnQuantity') {
      if (newValue > item.availableMainQty) {
        showError(`الكمية الأساسية المرتجعة تتجاوز المتاح (${item.availableMainQty})`);
        return;
      }
    } else if (field === 'returnSubQuantity') {
      if (newValue > item.availableSubQty) {
        showError(`الكمية الفرعية المرتجعة تتجاوز المتاح (${${item.availableSubQty}})`);
        return;
      }
    }
    
    updated[index][field] = newValue;
    setReturnItems(updated);
    clearErrors();
  }, [showError]);

  // Template application
  const applyTemplate = useCallback((templateType) => {
    const updated = [...returnItems];
    
    switch (templateType) {
      case 'defective':
        updated.forEach(item => {
          if (item.availableMainQty > 0 || item.availableSubQty > 0) {
            item.selected = true;
            item.returnQuantity = item.availableMainQty;
            item.returnSubQuantity = item.availableSubQty;
            item.condition = 'poor';
            item.customerReason = 'منتج معيب';
            item.returnLocation = 'damaged';
            item.notes = 'منتج معيب - يحتاج فحص فني';
          }
        });
        break;
        
      case 'damaged':
        updated.forEach(item => {
          if (item.availableMainQty > 0 || item.availableSubQty > 0) {
            item.selected = true;
            item.returnQuantity = item.availableMainQty;
            item.returnSubQuantity = item.availableSubQty;
            item.condition = 'poor';
            item.customerReason = 'منتج تالف';
            item.returnLocation = 'damaged';
            item.notes = 'منتج تالف - خارج عن الخدمة';
          }
        });
        break;
        
      case 'customer_request':
        updated.forEach(item => {
          if (item.availableMainQty > 0 || item.availableSubQty > 0) {
            item.selected = true;
            item.returnQuantity = item.availableMainQty;
            item.returnSubQuantity = item.availableSubQty;
            item.condition = 'good';
            item.customerReason = 'طلب العميل';
            item.returnLocation = 'warehouse';
            item.notes = 'إرجاع بناءً على طلب العميل';
          }
        });
        break;
        
      case 'wrong_color':
        updated.forEach(item => {
          if (item.availableMainQty > 0 || item.availableSubQty > 0) {
            item.selected = true;
            item.returnQuantity = item.availableMainQty;
            item.returnSubQuantity = item.availableSubQty;
            item.condition = 'good';
            item.customerReason = 'لون خاطئ';
            item.returnLocation = 'warehouse';
            item.notes = 'اللون لا يتطابق مع الطلب';
          }
        });
        break;
        
      default:
        break;
    }
    
    setReturnItems(updated);
    showSuccess('تم تطبيق القالب بنجاح');
  }, [showSuccess]);

  // Clear errors
  const clearErrors = () => setErrors({});

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 'product-selection':
        const selectedItems = returnItems.filter(item => item.selected);
        if (selectedItems.length === 0) {
          newErrors.products = 'يرجى اختيار منتج واحد على الأقل للإرجاع';
        }
        selectedItems.forEach((item, index) => {
          if ((item.returnQuantity + item.returnSubQuantity) === 0) {
            newErrors[`quantity_${index}`] = `يرجى إدخال كمية صحيحة للمنتج: ${item.productName}`;
          }
        });
        break;
        
      case 'details':
        if (!reason.trim()) {
          newErrors.reason = 'يرجى إدخال سبب الإرجاع';
        }
        if (!selectedWarehouse) {
          newErrors.warehouse = 'يرجى اختيار المستودع';
        }
        if (!customerNotes.trim()) {
          newErrors.customerNotes = 'يرجى إدخال ملاحظات العميل';
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const goToNextStep = () => {
    if (!validateStep(currentStep)) {
      showWarning('يرجى إصلاح الأخطاء قبل المتابعة');
      return;
    }
    
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  // Move to previous step
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const selectedItems = returnItems.filter(item => item.selected);
    const totalItems = selectedItems.length;
    const totalMainQty = selectedItems.reduce((sum, item) => sum + item.returnQuantity, 0);
    const totalSubQty = selectedItems.reduce((sum, item) => sum + item.returnSubQuantity, 0);
    const totalAmount = selectedItems.reduce((sum, item) => 
      sum + (item.returnQuantity * item.originalPrice) + (item.returnSubQuantity * item.originalSubPrice), 0
    );
    
    return { totalItems, totalMainQty, totalSubQty, totalAmount };
  };

  // Generate preview
  const generatePreview = () => {
    const selectedItems = returnItems.filter(item => item.selected);
    const totals = calculateTotals();
    
    const preview = {
      invoice,
      customerAnalysis,
      items: selectedItems,
      totals,
      reason,
      notes,
      customerNotes,
      returnType,
      priority,
      expectedReturnDate,
      selectedWarehouse,
      refundMethod,
      workflowState
    };
    
    setPreviewData(preview);
    setShowPreview(true);
  };

  // Save as draft
  const saveAsDraft = async () => {
    try {
      setWorkflowState('draft');
      setIsSubmitting(true);
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('تم حفظ المرتجع كمسودة بنجاح');
      navigate('/sales/returns');
    } catch (error) {
      showError('حدث خطأ في حفظ المسودة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit for review
  const submitForReview = async () => {
    if (!validateStep('details')) {
      showWarning('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }
    
    try {
      setWorkflowState('review');
      setIsSubmitting(true);
      
      // Simulate submit operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('تم تقديم المرتجع للمراجعة بنجاح');
      navigate('/sales/returns');
    } catch (error) {
      showError('حدث خطأ في تقديم المرتجع');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final submit
  const handleFinalSubmit = async () => {
    if (!validateStep('preview')) {
      showWarning('يرجى مراجعة البيانات قبل الإرسال النهائي');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const returnData = {
        invoiceId: invoice.id,
        items: returnItems
          .filter(item => item.selected)
          .map(item => ({
            productId: item.productId,
            quantity: item.returnQuantity,
            subQuantity: item.returnSubQuantity,
            notes: item.notes,
            condition: item.condition,
            customerReason: item.customerReason,
            returnLocation: item.returnLocation
          })),
        reason,
        notes,
        customerNotes,
        returnType,
        priority,
        expectedReturnDate,
        warehouseId: selectedWarehouse,
        refundMethod,
        status: 'approved'
      };

      addSalesReturn(returnData);
      showSuccess('تم تنفيذ الإرجاع بنجاح');
      setCurrentStep('completed');
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية الإرجاع');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading || !invoice) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">جاري تحميل بيانات الفاتورة</h3>
          <p className="text-gray-500">يرجى الانتظار بينما نقوم بتحضير البيانات...</p>
          <div className="mt-4 w-64 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  const customer = customers.find(c => c.id === parseInt(invoice.customerId));
  const totals = calculateTotals();

  return (
    <ErrorBoundary componentName="إرجاع فاتورة مبيعات محسن">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header with Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">إنشاء إرجاع فاتورة مبيعات</h2>
              <p className="text-gray-600">فاتورة رقم #{invoice.id} - {customer?.name || 'غير محدد'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  workflowState === 'draft' ? 'bg-gray-100 text-gray-700' :
                  workflowState === 'review' ? 'bg-yellow-100 text-yellow-700' :
                  workflowState === 'approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {workflowState === 'draft' ? 'مسودة' :
                   workflowState === 'review' ? 'قيد المراجعة' :
                   workflowState === 'approved' ? 'معتمد' : 'مرفوض'}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/sales/manage')}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaArrowLeft /> رجوع
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => {
                const isCompleted = steps.indexOf(step.id) <= steps.indexOf(currentStep);
                const isCurrent = step.id === currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex flex-col items-center ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCurrent ? 'border-blue-600 bg-blue-50' :
                        isCompleted ? 'border-green-600 bg-green-50' :
                        'border-gray-300 bg-gray-50'
                      }`}>
                        <step.icon className={`text-lg ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <span className="text-xs mt-2 text-center">{step.name}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-1 mx-4 rounded ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{width: `${progressPercentage}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Step 1: Invoice Info */}
          {currentStep === 'invoice-info' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FaShoppingCart className="mx-auto text-4xl text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">معلومات الفاتورة الأصلية</h3>
                <p className="text-gray-600">راجع تفاصيل الفاتورة قبل المتابعة</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-blue-600 text-xl" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">العميل</p>
                      <p className="font-semibold text-sm">{customer?.name || 'غير محدد'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-green-600 text-xl" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">التاريخ</p>
                      <p className="font-semibold text-sm">
                        {new Date(invoice.date).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle className="text-yellow-600 text-xl" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">نوع الدفع</p>
                      <p className="font-semibold text-sm">
                        {invoice.paymentType === 'cash' ? 'نقدي' : 
                         invoice.paymentType === 'deferred' ? 'آجل' : 'جزئي'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-purple-600 text-xl" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">المجموع الكلي</p>
                      <p className="font-bold text-lg text-purple-600">{invoice.total.toFixed(2)} د.ع</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={goToNextStep}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  متابعة <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Customer Analysis */}
          {currentStep === 'customer-analysis' && customerAnalysis && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FaUsers className="mx-auto text-4xl text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">تحليل العميل وتاريخ المرتجعات</h3>
                <p className="text-gray-600">تحليل سلوك العميل وتاريخ المرتجعات السابقة</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <FaShoppingCart className="mx-auto text-2xl text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">إجمالي الفواتير</p>
                    <p className="text-2xl font-bold text-blue-600">{customerAnalysis.totalInvoices}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <FaUsers className="mx-auto text-2xl text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                    <p className="text-2xl font-bold text-green-600">{customerAnalysis.totalSpent.toFixed(0)} د.ع</p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-center">
                    <FaUndo className="mx-auto text-2xl text-red-600 mb-2" />
                    <p className="text-sm text-gray-600">عدد المرتجعات</p>
                    <p className="text-2xl font-bold text-red-600">{customerAnalysis.totalReturns}</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  customerAnalysis.riskLevel === 'high' ? 'bg-red-50 border-red-200' :
                  customerAnalysis.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="text-center">
                    <FaExclamationTriangle className={`mx-auto text-2xl mb-2 ${
                      customerAnalysis.riskLevel === 'high' ? 'text-red-600' :
                      customerAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <p className="text-sm text-gray-600">معدل المخاطر</p>
                    <p className={`text-2xl font-bold ${
                      customerAnalysis.riskLevel === 'high' ? 'text-red-600' :
                      customerAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {customerAnalysis.riskLevel === 'high' ? 'عالي' :
                       customerAnalysis.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer History Table */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">تفاصيل العميل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">اسم العميل</p>
                    <p className="font-semibold">{customerAnalysis.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">معدل المرتجعات</p>
                    <p className="font-semibold">{customerAnalysis.returnRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">متوسط قيمة المرتجع</p>
                    <p className="font-semibold">{customerAnalysis.averageReturnAmount.toFixed(2)} د.ع</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">آخر إرجاع</p>
                    <p className="font-semibold">
                      {customerAnalysis.lastReturnDate ? 
                        new Date(customerAnalysis.lastReturnDate).toLocaleDateString('ar-EG') : 
                        'لا يوجد'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {customerAnalysis.riskLevel === 'high' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-500 text-xl mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">تنبيه: عميل عالي المخاطر</h4>
                    <p className="text-red-700 text-sm">
                      هذا العميل لديه معدل مرتجعات عالي. يُنصح بمراجعة دقيقة للمنتجات قبل الموافقة على الإرجاع.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <FaArrowLeft /> السابق
                </button>
                <button
                  onClick={goToNextStep}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  التالي <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Product Selection */}
          {currentStep === 'product-selection' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FaWarehouse className="mx-auto text-4xl text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">اختيار المنتجات للإرجاع</h3>
                <p className="text-gray-600">حدد المنتجات والكميات المراد إرجاعها</p>
              </div>

              {/* Templates */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-3">قوالب الإرجاع السريع</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(returnTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في المنتجات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع الفئات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع المنتجات</option>
                  <option value="available">المتاح للإرجاع</option>
                  <option value="unavailable">غير متاح</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">ترتيب حسب الاسم</option>
                  <option value="category">ترتيب حسب الفئة</option>
                  <option value="quantity">ترتيب حسب الكمية</option>
                  <option value="price">ترتيب حسب السعر</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const updated = returnItems.map(item => ({
                              ...item,
                              selected: e.target.checked && (item.availableMainQty > 0 || item.availableSubQty > 0)
                            }));
                            setReturnItems(updated);
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">المنتج</th>
                      <th className="px-4 py-3 text-center font-semibold">الفئة</th>
                      <th className="px-4 py-3 text-center font-semibold">الكمية الأصلية</th>
                      <th className="px-4 py-3 text-center font-semibold">المرتجع سابقاً</th>
                      <th className="px-4 py-3 text-center font-semibold">المتاح</th>
                      <th className="px-4 py-3 text-center font-semibold">كمية الإرجاع</th>
                      <th className="px-4 py-3 text-center font-semibold">سبب العميل</th>
                      <th className="px-4 py-3 text-center font-semibold">الحالة</th>
                      <th className="px-4 py-3 text-center font-semibold">مكان الإرجاع</th>
                      <th className="px-4 py-3 text-center font-semibold">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item, index) => {
                      const productIndex = returnItems.findIndex((_, i) => i === index);
                      const isDisabled = item.availableMainQty === 0 && item.availableSubQty === 0;
                      
                      return (
                        <tr key={index} className={`hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => handleItemSelect(index, e.target.checked)}
                              disabled={isDisabled}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.productCode}</div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">
                            {item.category || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div>{item.originalQuantity} أساسي</div>
                            {item.originalSubQuantity > 0 && (
                              <div className="text-xs text-gray-500">{item.originalSubQuantity} فرعي</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              {item.returnedMainQty + item.returnedSubQty}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.availableMainQty > 0 || item.availableSubQty > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {item.availableMainQty + item.availableSubQty}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {item.selected && (
                              <div className="flex gap-2 justify-center">
                                <input
                                  type="number"
                                  value={item.returnQuantity}
                                  onChange={(e) => handleQuantityChange(index, 'returnQuantity', e.target.value)}
                                  className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded"
                                  min="0"
                                  max={item.availableMainQty}
                                  placeholder="أساسي"
                                />
                                {item.availableSubQty > 0 && (
                                  <input
                                    type="number"
                                    value={item.returnSubQuantity}
                                    onChange={(e) => handleQuantityChange(index, 'returnSubQuantity', e.target.value)}
                                    className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded"
                                    min="0"
                                    max={item.availableSubQty}
                                    placeholder="فرعي"
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.selected && (
                              <input
                                type="text"
                                value={item.customerReason}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[index].customerReason = e.target.value;
                                  setReturnItems(updated);
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                placeholder="سبب العميل..."
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.selected && (
                              <select
                                value={item.condition}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[index].condition = e.target.value;
                                  setReturnItems(updated);
                                }}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="good">جيد</option>
                                <option value="fair">مقبول</option>
                                <option value="poor">سيء</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.selected && (
                              <select
                                value={item.returnLocation}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[index].returnLocation = e.target.value;
                                  setReturnItems(updated);
                                }}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="warehouse">مستودع</option>
                                <option value="store">متجر</option>
                                <option value="damaged">تالف</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.selected && (
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[index].notes = e.target.value;
                                  setReturnItems(updated);
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                placeholder="ملاحظات..."
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {errors.products && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <FaExclamationCircle className="text-red-500" />
                  <span className="text-red-700">{errors.products}</span>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <FaArrowLeft /> السابق
                </button>
                <button
                  onClick={goToNextStep}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  التالي <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FaEdit className="mx-auto text-4xl text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">تفاصيل الإرجاع</h3>
                <p className="text-gray-600">أكمل تفاصيل عملية الإرجاع وطريقة الاسترداد</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سبب الإرجاع <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر السبب...</option>
                      <option value="defective">منتج معيب</option>
                      <option value="damaged">منتج تالف</option>
                      <option value="wrong_item">منتج خاطئ</option>
                      <option value="customer_request">طلب العميل</option>
                      <option value="wrong_color">لون خاطئ</option>
                      <option value="wrong_size">مقاس خاطئ</option>
                      <option value="not_satisfied">عدم الرضا</option>
                      <option value="quality_issue">مشكلة في الجودة</option>
                      <option value="other">أخرى</option>
                    </select>
                    {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الإرجاع</label>
                    <select
                      value={returnType}
                      onChange={(e) => setReturnType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full">إرجاع كامل</option>
                      <option value="partial">إرجاع جزئي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الاسترداد</label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="original">نفس طريقة الدفع الأصلية</option>
                      <option value="credit">رصيد للمتجر</option>
                      <option value="cash">نقداً</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المستودع المستهدف</label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">اختر المستودع...</option>
                      {warehouses?.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                      ))}
                    </select>
                    {errors.warehouse && <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الإرجاع المتوقع</label>
                    <input
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات العميل <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل ملاحظات العميل حول سبب الإرجاع..."
                    />
                    {errors.customerNotes && <p className="text-red-500 text-sm mt-1">{errors.customerNotes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل ملاحظات إضافية حول عملية الإرجاع..."
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">ملخص التحديد</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>عدد المنتجات:</span>
                        <span className="font-semibold">{totals.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الكمية:</span>
                        <span className="font-semibold">{totals.totalMainQty + totals.totalSubQty}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>إجمالي المبلغ:</span>
                        <span className="font-bold text-red-600">{totals.totalAmount.toFixed(2)} د.ع</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <FaArrowLeft /> السابق
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={generatePreview}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <FaEye /> معاينة
                  </button>
                  <button
                    onClick={goToNextStep}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    التالي <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FaEye className="mx-auto text-4xl text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">معاينة نهائية</h3>
                <p className="text-gray-600">راجع جميع البيانات قبل الإرسال النهائي</p>
              </div>

              {/* Preview Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <FaShoppingCart className="mx-auto text-2xl text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">عدد المنتجات</p>
                    <p className="text-2xl font-bold text-blue-600">{totals.totalItems}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <FaWarehouse className="mx-auto text-2xl text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">إجمالي الكمية</p>
                    <p className="text-2xl font-bold text-green-600">{totals.totalMainQty + totals.totalSubQty}</p>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="text-center">
                    <FaExclamationTriangle className="mx-auto text-2xl text-red-600 mb-2" />
                    <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                    <p className="text-2xl font-bold text-red-600">{totals.totalAmount.toFixed(2)} د.ع</p>
                  </div>
                </div>
              </div>

              {/* Items Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">المنتجات المحددة</h4>
                <div className="space-y-3">
                  {returnItems.filter(item => item.selected).map((item, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            الكمية: {item.returnQuantity + item.returnSubQuantity} | 
                            المبلغ: {((item.returnQuantity * item.originalPrice) + (item.returnSubQuantity * item.originalSubPrice)).toFixed(2)} د.ع
                          </p>
                          {item.customerReason && (
                            <p className="text-sm text-blue-600 mt-1">سبب العميل: {item.customerReason}</p>
                          )}
                          {item.notes && <p className="text-sm text-gray-500 mt-1">ملاحظات: {item.notes}</p>}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold mb-1 block ${
                            item.condition === 'good' ? 'bg-green-100 text-green-700' :
                            item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.condition === 'good' ? 'جيد' : 
                             item.condition === 'fair' ? 'مقبول' : 'سيء'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold block ${
                            item.returnLocation === 'warehouse' ? 'bg-blue-100 text-blue-700' :
                            item.returnLocation === 'store' ? 'bg-purple-100 text-purple-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {item.returnLocation === 'warehouse' ? 'مستودع' :
                             item.returnLocation === 'store' ? 'متجر' : 'تالف'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-700 mb-3">تفاصيل الإرجاع</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>السبب:</span>
                      <span className="font-medium">
                        {reason === 'defective' ? 'منتج معيب' :
                         reason === 'damaged' ? 'منتج تالف' :
                         reason === 'wrong_item' ? 'منتج خاطئ' :
                         reason === 'customer_request' ? 'طلب العميل' :
                         reason === 'wrong_color' ? 'لون خاطئ' :
                         reason === 'wrong_size' ? 'مقاس خاطئ' :
                         reason === 'not_satisfied' ? 'عدم الرضا' :
                         reason === 'quality_issue' ? 'مشكلة في الجودة' : reason}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>النوع:</span>
                      <span className="font-medium">{returnType === 'full' ? 'إرجاع كامل' : 'إرجاع جزئي'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>طريقة الاسترداد:</span>
                      <span className="font-medium">
                        {refundMethod === 'original' ? 'نفس طريقة الدفع' :
                         refundMethod === 'credit' ? 'رصيد للمتجر' : 'نقداً'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>الأولوية:</span>
                      <span className="font-medium">
                        {priority === 'low' ? 'منخفضة' :
                         priority === 'medium' ? 'متوسطة' :
                         priority === 'high' ? 'عالية' : 'عاجلة'}
                      </span>
                    </div>
                    {expectedReturnDate && (
                      <div className="flex justify-between">
                        <span>تاريخ متوقع:</span>
                        <span className="font-medium">{new Date(expectedReturnDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-700 mb-3">الملاحظات</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ملاحظات العميل:</p>
                      <p className="text-sm">{customerNotes || 'لا توجد ملاحظات'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">ملاحظات إضافية:</p>
                      <p className="text-sm">{notes || 'لا توجد ملاحظات'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <FaArrowLeft /> السابق
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={saveAsDraft}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {isSubmitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <FaSave />}
                    حفظ كمسودة
                  </button>
                  <button
                    onClick={submitForReview}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {isSubmitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <FaCheckCircle />}
                    تقديم للمراجعة
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {isSubmitting ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <FaCheck />}
                    تنفيذ الإرجاع
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Completed */}
          {currentStep === 'completed' && (
            <div className="text-center py-12">
              <FaCheckCircle className="mx-auto text-6xl text-green-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">تم تنفيذ الإرجاع بنجاح!</h3>
              <p className="text-gray-600 mb-6">تم إنشاء إرجاع فاتورة المبيعات وإضافته إلى النظام</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/sales/returns')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  عرض المرتجعات
                </button>
                <button
                  onClick={() => navigate('/sales/manage')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  العودة للفواتير
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default NewSalesReturn;