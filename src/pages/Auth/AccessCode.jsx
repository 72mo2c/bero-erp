// ======================================
// AccessCode - صفحة إدخال المعرف الآمن
// ======================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSecureCode } from '../../context/SecureCodeContext';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';

const AccessCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [codeId, setCodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info'); // info, success, error

  const { useSecureCode, loading: contextLoading } = useSecureCode();

  // معالجة رسالة إعادة التوجيه
  useEffect(() => {
    if (location.state?.reason) {
      const reason = location.state.reason;
      const messages = {
        invalid_session: {
          type: 'error',
          text: 'انتهت صلاحية الجلسة. يرجى إعادة إدخال المعرف'
        },
        insufficient_permission: {
          type: 'warning',
          text: 'المعرف الحالي لا يحتوي على الصلاحيات المطلوبة'
        },
        session_expired: {
          type: 'error',
          text: 'انتهت صلاحية المعرف الآمن'
        }
      };

      if (messages[reason]) {
        setMessageType(messages[reason].type);
        setMessage(messages[reason].text);
      }
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codeId.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await useSecureCode(codeId.trim());

      if (result.valid) {
        setMessageType('success');
        setMessage('تم تفعيل المعرف بنجاح! جاري التوجيه...');

        // التوجيه إلى الصفحة المطلوبة أو الصفحة الرئيسية
        setTimeout(() => {
          const redirectTo = location.state?.from || '/dashboard';
          navigate(redirectTo, { replace: true });
        }, 1500);

      } else {
        setMessageType('error');
        
        const errorMessages = {
          expired: 'انتهت صلاحية هذا المعرف',
          exceeded: 'تم تجاوز عدد مرات الاستخدام المسموحة',
          invalid: 'المعرف غير صحيح أو غير موجود'
        };

        setMessage(errorMessages[result.status] || result.message || 'خطأ غير معروف');
      }

    } catch (error) {
      setMessageType('error');
      setMessage('حدث خطأ أثناء التحقق من المعرف');
      console.error('خطأ في استخدام المعرف:', error);

    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    setCodeId(e.target.value.toUpperCase()); // تحويل إلى أحرف كبيرة
    setMessage(null); // مسح الرسالة عند الكتابة
  };

  // أمثلة على المعرفات للاختبار
  const demoCodes = [
    { id: 'ACCESS2025', name: 'معرف الوصول العام', description: 'للوصول للواجهة الأساسية' },
    { id: 'FOUNDER2025', name: 'معرف المؤسسين', description: 'للوصول الكامل للنظام' }
  ];

  const fillDemoCode = (code) => {
    setCodeId(code.id);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl shadow-lg mb-4" style={{ backgroundColor: '#1e3a8a' }}>
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bero System</h1>
          <p className="text-gray-600">إدخال المعرف الآمن</p>
        </div>

        {/* Access Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#1e3a8a' }}>
            أدخل المعرف الآمن
          </h2>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
              messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
              messageType === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
              'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {messageType === 'success' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {messageType === 'error' && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {(messageType === 'warning' || messageType === 'info') && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                المعرف الآمن
              </label>
              <Input
                type="text"
                name="codeId"
                value={codeId}
                onChange={handleCodeChange}
                placeholder="أدخل المعرف الآمن (مثال: ACCESS2025)"
                required
                className="w-full text-center text-lg font-mono tracking-wider"
                disabled={loading || contextLoading}
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-2">
                أدخل المعرف الآمن الذي حصلت عليه من مدير النظام
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || contextLoading || !codeId.trim()}
              className="w-full text-white py-3 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: '#1e3a8a',
                opacity: (loading || contextLoading || !codeId.trim()) ? 0.7 : 1
              }}
            >
              {(loading || contextLoading) ? 'جاري التحقق...' : 'تفعيل المعرف'}
            </Button>
          </form>

          {/* Demo Codes */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">معرفات تجريبية:</h4>
            <div className="space-y-2">
              {demoCodes.map((code) => (
                <button
                  key={code.id}
                  onClick={() => fillDemoCode(code)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading || contextLoading}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{code.name}</p>
                      <p className="text-xs text-gray-600">{code.description}</p>
                    </div>
                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {code.id}
                    </code>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              انقر على أي معرف لتعبئته تلقائياً
            </p>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">تحتاج مساعدة؟</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• تأكد من كتابة المعرف بشكل صحيح</li>
              <li>• المعرف حساس لحالة الأحرف</li>
              <li>• تحقق من عدم انتهاء صلاحية المعرف</li>
              <li>• تواصل مع مدير النظام إذا استمرت المشكلة</li>
            </ul>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              العودة لصفحة تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>&copy; 2025 Bero System. نظام الوصول الآمن</p>
        </div>
      </div>
    </div>
  );
};

export default AccessCode;