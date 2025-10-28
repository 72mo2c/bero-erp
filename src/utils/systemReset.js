// ======================================
// System Reset - إعادة تعيين النظام
// ======================================
// هذا الملف يساعد في إعادة تعيين بيانات المستخدمين إذا حدثت مشكلة

import { hashPassword } from './security';

/**
 * إعادة تعيين بيانات المستخدمين بالكامل
 * ⚠️ تحذير: هـذه العملية ستحذف جميع المستخدمين وتنشئ مستخدم افتراضي جديد
 */
export const resetSystemUsers = () => {
  try {
    // إنشاء مستخدم افتراضي جديد
    const defaultUser = {
      id: 1,
      username: 'admin',
      password: hashPassword('admin123'),
      name: 'المدير العام',
      email: 'admin@berosystem.com',
      phone: '+20 XXX XXX XXXX',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // حفظ المستخدم الافتراضي
    localStorage.setItem('bero_system_users', JSON.stringify([defaultUser]));
    
    // حذف بيانات الجلسة
    localStorage.removeItem('bero_user');
    
    console.log('✅ تم إعادة تعيين بيانات المستخدمين بنجاح');
    console.log('بيانات الدخول الافتراضية:');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: admin123');
    
    return {
      success: true,
      message: 'تم إعادة تعيين النظام بنجاح',
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    };
  } catch (error) {
    console.error('خطأ في إعادة تعيين النظام:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إعادة التعيين'
    };
  }
};

/**
 * التحقق من سلامة بيانات المستخدمين
 */
export const checkUsersIntegrity = () => {
  try {
    const usersData = localStorage.getItem('bero_system_users');
    
    if (!usersData) {
      return {
        valid: false,
        message: 'لا توجد بيانات مستخدمين',
        needsReset: true
      };
    }
    
    const users = JSON.parse(usersData);
    
    if (!Array.isArray(users) || users.length === 0) {
      return {
        valid: false,
        message: 'بيانات المستخدمين تالفة',
        needsReset: true
      };
    }
    
    return {
      valid: true,
      message: 'بيانات المستخدمين سليمة',
      usersCount: users.length,
      needsReset: false
    };
  } catch (error) {
    return {
      valid: false,
      message: 'خطأ في قراءة بيانات المستخدمين',
      needsReset: true,
      error: error.message
    };
  }
};

/**
 * تحديث تشفير جميع كلمات المرور غير المشفرة
 * يستخدم عند الترقية من نظام قديم
 */
export const migratePasswordsToHashed = () => {
  try {
    const usersData = localStorage.getItem('bero_system_users');
    
    if (!usersData) {
      return { success: false, message: 'لا توجد بيانات مستخدمين' };
    }
    
    const users = JSON.parse(usersData);
    let migratedCount = 0;
    
    // هذه عملية معقدة لأن لا نعرف إذا كانت كلمة المرور مشفرة بالفعل
    // لذلك نفترض أن كلمات المرور القصيرة (أقل من 15 حرف) هي غير مشفرة
    
    const updatedUsers = users.map(user => {
      // إذا كانت كلمة المرور قصيرة جداً، نفترض أنها غير مشفرة
      if (user.password && user.password.length < 15) {
        console.log(`تحديث تشفير كلمة مرور المستخدم: ${user.username}`);
        migratedCount++;
        return {
          ...user,
          password: hashPassword(user.password)
        };
      }
      return user;
    });
    
    if (migratedCount > 0) {
      localStorage.setItem('bero_system_users', JSON.stringify(updatedUsers));
      return {
        success: true,
        message: `تم تحديث ${migratedCount} مستخدم`,
        migratedCount
      };
    }
    
    return {
      success: true,
      message: 'جميع كلمات المرور مشفرة بالفعل',
      migratedCount: 0
    };
  } catch (error) {
    console.error('خطأ في ترحيل كلمات المرور:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء الترحيل'
    };
  }
};

// تصدير الدوال للاستخدام في أدوات المطور
// يمكن استدعاءها من Console المتصفح
// مثال: window.resetSystem()
if (typeof window !== 'undefined') {
  window.resetSystemUsers = resetSystemUsers;
  window.checkUsersIntegrity = checkUsersIntegrity;
  window.migratePasswordsToHashed = migratePasswordsToHashed;
}

export default {
  resetSystemUsers,
  checkUsersIntegrity,
  migratePasswordsToHashed
};
