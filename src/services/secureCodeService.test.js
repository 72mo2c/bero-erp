/**
 * اختبارات خدمة إدارة المعرفات الآمنة
 * Tests for Secure Code Management Service
 */

const secureCodeService = require('./secureCodeService');

// دوال مساعدة للاختبارات
function assert(condition, message) {
    if (!condition) {
        throw new Error(`فشل الاختبار: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`فشل الاختبار: ${message}. المتوقع: ${expected}, الفعلي: ${actual}`);
    }
}

function assertNotNull(value, message) {
    if (value === null || value === undefined) {
        throw new Error(`فشل الاختبار: ${message}`);
    }
}

// اختبارات التشفير
function testEncryption() {
    console.log('🔐 اختبار التشفير...');
    
    const originalText = 'test message';
    const encrypted = secureCodeService.encrypt(originalText);
    
    assert(encrypted !== originalText, 'التشفير يجب أن ينتج نص مختلف');
    assert(encrypted.includes(':'), 'النص المشفر يجب أن يحتوي على فاصل');
    
    const decrypted = secureCodeService.decrypt(encrypted);
    assertEqual(decrypted, originalText, 'فك التشفير يجب أن يعيد النص الأصلي');
    
    console.log('✅ اختبار التشفير نجح');
}

// اختبارات توليد المعرفات
function testCodeGeneration() {
    console.log('🆔 اختبار توليد المعرفات...');
    
    // اختبار المعرف الآمن
    const secureCode = secureCodeService.generateSecureCode();
    assert(secureCode.length >= 8, 'المعرف الآمن يجب أن يكون 8 أحرف على الأقل');
    
    // اختبار قوة المعرف
    const validation = secureCodeService.validateCodeStrength(secureCode);
    assert(validation.isValid, 'المعرف المولد يجب أن يكون صالح');
    assert(['متوسط', 'قوي', 'قوي جداً'].includes(validation.strength), 
           'قوة المعرف يجب أن تكون مقبولة');
    
    // اختبار المعرفات المخصصة
    const customCode = secureCodeService.generateSecureCode(12, {
        includeSpecialChars: false,
        includeNumbers: true
    });
    assert(customCode.length === 12, 'طول المعرف المخصص يجب أن يكون صحيح');
    
    console.log('✅ اختبار توليد المعرفات نجح');
}

// اختبارات إدارة المعرفات
function testCodeManagement() {
    console.log('⚙️ اختبار إدارة المعرفات...');
    
    // إنشاء معرف مؤسسي
    const institutionId = 'INST_123';
    const codeType = 'admin';
    
    const codeResult = secureCodeService.createInstitutionalCode(institutionId, codeType);
    assertNotNull(codeResult.codeId, 'يجب إرجاع معرف فريد');
    assertNotNull(codeResult.code, 'يجب إرجاع المعرف الفعلي');
    assertNotNull(codeResult.encryptedData, 'يجب إرجاع البيانات المشفرة');
    
    const codeId = codeResult.codeId;
    
    // التحقق من صحة المعرف
    const validation = secureCodeService.validateCode(codeResult.code, institutionId);
    assert(validation.isValid, 'المعرف الجديد يجب أن يكون صالح');
    assertEqual(validation.codeData.institutionId, institutionId, 'معرف المؤسسة يجب أن يكون صحيح');
    
    // الحصول على إحصائيات المعرف
    const stats = secureCodeService.getCodeStats(codeId);
    assertNotNull(stats, 'يجب إرجاع إحصائيات المعرف');
    assertEqual(stats.usageCount, 1, 'عداد الاستخدام يجب أن يكون 1');
    
    // تحديث حالة المعرف
    const updatedCode = secureCodeService.updateCodeStatus(codeId, { isActive: false });
    assert(!updatedCode.isActive, 'حالة المعرف يجب أن تصبح غير نشطة');
    
    // التحقق من عدم صحة المعرف بعد الإيقاف
    const invalidValidation = secureCodeService.validateCode(codeResult.code);
    assert(!invalidValidation.isValid, 'المعرف غير النشط يجب أن يكون غير صالح');
    
    // تنظيف المعرف
    const deleted = secureCodeService.deleteCode(codeId);
    assert(deleted, 'حذف المعرف يجب أن ينجح');
    
    console.log('✅ اختبار إدارة المعرفات نجح');
}

// اختبارات الأمان
function testSecurity() {
    console.log('🛡️ اختبار الأمان...');
    
    const testCode = 'SecurePass123!';
    
    // اختبار Rate Limiting
    const maxAttempts = secureCodeService.config.maxAttempts;
    
    // محاولات فاشلة متعددة
    for (let i = 0; i < maxAttempts; i++) {
        const result = secureCodeService.validateCode('wrong_code');
        assert(!result.isValid, 'المعرف الخطأ يجب أن يكون غير صالح');
    }
    
    // محاولة بعد تجاوز الحد
    const rateLimitedResult = secureCodeService.validateCode('wrong_code');
    assert(rateLimitedResult.rateLimited, 'يجب تفعيل Rate Limiting');
    assertEqual(rateLimitedResult.error, 'تم تجاوز حد المحاولات المسموح', 
               'رسالة الخطأ يجب أن تكون صحيحة');
    
    // اختبار القوة
    const weakCode = '123';
    const weakValidation = secureCodeService.validateCodeStrength(weakCode);
    assert(!weakValidation.isValid, 'المعرف الضعيف يجب أن يكون غير صالح');
    assert(weakValidation.errors.length > 0, 'يجب وجود أخطاء للمعرف الضعيف');
    
    console.log('✅ اختبار الأمان نجح');
}

// اختبارات التسجيل والمراقبة
function testLoggingAndMonitoring() {
    console.log('📊 اختبار التسجيل والمراقبة...');
    
    const initialLogCount = secureCodeService.usageLogs.length;
    
    // إنشاء معرف ومراقبته
    const result = secureCodeService.createInstitutionalCode('TEST_INST', 'test');
    const codeId = result.codeId;
    
    // استخدام المعرف
    secureCodeService.validateCode(result.code, 'TEST_INST');
    
    // فحص الإحصائيات
    const systemStats = secureCodeService.getSystemStats();
    assertNotNull(systemStats.totalCodes, 'يجب إرجاع إجمالي المعرفات');
    assert(systemStats.totalCodes >= 1, 'إجمالي المعرفات يجب أن يكون ≥ 1');
    
    // فحص التنبيهات
    const alerts = secureCodeService.getAlerts();
    assert(Array.isArray(alerts), 'التنبيهات يجب أن تكون مصفوفة');
    
    // تنظيف المعرف
    secureCodeService.deleteCode(codeId);
    
    console.log('✅ اختبار التسجيل والمراقبة نجح');
}

// اختبارات البحث والفلترة
function testSearchAndFiltering() {
    console.log('🔍 اختبار البحث والفلترة...');
    
    // إنشاء عدة معرفات باختلاف الأنواع
    const code1 = secureCodeService.createInstitutionalCode('INST_A', 'admin');
    const code2 = secureCodeService.createInstitutionalCode('INST_A', 'user');
    const code3 = secureCodeService.createInstitutionalCode('INST_B', 'admin');
    
    // البحث حسب المؤسسة
    const instAResults = secureCodeService.searchCodes({ institutionId: 'INST_A' });
    assertEqual(instAResults.length, 2, 'يجب العثور على معرفين لمؤسسة INST_A');
    
    // البحث حسب النوع
    const adminResults = secureCodeService.searchCodes({ type: 'admin' });
    assertEqual(adminResults.length, 2, 'يجب العثور على معرفين من نوع admin');
    
    // البحث المركب
    const combinedResults = secureCodeService.searchCodes({ 
        institutionId: 'INST_A', 
        type: 'admin' 
    });
    assertEqual(combinedResults.length, 1, 'يجب العثور على معرف واحد');
    
    // تنظيف
    secureCodeService.deleteCode(code1.codeId);
    secureCodeService.deleteCode(code2.codeId);
    secureCodeService.deleteCode(code3.codeId);
    
    console.log('✅ اختبار البحث والفلترة نجح');
}

// اختبارات البيانات المتقدمة
function testAdvancedData() {
    console.log('🔧 اختبار البيانات المتقدمة...');
    
    // إنشاء معرف مع حد استخدام
    const codeResult = secureCodeService.createInstitutionalCode('ADVANCED_TEST', 'limited');
    const codeId = codeResult.codeId;
    
    // تحديث حد الاستخدام
    secureCodeService.updateCodeStatus(codeId, { maxUsage: 3 });
    
    // استخدام المعرف عدة مرات
    for (let i = 0; i < 3; i++) {
        const validation = secureCodeService.validateCode(codeResult.code);
        assert(validation.isValid, `الاستخدام رقم ${i + 1} يجب أن ينجح`);
    }
    
    // محاولة تجاوز الحد
    const exceededValidation = secureCodeService.validateCode(codeResult.code);
    assert(!exceededValidation.isValid, 'تجاوز حد الاستخدام يجب أن يفشل');
    assertEqual(exceededValidation.error, 'تم تجاوز حد الاستخدام المسموح', 
               'رسالة خطأ تجاوز الحد يجب أن تكون صحيحة');
    
    // اختبار تمديد الصلاحية
    const extendedCode = secureCodeService.extendCodeExpiry(codeId, 48);
    assert(extendedCode.expiresAt > codeResult.expiresAt, 'تاريخ الانتهاء يجب أن يتمدد');
    
    // تنظيف
    secureCodeService.deleteCode(codeId);
    
    console.log('✅ اختبار البيانات المتقدمة نجح');
}

// اختبارات الاستيراد والتصدير
function testImportExport() {
    console.log('💾 اختبار الاستيراد والتصدير...');
    
    // إنشاء بيانات للاختبار
    const testCode = secureCodeService.createInstitutionalCode('EXPORT_TEST', 'export');
    
    // تصدير البيانات
    const exportedData = secureCodeService.exportData();
    assertNotNull(exportedData.codes, 'البيانات المصدرة يجب أن تحتوي على المعرفات');
    assert(Array.isArray(exportedData.codes), 'المعرفات يجب أن تكون مصفوفة');
    assertEqual(exportedData.codes.length, 1, 'يجب تصدير معرف واحد');
    
    // حذف المعرف الأصلي
    secureCodeService.deleteCode(testCode.codeId);
    
    // استيراد البيانات
    const importResult = secureCodeService.importData(exportedData);
    assert(importResult, 'استيراد البيانات يجب أن ينجح');
    
    // التحقق من الاستيراد
    const importedCode = secureCodeService.searchCodes({ 
        institutionId: 'EXPORT_TEST' 
    });
    assertEqual(importedCode.length, 1, 'يجب العثور على المعرف المستورد');
    
    // تنظيف
    secureCodeService.deleteCode(importedCode[0].codeId);
    
    console.log('✅ اختبار الاستيراد والتصدير نجح');
}

// اختبار شامل للنظام
function runFullSystemTest() {
    console.log('🚀 بدء الاختبار الشامل للنظام...\n');
    
    try {
        testEncryption();
        testCodeGeneration();
        testCodeManagement();
        testSecurity();
        testLoggingAndMonitoring();
        testSearchAndFiltering();
        testAdvancedData();
        testImportExport();
        
        console.log('\n🎉 جميع الاختبارات نجحت! النظام يعمل بشكل صحيح.');
        
        // عرض إحصائيات نهائية
        const finalStats = secureCodeService.getSystemStats();
        console.log('\n📈 إحصائيات النظام النهائية:');
        console.log(`- إجمالي المعرفات: ${finalStats.totalCodes}`);
        console.log(`- المعرفات النشطة: ${finalStats.activeCodes}`);
        console.log(`- التنبيهات غير المقروءة: ${finalStats.unreadAlerts}`);
        
        return true;
    } catch (error) {
        console.error(`\n❌ فشل اختبار: ${error.message}`);
        console.error(error.stack);
        return false;
    }
}

// تشغيل الاختبارات
if (require.main === module) {
    runFullSystemTest();
}

module.exports = {
    runFullSystemTest,
    assert,
    assertEqual,
    assertNotNull,
    testEncryption,
    testCodeGeneration,
    testCodeManagement,
    testSecurity,
    testLoggingAndMonitoring,
    testSearchAndFiltering,
    testAdvancedData,
    testImportExport
};