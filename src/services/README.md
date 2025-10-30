# خدمة إدارة المعرفات الآمنة

## نظرة عامة

خدمة إدارة المعرفات الآمنة هي نظام شامل لإدارة المعرفات والتشفير مع مراقبة الاستخدام والأمان المتقدم. توفر هذه الخدمة وظائف متكاملة لتوليد المعرفات المشفرة والتحقق من صحتها وإدارة دورة حياتها.

## المميزات الرئيسية

### 🔐 التشفير والأمان
- **تشفير AES-256**: حماية قوية للبيانات الحساسة
- **Hashing SHA-256**: حفظ آمن للمعرفات
- **Rate Limiting**: حماية من هجمات Brute Force
- **تحليل قوة المعرفات**: فحص قوة وأمان المعرفات

### ⚙️ إدارة المعرفات
- توليد معرفات آمنة عشوائية
- ربط المعرفات بالمؤسسات
- إدارة دورة حياة المعرفات
- نظام انتهاء الصلاحية التلقائي
- حد الاستخدام الأقصى

### 📊 المراقبة والإحصائيات
- تسجيل جميع النشاطات
- مراقبة أنماط الاستخدام
- تنبيهات أمنية ذكية
- إحصائيات شاملة للنظام

### 🔍 البحث والفلترة
- البحث المتقدم في المعرفات
- فلترة حسب المعايير المختلفة
- تقارير مفصلة

## التثبيت والإعداد

### المتطلبات
- Node.js (الإصدار 14 أو أحدث)
- npm أو yarn

### التثبيت
```bash
# نسخ ملفات الخدمة
cp secureCodeService.js your-project/src/services/
cp secureCodeService.test.js your-project/src/services/tests/
```

### الإعداد الأولي
```javascript
const secureCodeService = require('./services/secureCodeService');

// إنشاء متغيرات البيئة للمفتاح السري
process.env.SECURE_CODE_SECRET = 'your-secret-key-here';

// أو استخدام المفتاح المولد تلقائياً
const secretKey = secureCodeService.generateSecretKey();
```

## الاستخدام

### توليد المعرفات

#### توليد معرف آمن بسيط
```javascript
const code = secureCodeService.generateSecureCode();
console.log('المعرف الآمن:', code);
```

#### توليد معرف مخصص
```javascript
const customCode = secureCodeService.generateSecureCode(16, {
    includeSpecialChars: true,
    includeNumbers: true,
    includeUpperCase: true,
    includeLowerCase: true,
    customChars: 'ABC123' // أحرف إضافية
});

console.log('المعرف المخصص:', customCode);
```

#### فحص قوة المعرف
```javascript
const code = 'MySecurePass123!';
const validation = secureCodeService.validateCodeStrength(code);

console.log('صالح:', validation.isValid);
console.log('القوة:', validation.strength);
console.log('الأخطاء:', validation.errors);
```

### إدارة المعرفات المؤسسية

#### إنشاء معرف مؤسسي
```javascript
const codeResult = secureCodeService.createInstitutionalCode(
    'INST_12345', // معرف المؤسسة
    'admin',      // نوع المعرف
    'CustomCode123!' // معرف مخصص (اختياري)
);

console.log('معرف المعرف:', codeResult.codeId);
console.log('المعرف الفعلي:', codeResult.code);
console.log('ينتهي في:', new Date(codeResult.expiresAt));
```

#### التحقق من المعرف
```javascript
const validation = secureCodeService.validateCode(code, 'INST_12345');

if (validation.isValid) {
    console.log('المعرف صحيح');
    console.log('معرف المؤسسة:', validation.codeData.institutionId);
    console.log('النوع:', validation.codeData.type);
    console.log('عداد الاستخدام:', validation.codeData.usageCount);
} else {
    console.log('خطأ:', validation.error);
}
```

#### تحديث حالة المعرف
```javascript
// إيقاف تفعيل المعرف
secureCodeService.deactivateCode(codeId);

// تمديد الصلاحية لمدة 48 ساعة
secureCodeService.extendCodeExpiry(codeId, 48);

// حذف المعرف نهائياً
secureCodeService.deleteCode(codeId);
```

### المراقبة والإحصائيات

#### الحصول على إحصائيات المعرف
```javascript
const stats = secureCodeService.getCodeStats(codeId);

console.log('المعرف نشط:', stats.isActive);
console.log('المعرف منتهي:', stats.isExpired);
console.log('الوقت المتبقي:', stats.timeUntilExpiry);
console.log('نسبة الاستخدام:', stats.usagePercentage + '%');
```

#### البحث في المعرفات
```javascript
// البحث حسب المؤسسة
const institutionCodes = secureCodeService.searchCodes({
    institutionId: 'INST_12345'
});

// البحث حسب النوع والنشاط
const adminCodes = secureCodeService.searchCodes({
    type: 'admin',
    isActive: true,
    isExpired: false
});

// البحث المركب
const filteredCodes = secureCodeService.searchCodes({
    institutionId: 'INST_12345',
    type: 'admin',
    isActive: true
});
```

