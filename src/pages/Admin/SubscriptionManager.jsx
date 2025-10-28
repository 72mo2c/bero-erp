// ======================================
// Subscription Manager - إدارة الاشتراكات
// ======================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrganizations } from '../../services/organizationService';
import {
  getAllSubscriptions,
  getSubscriptionsStats,
  SUBSCRIPTION_PLANS,
  renewSubscription,
  changePlan
} from '../../services/subscriptionService';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';

const SubscriptionManager = () => {
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const orgs = getAllOrganizations();
    setOrganizations(orgs);
    
    const subscriptionStats = getSubscriptionsStats();
    setStats(subscriptionStats);
  };

  const handleRenew = (org) => {
    setSelectedOrg(org);
    setShowRenewModal(true);
  };

  const confirmRenew = () => {
    if (selectedOrg) {
      const subscriptions = getAllSubscriptions();
      const sub = subscriptions.find(s => s.orgId === selectedOrg.id && s.status === 'active');
      if (sub) {
        renewSubscription(sub.id, 1);
        loadData();
      }
    }
    setShowRenewModal(false);
    setSelectedOrg(null);
  };

  const handleChangePlan = (org) => {
    setSelectedOrg(org);
    setSelectedPlan(org.plan);
    setShowChangePlanModal(true);
  };

  const confirmChangePlan = () => {
    if (selectedOrg && selectedPlan) {
      changePlan(selectedOrg.id, selectedPlan);
      loadData();
    }
    setShowChangePlanModal(false);
    setSelectedOrg(null);
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

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <h1 className="text-2xl font-bold text-gray-900">إدارة الاشتراكات</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">الإيرادات الشهرية</p>
                <h3 className="text-3xl font-bold text-green-600">
                  ${stats?.revenue.month || 0}
                </h3>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">خطة Basic</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {stats?.byPlan.basic || 0}
                </h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">خطة Pro</p>
                <h3 className="text-3xl font-bold text-purple-600">
                  {stats?.byPlan.pro || 0}
                </h3>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">خطة Enterprise</p>
                <h3 className="text-3xl font-bold text-orange-600">
                  {stats?.byPlan.enterprise || 0}
                </h3>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الاشتراكات */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">جميع الاشتراكات</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    المؤسسة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الخطة الحالية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    السعر الشهري
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    تاريخ البداية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    تاريخ الانتهاء
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الأيام المتبقية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {organizations.map((org) => {
                  const plan = SUBSCRIPTION_PLANS[org.plan];
                  const daysRemaining = getDaysRemaining(org.subscriptionEnd);
                  
                  return (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.adminEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getPlanBadge(org.plan)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${plan.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(org.subscriptionStart).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(org.subscriptionEnd).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${
                          daysRemaining < 7 ? 'text-red-600' : 
                          daysRemaining < 30 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(org.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRenew(org)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            تجديد
                          </button>
                          <button
                            onClick={() => handleChangePlan(org)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            تغيير الخطة
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد اشتراكات</h3>
            </div>
          )}
        </div>
      </main>

      {/* نموذج التجديد */}
      <Modal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        title="تجديد الاشتراك"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            هل تريد تجديد اشتراك <strong>{selectedOrg?.name}</strong> لمدة شهر إضافي؟
          </p>
          
          {selectedOrg && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>الخطة الحالية:</strong> {selectedOrg.plan}
              </p>
              <p className="text-sm text-gray-700">
                <strong>التكلفة:</strong> ${SUBSCRIPTION_PLANS[selectedOrg.plan].price}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={confirmRenew}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              تأكيد التجديد
            </Button>
            <Button
              onClick={() => setShowRenewModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* نموذج تغيير الخطة */}
      <Modal
        isOpen={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        title="تغيير الخطة"
      >
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            اختر الخطة الجديدة لـ <strong>{selectedOrg?.name}</strong>
          </p>

          <div className="space-y-3">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === key
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(key)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500">{plan.interval}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${plan.price}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={confirmChangePlan}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!selectedPlan || selectedPlan === selectedOrg?.plan}
            >
              تأكيد التغيير
            </Button>
            <Button
              onClick={() => setShowChangePlanModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionManager;
