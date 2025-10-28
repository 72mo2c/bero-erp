// ======================================
// Organizations Manager - إدارة المؤسسات
// ======================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  createDemoOrganizations
} from '../../services/organizationService';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';

const OrganizationsManager = () => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
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

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = () => {
    const orgs = getAllOrganizations();
    setOrganizations(orgs);
  };

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

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          org.adminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">إدارة المؤسسات</h1>
            </div>

            <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* البحث والفلترة */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث
              </label>
              <Input
                type="text"
                placeholder="ابحث عن مؤسسة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
          </div>
        </div>

        {/* قائمة المؤسسات */}
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
                    تاريخ الانتهاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrgs.map((org) => (
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(org.subscriptionEnd).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
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
                ))}
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
    </div>
  );
};

export default OrganizationsManager;
