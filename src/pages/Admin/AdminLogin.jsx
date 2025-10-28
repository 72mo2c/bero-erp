// ======================================
// Admin Login - تسجيل دخول المطور
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Toast from '../../components/Common/Toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    secretAnswer: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: بيانات الدخول، 2: السؤال السري

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      // الخطوة الأولى: التحقق من اسم المستخدم وكلمة المرور
      setLoading(true);
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        setStep(2); // الانتقال للسؤال السري
        setLoading(false);
      } else {
        setError(result.message);
        setLoading(false);
      }
    } else {
      // الخطوة الثانية: التحقق من السؤال السري
      const correctAnswer = 'admin2025'; // الإجابة الصحيحة
      
      if (formData.secretAnswer.toLowerCase() === correctAnswer) {
        navigate('/dev-admin-control-2025-system-super-secret/dashboard');
      } else {
        setError('الإجابة السرية غير صحيحة');
        setStep(1); // العودة للخطوة الأولى
        setFormData({ username: '', password: '', secretAnswer: '' });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-4 rounded-2xl shadow-lg mb-4">
            <svg className="w-16 h-16 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            تسجيل الدخول الآمن
          </h1>
          <p className="text-blue-200">
            النظام المطور - وصول مقيد
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {step === 1 ? (
              <>
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
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border-r-4 border-green-500 p-4 rounded mb-4">
                  <p className="text-green-700 text-sm">تم التحقق من البيانات بنجاح</p>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    السؤال السري: ما هو رمز أمان النظام؟
                  </label>
                  <Input
                    type="text"
                    name="secretAnswer"
                    value={formData.secretAnswer}
                    onChange={handleChange}
                    placeholder="أدخل الإجابة السرية"
                    required
                    className="w-full text-center"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    أدخل رمز الأمان الخاص بالمطورين
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'جاري التحقق...' : (step === 1 ? 'التالي' : 'تسجيل الدخول')}
            </Button>
          </form>

          {step === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>المطور الافتراضي</p>
              <p className="mt-2 font-mono text-xs">
                Username: <span className="text-blue-900">superadmin</span>
                <br />
                Password: <span className="text-blue-900">admin@2025</span>
                <br />
                Secret: <span className="text-blue-900">admin2025</span>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFormData({ username: '', password: '', secretAnswer: '' });
                  setError('');
                }}
                className="text-blue-900 hover:text-blue-700 text-sm"
              >
                العودة للخلف
              </button>
            </div>
          )}
        </div>

        {/* تنبيه الأمان */}
        <div className="mt-6 text-center">
          <div className="bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-200 text-sm font-medium">
              وصول مقيد ومقيّد
            </p>
            <p className="text-yellow-300 text-xs mt-1">
              يتطلب بيانات دخول موثقة + رمز أمان سري
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
