# دليل المطور - لوحة تحكم المطور المحدثة

## نظرة سريعة

تم تحديث لوحة تحكم المطور بنجاح لتشمل نظام المعرف الآمن المتطور. النظام الآن يوفر حماية أمنية عالية ومراقبة شاملة للمؤسسات والمعرفات.

## الملفات الرئيسية

| الملف | الوصف | الحالة |
|-------|--------|---------|
| `OrganizationsManager.jsx` | الملف الرئيسي المحدث | ✅ نشط |
| `OrganizationsManager_backup_*.jsx` | نسخة احتياطية من النسخة القديمة | 🗄️ أرشيف |
| `UPDATE_REPORT.md` | تقرير التحديث الشامل | 📄 توثيق |
| `TASK_SUMMARY.md` | ملخص إنجاز المهمة | 📋 ملخص |

## البدء السريع

### 1. تشغيل النظام
```bash
# تأكد من وجود جميع التبعيات
npm install

# تشغيل النظام
npm start
```

### 2. الوصول للوحة التحكم
- اذهب إلى `/admin/organizations`
- تأكد من تسجيل الدخول كمدير
- ستظهر لك التبويبات الجديدة

## الميزات الرئيسية

### 🔐 نظام المعرف الآمن
- توليد معرفات آمنة مشفرة
- إدارة الصلاحية والمتابعة
- مراقبة محاولات الوصول
- تنبيهات أمنية ذكية

### 📊 الإحصائيات والمراقبة
- إحصائيات فورية للمعرفات
- تتبع الاستخدام والأنشطة
- تنبيهات أمنية
- تقارير مفصلة

### 🎨 واجهة المستخدم
- تصميم متجاوب وحديث
- دعم كامل للغة العربية (RTL)
- نظام تبويبات منظم
- ألوان ورموز واضحة

## استخدام الوظائف

### للمطورين

#### توليد معرف آمن جديد
```javascript
// في جدول المؤسسات، اضغط "+ معرف جديد"
generateSecureCode(orgId, 'general');
```

#### عرض معرفات المؤسسة
```javascript
// اضغط "عرض الكل" لرؤية جميع معرفات المؤسسة
showOrganizationCodes(orgId);
```

#### مراقبة النظام
```javascript
// راجع تبويب "إحصائيات النظام"
loadSystemStats();
loadSecurityAlerts();
```

#### إدارة المعرفات
```javascript
// في جدول المعرفات الآمنة
copySecureCode(codeId, code);          // نسخ المعرف
deactivateSecureCode(codeId);          // إلغاء التفعيل
extendSecureCodeExpiry(codeId, 24);    // تمديد الصلاحية
deleteSecureCode(codeId);              // حذف المعرف
```

### للمستخدمين

#### إنشاء معرف جديد
1. اذهب إلى تبويب "إدارة المؤسسات"
2. اضغط "+ معرف جديد" بجانب المؤسسة
3. سيتم إنشاء معرف آمن تلقائياً

#### عرض وإدارة المعرفات
1. اضغط "عرض الكل" لرؤية معرفات المؤسسة
2. استخدم أزرار الإدارة لكل معرف:
   - **نسخ**: نسخ المعرف للحافظة
   - **تمديد**: إضافة 24 ساعة للصلاحية
   - **إلغاء تفعيل**: إيقاف المعرف مؤقتاً

#### مراقبة النظام
1. اذهب إلى تبويب "إحصائيات النظام"
2. راجع الإحصائيات العامة
3. تابع التنبيهات الأمنية

## الاستكشاف وحل المشاكل

### مشاكل شائعة

#### المعرفات لا تظهر
```javascript
// تأكد من تحميل البيانات
loadSecureCodes();
loadSystemStats();
```

#### أخطاء التشفير
```javascript
// تحقق من secureCodeService
import secureCodeService from '../../services/secureCodeService';
```

#### التنبيهات لا تعمل
```javascript
// تحقق من تحميل التنبيهات
loadSecurityAlerts();
```

### سجلات التطوير

#### إضافة معرف جديد
```javascript
// استخدام آمن
try {
  const result = secureCodeService.createInstitutionalCode(orgId, 'general');
  console.log('تم إنشاء المعرف:', result.codeId);
} catch (error) {
  console.error('خطأ:', error);
}
```

#### التحقق من المعرف
```javascript
const validation = secureCodeService.validateCode(code, orgId);
if (validation.isValid) {
  console.log('المعرف صحيح');
} else {
  console.log('خطأ:', validation.error);
}
```

## تطوير إضافي

### إضافة نوع معرف جديد
```javascript
// في secureCodeService.js
const labels = {
  general: 'عام',
  admin: 'إداري',
  user: 'مستخدم',
  api: 'API',
  custom: 'مخصص' // نوع جديد
};
```

### تخصيص الألوان
```javascript
// في OrganizationsManager.jsx
const getPlanBadge = (plan) => {
  const badges = {
    Basic: 'bg-blue-100 text-blue-700',
    Pro: 'bg-purple-100 text-purple-700',
    Enterprise: 'bg-orange-100 text-orange-700',
    Custom: 'bg-pink-100 text-pink-700' // لون جديد
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[plan]}`}>
      {plan}
    </span>
  );
};
```

### إضافة إحصائية جديدة
```javascript
// في loadSystemStats()
const stats = secureCodeService.getSystemStats();
setSystemStats({
  ...stats,
  customStats: 'قيمة جديدة' // إحصائية مخصصة
});
```

## الدعم والمساعدة

### روابط مفيدة
- [تقرير التحديث الشامل](./UPDATE_REPORT.md)
- [ملخص إنجاز المهمة](./TASK_SUMMARY.md)
- [خدمة المعرف الآمن](../../services/secureCodeService.js)

### الاتصال
لأي استفسارات أو مشاكل تقنية، راجع:
1. سجلات وحدة التحكم (Console)
2. ملف UPDATE_REPORT.md
3. خدمة secureCodeService.js

---

**تم التحديث**: 2025-10-31 03:33:04  
**الإصدار**: v2.0.0 - نظام المعرف الآمن  
**الحالة**: ✅ جاهز للاستخدام الإنتاجي