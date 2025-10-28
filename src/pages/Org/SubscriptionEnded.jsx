// ======================================
// Subscription Ended - صفحة انتهاء الاشتراك
// ======================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrganization, checkSubscriptionStatus } from '../../services/organizationService';
import { SUBSCRIPTION_PLANS } from '../../services/subscriptionService';
import Button from '../../components/Common/Button';

const SubscriptionEnded = () => {
  const { orgId } = useParams();
  const [organization, setOrganization] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    const org = getOrganization(orgId);
    setOrganization(org);
    
    const status = checkSubscriptionStatus(orgId);
    setSubscriptionStatus(status);
  }, [orgId]);

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (subscriptionStatus?.status === 'suspended') {
      return {
        title: 'تم تعليق الاشتراك',
        message: 'تم تعليق حسابك مؤقتاً. يرجى التواصل مع الإدارة.',
        icon: (
          <svg className="w-24 h-24 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        color: 'yellow'
      };
    } else if (subscriptionStatus?.status === 'expired') {
      return {
        title: 'انتهى الاشتراك',
        message: 'انتهت صلاحية اشتراكك. يرجى التجديد للاستمرار في استخدام النظام.',
        icon: (
          <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'red'
      };
    }
    return {
      title: 'غير متاح',
      message: 'النظام غير متاح حالياً.',
      icon: (
        <svg className="w-24 h-24 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      color: 'gray'
    };
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* رسالة انتهاء الاشتراك */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center">
            {statusInfo.icon}
            
            <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-4">
              {statusInfo.title}
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              {statusInfo.message}
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-right">
                <div>
                  <p className="text-sm text-gray-500">اسم المؤسسة</p>
                  <p className="font-medium text-gray-900">{organization.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الخطة الحالية</p>
                  <p className="font-medium text-gray-900">{organization.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                  <p className="font-medium text-gray-900">
                    {new Date(organization.subscriptionEnd).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <p className={`font-medium text-${statusInfo.color}-600`}>
                    {subscriptionStatus?.status === 'suspended' ? 'معلق' : 'منتهي'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <a
                href={`mailto:${organization.adminEmail}`}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                التواصل مع المسؤول
              </a>
              <Link
                to="/"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>

        {/* عرض خطط الاشتراك */}
        {subscriptionStatus?.status === 'expired' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">اختر خطة الاشتراك</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                <div
                  key={key}
                  className={`border-2 rounded-xl p-6 transition-all ${
                    organization.plan === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-900">${plan.price}</span>
                    <span className="text-gray-500">/{plan.interval}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      organization.plan === key
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {organization.plan === key ? 'الخطة الحالية' : 'اختيار الخطة'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>للتجديد أو الترقية، يرجى التواصل مع المسؤول على</p>
              <p className="font-medium text-blue-900 mt-1">{organization.adminEmail}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionEnded;
