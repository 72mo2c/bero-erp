// ======================================
// Login Page - صفحة تسجيل الدخول
// ======================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import { FaUser, FaLock, FaShieldAlt, FaEye, FaEyeSlash, FaWarehouse, FaChartLine, FaBox } from 'react-icons/fa';
import { resetSystemUsers, checkUsersIntegrity } from '../../utils/systemReset';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // تحميل دوال المساعدة في Window للوصول من Console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resetSystemUsers = resetSystemUsers;
      window.checkUsersIntegrity = checkUsersIntegrity;
      
      // التحقق من سلامة البيانات عند تحميل الصفحة
      const integrity = checkUsersIntegrity();
      console.log('🔍 فحص سلامة البيانات:', integrity);
      
      if (integrity.needsReset) {
        console.warn('⚠️ بيانات المستخدمين تحتاج إعادة تعيين!');
        console.log('🔧 لإعادة التعيين، اكتب في Console: resetSystemUsers()');
      }
      
      console.log('🛠️ دوال المساعدة متاحة:');
      console.log('  - resetSystemUsers() - إعادة تعيين بيانات المستخدمين');
      console.log('  - checkUsersIntegrity() - فحص سلامة البيانات');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔐 محاولة تسجيل الدخول...', { username: formData.username });

    try {
      const result = await login(formData.username, formData.password);
      
      console.log('📊 نتيجة تسجيل الدخول:', result);
      
      if (result.success) {
        showSuccess(result.message);
        console.log('✅ تسجيل دخول ناجح!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        showError(result.message);
        console.log('❌ فشل تسجيل الدخول:', result.message);
      }
    } catch (error) {
      console.error('💥 خطأ في تسجيل الدخول:', error);
      showError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Circle */}
        <div className="absolute w-96 h-96 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full -top-48 -right-48 opacity-20 animate-pulse"></div>
        
        {/* Bottom Left Circle */}
        <div className="absolute w-80 h-80 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full -bottom-40 -left-40 opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Center Floating Elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-orange-200 rounded-lg opacity-20 transform rotate-45 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 right-32 w-20 h-20 bg-orange-300 rounded-full opacity-15 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Decorative Icons */}
        <div className="absolute top-1/4 right-1/4 opacity-5">
          <FaWarehouse className="text-orange-600" size={100} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-5">
          <FaChartLine className="text-orange-600" size={80} />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-sm border border-orange-100">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
              
              {/* Logo Container */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <FaBox className="text-5xl" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Bero System
              </span>
            </h1>
            <p className="text-gray-600 font-medium text-lg">نظام إدارة المخازن المتكامل</p>
            
            {/* Features Icons */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <FaWarehouse className="text-xl" />
                </div>
                <span className="text-xs text-gray-500 mt-1">المخازن</span>
              </div>
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <FaChartLine className="text-xl" />
                </div>
                <span className="text-xs text-gray-500 mt-1">التقارير</span>
              </div>
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <FaShieldAlt className="text-xl" />
                </div>
                <span className="text-xs text-gray-500 mt-1">الأمان</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="أدخل اسم المستخدم"
                  required
                  className="w-full pr-12 pl-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="w-full pr-12 pl-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-gray-50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaShieldAlt />
                  تسجيل الدخول
                </span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 rounded-xl border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100/50">
            <div className="flex items-center justify-center gap-2 text-orange-700">
              <FaShieldAlt className="text-xl" />
              <p className="text-sm font-semibold">نظام آمن ومحمي بالكامل</p>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              يرجى استخدام بيانات الاعتماد الخاصة بك للدخول
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            تم التطوير بواسطة 
            <span className="font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Biruni Soft
            </span>
          </p>
          <p className="mt-2 text-gray-500">&copy; 2025 Biruni Soft - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
