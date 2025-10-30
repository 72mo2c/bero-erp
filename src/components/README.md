# مكون إدخال المعرف الآمن (AccessCodeEntry)

## نظرة عامة
مكون React أنيق ومتجاوب لإدخال المعرف الآمن مع دعم كامل للغة العربية واتجاه RTL.

## الميزات

### 🎨 التصميم
- تصميم متجاوب باستخدام Tailwind CSS
- دعم كامل لاتجاه RTL للعناصر العربية
- ألوان وخطوط مناسبة للواجهة العربية
- تأثيرات بصرية جذابة وتفاعلية

### 🔒 الأمان والتحقق
- التحقق من صحة المعرف (طول، تنسيق)
- إخفاء/إظهار المعرف
- شريط قوة المعرف
- رسائل خطأ ونجاح واضحة

### 📱 التفاعل
- حالات تحميل أثناء التحقق
- تأثيرات بصرية عند التفاعل
- رسائل تحميل واضحة
- دعم التعطيل أثناء المعالجة

## التثبيت والتبعيات

```bash
# تثبيت react-icons إذا لم يكن مثبتاً
npm install react-icons
```

## الاستخدام

### الاستخدام الأساسي

```jsx
import React from 'react';
import AccessCodeEntry from './components/AccessCodeEntry';

function App() {
  const handleAccessCodeSubmit = async (code) => {
    try {
      const response = await fetch('/api/verify-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('accessCode', code);
        window.location.href = '/dashboard';
      } else {
        throw new Error(result.message || 'معرف غير صحيح');
      }
    } catch (error) {
      console.error('خطأ في التحقق من المعرف:', error);
      throw error;
    }
  };

  return (
    <AccessCodeEntry 
      onSubmit={handleAccessCodeSubmit}
      maxLength={8}
      placeholder="أدخل المعرف الآمن"
      title="إدخال المعرف الآمن"
      subtitle="يرجى إدخال المعرف الآمن للوصول إلى النظام"
    />
  );
}
```

### الاستخدام المتقدم

```jsx
import React, { useState } from 'react';
import AccessCodeEntry from './components/AccessCodeEntry';

function AdvancedExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccessCodeSubmit = async (code) => {
    setIsLoading(true);
    
    try {
      // منطق التحقق المخصص
      const isValid = await validateAccessCode(code);
      
      if (isValid) {
        // حفظ المعرف والتوجيه
        localStorage.setItem('accessCode', code);
        localStorage.setItem('accessTime', new Date().toISOString());
        
        // رسالة نجاح
        alert('تم التحقق من المعرف الآمن بنجاح!');
        
        // التوجيه
        window.location.href = '/dashboard';
      } else {
        throw new Error('المعرف غير صحيح');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccessCodeEntry 
      onSubmit={handleAccessCodeSubmit}
      isLoading={isLoading}
      maxLength={6}
      placeholder="أدخل رمز الأمان"
      title="أمان النظام"
      subtitle="هذا النظام محمي برمز أمان خاص"
    />
  );
}
```

## الخصائص (Props)

| الخاصية | النوع | افتراضي | الوصف |
|---------|------|---------|--------|
| `onSubmit` | `function` | مطلوبة | دالة تُستدعى عند إرسال المعرف |
| `isLoading` | `boolean` | `false` | حالة التحميل |
| `maxLength` | `number` | `8` | الطول الأقصى للمعرف |
| `placeholder` | `string` | "أدخل المعرف الآمن" | نص التوضيح |
| `title` | `string` | "إدخال المعرف الآمن" | عنوان المكون |
| `subtitle` | `string` | "يرجى إدخال المعرف الآمن للوصول إلى النظام" | العنوان الفرعي |

## التخصيص

### تخصيص الألوان
```jsx
// يمكن تخصيص الألوان عبر Tailwind CSS classes
// المكون يستخدم الفئات التالية:
// - from-blue-500 to-purple-600 (الألوان الأساسية)
// - border-red-300 (ألوان الخطأ)
// - focus:border-blue-500 (ألوان التركيز)
```

### تخصيص التحقق
```jsx
// تعديل دالة validateCode في المكون
const validateCode = (value) => {
  const newErrors = {};
  
  // قواعد التحقق المخصصة
  if (!value) {
    newErrors.code = 'المعرف مطلوب';
  } else if (value.length < 6) {
    newErrors.code = 'المعرف يجب أن يكون 6 أحرف على الأقل';
  }
  
  return newErrors;
};
```

## الملفات المرفقة

1. **AccessCodeEntry.jsx** - المكون الرئيسي
2. **AccessCodePage.jsx** - صفحة مثال للاستخدام
3. **README.md** - دليل الاستخدام (هذا الملف)

## المتطلبات

- React 16.8+
- React Router (للتحويل بين الصفحات)
- Tailwind CSS (للتصميم)
- react-icons (للأيقونات)

## الأمان

### إرشادات الأمان
- استخدم HTTPS دائماً في الإنتاج
- لا تحفظ المعرفات الآمنة في التخزين المحلي في الإنتاج
- استخدم خوارزميات تشفير قوية
- تأكد من انتهاء صلاحية المعرفات

### اختبار الأمان
```jsx
// مثال لاختبار الأمان
const validateAccessCode = async (code) => {
  // لا تستخدم هذا في الإنتاج
  const validCodes = ['ADMIN', 'SECURE123'];
  return validCodes.includes(code);
};
```

## المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الدعم

للحصول على الدعم أو الإبلاغ عن الأخطاء، يرجى فتح issue في المستودع.

---

تم إنشاء هذا المكون ليكون بسيطاً وقابلاً للتخصيص مع دعم كامل للغة العربية.