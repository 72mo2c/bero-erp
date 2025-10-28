// ======================================
// Custom Login - تسجيل دخول مخصص للمؤسسات
// ======================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrganization, checkSubscriptionStatus } from '../../services/organizationService';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const CustomLogin = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // تحميل بيانات المؤسسة
    const org = getOrganization(orgId);
    if (!org) {
      navigate('/');
      return;
    }

    // التحقق من حالة الاشتراك
    const subStatus = checkSubscriptionStatus(orgId);
    if (!subStatus.valid) {
      navigate(`/org/${orgId}/subscription-ended`);
      return;
    }

    setOrganization(org);
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate(`/org/${orgId}/dashboard`);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  const primaryColor = organization.customization?.primaryColor || '#1e3a8a';
  const systemName = organization.customization?.systemName || 'Bero System';
  const logo = organization.customization?.logo;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ 
           background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)` 
         }}>
      <div className="max-w-md w-full">
        {/* شعار وعنوان المؤسسة */}
        <div className="text-center mb-8">
          {logo ? (
            <img src={logo} alt={organization.name} className="h-20 mx-auto mb-4" />
          ) : (
            <div className="inline-block p-4 rounded-2xl shadow-lg mb-4"
                 style={{ backgroundColor: primaryColor }}>
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {organization.name}
          </h1>
          <p className="text-gray-600">{systemName}</p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: primaryColor }}>
            تسجيل الدخول
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                اسم المستخدم
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="أدخل اسم المستخدم"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="أدخل كلمة المرور"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: primaryColor,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>الخطة: <span className="font-medium" style={{ color: primaryColor }}>
                {organization.plan}
              </span></p>
              <p className="mt-1">
                تنتهي في: {new Date(organization.subscriptionEnd).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>بيانات الدخول الافتراضية</p>
            <p className="mt-2 font-mono text-xs">
              Username: <span style={{ color: primaryColor }}>admin</span>
              <br />
              Password: <span style={{ color: primaryColor }}>admin123</span>
            </p>
          </div>
        </div>

        {/* روابط مساعدة */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            تحتاج مساعدة؟ تواصل مع الدعم الفني
          </p>
          <p className="text-gray-500 text-xs mt-2">
            {organization.adminEmail}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomLogin;
