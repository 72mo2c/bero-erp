// ======================================
// Security Utilities - أدوات الأمان
// ======================================

/**
 * تشفير كلمة المرور باستخدام PBKDF2 - خوارزمية آمنة
 * يستخدم Web Crypto API الآمن
 */
export const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // تحويل كلمة المرور إلى ArrayBuffer
    const passwordBuffer = encoder.encode(password);
    
    // استيراد المفتاح للتشفير
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // تشفير كلمة المرور
    const hashedPassword = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // 100k iterations للأمان
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    // تحويل إلى Base64 مع salt
    const hashArray = Array.from(new Uint8Array(hashedPassword));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${saltHex}:${hashHex}`;
  } catch (error) {
    console.error('خطأ في تشفير كلمة المرور:', error);
    throw new Error('فشل في تشفير كلمة المرور');
  }
};

/**
 * التحقق من كلمة المرور مقارنة مع النص المشفر
 */
export const verifyPassword = async (password, hashedPasswordWithSalt) => {
  try {
    const [saltHex, originalHash] = hashedPasswordWithSalt.split(':');
    
    if (!saltHex || !originalHash) {
      return false;
    }
    
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const hashedPassword = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    const hashArray = Array.from(new Uint8Array(hashedPassword));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === originalHash;
  } catch (error) {
    console.error('خطأ في التحقق من كلمة المرور:', error);
    return false;
  }
};

/**
 * توليد معرف فريد
 */
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

/**
 * التحقق من قوة كلمة المرور
 */
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: []
  };

  if (password.length < 6) {
    strength.feedback.push('كلمة المرور قصيرة جداً (الحد الأدنى 6 أحرف)');
    return strength;
  }

  if (password.length >= 6) strength.score += 1;
  if (password.length >= 8) strength.score += 1;
  if (/[a-z]/.test(password)) strength.score += 1;
  if (/[A-Z]/.test(password)) strength.score += 1;
  if (/[0-9]/.test(password)) strength.score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength.score += 1;

  if (strength.score <= 2) {
    strength.level = 'weak';
    strength.label = 'ضعيفة';
    strength.color = 'red';
  } else if (strength.score <= 4) {
    strength.level = 'medium';
    strength.label = 'متوسطة';
    strength.color = 'orange';
  } else {
    strength.level = 'strong';
    strength.label = 'قوية';
    strength.color = 'green';
  }

  return strength;
};

/**
 * تنظيف البيانات المدخلة
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export default {
  hashPassword,
  verifyPassword,
  generateId,
  checkPasswordStrength,
  sanitizeInput
};