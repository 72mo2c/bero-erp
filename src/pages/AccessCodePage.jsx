import React, { useState } from 'react';
import AccessCodeEntry from '../components/AccessCodeEntry';
import { useNavigate } from 'react-router-dom';

/**
 * صفحة إدخال المعرف الآمن
 * مثال كامل لاستخدام مكون AccessCodeEntry
 */
const AccessCodePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // معالجة إرسال المعرف الآمن
  const handleAccessCodeSubmit = async (code) => {
    setIsLoading(true);
    
    try {
      // محاكاة طلب API للتحقق من المعرف
      await new Promise(resolve => setTimeout(resolve, 1500)); // محاكاة تأخير الشبكة

      // قائمة بالمعرفات الآمنة الصالحة (للاختبار فقط)
      const validCodes = ['ADMIN', 'SECURE123', 'ACCESS2024', 'SAFE123'];
      
      if (validCodes.includes(code)) {
        // حفظ المعرف في التخزين المحلي
        localStorage.setItem('accessCode', code);
        localStorage.setItem('accessTime', new Date().toISOString());
        
        // إظهار رسالة نجاح
        alert('تم التحقق من المعرف الآمن بنجاح! سيتم توجيهك إلى النظام...');
        
        // التوجيه إلى لوحة التحكم
        navigate('/dashboard');
      } else {
        throw new Error('المعرف الآمن غير صحيح. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('خطأ في التحقق من المعرف:', error);
      throw error; // لإعادة عرض رسالة الخطأ في المكون
    } finally {
      setIsLoading(false);
    }
  };

  // اختبار المعرف الآمن
  const testCodes = [
    { code: 'ADMIN', description: 'معرف المدير' },
    { code: 'SECURE123', description: 'معرف آمن' },
    { code: 'ACCESS2024', description: 'معرف عام 2024' },
    { code: 'SAFE123', description: 'معرف آمن بسيط' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* المكون الرئيسي */}
      <AccessCodeEntry 
        onSubmit={handleAccessCodeSubmit}
        isLoading={isLoading}
        maxLength={8}
        placeholder="أدخل المعرف الآمن"
        title="إدخال المعرف الآمن"
        subtitle="يرجى إدخال المعرف الآمن للوصول إلى النظام"
      />

      {/* معلومات الاختبار (إزالة في الإنتاج) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">🔧 المعرفات الآمنة للاختبار:</h3>
          <div className="space-y-1">
            {testCodes.map((item, index) => (
              <div key={index} className="text-xs">
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-600">
                  {item.code}
                </span>
                <span className="text-gray-600 mr-2">- {item.description}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            انسخ أحد هذه المعرفات للاختبار
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessCodePage;