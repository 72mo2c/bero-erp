// ======================================
// Security Utilities - أدوات الأمان
// ======================================

/**
 * تشفير كلمة المرور باستخدام خوارزمية بسيطة
 * في بيئة إنتاجية، استخدم bcrypt أو argon2
 */
export const hashPassword = (password) => {
  // Simple hash for demo - في الإنتاج استخدم bcrypt
  let hash = 0;
  const str = password + 'BERO_SALT_KEY_2025';
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * التحقق من كلمة المرور
 */
export const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
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
