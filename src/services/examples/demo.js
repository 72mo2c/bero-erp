/**
 * أمثلة عملية لاستخدام خدمة إدارة المعرفات الآمنة
 * Practical examples for Secure Code Management Service
 */

const secureCodeService = require('../secureCodeService');

async function main() {
    console.log('🚀 بدء أمثلة خدمة إدارة المعرفات الآمنة\n');
    
    // مثال 1: الاستخدام الأساسي
    await basicUsageExample();
    
    // مثال 2: إدارة معرفات مؤسسية
    await institutionalCodesExample();
    
    // مثال 3: الأمان والمراقبة
    await securityMonitoringExample();
    
    // مثال 4: البحث والفلترة
    await searchFilteringExample();
    
    // مثال 5: إدارة البيانات المتقدمة
    await advancedDataManagementExample();
    
    // مثال 6: التنبيهات والمراقبة
    await alertsMonitoringExample();
    
    console.log('\n✅ تم الانتهاء من جميع الأمثلة بنجاح!');
}

// مثال 1: الاستخدام الأساسي
async function basicUsageExample() {
    console.log('📝 مثال 1: الاستخدام الأساسي');
    console.log('=' * 50);
    
    try {
        // توليد معرف آمن
        const secureCode = secureCodeService.generateSecureCode();
        console.log(`✅ المعرف الآمن: ${secureCode}`);
        
        // فحص قوة المعرف
        const validation = secureCodeService.validateCodeStrength(secureCode);
        console.log(`🔍 قوة المعرف: ${validation.strength}`);
        console.log(`📊 صالح: ${validation.isValid ? 'نعم' : 'لا'}`);
        
        // تشفير وفك تشفير
        const originalData = 'معلومات حساسة';
        const encrypted = secureCodeService.encrypt(originalData);
        const decrypted = secureCodeService.decrypt(encrypted);
        
        console.log(`🔐 النص الأصلي: ${originalData}`);
        console.log(`🔐 النص المشفر: ${encrypted}`);
        console.log(`🔐 النص المفكوك: ${decrypted}`);
        
    } catch (error) {
        console.error(`❌ خطأ في المثال الأساسي: ${error.message}`);
    }
    
    console.log('\n');
}

// مثال 2: إدارة معرفات مؤسسية
async function institutionalCodesExample() {
    console.log('🏢 مثال 2: إدارة المعرفات المؤسسية');
    console.log('=' * 50);
    
    try {
        // إنشاء معرفات لمؤسسات مختلفة
        const bankCode = secureCodeService.createInstitutionalCode('BANK_001', 'admin', 'BankAdmin123!');
        const hospitalCode = secureCodeService.createInstitutionalCode('HOSP_001', 'medical');
        const schoolCode = secureCodeService.createInstitutionalCode('SCHOOL_001', 'student');
        
        console.log(`🏦 معرف البنك: ${bankCode.codeId}`);
        console.log(`🏥 معرف المستشفى: ${hospitalCode.codeId}`);
        console.log(`🏫 معرف المدرسة: ${schoolCode.codeId}`);
        
        // التحقق من المعرفات
        const bankValidation = secureCodeService.validateCode(bankCode.code, 'BANK_001');
        console.log(`✅ صحة معرف البنك: ${bankValidation.isValid ? 'صحيح' : 'خطأ'}`);
        
        // الحصول على إحصائيات المعرفات
        const bankStats = secureCodeService.getCodeStats(bankCode.codeId);
        console.log(`📊 إحصائيات معرف البنك:`);
        console.log(`   - النوع: ${bankStats.type}`);
        console.log(`   - تاريخ الإنشاء: ${new Date(bankStats.createdAt).toLocaleString('ar-SA')}`);
        console.log(`   - انتهاء الصلاحية: ${new Date(bankStats.expiresAt).toLocaleString('ar-SA')}`);
        console.log(`   - عدد الاستخدامات: ${bankStats.usageCount}`);
        
        // تنظيف المعرفات
        secureCodeService.deleteCode(bankCode.codeId);
        secureCodeService.deleteCode(hospitalCode.codeId);
        secureCodeService.deleteCode(schoolCode.codeId);
        
    } catch (error) {
        console.error(`❌ خطأ في مثال المعرفات المؤسسية: ${error.message}`);
    }
    
    console.log('\n');
}

