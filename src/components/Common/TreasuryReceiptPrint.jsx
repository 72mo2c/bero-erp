// ======================================
// Treasury Receipt Print Component - مكون طباعة إيصالات الخزينة
// ======================================

import React from 'react';
import { FaPrint, FaTimes } from 'react-icons/fa';
import './TreasuryReceiptPrint.css';

const TreasuryReceiptPrint = ({ receiptData, type = 'receipt', onClose }) => {
  // معلومات الشركة
  const companyInfo = {
    name: 'Bero System',
    address: 'القاهرة - مصر',
    phone: '+20 123 456 789',
    email: 'info@berosystem.com'
  };

  // معلومات الإيصال
  const receiptNumber = receiptData.receiptNumber || `REC-${Date.now()}`;
  const amount = parseFloat(receiptData.amount || 0);
  const dateTime = receiptData.date ? new Date(receiptData.date) : new Date();

  // خيارات الفئات
  const categoryLabels = {
    'invoice_payment': 'سداد فاتورة',
    'return_refund': 'استرداد مرتجع',
    'capital': 'رأس مال',
    'bank': 'بنك',
    'revenue': 'إيرادات',
    'expense': 'مصروفات',
    'salary': 'رواتب',
    'rent': 'إيجارات',
    'other': 'أخرى'
  };

  const paymentMethodLabels = {
    'cash': 'نقداً',
    'check': 'شيك',
    'bank_transfer': 'تحويل بنكي'
  };

  const fromTypeLabels = {
    'customer': 'عميل',
    'supplier': 'مورد',
    'employee': 'موظف',
    'other': 'أخرى'
  };

  // طباعة فورية
  const handleQuickPrint = () => {
    window.print();
  };

  // تحويل الأرقام إلى أحرف عربية (مبسطة)
  const convertToWords = (num) => {
    if (num === 0) return 'صفر';
    
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    const integer = Math.floor(num);
    
    if (integer < 10) return ones[integer];
    if (integer < 100) {
      const t = Math.floor(integer / 10);
      const o = integer % 10;
      return tens[t] + (o ? ' و' + ones[o] : '');
    }
    if (integer < 1000) {
      const h = Math.floor(integer / 100);
      const remainder = integer % 100;
      return hundreds[h] + (remainder ? ' و' + convertToWords(remainder) : '');
    }
    
    return integer.toString();
  };

  return (
    <div className="print-overlay">
      <div className="print-modal">
        {/* أزرار التحكم */}
        <div className="print-controls no-print">
          <button onClick={handleQuickPrint} className="btn-print">
            <FaPrint /> طباعة
          </button>
          <button onClick={onClose} className="btn-close">
            <FaTimes /> إغلاق
          </button>
        </div>

        {/* محتوى الإيصال */}
        <div className="invoice-container">
          {/* رأس الإيصال */}
          <div className="invoice-header">
            <div className="company-info">
              <h1>{companyInfo.name}</h1>
              <p>{companyInfo.address}</p>
              <p>هاتف: {companyInfo.phone}</p>
              <p>بريد: {companyInfo.email}</p>
            </div>
            <div className="invoice-title">
              <h2>{type === 'receipt' ? 'إيصال استلام نقدي' : 'إيصال صرف نقدي'}</h2>
              <div className="invoice-number">رقم: {receiptNumber}</div>
            </div>
          </div>

          {/* معلومات الإيصال */}
          <div className="receipt-details">
            <div className="detail-item">
              <span className="label">التاريخ:</span>
              <span className="value">{dateTime.toLocaleDateString('ar-EG')}</span>
            </div>
            <div className="detail-item">
              <span className="label">الوقت:</span>
              <span className="value">{dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="detail-item amount-item">
              <span className="label">المبلغ:</span>
              <span className="value amount">{amount.toFixed(2)} ج.م</span>
            </div>
            <div className="detail-item">
              <span className="label">طريقة الدفع:</span>
              <span className="value">{paymentMethodLabels[receiptData.paymentMethod] || 'نقداً'}</span>
            </div>
            <div className="detail-item">
              <span className="label">{type === 'receipt' ? 'المستلم منه:' : 'المدفوع له:'}</span>
              <span className="value">{receiptData.fromName || receiptData.toName || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">النوع:</span>
              <span className="value">{fromTypeLabels[receiptData.fromType || receiptData.toType] || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="label">الفئة:</span>
              <span className="value">{categoryLabels[receiptData.category] || '-'}</span>
            </div>
            {receiptData.referenceNumber && (
              <div className="detail-item">
                <span className="label">رقم المرجع:</span>
                <span className="value">{receiptData.referenceNumber}</span>
              </div>
            )}
            {receiptData.description && (
              <div className="detail-item full-width">
                <span className="label">الوصف:</span>
                <span className="value">{receiptData.description}</span>
              </div>
            )}
            {receiptData.notes && (
              <div className="detail-item full-width">
                <span className="label">ملاحظات:</span>
                <span className="value">{receiptData.notes}</span>
              </div>
            )}
          </div>

          {/* المبلغ بالأحرف */}
          <div className="amount-in-words">
            <strong>المبلغ بالأحرف:</strong>
            <span>{convertToWords(amount)} جنيه مصري</span>
          </div>

          {/* التوقيعات */}
          <div className="signatures">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>{type === 'receipt' ? 'المستلم' : 'المدفوع له'}</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>المحاسب</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>المدير</p>
            </div>
          </div>

          {/* تذييل الإيصال */}
          <div className="invoice-footer">
            <p>إيصال رسمي من نظام Bero</p>
            <p className="print-date">طباعة: {new Date().toLocaleString('ar-EG')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryReceiptPrint;
