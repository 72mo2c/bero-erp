// ======================================
// Print Button Component - زر الطباعة
// ======================================

import React from 'react';
import { FaPrint, FaFilePdf } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const PrintButton = ({ data, type = 'invoice', variant = 'primary', size = 'md', showIcon = true, label = 'طباعة' }) => {
  const handlePrint = () => {
    if (type === 'invoice') {
      printInvoiceDirectly(data, data.type || 'purchase');
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  return (
    <button
      onClick={handlePrint}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg font-semibold transition-all duration-200
        flex items-center gap-2 shadow-md hover:shadow-lg
      `}
      title="طباعة فورية"
    >
      {showIcon && <FaPrint className="text-lg" />}
      <span>{label}</span>
    </button>
  );
};

export default PrintButton;
