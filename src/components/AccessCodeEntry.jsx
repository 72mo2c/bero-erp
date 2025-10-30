import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaShield, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

/**
 * مكون إدخال المعرف الآمن
 * مكون React بسيط وأنيق لإدخال المعرف الآمن مع دعم RTL
 */
const AccessCodeEntry = ({ 
  onSubmit, 
  isLoading = false, 
  maxLength = 8,
  placeholder = "أدخل المعرف الآمن",
  title = "إدخال المعرف الآمن",
  subtitle = "يرجى إدخال المعرف الآمن للوصول إلى النظام"
}) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // التحقق من صحة المعرف
  const validateCode = (value) => {
    const newErrors = {};
    
    if (!value) {
      newErrors.code = 'يرجى إدخال المعرف الآمن';
    } else if (value.length < 4) {
      newErrors.code = 'المعرف الآمن يجب أن يكون 4 أحرف على الأقل';
    } else if (!/^[A-Za-z0-9]+$/.test(value)) {
      newErrors.code = 'المعرف الآمن يجب أن يحتوي على أحرف وأرقام فقط';
    }
    
    return newErrors;
  };

  // معالجة تغيير المعرف
  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, '');
    setCode(value);
    
    // إزالة الأخطاء عند الكتابة
    if (errors.code) {
      setErrors({});
    }
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateCode(code);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (onSubmit) {
        await onSubmit(code);
      }
    } catch (error) {
      setErrors({ submit: 'حدث خطأ أثناء التحقق من المعرف الآمن' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // تأثيرات بصرية للمعرف
  const getCodeStrength = () => {
    if (code.length === 0) return 0;
    if (code.length < 4) return 1;
    if (code.length < 6) return 2;
    return 3;
  };

  const strengthLevels = [
    { color: 'bg-red-500', text: 'ضعيف' },
    { color: 'bg-yellow-500', text: 'متوسط' },
    { color: 'bg-blue-500', text: 'جيد' },
    { color: 'bg-green-500', text: 'قوي' }
  ];

  const strength = getCodeStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* بطاقة المعرف الآمن */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          
          {/* الهيدر */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <FaShield className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{subtitle}</p>
          </div>

          {/* نموذج الإدخال */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* حقل المعرف */}
            <div className="relative">
              <label htmlFor="access-code" className="block text-sm font-semibold text-gray-700 mb-2">
                المعرف الآمن
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                
                <input
                  id="access-code"
                  type={showCode ? "text" : "password"}
                  value={code}
                  onChange={handleCodeChange}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  className={`
                    w-full pr-10 pl-10 py-3 border-2 rounded-xl text-center font-mono text-lg
                    transition-all duration-200 focus:outline-none focus:ring-2
                    ${errors.code 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                    }
                    ${code ? 'bg-gray-50' : 'bg-white'}
                  `}
                  dir="ltr"
                />
                
                {/* زر إظهار/إخفاء المعرف */}
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCode ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>

              {/* رسالة الخطأ */}
              {errors.code && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <FaExclamationCircle className="ml-2 h-4 w-4" />
                  <span>{errors.code}</span>
                </div>
              )}
            </div>

            {/* شريط قوة المعرف */}
            {code && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">قوة المعرف</span>
                  <span className={`text-xs font-semibold ${strength > 0 ? strengthLevels[strength - 1].color.replace('bg-', 'text-') : 'text-gray-400'}`}>
                    {strength > 0 ? strengthLevels[strength - 1].text : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${strength > 0 ? strengthLevels[strength - 1].color : 'bg-gray-200'}`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* زر التحقق */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`
                w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200
                flex items-center justify-center space-x-2 space-x-reverse
                ${(isSubmitting || isLoading)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="h-5 w-5" />
                  <span>التحقق والدخول</span>
                </>
              )}
            </button>

            {/* رسالة الخطأ العامة */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
                <FaExclamationCircle className="ml-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}
          </form>

          {/* معلومات إضافية */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>• المعرف الآمن يجب أن يكون 4-8 أحرف</p>
              <p>• يُسمح بالأحرف والأرقام فقط</p>
            </div>
          </div>
        </div>

        {/* معلومات إضافية في الأسفل */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            محمي بأعلى معايير الأمان
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeEntry;

/**
 * مثال للاستخدام:
 * 
 * import React from 'react';
 * import AccessCodeEntry from './components/AccessCodeEntry';
 * 
 * function App() {
 *   const handleAccessCodeSubmit = async (code) => {
 *     try {
 *       // محاكاة طلب API للتحقق من المعرف
 *       const response = await fetch('/api/verify-access-code', {
 *         method: 'POST',
 *         headers: {
 *           'Content-Type': 'application/json',
 *         },
 *         body: JSON.stringify({ code }),
 *       });
 * 
 *       const result = await response.json();
 * 
 *       if (result.success) {
 *         // التوجيه إلى الصفحة الرئيسية أو حفظ المعرف
 *         localStorage.setItem('accessCode', code);
 *         window.location.href = '/dashboard';
 *       } else {
 *         throw new Error(result.message || 'معرف غير صحيح');
 *       }
 *     } catch (error) {
 *       console.error('خطأ في التحقق من المعرف:', error);
 *       throw error; // لإعادة عرض رسالة الخطأ
 *     }
 *   };
 *
 *   return (
 *     <div className="App">
 *       <AccessCodeEntry 
 *         onSubmit={handleAccessCodeSubmit}
 *         maxLength={8}
 *         placeholder="أدخل المعرف الآمن"
 *         title="إدخال المعرف الآمن"
 *         subtitle="يرجى إدخال المعرف الآمن للوصول إلى النظام"
 *       />
 *     </div>
 *   );
 * }
 * 
 * export default App;
 */