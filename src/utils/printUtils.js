// ======================================
// Print Utilities - أدوات الطباعة
// ======================================

/**
 * طباعة فاتورة بشكل فوري
 * @param {Object} invoiceData - بيانات الفاتورة
 * @param {string} type - نوع الفاتورة (purchase/sales)
 */
export const printInvoiceDirectly = (invoiceData, type = 'purchase') => {
  const { formData, items, total, suppliers, customers, products, warehouses, paymentTypes } = invoiceData;
  
  // معلومات الشركة
  const companyInfo = {
    name: 'Bero System',
    address: 'القاهرة - مصر',
    phone: '+20 123 456 789',
    email: 'info@berosystem.com'
  };

  // إيجاد اسم المورد أو العميل
  const partnerName = type === 'purchase'
    ? suppliers?.find(s => s.id === parseInt(formData.supplierId))?.name || '-'
    : customers?.find(c => c.id === parseInt(formData.customerId))?.name || '-';

  const paymentTypeLabel = paymentTypes?.find(p => p.value === formData.paymentType)?.label || '-';
  const invoiceNumber = Date.now();

  // بناء HTML للطباعة
  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة - ${invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: white;
          color: #000;
          line-height: 1.6;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #000;
          padding: 20px;
        }
        
        .invoice-header {
          text-align: center;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
        }
        
        .invoice-header h1 {
          font-size: 28px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        
        .invoice-header .company-details {
          font-size: 12px;
          color: #333;
          margin: 3px 0;
        }
        
        .invoice-type {
          background: #000;
          color: #fff;
          padding: 10px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .invoice-info {
          display: table;
          width: 100%;
          margin-bottom: 20px;
          border: 1px solid #000;
        }
        
        .invoice-info-row {
          display: table-row;
        }
        
        .invoice-info-label,
        .invoice-info-value {
          display: table-cell;
          padding: 10px;
          border: 1px solid #000;
        }
        
        .invoice-info-label {
          font-weight: bold;
          background: #f5f5f5;
          width: 30%;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 2px solid #000;
        }
        
        .items-table thead {
          background: #000;
          color: #fff;
        }
        
        .items-table th,
        .items-table td {
          padding: 10px;
          text-align: right;
          border: 1px solid #000;
        }
        
        .items-table th {
          font-weight: bold;
          font-size: 14px;
        }
        
        .items-table td {
          font-size: 13px;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .totals-section {
          margin-top: 20px;
          border: 2px solid #000;
          padding: 15px;
          background: #f5f5f5;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
          font-weight: bold;
        }
        
        .total-row.grand-total {
          border-top: 2px solid #000;
          margin-top: 10px;
          padding-top: 15px;
          font-size: 20px;
          color: #000;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #000;
          font-size: 12px;
          color: #666;
        }
        
        .print-date {
          margin-top: 10px;
          font-size: 11px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          
          .invoice-container {
            border: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- رأس الفاتورة -->
        <div class="invoice-header">
          <h1>${companyInfo.name}</h1>
          <p class="company-details">${companyInfo.address}</p>
          <p class="company-details">الهاتف: ${companyInfo.phone} | البريد: ${companyInfo.email}</p>
        </div>

        <!-- نوع الفاتورة -->
        <div class="invoice-type">
          ${type === 'purchase' ? 'فاتورة مشتريات' : 'فاتورة مبيعات'}
        </div>

        <!-- معلومات الفاتورة -->
        <table class="invoice-info">
          <tr class="invoice-info-row">
            <td class="invoice-info-label">رقم الفاتورة</td>
            <td class="invoice-info-value">#${invoiceNumber}</td>
          </tr>
          <tr class="invoice-info-row">
            <td class="invoice-info-label">${type === 'purchase' ? 'اسم المورد' : 'اسم العميل'}</td>
            <td class="invoice-info-value">${partnerName}</td>
          </tr>
          <tr class="invoice-info-row">
            <td class="invoice-info-label">التاريخ</td>
            <td class="invoice-info-value">${new Date(formData.date).toLocaleDateString('ar-EG')}</td>
          </tr>
          <tr class="invoice-info-row">
            <td class="invoice-info-label">طريقة الدفع</td>
            <td class="invoice-info-value">${paymentTypeLabel}</td>
          </tr>
          ${formData.notes ? `
          <tr class="invoice-info-row">
            <td class="invoice-info-label">ملاحظات</td>
            <td class="invoice-info-value">${formData.notes}</td>
          </tr>
          ` : ''}
        </table>

        <!-- جدول الأصناف -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 5%">#</th>
              <th style="width: 30%">اسم الصنف</th>
              <th style="width: 20%">المخزن</th>
              <th style="width: 10%">الكمية</th>
              <th style="width: 15%">السعر</th>
              <th style="width: 20%">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => {
              const product = products?.find(p => p.id === parseInt(item.productId));
              const warehouse = warehouses?.find(w => w.id === product?.warehouseId);
              const lineTotal = item.quantity * (item.price || 0);
              
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product?.name || '-'}</td>
                  <td>${warehouse?.name || '-'}</td>
                  <td>${item.quantity}</td>
                  <td>${parseFloat(item.price || 0).toFixed(2)} ج.م</td>
                  <td>${lineTotal.toFixed(2)} ج.م</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- المجاميع -->
        <div class="totals-section">
          <div class="total-row">
            <span>المجموع الفرعي:</span>
            <span>${(total || 0).toFixed(2)} ج.م</span>
          </div>
          <div class="total-row grand-total">
            <span>الإجمالي النهائي:</span>
            <span>${(total || 0).toFixed(2)} ج.م</span>
          </div>
        </div>

        <!-- التذييل -->
        <div class="footer">
          <p><strong>شكراً لتعاملكم معنا</strong></p>
          <p>Bero System - نظام إدارة متكامل</p>
          <p class="print-date">تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  // فتح نافذة جديدة للطباعة
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
};

/**
 * تصدير فاتورة كـ PDF
 */
export const exportInvoiceToPDF = (invoiceData, type = 'purchase') => {
  // طباعة مباشرة (المتصفح يوفر خيار "Save as PDF")
  printInvoiceDirectly(invoiceData, type);
};

/**
 * طباعة معاملة من الخزينة
 */
export const printTreasuryTransaction = (transaction) => {
  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>إيصال معاملة - ${transaction.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: white;
          color: #000;
          line-height: 1.6;
        }
        
        .receipt-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border: 2px solid #000;
          padding: 20px;
        }
        
        .receipt-header {
          text-align: center;
          padding-bottom: 15px;
          margin-bottom: 20px;
          border-bottom: 2px solid #000;
        }
        
        .receipt-header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #000;
          margin-bottom: 5px;
        }
        
        .receipt-header .subtitle {
          font-size: 16px;
          color: #333;
          font-weight: bold;
        }
        
        .receipt-type {
          background: #000;
          color: #fff;
          padding: 10px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .receipt-info {
          border: 1px solid #000;
          margin-bottom: 20px;
        }
        
        .info-row {
          display: flex;
          border-bottom: 1px solid #000;
        }
        
        .info-row:last-child {
          border-bottom: none;
        }
        
        .info-label {
          flex: 0 0 35%;
          font-weight: bold;
          background: #f5f5f5;
          padding: 12px;
          border-left: 1px solid #000;
        }
        
        .info-value {
          flex: 1;
          padding: 12px;
        }
        
        .amount-box {
          border: 3px solid #000;
          padding: 25px;
          text-align: center;
          margin: 20px 0;
          background: #f9f9f9;
        }
        
        .amount-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .amount-value {
          font-size: 32px;
          font-weight: bold;
          color: #000;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #000;
          font-size: 12px;
          color: #666;
        }
        
        .print-date {
          margin-top: 10px;
          font-size: 11px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          @page {
            size: A5 portrait;
            margin: 1cm;
          }
          
          .receipt-container {
            border: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- رأس الإيصال -->
        <div class="receipt-header">
          <h1>Bero System</h1>
          <p class="subtitle">إيصال معاملة خزينة</p>
        </div>

        <!-- نوع المعاملة -->
        <div class="receipt-type">
          ${transaction.type === 'income' ? 'إيداع' : 'سحب'}
        </div>

        <!-- معلومات الإيصال -->
        <div class="receipt-info">
          <div class="info-row">
            <div class="info-label">رقم المعاملة</div>
            <div class="info-value">#${transaction.id}</div>
          </div>
          <div class="info-row">
            <div class="info-label">التاريخ</div>
            <div class="info-value">${new Date(transaction.date).toLocaleDateString('ar-EG')}</div>
          </div>
          <div class="info-row">
            <div class="info-label">الوصف</div>
            <div class="info-value">${transaction.description || '-'}</div>
          </div>
        </div>

        <!-- المبلغ -->
        <div class="amount-box">
          <div class="amount-label">المبلغ</div>
          <div class="amount-value">${(transaction.amount || 0).toFixed(2)} ج.م</div>
        </div>

        <!-- التذييل -->
        <div class="footer">
          <p><strong>Bero System - نظام إدارة متكامل</strong></p>
          <p>القاهرة - مصر</p>
          <p class="print-date">تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=600,height=500');
  printWindow.document.write(printContent);
  printWindow.document.close();
};

/**
 * طباعة تقرير مالي
 */
export const printFinancialReport = (reportData) => {
  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير مالي</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: white;
          color: #000;
          line-height: 1.6;
        }
        
        .report-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border: 2px solid #000;
          padding: 20px;
        }
        
        .report-header {
          text-align: center;
          padding-bottom: 20px;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
        }
        
        .report-header h1 {
          font-size: 28px;
          font-weight: bold;
          color: #000;
          margin-bottom: 10px;
        }
        
        .report-header h2 {
          font-size: 20px;
          color: #333;
          margin-bottom: 10px;
        }
        
        .report-date {
          font-size: 14px;
          color: #666;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .summary-card {
          border: 2px solid #000;
          padding: 20px;
          text-align: center;
          background: #f9f9f9;
        }
        
        .summary-card h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        
        .summary-card .value {
          font-size: 28px;
          font-weight: bold;
          color: #000;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border: 2px solid #000;
        }
        
        .data-table thead {
          background: #000;
          color: #fff;
        }
        
        .data-table th,
        .data-table td {
          padding: 12px;
          text-align: right;
          border: 1px solid #000;
        }
        
        .data-table th {
          font-weight: bold;
          font-size: 14px;
        }
        
        .data-table td {
          font-size: 13px;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #000;
          font-size: 12px;
          color: #666;
        }
        
        .print-date {
          margin-top: 10px;
          font-size: 11px;
          color: #999;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          @page {
            size: A4 landscape;
            margin: 1.5cm;
          }
          
          .report-container {
            border: none;
            padding: 0;
          }
          
          .summary-cards {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <!-- رأس التقرير -->
        <div class="report-header">
          <h1>Bero System</h1>
          <h2>التقرير المالي</h2>
          <p class="report-date">التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        <!-- بطاقات الملخص -->
        <div class="summary-cards">
          <div class="summary-card">
            <h3>إجمالي الإيرادات</h3>
            <div class="value">${(reportData.totalIncome || 0).toFixed(2)} ج.م</div>
          </div>
          <div class="summary-card">
            <h3>إجمالي المصروفات</h3>
            <div class="value">${(reportData.totalExpense || 0).toFixed(2)} ج.م</div>
          </div>
          <div class="summary-card">
            <h3>الرصيد الحالي</h3>
            <div class="value">${(reportData.balance || 0).toFixed(2)} ج.م</div>
          </div>
        </div>

        ${reportData.transactions && reportData.transactions.length > 0 ? `
        <!-- جدول المعاملات -->
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 10%">#</th>
              <th style="width: 20%">التاريخ</th>
              <th style="width: 15%">النوع</th>
              <th style="width: 35%">الوصف</th>
              <th style="width: 20%">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.transactions.map((trans, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${new Date(trans.date).toLocaleDateString('ar-EG')}</td>
                <td>${trans.type === 'income' ? 'إيداع' : 'سحب'}</td>
                <td>${trans.description || '-'}</td>
                <td>${(trans.amount || 0).toFixed(2)} ج.م</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <!-- التذييل -->
        <div class="footer">
          <p><strong>Bero System - نظام إدارة متكامل</strong></p>
          <p>القاهرة - مصر | +20 123 456 789</p>
          <p class="print-date">تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</p>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(printContent);
  printWindow.document.close();
};