// مثال 3: الأمان والمراقبة
async function securityMonitoringExample() {
    console.log('🛡️ مثال 3: الأمان والمراقبة');
    console.log('=' * 50);
    
    try {
        // إنشاء معرف آمن
        const secureCode = secureCodeService.createInstitutionalCode('SECURITY_TEST', 'test');
        
        // محاولات فاشلة متعمدة لاختبار Rate Limiting
        console.log('🔒 اختبار Rate Limiting...');
        for (let i = 0; i < 3; i++) {
            const result = secureCodeService.validateCode('wrong_code_' + i);
            console.log(`   المحاولة ${i + 1}: ${result.isValid ? 'نجح' : 'فشل'} - ${result.error || 'OK'}`);
        }
        
        // استخدام المعرف الصحيح
        console.log('✅ استخدام المعرف الصحيح...');
        const validResult = secureCodeService.validateCode(secureCode.code);
        console.log(`   النتيجة: ${validResult.isValid ? 'صحيح' : 'خطأ'}`);
        
        // عرض التنبيهات
        const alerts = secureCodeService.getAlerts();
        if (alerts.length > 0) {
            console.log('🚨 التنبيهات الأخيرة:');
            alerts.slice(-3).forEach((alert, index) => {
                console.log(`   ${index + 1}. ${alert.data.message || alert.type}`);
            });
        }
        
        // تنظيف
        secureCodeService.deleteCode(secureCode.codeId);
        
    } catch (error) {
        console.error(`❌ خطأ في مثال الأمان: ${error.message}`);
    }
    
    console.log('\n');
}

// مثال 4: البحث والفلترة
async function searchFilteringExample() {
    console.log('🔍 مثال 4: البحث والفلترة');
    console.log('=' * 50);
    
    try {
        // إنشاء معرفات متعددة للاختبار
        const testCodes = [
            { institution: 'UNIV_001', type: 'admin' },
            { institution: 'UNIV_001', type: 'student' },
            { institution: 'UNIV_002', type: 'admin' },
            { institution: 'UNIV_002', type: 'faculty' },
            { institution: 'UNIV_003', type: 'student' }
        ];
        
        const createdCodes = testCodes.map(test => 
            secureCodeService.createInstitutionalCode(test.institution, test.type)
        );
        
        console.log('📋 تم إنشاء معرفات تجريبية');
        
        // البحث حسب المؤسسة
        const univ001Codes = secureCodeService.searchCodes({ institutionId: 'UNIV_001' });
        console.log(`🏫 معرفات جامعة 001: ${univ001Codes.length} معرف`);
        
        // البحث حسب النوع
        const adminCodes = secureCodeService.searchCodes({ type: 'admin' });
        console.log(`👑 معرفات المديرين: ${adminCodes.length} معرف`);
        
        // البحث المركب
        const studentCodes = secureCodeService.searchCodes({ 
            institutionId: 'UNIV_001', 
            type: 'student' 
        });
        console.log(`👨‍🎓 معرفات طلاب جامعة 001: ${studentCodes.length} معرف`);
        
        // البحث عن المعرفات النشطة وغير المنتهية
        const activeCodes = secureCodeService.searchCodes({ 
            isActive: true,
            isExpired: false 
        });
        console.log(`✅ المعرفات النشطة والصالحة: ${activeCodes.length} معرف`);
        
        // تنظيف
        createdCodes.forEach(code => secureCodeService.deleteCode(code.codeId));
        
    } catch (error) {
        console.error(`❌ خطأ في مثال البحث: ${error.message}`);
    }
    
    console.log('\n');
}