#### إحصائيات النظام
```javascript
const systemStats = secureCodeService.getSystemStats();

console.log('إجمالي المعرفات:', systemStats.totalCodes);
console.log('المعرفات النشطة:', systemStats.activeCodes);
console.log('المعرفات منتهية الصلاحية:', systemStats.expiredCodes);
console.log('المحاولات الناجحة (24 ساعة):', systemStats.uniqueSuccessfulAttempts24h);
console.log('المحاولات الفاشلة (24 ساعة):', systemStats.failedAttempts24h);
console.log('التنبيهات غير المقروءة:', systemStats.unreadAlerts);
```

### إدارة التنبيهات الأمنية

#### الحصول على التنبيهات
```javascript
// جميع التنبيهات
const allAlerts = secureCodeService.getAlerts();

// التنبيهات غير المقروءة فقط
const unreadAlerts = secureCodeService.getAlerts(true);

// تحديد التنبيه كمقروء
secureCodeService.markAlertAsRead(alertId);
```

### البيانات والاستيراد/التصدير

#### تصدير البيانات
```javascript
const data = secureCodeService.exportData();

// حفظ في ملف
const fs = require('fs');
fs.writeFileSync('backup.json', JSON.stringify(data, null, 2));
```

#### استيراد البيانات
```javascript
const fs = require('fs');
const backupData = JSON.parse(fs.readFileSync('backup.json', 'utf8'));

const result = secureCodeService.importData(backupData);
console.log('تم الاستيراد بنجاح:', result);
```

### تنظيف النظام

#### حذف المعرفات منتهية الصلاحية
```javascript
const cleanedCount = secureCodeService.cleanupExpiredCodes();
console.log(`تم حذف ${cleanedCount} معرف منتهي الصلاحية`);
```

## إعدادات الأمان

### التخصيص
```javascript
// تخصيص إعدادات الخدمة
secureCodeService.config = {
    maxAttempts: 5,              // عدد المحاولات القصوى
    lockoutDuration: 15 * 60 * 1000, // مدة الإقفال (بالميللي ثانية)
    codeExpiryHours: 24,         // انتهاء الصلاحية (بالساعات)
    minCodeLength: 8,           // الحد الأدنى لطول المعرف
    maxCodeLength: 64,          // الحد الأقصى لطول المعرف
    requireSpecialChars: true,   // يتطلب أحرف خاصة
    requireNumbers: true,        // يتطلب أرقام
    requireUpperCase: true       // يتطلب أحرف كبيرة
};
```

## معالجة الأخطاء

### أمثلة على معالجة الأخطاء
```javascript
try {
    const code = secureCodeService.generateSecureCode();
    console.log('تم إنشاء المعرف بنجاح:', code);
} catch (error) {
    console.error('خطأ في إنشاء المعرف:', error.message);
}

try {
    const result = secureCodeService.createInstitutionalCode('INST_123', 'admin');
} catch (error) {
    console.error('خطأ في إنشاء المعرف المؤسسي:', error.message);
}

// التحقق من نتائج التحقق
const validation = secureCodeService.validateCode('test_code');

if (validation.rateLimited) {
    console.log('المعرف محظور مؤقتاً:', validation.error);
} else if (!validation.isValid) {
    console.log('المعرف غير صحيح:', validation.error);
} else {
    console.log('المعرف صحيح');
}
```

## اختبار النظام

### تشغيل الاختبارات
```bash
node secureCodeService.test.js
```

### اختبار محدد
```javascript
const { testEncryption, testCodeGeneration } = require('./secureCodeService.test');

// تشغيل اختبار التشفير
testEncryption();

// اختبار توليد المعرفات
testCodeGeneration();

// تشغيل جميع الاختبارات
const { runFullSystemTest } = require('./secureCodeService.test');
runFullSystemTest();
```

## أفضل الممارسات

### الأمان
1. **استخدم متغيرات البيئة للمفاتيح السرية**
2. **فعّل Rate Limiting في الإنتاج**
3. **راقب التنبيهات الأمنية بانتظام**
4. **قم بعمل نسخ احتياطية منتظمة**

### الأداء
1. **قم بتنظيف المعرفات منتهية الصلاحية دورياً**
2. **استخدم البحث مع الفلاتر لتوفير الأداء**
3. **راقب حجم سجلات الاستخدام**

### إدارة البيانات
1. **حدد حد استخدام للمعرفات الحساسة**
2. **استخدم أسماء واضحة للمؤسسات والأنواع**
3. **سجل النشاطات المهمة للمراجعة**

## الإعدادات الموصى بها للإنتاج

```javascript
const productionConfig = {
    maxAttempts: 3,              // محاولات أقل في الإنتاج
    lockoutDuration: 30 * 60 * 1000, // إقال أطول (30 دقيقة)
    codeExpiryHours: 12,         // انتهاء صلاحية أقصر
    requireSpecialChars: true,   // متطلبات أمان أقوى
    requireNumbers: true,
    requireUpperCase: true,
    minCodeLength: 12           // طول أكبر للمعرفات
};
```

## الدعم والمساعدة

للمساعدة أو الإبلاغ عن المشاكل:
- راجع ملفات الاختبار للأمثلة
- فعّل وضع التسجيل للمراقبة
- راجع سجلات التنبيهات الأمنية

## التحديثات المستقبلية

المميزات المخططة:
- تكامل مع قواعد البيانات الخارجية
- دعم للمصادقة الثنائية
- واجهة ويب للإدارة
- تقارير متقدمة
- API RESTful

---

**تم التطوير**: 2025-10-31
**النسخة**: 1.0.0
**المؤلف**: فريق التطوير