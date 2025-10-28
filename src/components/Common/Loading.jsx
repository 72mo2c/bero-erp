// ======================================
// Enhanced Loading Component - مكون التحميل المحسن
// ======================================

import React from 'react';
import { FaSync, FaSpinner, FaCircleNotch, FaCog } from 'react-icons/fa';

/**
 * مكون التحميل العام المحسن للنظام
 * @param {Object} props
 * @param {string} props.message - رسالة التحميل
 * @param {boolean} props.fullScreen - عرض بملء الشاشة
 * @param {string} props.size - حجم التحميل (sm, md, lg, xl)
 * @param {string} props.variant - نوع التحميل (spinner, dots, pulse, bars, modern)
 * @param {string} props.color - لون التحميل (primary, success, warning, danger, gradient)
 * @param {boolean} props.withBackground - إضافة خلفية شفافة
 */
const Loading = ({ 
  message = "جاري التحميل...", 
  fullScreen = false,
  size = 'md',
  variant = 'modern',
  color = 'primary',
  withBackground = true
}) => {
  // تحديد حجم الرسوم المتحركة
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // ألوان التحميل
  const colorClasses = {
    primary: 'text-blue-600 border-blue-600',
    success: 'text-green-600 border-green-600',
    warning: 'text-yellow-600 border-yellow-600',
    danger: 'text-red-600 border-red-600',
    gradient: 'text-gradient-to-r from-blue-500 to-purple-600 border-blue-500'
  };

  const containerClasses = fullScreen 
    ? `fixed inset-0 ${withBackground ? 'bg-white bg-opacity-95 backdrop-blur-sm' : ''} flex items-center justify-center z-50`
    : 'flex items-center justify-center py-12';

  // مكونات التحميل المختلفة
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2 space-x-reverse">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} rounded-full bg-current animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full bg-current"></div>
          </div>
        );

      case 'bars':
        return (
          <div className="flex space-x-1 space-x-reverse items-end h-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-current animate-wave"
                style={{
                  height: `${(i + 1) * 20}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        );

      case 'modern':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            {/* حلقة خارجية متحركة */}
            <div className="absolute inset-0 rounded-full border-4 border-current border-t-transparent animate-spin"></div>
            {/* حلقة داخلية متحركة بالعكس */}
            <div className="absolute inset-2 rounded-full border-2 border-current border-b-transparent animate-spin-reverse"></div>
            {/* نقطة مركزية */}
            <div className="absolute inset-4 rounded-full bg-current animate-pulse"></div>
          </div>
        );

      default: // spinner
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-current border-t-transparent animate-spin"></div>
          </div>
        );
    }
  };

  const content = (
    <div className={containerClasses}>
      <div className="text-center">
        {/* رسوم متحركة للتحميل */}
        <div className={`flex justify-center mb-4 ${colorClasses[color]}`}>
          {renderLoader()}
        </div>

        {/* رسالة التحميل */}
        {message && (
          <div className="mt-4">
            <p className="text-gray-700 font-medium text-lg animate-pulse">
              {message}
            </p>
            {/* شريط تقدم متحرك */}
            <div className="mt-2 w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-current animate-progress"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return content;
};

/**
 * مكون التحميل السريع المحسن
 */
export const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <FaCircleNotch className="w-full h-full animate-spin" />
    </div>
  );
};

/**
 * مكون التحميل مع النص المحسن
 */
export const LoadingWithText = ({ text = "جاري التحميل...", size = 'md', color = 'primary' }) => {
  return (
    <div className="flex items-center space-x-3 space-x-reverse rtl:space-x-reverse">
      <LoadingSpinner size={size} color={color} />
      {text && (
        <div className="flex flex-col">
          <span className="text-gray-700 font-medium text-sm">
            {text}
          </span>
          <span className="text-gray-500 text-xs mt-1">
            يرجى الانتظار...
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * مكون التحميل للإحصائيات المحسن
 */
export const LoadingStats = ({ rows = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/3"></div>
              <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded-full w-1/4"></div>
            </div>
            <div className="ml-4">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <FaCog className="text-white text-lg animate-spin" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * مكون التحميل للجدول المحسن
 */
export const LoadingTable = ({ rows = 5, columns = 4, withHeader = true }) => {
  return (
    <div className="space-y-3">
      {/* رأس الجدول */}
      {withHeader && (
        <div className="grid gap-4 mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg" 
             style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2 space-x-reverse">
              <div className="h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-full"></div>
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
            </div>
          ))}
        </div>
      )}
      
      {/* صفوف البيانات */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} 
             className="grid gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
             style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex items-center space-x-3 space-x-reverse">
              <div className={`h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex-1 ${colIndex === 0 ? 'w-3/4' : 'w-full'}`}></div>
              {colIndex === 0 && (
                <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * مكون التحميل للبطاقات المحسن
 */
export const LoadingCards = ({ cards = 3, type = 'default' }) => {
  const renderCardContent = () => {
    if (type === 'stats') {
      return (
        <>
          <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-1/2 mb-4"></div>
          <div className="h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
        </>
      );
    }

    return (
      <>
        <div className="h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-full w-full"></div>
          <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded-full w-4/6"></div>
        </div>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          </div>
          {renderCardContent()}
        </div>
      ))}
    </div>
  );
};

export default Loading;