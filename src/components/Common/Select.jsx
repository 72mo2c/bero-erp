// ======================================
// Select Component - مكون القائمة المنسدلة
// ======================================

import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = '',
  className = '',
  placeholder = 'اختر...',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 text-lg">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`input-field appearance-none pr-12 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-orange-200 cursor-pointer'}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 group-focus-within:text-orange-600 transition-colors pointer-events-none">
          <FaChevronDown />
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Select;
