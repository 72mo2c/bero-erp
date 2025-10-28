// ======================================
// Fix Negative Quantities - أداة إصلاح الكميات السالبة
// فحص وإصلاح المنتجات ذات الكميات السالبة
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  FaExclamationTriangle, 
  FaTools, 
  FaSearch, 
  FaWrench, 
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaHistory,
  FaShieldAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaCalculator,
  FaFileAlt
} from 'react-icons/fa';

const FixNegativeQuantities = () => {
  const { products, updateProduct } = useData();
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [scanning, setScanning] = useState(true);
  const [negativeProducts, setNegativeProducts] = useState([]);
  const [fixedProducts, setFixedProducts] = useState([]);
  const [fixing, setFixing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('severity'); // severity, name, quantity
  const [showHistory, setShowHistory] = useState(false);
  const [fixLog, setFixLog] = useState([]);

  // فحص المنتجات عند تحميل الصفحة
  useEffect(() => {
    scanForNegativeQuantities();
  }, []);

  const scanForNegativeQuantities = () => {
    setScanning(true);
    
    setTimeout(() => {
      const productsWithNegativeQty = products.filter(
        product => (product.mainQuantity || 0) < 0
      );
      
      setNegativeProducts(productsWithNegativeQty);
      
      if (productsWithNegativeQty.length === 0) {
        showSuccess('🎉 لا توجد منتجات بكميات سالبة - النظام سليم!');
      } else {
        showWarning(`⚠️ تم العثور على ${productsWithNegativeQty.length} منتج بكميات سالبة`);
      }
      
      setScanning(false);
    }, 1500);
  };

  const fixProductQuantity = async (productId) => {
    setFixing(true);
    
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        showError('المنتج غير موجود');
        return;
      }

      const currentQty = product.mainQuantity || 0;
      const newQty = Math.abs(currentQty); // تحويل الكمية السالبة إلى موجبة
      
      await updateProduct(productId, { mainQuantity: newQty });
      
      // إضافة إلى سجل الإصلاح
      const fixRecord = {
        productId,
        productName: product.name,
        oldQuantity: currentQty,
        newQuantity: newQty,
        timestamp: new Date(),
        action: 'fixed_negative'
      };
      
      setFixLog(prev => [fixRecord, ...prev]);
      setFixedProducts(prev => [...prev, productId]);
      
      showSuccess(`✅ تم إصلاح "${product.name}" - الكمية: ${currentQty} → ${newQty}`);
      
      // تحديث القائمة
      setNegativeProducts(prev => prev.filter(p => p.id !== productId));
      
    } catch (error) {
      showError(`❌ فشل في إصلاح المنتج: ${error.message}`);
    } finally {
      setFixing(false);
    }
  };

  const fixAllProducts = async () => {
    if (negativeProducts.length === 0) return;
    
    setFixing(true);
    const successfulFixes = [];
    const failedFixes = [];
    
    for (const product of negativeProducts) {
      try {
        const newQty = Math.abs(product.mainQuantity || 0);
        await updateProduct(product.id, { mainQuantity: newQty });
        
        const fixRecord = {
          productId: product.id,
          productName: product.name,
          oldQuantity: product.mainQuantity || 0,
          newQuantity: newQty,
          timestamp: new Date(),
          action: 'bulk_fixed'
        };
        
        setFixLog(prev => [fixRecord, ...prev]);
        successfulFixes.push(product.id);
        
      } catch (error) {
        failedFixes.push({
          productName: product.name,
          error: error.message
        });
      }
    }
    
    setFixedProducts(prev => [...prev, ...successfulFixes]);
    setNegativeProducts(prev => prev.filter(p => !successfulFixes.includes(p.id)));
    
    if (successfulFixes.length > 0) {
      showSuccess(`✅ تم إصلاح ${successfulFixes.length} منتج بنجاح`);
    }
    
    if (failedFixes.length > 0) {
      showError(`❌ فشل في إصلاح ${failedFixes.length} منتج`);
    }
    
    setFixing(false);
  };

  // فلترة وترتيب النتائج
  const filteredProducts = negativeProducts
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          return (a.mainQuantity || 0) - (b.mainQuantity || 0); // الأكثر سالبة أولاً
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return (a.mainQuantity || 0) - (b.mainQuantity || 0);
        default:
          return 0;
      }
    });

  const getSeverityLevel = (quantity) => {
    const absQty = Math.abs(quantity);
    if (absQty >= 100) return { level: 'critical', color: 'text-red-700', bg: 'bg-red-100' };
    if (absQty >= 50) return { level: 'high', color: 'text-orange-700', bg: 'bg-orange-100' };
    if (absQty >= 10) return { level: 'medium', color: 'text-yellow-700', bg: 'bg-yellow-100' };
    return { level: 'low', color: 'text-blue-700', bg: 'bg-blue-100' };
  };

  const formatQuantity = (quantity) => {
    const absQty = Math.abs(quantity);
    return quantity < 0 ? `-${absQty.toLocaleString()}` : absQty.toLocaleString();
  };

  if (scanning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-orange-800 mb-2">🔍 جاري فحص المنتجات</h2>
          <p className="text-orange-600">يتم البحث عن المنتجات ذات الكميات السالبة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                🔧 أداة إصلاح الكميات السالبة
              </h1>
              <p className="text-gray-600 text-lg">فحص وإصلاح المنتجات ذات الكميات السالبة في النظام</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaHistory />
                سجل الإصلاحات
              </button>
              <button
                onClick={scanForNegativeQuantities}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <FaSearch />
                فحص جديد
              </button>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">منتجات سالبة</p>
                  <p className="text-3xl font-bold">{negativeProducts.length}</p>
                </div>
                <FaExclamationTriangle className="text-4xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">تم إصلاحها</p>
                  <p className="text-3xl font-bold">{fixedProducts.length}</p>
                </div>
                <FaCheckCircle className="text-4xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">إجمالي المنتجات</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <FaBox className="text-4xl opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">سجل الإصلاحات</p>
                  <p className="text-3xl font-bold">{fixLog.length}</p>
                </div>
                <FaFileAlt className="text-4xl opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* إذا لم توجد منتجات سالبة */}
        {negativeProducts.length === 0 && !scanning && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 النظام سليم!</h3>
            <p className="text-green-700 text-lg">لا توجد منتجات بكميات سالبة. جميع المنتجات لها كميات صحيحة.</p>
          </div>
        )}

        {/* قائمة المنتجات السالبة */}
        {negativeProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            
            {/* أدوات التحكم */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="severity">ترتيب حسب الخطورة</option>
                  <option value="name">ترتيب أبجدي</option>
                  <option value="quantity">ترتيب حسب الكمية</option>
                </select>
                
                <button
                  onClick={fixAllProducts}
                  disabled={fixing || negativeProducts.length === 0}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FaWrench />
                  إصلاح الكل ({negativeProducts.length})
                </button>
              </div>
            </div>

            {/* قائمة المنتجات */}
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const severity = getSeverityLevel(product.mainQuantity || 0);
                const isFixed = fixedProducts.includes(product.id);
                
                return (
                  <div
                    key={product.id}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      isFixed ? 'border-green-200 bg-green-50' : `border-red-200 ${severity.bg}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isFixed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                          {isFixed ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                          <p className="text-gray-600">الفئة: {product.category} | الكود: {product.code}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severity.color} ${severity.bg}`}>
                              الكمية: {formatQuantity(product.mainQuantity || 0)}
                            </span>
                            <span className="text-sm text-gray-500">
                              مستوى الخطورة: {severity.level}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {!isFixed && (
                          <button
                            onClick={() => fixProductQuantity(product.id)}
                            disabled={fixing}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            <FaWrench />
                            إصلاح
                          </button>
                        )}
                        
                        {isFixed && (
                          <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <FaCheckCircle />
                            تم الإصلاح
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد منتجات تطابق البحث</p>
              </div>
            )}
          </div>
        )}

        {/* سجل الإصلاحات */}
        {showHistory && fixLog.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FaHistory />
              سجل الإصلاحات
            </h3>
            
            <div className="space-y-3">
              {fixLog.slice(0, 10).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <FaCalculator className="text-blue-500" />
                    <div>
                      <p className="font-semibold">{record.productName}</p>
                      <p className="text-sm text-gray-600">
                        {record.oldQuantity} → {record.newQuantity} | {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{record.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نصائح وإرشادات */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mt-8">
          <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <FaShieldAlt />
            إرشادات لمنع الكميات السالبة
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🔍 فحص مستمر:</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• فحص المخزون يومياً</li>
                <li>• مراقبة تقارير المخزون</li>
                <li>• تتبع التنبيهات المبكرة</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">⚡ إصلاح فوري:</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• إصلاح الكميات السالبة فوراً</li>
                <li>• مراجعة سجل المعاملات</li>
                <li>• التحقق من صحة العمليات</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FixNegativeQuantities;