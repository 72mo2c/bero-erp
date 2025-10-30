// ======================================
// Organizations Manager - إدارة المؤسسات
// نظام المعرف الآمن المتطور
// ======================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  createDemoOrganizations
} from '../../services/organizationService';
import secureCodeService from '../../services/secureCodeService';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';

const OrganizationsManager = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { showSuccess, showError } = useNotification();
  
  // === حالة إدارة المؤسسات ===
  const [organizations, setOrganizations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    plan: 'Basic'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // === حالة إدارة المعرفات الآمنة ===
  const [secureCodes, setSecureCodes] = useState([]);
  const [showSecureCodesModal, setShowSecureCodesModal] = useState(false);
  const [selectedOrgCodes, setSelectedOrgCodes] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('organizations'); // organizations | secureCodes | stats
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrganizations();
    loadSecureCodes();
    loadSystemStats();
    loadSecurityAlerts();
  }, []);

  // === تحميل المؤسسات ===
  const loadOrganizations = () => {
    const orgs = getAllOrganizations();
    setOrganizations(orgs);
  };

  // === تحميل المعرفات الآمنة ===
  const loadSecureCodes = () => {
    try {
      const codes = secureCodeService.searchCodes();
      setSecureCodes(codes);
    } catch (error) {
      console.error('خطأ في تحميل المعرفات الآمنة:', error);
      showError('فشل في تحميل المعرفات الآمنة');
    }
  };

  // === تحميل إحصائيات النظام ===
  const loadSystemStats = () => {
    try {
      const stats = secureCodeService.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error);
    }
  };

  // === تحميل التنبيهات الأمنية ===
  const loadSecurityAlerts = () => {
    try {
      const alerts = secureCodeService.getAlerts();
      setSecurityAlerts(alerts.slice(-10)); // آخر 10 تنبيهات
    } catch (error) {
      console.error('خطأ في تحميل التنبيهات:', error);
    }
  };

  // === إدارة المؤسسات ===
  const handleCreateDemo = () => {
    if (window.confirm('هل تريد إنشاء 5 مؤسسات تجريبية؟')) {
      createDemoOrganizations();
      loadOrganizations();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingOrg) {
      updateOrganization(editingOrg.id, formData);
    } else {
      createOrganization(formData);
    }
    
    loadOrganizations();
    resetForm();
  };

  const handleEdit = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      adminName: org.adminName,
      adminEmail: org.adminEmail,
      adminPhone: org.adminPhone,
      plan: org.plan
    });
    setShowModal(true);
  };

  const handleDelete = (orgId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المؤسسة؟ سيتم حذف جميع بياناتها!')) {
      deleteOrganization(orgId);
      loadOrganizations();
    }
  };

  const handleStatusChange = (orgId, newStatus) => {
    updateOrganization(orgId, { status: newStatus });
    loadOrganizations();
  };

  const copyOrganizationLink = async (orgId) => {
    try {
      const baseUrl = window.location.origin;
      const organizationLink = `${baseUrl}/org/${orgId}/login`;
      await navigator.clipboard.writeText(organizationLink);
      showSuccess('تم نسخ رابط المؤسسة بنجاح!');
    } catch (error) {
      console.error('فشل في نسخ الرابط:', error);
      showError('فشل في نسخ رابط المؤسسة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      plan: 'Basic'
    });
    setEditingOrg(null);
    setShowModal(false);
  };

  // === إدارة المعرفات الآمنة ===
  const generateSecureCode = async (orgId, codeType = 'general') => {
    setLoading(true);
    try {
      const result = secureCodeService.createInstitutionalCode(orgId, codeType);
      loadSecureCodes();
      loadSystemStats();
      showSuccess(`تم إنشاء معرف آمن جديد: ${result.codeId}`);
      return result.code;
    } catch (error) {
      console.error('خطأ في توليد المعرف الآمن:', error);
      showError('فشل في توليد المعرف الآمن');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const copySecureCode = async (codeId, code) => {
    try {
      await navigator.clipboard.writeText(code);
      showSuccess('تم نسخ المعرف الآمن بنجاح!');
    } catch (error) {
      console.error('فشل في نسخ المعرف:', error);
      showError('فشل في نسخ المعرف الآمن');
    }
  };

  const deactivateSecureCode = (codeId) => {
    if (window.confirm('هل تريد إلغاء تفعيل هذا المعرف الآمن؟')) {
      try {
        secureCodeService.deactivateCode(codeId);
        loadSecureCodes();
        loadSystemStats();
        showSuccess('تم إلغاء تفعيل المعرف الآمن بنجاح');
      } catch (error) {
        console.error('خطأ في إلغاء تفعيل المعرف:', error);
        showError('فشل في إلغاء تفعيل المعرف الآمن');
      }
    }
  };

  const extendSecureCodeExpiry = (codeId, additionalHours = 24) => {
    try {
      secureCodeService.extendCodeExpiry(codeId, additionalHours);
      loadSecureCodes();
      loadSystemStats();
      showSuccess(`تم تمديد صلاحية المعرف ${additionalHours} ساعة`);
    } catch (error) {
      console.error('خطأ في تمديد الصلاحية:', error);
      showError('فشل في تمديد صلاحية المعرف الآمن');
    }
  };

  const deleteSecureCode = (codeId) => {
    if (window.confirm('هل تريد حذف هذا المعرف الآمن نهائياً؟')) {
      try {
        secureCodeService.deleteCode(codeId);
        loadSecureCodes();
        loadSystemStats();
        showSuccess('تم حذف المعرف الآمن بنجاح');
      } catch (error) {
        console.error('خطأ في حذف المعرف:', error);
        showError('فشل في حذف المعرف الآمن');
      }
    }
  };

  const showOrganizationCodes = (orgId) => {
    const orgCodes = secureCodes.filter(code => code.institutionId === orgId);
    setSelectedOrgCodes(orgCodes);
    setShowSecureCodesModal(true);
  };

  // === الترشيح والبحث ===
  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredCodes = secureCodes.filter(code => {
    const org = organizations.find(o => o.id === code.institutionId);
    const orgName = org ? org.name.toLowerCase() : '';
    return orgName.includes(searchTerm.toLowerCase()) ||
           code.codeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           code.type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // === دوال المساعدة ===
  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-yellow-100 text-yellow-700',
      expired: 'bg-red-100 text-red-700'
    };
    const labels = {
      active: 'نشط',
      suspended: 'معلق',
      expired: 'منتهي'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const badges = {
      Basic: 'bg-blue-100 text-blue-700',
      Pro: 'bg-purple-100 text-purple-700',
      Enterprise: 'bg-orange-100 text-orange-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[plan]}`}>
        {plan}
      </span>
    );
  };

  const getCodeStatusBadge = (code) => {
    const isExpired = code.expiresAt < Date.now();
    
    if (!code.isActive) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">غير نشط</span>;
    }
    
    if (isExpired) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">منتهي</span>;
    }
    
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">نشط</span>;
  };

  const formatTimeUntilExpiry = (expiresAt) => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return 'منتهي';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} يوم`;
    } else if (hours > 0) {
      return `${hours} ساعة`;
    } else {
      return 'أقل من ساعة';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      general: 'عام',
      admin: 'إداري',
      user: 'مستخدم',
      api: 'API'
    };
    return labels[type] || type;
  };

  // === الواجهة الرئيسية ===
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/admin/dashboard">
                <Button className="text-gray-600 hover:text-gray-900">
                  عودة
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المطور</h1>
            </div>

            <div className="flex items-center gap-3">
              {securityAlerts.filter(alert => !alert.isRead).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">
                    {securityAlerts.filter(alert => !alert.isRead).length} تنبيه أمني
                  </span>
                </div>
              )}
              
              <Button
                onClick={handleCreateDemo}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                إنشاء مؤسسات تجريبية
              </Button>
              
              <Button
                onClick={() => setShowModal(true)}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                إضافة مؤسسة جديدة
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 space-x-reverse">
            <button
              onClick={() => setActiveTab('organizations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organizations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إدارة المؤسسات
            </button>
            <button
              onClick={() => setActiveTab('secureCodes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'secureCodes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              المعرفات الآمنة
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إحصائيات النظام
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* شريط البحث والفلترة */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث
              </label>
              <Input
                type="text"
                placeholder={activeTab === 'organizations' ? "ابحث عن مؤسسة..." : "ابحث عن معرف آمن..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {activeTab === 'organizations' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تصفية حسب الحالة
                </label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="suspended">معلق</option>
                  <option value="expired">منتهي</option>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* محتوى التبويبات */}
        {activeTab === 'organizations' && (
          // === تبويب إدارة المؤسسات ===
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المؤسسة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المسؤول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الخطة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المستخدمين
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المعرفات الآمنة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رابط المؤسسة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrgs.map((org) => {
                    const orgCodes = secureCodes.filter(code => code.institutionId === org.id);
                    const activeCodes = orgCodes.filter(code => code.isActive && code.expiresAt > Date.now()).length;
                    
                    return (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{org.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{org.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{org.adminName}</div>
                          <div className="text-xs text-gray-500">{org.adminEmail}</div>
                          <div className="text-xs text-gray-500">{org.adminPhone}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getPlanBadge(org.plan)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(org.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {org.usersCount} / {org.maxUsers === -1 ? '∞' : org.maxUsers}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{activeCodes} نشط</span>
                            <Button
                              onClick={() => showOrganizationCodes(org.id)}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              عرض الكل ({orgCodes.length})
                            </Button>
                            <Button
                              onClick={() => generateSecureCode(org.id, 'general')}
                              disabled={loading}
                              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded disabled:opacity-50"
                            >
                              + معرف جديد
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyOrganizationLink(org.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                              title="نسخ رابط المؤسسة"
                            >
                              نسخ الرابط
                            </button>
                            <a
                              href={`/org/${org.id}/login`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                              title="فتح الرابط"
                            >
                              فتح
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/org/${org.id}/login`}
                              className="text-blue-900 hover:text-blue-700 text-sm font-medium"
                            >
                              فتح
                            </Link>
                            <button
                              onClick={() => handleEdit(org)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              تعديل
                            </button>
                            {org.status === 'active' ? (
                              <button
                                onClick={() => handleStatusChange(org.id, 'suspended')}
                                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                              >
                                تعليق
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(org.id, 'active')}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                تفعيل
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(org.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredOrgs.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مؤسسات</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === 'secureCodes' && (
          // === تبويب المعرفات الآمنة ===
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المعرف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المؤسسة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الاستخدام
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الصلاحية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCodes.map((code) => {
                    const org = organizations.find(o => o.id === code.institutionId);
                    const stats = secureCodeService.getCodeStats(code.codeId);
                    
                    return (
                      <tr key={code.codeId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 font-mono text-sm">{code.codeId}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(code.createdAt).toLocaleDateString('ar-SA')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{org ? org.name : 'غير محدد'}</div>
                          <div className="text-xs text-gray-500 font-mono">{code.institutionId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {getTypeLabel(code.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getCodeStatusBadge(code)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {stats ? `${stats.usageCount}` : code.usageCount}
                            {code.maxUsage && ` / ${code.maxUsage}`}
                          </div>
                          {stats && stats.usagePercentage > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {formatTimeUntilExpiry(code.expiresAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ينتهي: {new Date(code.expiresAt).toLocaleDateString('ar-SA')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              onClick={() => copySecureCode(code.codeId, code.code)}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              نسخ
                            </Button>
                            <Button
                              onClick={() => extendSecureCodeExpiry(code.codeId, 24)}
                              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded"
                            >
                              تمديد
                            </Button>
                            {code.isActive ? (
                              <Button
                                onClick={() => deactivateSecureCode(code.codeId)}
                                className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
                              >
                                إلغاء تفعيل
                              </Button>
                            ) : (
                              <Button
                                onClick={() => secureCodeService.updateCodeStatus(code.codeId, { isActive: true })}
                                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded"
                              >
                                تفعيل
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteSecureCode(code.codeId)}
                              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded"
                            >
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCodes.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد معرفات آمنة</h3>
                <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء معرفات آمنة للمؤسسات</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          // === تبويب إحصائيات النظام ===
          <div className="space-y-6">
            {/* إحصائيات عامة */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">إجمالي المعرفات</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.totalCodes || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">المعرفات النشطة</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.activeCodes || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">محاولات فاشلة (24س)</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.failedAttempts24h || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM15 17H9a4 4 0 01-4-4V5a2 2 0 012-2h2m4 10V9a2 2 0 012-2h4a2 2 0 012 2v8a2 2 0 01-2 2h-4a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="mr-4">
                    <p className="text-sm font-medium text-gray-600">تنبيهات أمنية</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.unreadAlerts || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* التنبيهات الأمنية */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">التنبيهات الأمنية الأخيرة</h3>
              {securityAlerts.length > 0 ? (
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div key={alert.id} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="mr-3">
                          <p className="text-sm font-medium text-yellow-800">{alert.data.message}</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            {new Date(alert.timestamp).toLocaleString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm">لا توجد تنبيهات أمنية حالياً</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* نموذج الإضافة/التعديل */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingOrg ? 'تعديل مؤسسة' : 'إضافة مؤسسة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المؤسسة
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المسؤول
            </label>
            <Input
              type="text"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجوال
            </label>
            <Input
              type="tel"
              value={formData.adminPhone}
              onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الخطة
            </label>
            <Select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            >
              <option value="Basic">Basic - $99/شهر</option>
              <option value="Pro">Pro - $199/شهر</option>
              <option value="Enterprise">Enterprise - $399/شهر</option>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800 text-white">
              {editingOrg ? 'حفظ التغييرات' : 'إنشاء المؤسسة'}
            </Button>
            <Button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700">
              إلغاء
            </Button>
          </div>
        </form>
      </Modal>

      {/* نموذج عرض معرفات المؤسسة */}
      <Modal
        isOpen={showSecureCodesModal}
        onClose={() => setShowSecureCodesModal(false)}
        title="المعرفات الآمنة للمؤسسة"
      >
        {selectedOrgCodes.length > 0 ? (
          <div className="space-y-4">
            {selectedOrgCodes.map((code) => (
              <div key={code.codeId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 font-mono">{code.codeId}</div>
                  {getCodeStatusBadge(code)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">النوع:</span> {getTypeLabel(code.type)}
                  </div>
                  <div>
                    <span className="font-medium">الاستخدام:</span> {code.usageCount}
                  </div>
                  <div>
                    <span className="font-medium">ينتهي في:</span> {formatTimeUntilExpiry(code.expiresAt)}
                  </div>
                  <div>
                    <span className="font-medium">تم الإنشاء:</span> {new Date(code.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => copySecureCode(code.codeId, code.code)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    نسخ المعرف
                  </Button>
                  <Button
                    onClick={() => extendSecureCodeExpiry(code.codeId, 24)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded"
                  >
                    تمديد الصلاحية
                  </Button>
                  <Button
                    onClick={() => deactivateSecureCode(code.codeId)}
                    className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
                  >
                    إلغاء التفعيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="mt-2 text-sm">لا توجد معرفات آمنة لهذه المؤسسة</p>
            <Button
              onClick={() => {
                const firstOrg = organizations[0];
                if (firstOrg) {
                  generateSecureCode(firstOrg.id, 'general');
                  setShowSecureCodesModal(false);
                }
              }}
              className="mt-3 text-xs bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 rounded"
            >
              إنشاء معرف جديد
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrganizationsManager;