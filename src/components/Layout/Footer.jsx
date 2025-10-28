// ======================================
// Footer Component - تذييل الصفحة
// ======================================

import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600 text-sm">
          <p>
            تم التطوير بواسطة <span className="font-semibold text-blue-600">Biruni Soft</span>
          </p>
          <p className="mt-1">
            &copy; {currentYear} Biruni Soft. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
