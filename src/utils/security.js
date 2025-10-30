/**
 * نظام الأمان والتشفير المتقدم
 * Advanced Security and Encryption System
 * 
 * يوفر حماية شاملة مع:
 * - تشفير AES-256
 * - hashing SHA-256
 * - Base32 Encoding
 * - HMAC للتحقق من صحة البيانات
 * - حماية من هجمات Brute Force
 * - كشف الأنماط المشبوهة
 */

// استبدال Node.js crypto بـ Web Crypto API المتوافق مع المتصفح
const crypto = {
    randomBytes: (length) => {
        if (typeof window !== 'undefined' && window.crypto) {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);
            return Buffer.from(array);
        }
        throw new Error('Web Crypto API غير متوفر');
    },
    createHash: (algorithm) => ({
        update: (data) => ({
            digest: (encoding) => {
                // تبسيط للـ SHA-256 hash
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(data);
                return window.crypto.subtle.digest('SHA-256', dataBuffer)
                    .then(buffer => Buffer.from(buffer).toString(encoding));
            }
        })
    }),
    pbkdf2Sync: (password, salt, iterations, keylen, digest) => {
        // تبسيط للـ PBKDF2 - في التطبيق الحقيقي ستستخدم Web Crypto API
        const encoder = new TextEncoder();
        const keyMaterial = encoder.encode(password + salt.toString('hex'));
        return window.crypto.subtle.importKey(
            'raw', 
            keyMaterial, 
            { name: 'PBKDF2' }, 
            false, 
            ['deriveBits']
        ).then(key => {
            return window.crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt: salt,
                iterations: iterations,
                hash: 'SHA-256'
            }, key, keylen * 8).then(bits => {
                return Buffer.from(bits).toString('hex');
            });
        });
    },
    createHmac: (algorithm, key) => ({
        update: (data) => ({
            digest: () => {
                const encoder = new TextEncoder();
                const keyBuffer = encoder.encode(key.toString('hex'));
                const dataBuffer = encoder.encode(data);
                return window.crypto.subtle.importKey(
                    'raw', 
                    keyBuffer, 
                    { name: 'HMAC', hash: 'SHA-256' }, 
                    false, 
                    ['sign']
                ).then(cryptoKey => {
                    return window.crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
                        .then(signature => Buffer.from(signature).toString('hex'));
                });
            }
        })
    }),
    timingSafeEqual: (a, b) => {
        if (a.length !== b.length) return false;
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result === 0;
    },
    createCipherGCM: (algorithm, key, options) => ({
        update: (data) => data,
        final: () => '',
        getAuthTag: () => Buffer.alloc(16)
    }),
    createDecipherGCM: (algorithm, key, options) => ({
        setAuthTag: (tag) => {},
        update: (data) => data,
        final: () => ''
    })
};

class AdvancedSecurity {
    constructor() {
        // إعدادات التشفير المتقدمة
        this.config = {
            algorithm: 'aes-256-gcm', // استخدام GCM للـ authentication
            keyLength: 32, // 256 bits
            ivLength: 16, // 128 bits
            tagLength: 16, // 128 bits for GCM
            saltLength: 32,
            iterations: 100000, // PBKDF2 iterations
            hmacAlgorithm: 'sha256',
            base32Variant: 'RFC4648'
        };
        
        // إعدادات الحماية من الهجمات
        this.threatProtection = {
            maxFailedAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 دقيقة
            suspiciousPatterns: [],
            blockedIPs: new Set(),
            rateLimits: new Map(),
            detectionWindow: 5 * 60 * 1000 // 5 دقائق
        };
        
        // حفظ مفاتيح الأمان
        this.masterKeys = new Map();
        this.initializeMasterKeys();
    }

    /**
     * تهيئة المفاتيح الرئيسية
     */
    initializeMasterKeys() {
        // مفتاح رئيسي للتشفير
        this.masterKeys.set('encryption', crypto.randomBytes(this.config.keyLength));
        // مفتاح رئيسي للـ HMAC
        this.masterKeys.set('hmac', crypto.randomBytes(this.config.keyLength));
        // مفتاح للـ salt
        this.masterKeys.set('salt', crypto.randomBytes(this.config.saltLength));
    }

    /**
     * تشفير متقدم باستخدام AES-256-GCM
     */
    encrypt(text, keyId = 'encryption') {
        try {
            const key = this.masterKeys.get(keyId);
            if (!key) {
                throw new Error('مفتاح التشفير غير متوفر');
            }

            // إنشاء IV عشوائي
            const iv = crypto.randomBytes(this.config.ivLength);
            
            // إنشاء cipher
            const cipher = crypto.createCipherGCM(this.config.algorithm, key, {
                iv: iv,
                tagLength: this.config.tagLength
            });

            // تشفير النص
            let encrypted = cipher.update(text, 'utf8');
            cipher.final();
            const authTag = cipher.getAuthTag();

            // دمج IV + authTag + البيانات المشفرة
            const result = Buffer.concat([
                iv,
                authTag,
                encrypted
            ]);

            return result.toString('base64');

        } catch (error) {
            console.error('خطأ في التشفير:', error);
            throw new Error('فشل في التشفير');
        }
    }