// مثال 5: إدارة البيانات المتقدمة
async function advancedDataManagementExample() {
    console.log('⚙️ مثال 5: إدارة البيانات المتقدمة');
    console.log('=' * 50);
    
    try {
        // إنشاء معرف مع حد استخدام
        const limitedCode = secureCodeService.createInstitutionalCode('ADVANCED_TEST', 'limited');
        const codeId = limitedCode.codeId;
        
        console.log(`🔢 معرف مع حد استخدام: ${codeId}`);
        
        // تحديد حد الاستخدام
        secureCodeService.updateCodeStatus(codeId, { maxUsage: 3 });
        
        // استخدام المعرف عدة مرات
        console.log('📝 استخدام المعرف حتى الحد الأقصى...');
        for (let i = 0; i < 3; i++) {
            const result = secureCodeService.validateCode(limitedCode.code);
            console.log(`   الاستخدام ${i + 1}: ${result.isValid ? 'نجح' : 'فشل'}`);
        }
        
        // محاولة استخدام زائد
        const exceededResult = secureCodeService.validateCode(limitedCode.code);
        console.log(`   الاستخدام الزائد: ${exceededResult.isValid ? 'نجح' : 'فشل'} - ${exceededResult.error}`);
        
        // تمديد الصلاحية
        const extended = secureCodeService.extendCodeExpiry(codeId, 72); // 72 ساعة
        console.log(`⏰ تم تمديد الصلاحية حتى: ${new Date(extended.expiresAt).toLocaleString('ar-SA')}`);
        
        // إحصائيات متقدمة
        const advancedStats = secureCodeService.getCodeStats(codeId);
        console.log(`📊 إحصائيات متقدمة:`);
        console.log(`   - نسبة الاستخدام: ${advancedStats.usagePercentage.toFixed(1)}%`);
        console.log(`   - الحد الأقصى: ${advancedStats.maxUsage}`);
        console.log(`   - الحالة: ${advancedStats.isExpired ? 'منتهي' : 'صالح'}`);
        
        // تصدير البيانات
        const exportData = secureCodeService.exportData();
        console.log(`💾 تم تصدير ${exportData.codes.length} معرف`);
        
        // تنظيف
        secureCodeService.deleteCode(codeId);
        
    } catch (error) {
        console.error(`❌ خطأ في مثال البيانات المتقدمة: ${error.message}`);
    }
    
    console.log('\n');
}

// مثال 6: التنبيهات والمراقبة
async function alertsMonitoringExample() {
    console.log('🚨 مثال 6: التنبيهات والمراقبة');
    console.log('=' * 50);
    
    try {
        // عرض إحصائيات النظام
        const systemStats = secureCodeService.getSystemStats();
        console.log('📈 إحصائيات النظام الحالية:');
        console.log(`   - إجمالي المعرفات: ${systemStats.totalCodes}`);
        console.log(`   - المعرفات النشطة: ${systemStats.activeCodes}`);
        console.log(`   - المعرفات منتهية الصلاحية: ${systemStats.expiredCodes}`);
        console.log(`   - التنبيهات غير المقروءة: ${systemStats.unreadAlerts}`);
        
        // إنشاء تنبيهات متعمدة
        console.log('🔔 إنشاء سيناريوهات التنبيه...');
        
        // محاولات فاشلة متعددة لتفعيل تنبيه الأمان
        for (let i = 0; i < 15; i++) {
            secureCodeService.validateCode('nonexistent_code_' + i);
        }
        
        // انتظار قصير
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // فحص التنبيهات الجديدة
        const newAlerts = secureCodeService.getAlerts(true);
        if (newAlerts.length > 0) {
            console.log(`🚨 تم إنشاء ${newAlerts.length} تنبيه جديد:`);
            newAlerts.slice(-3).forEach((alert, index) => {
                console.log(`   ${index + 1}. ${alert.data.message || alert.type}`);
            });
        }
        
        // تنظيف النظام
        const cleanedCount = secureCodeService.cleanupExpiredCodes();
        console.log(`🧹 تم تنظيف ${cleanedCount} معرف منتهي الصلاحية`);
        
        // إحصائيات نهائية
        const finalStats = secureCodeService.getSystemStats();
        console.log('📊 الإحصائيات النهائية:');
        console.log(`   - المحاولات الفاشلة (24 ساعة): ${finalStats.failedAttempts24h}`);
        console.log(`   - المحاولات الناجحة (24 ساعة): ${finalStats.uniqueSuccessfulAttempts24h}`);
        
    } catch (error) {
        console.error(`❌ خطأ في مثال التنبيهات: ${error.message}`);
    }
    
    console.log('\n');
}

// تشغيل الأمثلة
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    basicUsageExample,
    institutionalCodesExample,
    securityMonitoringExample,
    searchFilteringExample,
    advancedDataManagementExample,
    alertsMonitoringExample
};