// ======================================
// Permissions Management - إدارة الصلاحيات
// ======================================

import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { FaCog, FaCheck, FaTimes, FaSave, FaUndo, FaShieldAlt, FaLock } from 'react-icons/fa';

const STORAGE_KEY = 'bero_permissions_matrix';

const Permissions = () => {
  const { showSuccess, showWarning } = useNotification();
  const { isAdmin } = useAuth();
  
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});

  // تحميل الصلاحيات عند بدء التشغيل
  useEffect(() => {
    loadPermissions();
  }, []);

  // مراقبة التغييرات
  useEffect(() => {
    if (Object.keys(originalPermissions).length > 0) {
      const changed = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
      setHasChanges(changed);
    }
  }, [permissions, originalPermissions]);

  // فحص المدير فقط
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <FaLock className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">مدير فقط</h3>
          <p className="text-gray-600 mb-4">
            إدارة الصلاحيات متاحة للمدير العام فقط.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            دورك الحالي: غير مدير - مطلوب: admin
          </p>
          <button
            onClick={() => window.location.href = '#/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  const roles = [
    { id: 'admin', name: 'مدير', color: 'red' },
    { id: 'manager', name: 'مدير مخزن', color: 'blue' },
    { id: 'user', name: 'مستخدم', color: 'green' },
    { id: 'viewer', name: 'مشاهد', color: 'gray' }
  ];

  const allPermissions = [
    { id: 'warehouses', name: 'إدارة المخازن', category: 'inventory' },
    { id: 'products', name: 'إدارة المنتجات', category: 'inventory' },
    { id: 'purchases', name: 'فواتير المشتريات', category: 'transactions' },
    { id: 'sales', name: 'فواتير المبيعات', category: 'transactions' },
    { id: 'suppliers', name: 'إدارة الموردين', category: 'contacts' },
    { id: 'customers', name: 'إدارة العملاء', category: 'contacts' },
    { id: 'treasury', name: 'الخزينة', category: 'finance' },
    { id: 'reports', name: 'التقارير', category: 'reports' },
    { id: 'users', name: 'إدارة المستخدمين', category: 'system' },
    { id: 'settings', name: 'الإعدادات', category: 'system' },
    { id: 'integrations', name: 'التكاملات', category: 'system' },
    { id: 'backup', name: 'النسخ الاحتياطي', category: 'system' }
  ];

  const categories = [
    { id: 'inventory', name: 'المخزون', icon: '📦' },
    { id: 'transactions', name: 'المعاملات', icon: '💰' },
    { id: 'contacts', name: 'جهات الاتصال', icon: '👥' },
    { id: 'finance', name: 'المالية', icon: '💵' },
    { id: 'reports', name: 'التقارير', icon: '📊' },
    { id: 'system', name: 'النظام', icon: '⚙️' }
  ];

  const loadPermissions = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setPermissions(data);
        setOriginalPermissions(data);
      } else {
        // الصلاحيات الافتراضية
        const defaultPermissions = {
          admin: allPermissions.map(p => p.id), // المدير له جميع الصلاحيات
          manager: ['warehouses', 'products', 'purchases', 'sales', 'suppliers', 'customers', 'reports'],
          user: ['sales', 'purchases', 'products', 'customers', 'suppliers'],
          viewer: ['reports'] // المشاهد يمكنه فقط رؤية التقارير
        };
        setPermissions(defaultPermissions);
        setOriginalPermissions(defaultPermissions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPermissions));
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const togglePermission = (roleId, permissionId) => {
    setPermissions(prev => {
      const rolePermissions = prev[roleId] || [];
      const hasPermission = rolePermissions.includes(permissionId);
      
      return {
        ...prev,
        [roleId]: hasPermission
          ? rolePermissions.filter(p => p !== permissionId)
          : [...rolePermissions, permissionId]
      };
    });
  };

  const hasPermission = (roleId, permissionId) => {
    return permissions[roleId]?.includes(permissionId) || false;
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
      setOriginalPermissions(permissions);
      setHasChanges(false);
      setShowSaveModal(false);
      showSuccess('تم حفظ الصلاحيات بنجاح');
    } catch (error) {
      console.error('Error saving permissions:', error);
      showWarning('حدث خطأ أثناء حفظ الصلاحيات');
    }
  };

  const handleReset = () => {
    setPermissions(originalPermissions);
    setHasChanges(false);
    showWarning('تم التراجع عن التغييرات');
  };

  const grantAllPermissions = (roleId) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: allPermissions.map(p => p.id)
    }));
  };

  const revokeAllPermissions = (roleId) => {
    setPermissions(prev => ({
      ...prev,
      [roleId]: []
    }));
  };

  const getPermissionCount = (roleId) => {
    return permissions[roleId]?.length || 0;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إدارة الصلاحيات</h1>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleReset}>
              <FaUndo className="ml-2" /> تراجع
            </Button>
            <Button variant="success" onClick={handleSave}>
              <FaSave className="ml-2" /> حفظ التغييرات
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {roles.map(role => (
          <div key={role.id} className={`bg-gradient-to-r from-${role.color}-500 to-${role.color}-600 rounded-lg p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{role.name}</p>
                <p className="text-2xl font-bold">{getPermissionCount(role.id)}/{allPermissions.length}</p>
                <p className="text-xs opacity-75 mt-1">صلاحية مفعلة</p>
              </div>
              <FaShieldAlt className="text-3xl opacity-75" />
            </div>
          </div>
        ))}
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryPermissions = allPermissions.filter(p => p.category === category.id);
          
          return (
            <Card key={category.id} title={`${category.icon} ${category.name}`} icon={<FaCog />}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                        الصلاحية
                      </th>
                      {roles.map(role => (
                        <th key={role.id} className="px-6 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium text-gray-700">{role.name}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  categoryPermissions.forEach(p => {
                                    if (!hasPermission(role.id, p.id)) {
                                      togglePermission(role.id, p.id);
                                    }
                                  });
                                }}
                                className="text-xs text-green-600 hover:text-green-800"
                                title="تفعيل الكل"
                              >
                                تفعيل
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => {
                                  categoryPermissions.forEach(p => {
                                    if (hasPermission(role.id, p.id)) {
                                      togglePermission(role.id, p.id);
                                    }
                                  });
                                }}
                                className="text-xs text-red-600 hover:text-red-800"
                                title="تعطيل الكل"
                              >
                                تعطيل
                              </button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categoryPermissions.map(permission => (
                      <tr key={permission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {permission.name}
                        </td>
                        {roles.map(role => (
                          <td key={role.id} className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => togglePermission(role.id, permission.id)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                hasPermission(role.id, permission.id)
                                  ? 'bg-green-100 hover:bg-green-200 text-green-600'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                              }`}
                            >
                              {hasPermission(role.id, permission.id) ? (
                                <FaCheck className="text-xl" />
                              ) : (
                                <FaTimes className="text-xl" />
                              )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card title="إجراءات سريعة" icon={<FaCog />} className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.id} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">{role.name}</h4>
              <div className="flex flex-col gap-2">
                <Button
                  variant="success"
                  size="sm"
                  fullWidth
                  onClick={() => grantAllPermissions(role.id)}
                >
                  <FaCheck className="ml-2" />
                  منح جميع الصلاحيات
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => revokeAllPermissions(role.id)}
                >
                  <FaTimes className="ml-2" />
                  إزالة جميع الصلاحيات
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>💡 ملاحظة:</strong> يمكنك تخصيص صلاحيات مختلفة لكل دور في النظام. 
          انقر على الأيقونات لتفعيل أو تعطيل الصلاحيات. استخدم الإجراءات السريعة لتطبيق تغييرات جماعية.
        </p>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaSave className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">تأكيد حفظ الصلاحيات</h3>
              <p className="text-gray-600 mb-4">
                هل أنت متأكد من حفظ التغييرات؟ سيتم تطبيق الصلاحيات الجديدة على جميع المستخدمين.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                {roles.map(role => (
                  <div key={role.id} className="flex justify-between items-center mb-2 text-sm">
                    <span className="font-medium text-gray-700">{role.name}:</span>
                    <span className="text-blue-600">{getPermissionCount(role.id)} صلاحية</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => setShowSaveModal(false)}
              >
                إلغاء
              </Button>
              <Button 
                variant="success" 
                fullWidth
                onClick={confirmSave}
              >
                <FaSave className="ml-2" />
                حفظ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;