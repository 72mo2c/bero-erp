// ======================================
// Global Search - بحث شامل في النظام
// ======================================

import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBox, FaUser, FaTruck, FaFileInvoice, FaWarehouse, FaTimes, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const GlobalSearch = ({ isMobile = false, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  const { products, customers, suppliers, purchaseInvoices, salesInvoices, warehouses } = useData();

  // البحث في البيانات
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // البحث في المنتجات
    const matchedProducts = products.filter(p => 
      p.name?.toLowerCase().includes(query) || 
      p.barcode?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    ).slice(0, 5);
    
    matchedProducts.forEach(product => {
      results.push({
        id: `product-${product.id}`,
        type: 'product',
        title: product.name,
        subtitle: `الكمية: ${product.mainQuantity || 0} - السعر: ${product.sellingPrice || 0} جنيه`,
        category: product.category,
        icon: <FaBox />,
        color: 'purple',
        path: '/warehouses/manage-products',
        data: product
      });
    });

    // البحث في العملاء
    const matchedCustomers = customers.filter(c => 
      c.name?.toLowerCase().includes(query) || 
      c.phone?.includes(query) ||
      c.email?.toLowerCase().includes(query)
    ).slice(0, 5);
    
    matchedCustomers.forEach(customer => {
      results.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        title: customer.name,
        subtitle: customer.phone || customer.email,
        icon: <FaUser />,
        color: 'pink',
        path: '/customers/manage',
        data: customer
      });
    });

    // البحث في الموردين
    const matchedSuppliers = suppliers.filter(s => 
      s.name?.toLowerCase().includes(query) || 
      s.phone?.includes(query) ||
      s.email?.toLowerCase().includes(query)
    ).slice(0, 5);
    
    matchedSuppliers.forEach(supplier => {
      results.push({
        id: `supplier-${supplier.id}`,
        type: 'supplier',
        title: supplier.name,
        subtitle: supplier.phone || supplier.email,
        icon: <FaTruck />,
        color: 'cyan',
        path: '/suppliers/manage',
        data: supplier
      });
    });

    // البحث في فواتير المشتريات
    const matchedPurchases = purchaseInvoices.filter(inv => 
      inv.invoiceNumber?.toString().includes(query) ||
      inv.supplierName?.toLowerCase().includes(query)
    ).slice(0, 3);
    
    matchedPurchases.forEach(invoice => {
      results.push({
        id: `purchase-${invoice.id}`,
        type: 'purchase',
        title: `فاتورة مشتريات #${invoice.invoiceNumber || invoice.id}`,
        subtitle: `${invoice.supplierName} - ${invoice.total} جنيه`,
        icon: <FaShoppingCart />,
        color: 'green',
        path: '/purchases/invoices',
        data: invoice
      });
    });

    // البحث في فواتير المبيعات
    const matchedSales = salesInvoices.filter(inv => 
      inv.invoiceNumber?.toString().includes(query) ||
      inv.customerName?.toLowerCase().includes(query)
    ).slice(0, 3);
    
    matchedSales.forEach(invoice => {
      results.push({
        id: `sale-${invoice.id}`,
        type: 'sale',
        title: `فاتورة مبيعات #${invoice.invoiceNumber || invoice.id}`,
        subtitle: `${invoice.customerName} - ${invoice.total} جنيه`,
        icon: <FaChartLine />,
        color: 'orange',
        path: '/sales/invoices',
        data: invoice
      });
    });

    // البحث في المخازن
    const matchedWarehouses = warehouses.filter(w => 
      w.name?.toLowerCase().includes(query) ||
      w.location?.toLowerCase().includes(query)
    ).slice(0, 3);
    
    matchedWarehouses.forEach(warehouse => {
      results.push({
        id: `warehouse-${warehouse.id}`,
        type: 'warehouse',
        title: warehouse.name,
        subtitle: warehouse.location || 'لا يوجد موقع',
        icon: <FaWarehouse />,
        color: 'indigo',
        path: '/warehouses/manage',
        data: warehouse
      });
    });

    setSearchResults(results);
    setShowResults(results.length > 0);
    setIsSearching(false);
  }, [searchQuery, products, customers, suppliers, purchaseInvoices, salesInvoices, warehouses]);

  // إغلاق النتائج عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result) => {
    navigate(result.path);
    setSearchQuery('');
    setShowResults(false);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getColorClasses = (color) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      cyan: 'from-cyan-500 to-cyan-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(result);
    return acc;
  }, {});

  const typeLabels = {
    product: 'المنتجات',
    customer: 'العملاء',
    supplier: 'الموردين',
    purchase: 'فواتير المشتريات',
    sale: 'فواتير المبيعات',
    warehouse: 'المخازن'
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن منتج، عميل، مورد، فاتورة..."
          className={`w-full ${isMobile ? 'px-3 py-2 pr-9 text-sm' : 'px-3 py-1.5 pr-9 text-xs'} bg-orange-50/80 border border-orange-100 rounded-lg focus:outline-none focus:bg-white focus:border-orange-300 transition-all placeholder-gray-400`}
          autoFocus={isMobile}
        />
        
        {/* أيقونة البحث أو التحميل */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaSearch className="text-orange-400" size={isMobile ? 14 : 12} />
          )}
        </div>

        {/* زر المسح */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={isMobile ? 14 : 12} />
          </button>
        )}
      </div>

      {/* نتائج البحث */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-orange-100 max-h-[70vh] overflow-y-auto z-50">
          {Object.entries(groupedResults).map(([type, results]) => (
            <div key={type} className="border-b border-orange-50 last:border-b-0">
              <div className="px-3 py-2 bg-gradient-to-r from-orange-50 to-white sticky top-0">
                <p className="text-xs font-bold text-orange-600">{typeLabels[type]}</p>
              </div>
              
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-3 py-2.5 hover:bg-orange-50 transition-all flex items-start gap-3 text-right border-b border-orange-50/50 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getColorClasses(result.color)} flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-0.5`}>
                    <span className="text-xs">{result.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{result.subtitle}</p>
                    {result.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                        {result.category}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}

          {/* عدد النتائج */}
          <div className="px-3 py-2 bg-gray-50 border-t border-orange-100 sticky bottom-0">
            <p className="text-[10px] text-gray-500 text-center">
              تم العثور على {searchResults.length} نتيجة
            </p>
          </div>
        </div>
      )}

      {/* لا توجد نتائج */}
      {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-orange-100 p-6 z-50 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaSearch className="text-orange-300" size={24} />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">لا توجد نتائج</p>
          <p className="text-xs text-gray-500">لم يتم العثور على نتائج لـ "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
