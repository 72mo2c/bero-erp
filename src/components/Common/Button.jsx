// ======================================
// Button Component - مكون الزر
// ======================================

import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  icon = null
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-orange-200 shadow-lg hover:shadow-xl disabled:from-orange-300 disabled:to-orange-300',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 focus:ring-gray-200 shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-200 shadow-lg hover:shadow-xl disabled:from-green-300 disabled:to-green-300',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-200 shadow-lg hover:shadow-xl disabled:from-red-300 disabled:to-red-300',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-200 shadow-lg hover:shadow-xl disabled:from-yellow-300 disabled:to-yellow-300',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 focus:ring-orange-200 disabled:border-orange-300 disabled:text-orange-300 hover:border-orange-600',
    ghost: 'text-orange-600 hover:bg-orange-50 focus:ring-orange-200 disabled:text-orange-300',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
