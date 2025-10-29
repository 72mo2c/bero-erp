// ======================================
// Enhanced Return Status Component - مكون حالة المرتجعات المحسن
// ======================================

import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaCheck, 
  FaExclamationTriangle, 
  FaBan, 
  FaEdit,
  FaEye,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaCalendar,
  FaDollarSign,
  FaBoxes,
  FaWarehouse,
  FaFilter,
  FaSearch,
  FaRefreshCw
} from 'react-icons/fa';

const EnhancedReturnStatus = ({ 
  returns = [], 
  type = 'purchase', // purchase or sales
  onView, 
  onEdit, 
  onDelete,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Real-time status mapping
  const statusConfig = {
    draft: {
      label: 'مسودة',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: FaEdit,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    },
    review: {
      label: 'قيد المراجعة',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: FaClock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    approved: {
      label: 'معتمد',
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: FaCheck,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    rejected: {
      label: 'مرفوض',
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: FaBan,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    completed: {
      label: 'مكتمل',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: FaCheck,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    cancelled: {
      label: 'ملغي',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: FaBan,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    }
  };

  // Real-time filtering
  useEffect(() => {
    let filtered = [...returns];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(returnItem => 
        returnItem.id?.toString().includes(searchTerm) ||
        returnItem.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.invoiceId?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(returnItem => 
          new Date(returnItem.date) >= filterDate
        );
      }
    }

    setFilteredReturns(filtered);
  }, [returns, searchTerm, statusFilter, dateFilter]);

  // Auto-refresh for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        setLastRefresh(new Date());
      }, 1000);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Toggle expanded item
  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate return statistics
  const calculateStats = () => {
    const total = returns.length;
    const byStatus = returns.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    const totalAmount = returns.reduce((sum, item) => sum + (item.total || 0), 0);
    
    return { total, byStatus, totalAmount };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header with Real-time Status */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            مراقبة حالة المرتجعات - {type === 'purchase' ? 'مشتريات' : 'مبيعات'}
          </h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className="text-sm text-gray-600">
                آخر تحديث: {formatDate(lastRefresh)}
              </span>
            </div>
            <button
              onClick={() => setIsRefreshing(true)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              disabled={isRefreshing}
            >
              <FaRefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-500">إجمالي المرتجعات</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{stats.totalAmount.toFixed(0)}</p>
            <p className="text-xs text-gray-500">د.ع المبلغ الإجمالي</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = stats.byStatus[status] || 0;
          const IconComponent = config.icon;
          
          if (count === 0) return null;
          
          return (
            <div key={status} className={`${config.bgColor} p-3 rounded-lg border ${config.color}`}>
              <div className="flex items-center gap-2">
                <IconComponent className={`text-lg ${config.textColor}`} />
                <div>
                  <p className="text-sm font-semibold">{config.label}</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في المرتجعات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع الحالات</option>
          {Object.entries(statusConfig).map(([status, config]) => (
            <option key={status} value={status}>{config.label}</option>
          ))}
        </select>
        
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع التواريخ</option>
          <option value="today">اليوم</option>
          <option value="week">آخر أسبوع</option>
          <option value="month">آخر شهر</option>
        </select>
      </div>

      {/* Returns List */}
      <div className="space-y-3">
        {filteredReturns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaBoxes className="mx-auto text-4xl mb-4 opacity-50" />
            <p>لا توجد مرتجعات تطابق المعايير المحددة</p>
          </div>
        ) : (
          filteredReturns.map((returnItem) => {
            const statusInfo = statusConfig[returnItem.status] || statusConfig.draft;
            const IconComponent = statusInfo.icon;
            const isExpanded = expandedItems.has(returnItem.id);
            
            return (
              <div 
                key={returnItem.id} 
                className={`border rounded-lg transition-all duration-200 ${
                  isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Main Row */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpanded(returnItem.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`text-lg ${statusInfo.textColor}`} />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          إرجاع فاتورة #{returnItem.invoiceId}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {returnItem.reason || 'لا يوجد سبب محدد'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaCalendar className="text-xs" />
                            {formatDate(returnItem.date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaDollarSign className="text-xs" />
                            {(returnItem.total || 0).toFixed(2)} د.ع
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <FaBoxes className="text-xs" />
                            {(returnItem.items?.length || 0)} منتج
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Items Details */}
                    {returnItem.items && returnItem.items.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FaBoxes className="text-sm" />
                          المنتجات المرتجعة
                        </h5>
                        <div className="bg-white rounded-lg p-3">
                          <div className="space-y-2">
                            {returnItem.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className="font-medium">منتج #{item.productId}</span>
                                <div className="flex gap-3 text-gray-600">
                                  <span>الكمية: {item.quantity + (item.subQuantity || 0)}</span>
                                  {item.condition && (
                                    <span>الحالة: {
                                      item.condition === 'good' ? 'جيد' :
                                      item.condition === 'fair' ? 'مقبول' : 'سيء'
                                    }</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {returnItem.notes && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-1">ملاحظات</h5>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded">{returnItem.notes}</p>
                        </div>
                      )}
                      
                      {returnItem.expectedReturnDate && (
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-1">تاريخ الإرجاع المتوقع</h5>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded">
                            {formatDate(returnItem.expectedReturnDate)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      {onView && (
                        <button
                          onClick={() => onView(returnItem)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          <FaEye />
                          عرض
                        </button>
                      )}
                      
                      {onEdit && returnItem.status === 'draft' && (
                        <button
                          onClick={() => onEdit(returnItem)}
                          className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                        >
                          <FaEdit />
                          تعديل
                        </button>
                      )}
                      
                      {onDelete && (returnItem.status === 'draft' || returnItem.status === 'review') && (
                        <button
                          onClick={() => onDelete(returnItem)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                        >
                          <FaTrash />
                          حذف
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{filteredReturns.length}</p>
            <p className="text-sm text-blue-700">المرتجعات المعروضة</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {filteredReturns.filter(r => r.status === 'approved' || r.status === 'completed').length}
            </p>
            <p className="text-sm text-green-700">معتمدة/مكتملة</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredReturns.filter(r => r.status === 'review').length}
            </p>
            <p className="text-sm text-yellow-700">قيد المراجعة</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {filteredReturns.filter(r => r.status === 'draft').length}
            </p>
            <p className="text-sm text-gray-700">مسودات</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedReturnStatus;