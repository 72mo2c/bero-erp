// ======================================
// Admin Dashboard - لوحة تحكم المطور
// ======================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAllOrganizations, getOrganizationsStats } from '../../services/organizationService';
import { getSubscriptionsStats } from '../../services/subscriptionService';
import Button from '../../components/Common/Button';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [orgStats, setOrgStats] = useState(null);
  const [subStats, setSubStats] = useState(null);
  const [recentOrgs, setRecentOrgs] = useState([]);
  const [systemStats, setSystemStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const organizations = getAllOrganizations();
    const organizationStats = getOrganizationsStats();
    const subscriptionStats = getSubscriptionsStats();

    setOrgStats(organizationStats);
    setSubStats(subscriptionStats);

    // أحدث 5 مؤسسات
    const recent = organizations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentOrgs(recent);

    // حساب إحصائيات النظام الكامل
    const totalUsers = organizations.reduce((sum, org) => sum + (org.usersCount || 0), 0);
    const totalProducts = organizations.reduce((sum, org) => sum + (org.productsCount || 0), 0);
    const totalRevenue = organizations.reduce((sum, org) => sum + (org.monthlyRevenue || 0), 0);
    
    // حساب معدل النمو (افتراضي)
    const growthRate = 23; // نسبة نمو افتراضية
    
    // إحصائيات النظام
    setSystemStats({
      totalUsers,
      totalProducts,
      totalRevenue,
      growthRate,
      activeOrgs: organizations.filter(o => o.status === 'active').length,
      suspendedOrgs: organizations.filter(o => o.status === 'suspended').length,
      expiredOrgs: organizations.filter(o => o.status === 'expired').length
    });

    // إحصائيات عامة
    setStats({
      totalOrgs: organizations.length,
      activeOrgs: organizations.filter(o => o.status === 'active').length,
      totalRevenue: totalRevenue,
      newOrgsThisMonth: organizations.filter(o => {
        const orgDate = new Date(o.createdAt);
        const now = new Date();
        return orgDate.getMonth() === now.getMonth() &&
               orgDate.getFullYear() === now.getFullYear();
      }).length
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/dev-admin-control-2025-system-super-secret/login');
  };

  const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border-r-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
          {subtext && <p className="text-gray-500 text-xs mt-2">{subtext}</p>}
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );

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
              <div className="bg-blue-900 p-3 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المطور</h1>
                <p className="text-sm text-gray-500">مرحباً، {admin?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/dev-admin-control-2025-system-super-secret/organizations">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                  إدارة المؤسسات
                </Button>
              </Link>
              <Link to="/dev-admin-control-2025-system-super-secret/subscriptions">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  إدارة الاشتراكات
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المؤسسات"
            value={stats?.totalOrgs || 0}
            color="#1e3a8a"
            icon={
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <StatCard
            title="المؤسسات النشطة"
            value={stats?.activeOrgs || 0}
            color="#059669"
            subtext={`${orgStats?.suspended || 0} معلقة، ${orgStats?.expired || 0} منتهية`}
            icon={
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="الإيرادات الشهرية"
            value={`$${stats?.totalRevenue || 0}`}
            color="#ea580c"
            icon={
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="مؤسسات جديدة (شهرياً)"
            value={stats?.newOrgsThisMonth || 0}
            color="#7c3aed"
            icon={
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* إحصائيات النظام المتقدمة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المستخدمين"
            value={systemStats?.totalUsers || 0}
            color="#6366f1"
            subtext="مستخدم نشط"
            icon={
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />

          <StatCard
            title="عدد المنتجات"
            value={`${(systemStats?.totalProducts || 0).toLocaleString()}`}
            color="#059669"
            subtext="منتج في النظام"
            icon={
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />

          <StatCard
            title="الإيرادات الإجمالية"
            value={`$${(systemStats?.totalRevenue || 0).toLocaleString()}`}
            color="#dc2626"
            subtext={`معدل النمو: ${systemStats?.growthRate || 0}%`}
            icon={
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <StatCard
            title="معدل النمو الشهري"
            value={`${systemStats?.growthRate || 0}%`}
            color="#7c3aed"
            subtext="نمو إيجابي"
            icon={
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* أحدث المؤسسات */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">أحدث المؤسسات</h2>
              <Link to="/dev-admin-control-2025-system-super-secret/organizations">
                <Button className="text-blue-900 hover:text-blue-700">
                  عرض الكل
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    اسم المؤسسة
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
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrgs.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.adminName}</div>
                      <div className="text-xs text-gray-500">{org.adminEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(org.plan)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(org.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/org/${org.id}/login`}
                        className="text-blue-900 hover:text-blue-700 font-medium"
                      >
                        فتح
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recentOrgs.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مؤسسات</h3>
              <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء مؤسسة جديدة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