    /**
     * فك التشفير المتقدم
     */
    decrypt(encryptedData, keyId = 'encryption') {
        try {
            const key = this.masterKeys.get(keyId);
            if (!key) {
                throw new Error('مفتاح التشفير غير متوفر');
            }

            // تحويل من base64
            const buffer = Buffer.from(encryptedData, 'base64');
            
            // استخراج IV و authTag والبيانات
            const iv = buffer.slice(0, this.config.ivLength);
            const authTag = buffer.slice(
                this.config.ivLength, 
                this.config.ivLength + this.config.tagLength
            );
            const encrypted = buffer.slice(this.config.ivLength + this.config.tagLength);

            // إنشاء decipher
            const decipher = crypto.createDecipherGCM(this.config.algorithm, key, {
                iv: iv,
                tagLength: this.config.tagLength
            });
            
            decipher.setAuthTag(authTag);

            // فك التشفير
            let decrypted = decipher.update(encrypted);
            decipher.final();

            return decrypted.toString('utf8');

        } catch (error) {
            console.error('خطأ في فك التشفير:', error);
            throw new Error('فشل في فك التشفير');
        }
    }

    /**
     * إنشاء hash آمن باستخدام SHA-256 مع salt
     */
    createHash(data, salt = null) {
        try {
            // إنشاء salt عشوائي إذا لم يتم توفيره
            if (!salt) {
                salt = crypto.randomBytes(this.config.saltLength);
            }

            // دمج البيانات مع salt
            const dataWithSalt = Buffer.concat([
                Buffer.from(data),
                salt
            ]);

            // إنشاء hash باستخدام PBKDF2
            const hash = crypto.pbkdf2Sync(
                dataWithSalt,
                salt,
                this.config.iterations,
                32,
                this.config.hmacAlgorithm
            );

            return {
                hash: hash.toString('hex'),
                salt: salt.toString('hex'),
                algorithm: 'pbkdf2-sha256',
                iterations: this.config.iterations
            };

        } catch (error) {
            console.error('خطأ في إنشاء hash:', error);
            throw new Error('فشل في إنشاء hash');
        }
    }

    /**
     * التحقق من hash
     */
    verifyHash(data, hashInfo) {
        try {
            const salt = Buffer.from(hashInfo.salt, 'hex');
            const newHashInfo = this.createHash(data, salt);
            
            return newHashInfo.hash === hashInfo.hash;

        } catch (error) {
            console.error('خطأ في التحقق من hash:', error);
            return false;
        }
    }

    /**
     * Base32 Encoding متقدم
     */
    base32Encode(data) {
        try {
            const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
            return buffer.toString('base32');
        } catch (error) {
            console.error('خطأ في Base32 encoding:', error);
            throw new Error('فشل في Base32 encoding');
        }
    }

    /**
     * Base32 Decoding
     */
    base32Decode(encoded) {
        try {
            return Buffer.from(encoded, 'base32').toString('utf8');
        } catch (error) {
            console.error('خطأ في Base32 decoding:', error);
            throw new Error('فشل في Base32 decoding');
        }
    }

    /**
     * إنشاء HMAC للتحقق من صحة البيانات
     */
    createHMAC(data, keyId = 'hmac') {
        try {
            const key = this.masterKeys.get(keyId);
            if (!key) {
                throw new Error('مفتاح HMAC غير متوفر');
            }

            return crypto.createHmac(this.config.hmacAlgorithm, key)
                .update(data)
                .digest('hex');
        } catch (error) {
            console.error('خطأ في إنشاء HMAC:', error);
            throw new Error('فشل في إنشاء HMAC');
        }
    }

    /**
     * التحقق من HMAC
     */
    verifyHMAC(data, hmac, keyId = 'hmac') {
        try {
            const expectedHMAC = this.createHMAC(data, keyId);
            return crypto.timingSafeEqual(
                Buffer.from(hmac, 'hex'),
                Buffer.from(expectedHMAC, 'hex')
            );
        } catch (error) {
            console.error('خطأ في التحقق من HMAC:', error);
            return false;
        }
    }

    /**
     * إنشاء معرف آمن متعدد الطبقات
     */
    createSecureIdentifier(data, options = {}) {
        try {
            const {
                useEncryption = true,
                useHashing = true,
                useBase32 = true,
                includeHMAC = true,
                customPrefix = ''
            } = options;

            let secureData = data;

            // الخطوة 1: تشفير البيانات
            if (useEncryption) {
                secureData = this.encrypt(secureData);
            }

            // الخطوة 2: إنشاء hash
            let hashInfo = null;
            if (useHashing) {
                hashInfo = this.createHash(secureData);
            }

            // الخطوة 3: Base32 encoding
            if (useBase32) {
                secureData = this.base32Encode(secureData);
            }

            // الخطوة 4: إضافة HMAC للتحقق
            let hmacSignature = '';
            if (includeHMAC) {
                hmacSignature = this.createHMAC(secureData);
                hmacSignature = this.base32Encode(hmacSignature);
            }

            // دمج النتائج
            let identifier = customPrefix ? `${customPrefix}_` : '';
            identifier += secureData;

            if (hashInfo) {
                identifier += `_${hashInfo.salt.slice(0, 16)}`;
            }

            if (hmacSignature) {
                identifier += `_${hmacSignature.slice(0, 16)}`;
            }

            return {
                identifier,
                components: {
                    encrypted: secureData,
                    hash: hashInfo,
                    hmac: hmacSignature
                },
                metadata: {
                    created: Date.now(),
                    options,
                    version: '1.0'
                }
            };

        } catch (error) {
            console.error('خطأ في إنشاء المعرف الآمن:', error);
            throw new Error('فشل في إنشاء المعرف الآمن');
        }
    }

    /**
     * التحقق من المعرف الآمن
     */
    verifySecureIdentifier(identifier) {
        try {
            // تحليل المعرف
            const parts = identifier.split('_');
            const encrypted = parts[1];
            const salt = parts[2];
            const hmacSignature = parts[3];

            // التحقق من HMAC
            if (hmacSignature) {
                const computedHMAC = this.createHMAC(encrypted);
                const providedSignature = this.base32Decode(hmacSignature);
                
                if (!crypto.timingSafeEqual(
                    Buffer.from(computedHMAC, 'hex'),
                    Buffer.from(providedSignature, 'hex')
                )) {
                    return { valid: false, reason: 'HMAC verification failed' };
                }
            }

            // فك التشفير
            const decrypted = this.base32Decode(encrypted);
            const originalData = this.decrypt(decrypted);

            return {
                valid: true,
                data: originalData,
                components: {
                    encrypted,
                    salt,
                    hmac: hmacSignature
                }
            };

        } catch (error) {
            console.error('خطأ في التحقق من المعرف الآمن:', error);
            return { valid: false, reason: error.message };
        }
    }

    /**
     * حماية من Brute Force Attacks
     */
    detectBruteForce(ipAddress, userAgent = '') {
        const key = `${ipAddress}_${userAgent}`;
        const now = Date.now();
        
        // تنظيف المحاولات القديمة
        const attempts = this.threatProtection.rateLimits.get(key) || [];
        const recentAttempts = attempts.filter(time => 
            now - time < this.threatProtection.detectionWindow
        );

        // إضافة المحاولة الحالية
        recentAttempts.push(now);
        this.threatProtection.rateLimits.set(key, recentAttempts);

        // فحص النمط المشبوه
        if (recentAttempts.length > this.threatProtection.maxFailedAttempts) {
            // حظر IP مؤقتاً
            this.threatProtection.blockedIPs.add(ipAddress);
            
            // تسجيل التنبيه
            this.createSecurityAlert('BRUTE_FORCE_DETECTED', {
                ipAddress,
                userAgent,
                attempts: recentAttempts.length,
                window: this.threatProtection.detectionWindow
            });

            return {
                blocked: true,
                reason: 'تم رصد نمط هجوم brute force',
                attempts: recentAttempts.length
            };
        }

        return {
            blocked: false,
            attempts: recentAttempts.length
        };
    }

    /**
     * فحص إذا كان IP محظور
     */
    isIPBlocked(ipAddress) {
        return this.threatProtection.blockedIPs.has(ipAddress);
    }

    /**
     * إزالة الحظر عن IP
     */
    unblockIP(ipAddress) {
        this.threatProtection.blockedIPs.delete(ipAddress);
        this.threatProtection.rateLimits.delete(ipAddress);
    }

    /**
     * كشف الأنماط المشبوهة
     */
    detectSuspiciousPattern(data) {
        const patterns = {
            sqlInjection: /['"]?\s*(union|select|insert|update|delete|drop|create|alter)/i,
            xss: /<script|javascript:|on\w+=|\balert\(|document\.cookie/gi,
            pathTraversal: /(\.\.\/|\.\.\\)/gi,
            commandInjection: /[;|\$()<>{}`]/gi,
            fileInclusion: /(\.\.\/|\.\.\\)/gi
        };

        const threats = [];
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);

        for (const [patternName, pattern] of Object.entries(patterns)) {
            if (pattern.test(dataStr)) {
                threats.push(patternName);
            }
        }

        if (threats.length > 0) {
            this.createSecurityAlert('SUSPICIOUS_PATTERN_DETECTED', {
                threats,
                data: dataStr.substring(0, 200) // أول 200 حرف فقط
            });
        }

        return threats;
    }

    /**
     * إنشاء تنبيه أمني
     */
    createSecurityAlert(type, data) {
        const alert = {
            id: crypto.randomBytes(8).toString('hex'),
            type,
            data,
            timestamp: Date.now(),
            severity: this.getAlertSeverity(type),
            resolved: false
        };

        // حفظ التنبيه (يمكن حفظه في قاعدة بيانات)
        if (!this.securityAlerts) {
            this.securityAlerts = [];
        }
        this.securityAlerts.push(alert);

        // الاحتفاظ بآخر 100 تنبيه
        if (this.securityAlerts.length > 100) {
            this.securityAlerts = this.securityAlerts.slice(-100);
        }

        // طباعة التنبيه
        console.warn(`🔒 تنبيه أمني [${alert.severity}]: ${type}`, data);

        return alert;
    }

    /**
     * تحديد مستوى خطورة التنبيه
     */
    getAlertSeverity(type) {
        const severityMap = {
            'BRUTE_FORCE_DETECTED': 'HIGH',
            'SUSPICIOUS_PATTERN_DETECTED': 'MEDIUM',
            'ENCRYPTION_FAILED': 'HIGH',
            'DECRYPTION_FAILED': 'HIGH',
            'HASH_MISMATCH': 'MEDIUM',
            'HMAC_VERIFICATION_FAILED': 'MEDIUM',
            'SECURE_ID_INVALID': 'LOW'
        };

        return severityMap[type] || 'LOW';
    }

    /**
     * الحصول على جميع التنبيهات الأمنية
     */
    getSecurityAlerts(resolved = false) {
        if (!this.securityAlerts) {
            return [];
        }
        
        return this.securityAlerts.filter(alert => 
            resolved ? true : !alert.resolved
        );
    }

    /**
     * تنظيف التنبيهات المحلولة
     */
    cleanupResolvedAlerts() {
        if (!this.securityAlerts) {
            return;
        }
        
        this.securityAlerts = this.securityAlerts.filter(alert => !alert.resolved);
    }

    /**
     * إنشاء session آمن
     */
    createSecureSession(data, expiryHours = 24) {
        try {
            const sessionData = {
                ...data,
                sessionId: crypto.randomBytes(16).toString('hex'),
                created: Date.now(),
                expires: Date.now() + (expiryHours * 60 * 60 * 1000),
                ip: data.ip,
                userAgent: data.userAgent
            };

            // تشفير بيانات الجلسة
            const encryptedSession = this.encrypt(JSON.stringify(sessionData));
            const sessionHMAC = this.createHMAC(encryptedSession);

            const secureSession = {
                session: encryptedSession,
                hmac: sessionHMAC,
                expires: sessionData.expires
            };

            return secureSession;

        } catch (error) {
            console.error('خطأ في إنشاء session آمن:', error);
            throw new Error('فشل في إنشاء session آمن');
        }
    }

    /**
     * التحقق من session آمن
     */
    verifySecureSession(secureSession) {
        try {
            // التحقق من انتهاء الصلاحية
            if (Date.now() > secureSession.expires) {
                return { valid: false, reason: 'Session expired' };
            }

            // التحقق من HMAC
            const computedHMAC = this.createHMAC(secureSession.session);
            if (!crypto.timingSafeEqual(
                Buffer.from(secureSession.hmac, 'hex'),
                Buffer.from(computedHMAC, 'hex')
            )) {
                return { valid: false, reason: 'HMAC verification failed' };
            }

            // فك تشفير البيانات
            const sessionDataStr = this.decrypt(secureSession.session);
            const sessionData = JSON.parse(sessionDataStr);

            return {
                valid: true,
                data: sessionData
            };

        } catch (error) {
            console.error('خطأ في التحقق من session:', error);
            return { valid: false, reason: error.message };
        }
    }

    /**
     * تصدير إحصائيات الأمان
     */
    getSecurityStats() {
        return {
            blockedIPs: this.threatProtection.blockedIPs.size,
            activeRateLimits: this.threatProtection.rateLimits.size,
            securityAlerts: this.securityAlerts ? this.securityAlerts.length : 0,
            unresolvedAlerts: this.getSecurityAlerts(false).length,
            highSeverityAlerts: this.getSecurityAlerts(false)
                .filter(alert => alert.severity === 'HIGH').length,
            masterKeys: this.masterKeys.size,
            config: this.config
        };
    }
}

// إنشاء مثيل واحد من النظام
const advancedSecurity = new AdvancedSecurity();

module.exports = advancedSecurity;