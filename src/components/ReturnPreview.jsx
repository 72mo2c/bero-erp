// ======================================
// Return Preview Component - معاينة المرتجعات المتقدمة
// ======================================

import React, { useState } from 'react';
import { 
  FaEye, 
  FaDownload, 
  FaPrint, 
  FaShare, 
  FaEdit, 
  FaCheck,
  FaBoxes,
  FaUser,
  FaCalendar,
  FaDollarSign,
  FaWarehouse,
  FaFileAlt,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaExpand,
  FaCompress,
  FaTag,
  FaBell
} from 'react-icons/fa';

const ReturnPreview = ({ 
  returnData, 
  onEdit, 
  onConfirm, 
  onClose,
  showActions = true,
  printMode = false
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set(['summary', 'items', 'details']));
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle section expansion
  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} د.ع`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!returnData.items) return { totalItems: 0, totalQty: 0, totalAmount: 0 };
    
    const totalItems = returnData.items.length;
    const totalQty = returnData.items.reduce((sum, item) => 
      sum + (item.quantity || 0) + (item.subQuantity || 0), 0
    );
    const totalAmount = returnData.items.reduce((sum, item) => 
      sum + (item.quantity * item.price || 0) + (item.subQuantity * item.subPrice || 0), 0
    );
    
    return { totalItems, totalQty, totalAmount };
  };

  const totals = calculateTotals();

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700', icon: FaEdit },
      review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: FaClock },
      approved: { label: 'معتمد', color: 'bg-green-100 text-green-700', icon: FaCheck },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: FaExclamationTriangle },
      completed: { label: 'مكتمل', color: 'bg-blue-100 text-blue-700', icon: FaCheckCircle }
    };
    return statusMap[status] || statusMap.draft;
  };

  const statusInfo = getStatusInfo(returnData.status || 'draft');
  const StatusIcon = statusInfo.icon;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF (simulation)
  const handleDownload = () => {
    alert('سيتم تطوير ميزة تحميل PDF قريباً');
  };

  // Share function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `إرجاع فاتورة #${returnData.invoiceId}`,
        text: `مراجعة إرجاع فاتورة رقم ${returnData.invoiceId}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  if (!returnData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaEye className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد بيانات للمعاينة</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FaEye className="text-blue-600 text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">معاينة إرجاع الفاتورة</h2>
            <p className="text-gray-600">فاتورة رقم #{returnData.invoiceId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
            <StatusIcon className="inline mr-1" />
            {statusInfo.label}
          </span>
          
          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              
              <button
                onClick={handlePrint}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="طباعة"
              >
                <FaPrint />
              </button>
              
              <button
                onClick={handleDownload}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="تحميل PDF"
              >
                <FaDownload />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="مشاركة"
              >
                <FaShare />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="إغلاق"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <FaBoxes className="text-blue-600 text-2xl" />
              <div>
                <p className="text-sm text-blue-700">عدد المنتجات</p>
                <p className="text-2xl font-bold text-blue-600">{totals.totalItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <FaWarehouse className="text-green-600 text-2xl" />
              <div>
                <p className="text-sm text-green-700">إجمالي الكمية</p>
                <p className="text-2xl font-bold text-green-600">{totals.totalQty}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-red-600 text-2xl" />
              <div>
                <p className="text-sm text-red-700">إجمالي المبلغ</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalAmount)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <FaCalendar className="text-purple-600 text-2xl" />
              <div>
                <p className="text-sm text-purple-700">تاريخ الإنشاء</p>
                <p className="text-sm font-semibold text-purple-600">
                  {formatDate(returnData.date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Details Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('details')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              تفاصيل الإرجاع
            </h3>
            {expandedSections.has('details') ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          
          {expandedSections.has('details') && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">سبب الإرجاع</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">
                      {returnData.reason === 'defective' ? 'منتج معيب' :
                       returnData.reason === 'damaged' ? 'منتج تالف' :
                       returnData.reason === 'wrong_item' ? 'منتج خاطئ' :
                       returnData.reason === 'expired' ? 'منتج منتهي الصلاحية' :
                       returnData.reason === 'customer_request' ? 'طلب العميل' :
                       returnData.reason === 'wrong_color' ? 'لون خاطئ' :
                       returnData.reason === 'wrong_size' ? 'مقاس خاطئ' :
                       returnData.reason === 'not_satisfied' ? 'عدم الرضا' :
                       returnData.reason || 'غير محدد'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الإرجاع</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">
                      {returnData.returnType === 'full' ? 'إرجاع كامل' : 'إرجاع جزئي'}
                    </p>
                  </div>
                  
                  {returnData.priority && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        returnData.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        returnData.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        returnData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {returnData.priority === 'urgent' ? 'عاجلة' :
                         returnData.priority === 'high' ? 'عالية' :
                         returnData.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {returnData.customerNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات العميل</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
                        {returnData.customerNotes}
                      </p>
                    </div>
                  )}
                  
                  {returnData.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">
                        {returnData.notes}
                      </p>
                    </div>
                  )}
                  
                  {returnData.expectedReturnDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإرجاع المتوقع</label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">
                        {formatDate(returnData.expectedReturnDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('items')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaBoxes className="text-green-600" />
              المنتجات المرتجعة ({totals.totalItems})
            </h3>
            {expandedSections.has('items') ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          
          {expandedSections.has('items') && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="mt-4">
                {returnData.items && returnData.items.length > 0 ? (
                  <div className="space-y-3">
                    {returnData.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">منتج #{item.productId}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-gray-600">الكمية الأساسية:</span>
                                <span className="font-semibold ml-1">{item.quantity || 0}</span>
                              </div>
                              {item.subQuantity > 0 && (
                                <div>
                                  <span className="text-gray-600">الكمية الفرعية:</span>
                                  <span className="font-semibold ml-1">{item.subQuantity}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-600">السعر:</span>
                                <span className="font-semibold ml-1">{formatCurrency(item.price || 0)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">المجموع:</span>
                                <span className="font-semibold ml-1 text-red-600">
                                  {formatCurrency((item.quantity * (item.price || 0)) + (item.subQuantity * (item.subPrice || 0)))}
                                </span>
                              </div>
                            </div>
                            
                            {item.condition && (
                              <div className="mt-2">
                                <span className="text-gray-600 text-sm">الحالة: </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  item.condition === 'good' ? 'bg-green-100 text-green-700' :
                                  item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {item.condition === 'good' ? 'جيد' :
                                   item.condition === 'fair' ? 'مقبول' : 'سيء'}
                                </span>
                              </div>
                            )}
                            
                            {item.customerReason && (
                              <div className="mt-2">
                                <span className="text-gray-600 text-sm">سبب العميل: </span>
                                <span className="text-sm text-gray-800">{item.customerReason}</span>
                              </div>
                            )}
                            
                            {item.notes && (
                              <div className="mt-2">
                                <span className="text-gray-600 text-sm">ملاحظات: </span>
                                <span className="text-sm text-gray-800">{item.notes}</span>
                              </div>
                            )}
                          </div>
                          
                          {item.returnLocation && (
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.returnLocation === 'warehouse' ? 'bg-blue-100 text-blue-700' :
                                item.returnLocation === 'store' ? 'bg-purple-100 text-purple-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {item.returnLocation === 'warehouse' ? 'مستودع' :
                                 item.returnLocation === 'store' ? 'متجر' : 'تالف'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaBoxes className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>لا توجد منتجات في هذا الإرجاع</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              إلغاء
            </button>
            
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <FaEdit />
                تعديل
              </button>
            )}
            
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <FaCheck />
                تأكيد الإرجاع
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications Preview */}
      {returnData.priority === 'urgent' && (
        <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FaBell className="text-red-600" />
            <span className="font-semibold text-red-800">تنبيه عاجل</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            هذا الإرجاع مُصنف كعاجل ويتطلب معالجة فورية
          </p>
        </div>
      )}
    </div>
  );
};

export default ReturnPreview;