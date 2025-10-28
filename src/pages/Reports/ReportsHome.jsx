import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/Common/PageHeader';

const ReportsHome = () => {
  const reportCategories = [
    {
      title: 'تقارير المخزون',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      reports: [
        { name: 'تقرير الجرد', path: '/reports/inventory', description: 'عرض جميع الأصناف والكميات المتوفرة في جميع المخازن' },
        { name: 'تقرير حركة الأصناف', path: '/reports/product-movement', description: 'تتبع حركة دخول وخروج الأصناف خلال فترة محددة' },
        { name: 'الأصناف الأقل من حد الطلب', path: '/reports/low-stock', description: 'عرض الأصناف التي وصلت لحد الطلب أو أقل' },
      ],
    },
    {
      title: 'تقارير المبيعات',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      reports: [
        { name: 'تقرير المبيعات', path: '/reports/sales', description: 'تقرير شامل لجميع المبيعات خلال فترة زمنية محددة' },
        { name: 'المبيعات حسب العميل', path: '/reports/sales-by-customer', description: 'تحليل مبيعات كل عميل والمبالغ المحصلة' },
        { name: 'أفضل المنتجات مبيعاً', path: '/reports/top-selling', description: 'ترتيب المنتجات حسب الكميات والمبالغ المباعة' },
      ],
    },
    {
      title: 'تقارير المشتريات',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      reports: [
        { name: 'تقرير المشتريات', path: '/reports/purchases', description: 'تقرير شامل لجميع المشتريات خلال فترة زمنية محددة' },
        { name: 'المشتريات حسب المورد', path: '/reports/purchases-by-supplier', description: 'تحليل مشتريات كل مورد والمبالغ المدفوعة' },
      ],
    },
    {
      title: 'تقارير الخزينة',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-yellow-500 to-yellow-600',
      reports: [
        { name: 'تقرير حركة الخزينة', path: '/reports/treasury', description: 'عرض جميع المقبوضات والمدفوعات النقدية' },
        { name: 'تقرير التدفقات النقدية', path: '/reports/cash-flow', description: 'تحليل التدفقات النقدية الداخلة والخارجة' },
      ],
    },
    {
      title: 'تقارير مالية',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600',
      reports: [
        { name: 'تقرير الأرباح والخسائر', path: '/reports/profit-loss', description: 'تحليل الأرباح والخسائر خلال فترة زمنية محددة' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header محسّن */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              📊 مركز التقارير والتحليلات
            </h1>
            <p className="text-gray-600 text-lg">
              تقارير شاملة ومتقدمة لجميع عمليات النظام مع التحليلات المالية والإحصائية
            </p>
          </div>

          {/* بطاقات سريعة للعمليات اليومية */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">تقارير المخزون</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">تقارير المبيعات</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">تقارير المشتريات</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">تقارير مالية</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* محتوى التقارير */}
        <div className="space-y-8">
          {reportCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* عنوان الفئة */}
              <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.title}</h2>
                    <p className="text-white opacity-90 text-sm mt-1">
                      {category.reports.length} تقرير متاح
                    </p>
                  </div>
                </div>
              </div>

              {/* قائمة التقارير */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.reports.map((report, reportIndex) => (
                    <Link
                      key={reportIndex}
                      to={report.path}
                      className="group block p-6 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} text-white flex items-center justify-center`}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 group-hover:text-gray-900">
                              {report.name}
                            </h3>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {report.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* معلومات إضافية */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-800 font-semibold mb-2">💡 نصائح لاستخدام التقارير</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• استخدم الفلاتر لتحديد الفترة الزمنية المطلوبة</li>
                <li>• يمكنك تصدير التقارير بصيغة CSV أو طباعتها</li>
                <li>• راجع التقارير بانتظام لمتابعة أداء العمل</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsHome;