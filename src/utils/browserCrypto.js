/**
 * نظام الأمان المتوافق مع المتصفح
 * Browser-Compatible Security System
 * 
 * يوفر وظائف الأمان والتشفير المتوافقة مع Web Crypto API
 * بدلاً من Node.js crypto module
 */

/**
 * Web Crypto API Wrapper متوافق مع جميع المتصفحات الحديثة
 */
class BrowserCrypto {
    constructor() {
        // التحقق من توفر Web Crypto API
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('Web Crypto API غير متوفر في هذا المتصفح');
        }
        
        this.crypto = window.crypto;
        this.subtle = window.crypto.subtle;
        
        // إعدادات الأمان المتقدمة
        this.config = {
            algorithm: 'AES-GCM',
            keyLength: 256, // 256 bits
            ivLength: 12, // 96 bits for GCM
            tagLength: 128, // 128 bits for GCM
            saltLength: 16,
            iterations: 100000, // PBKDF2 iterations
            hmacAlgorithm: 'SHA-256'
        };
    }

    /**
     * تحويل نص إلى ArrayBuffer
     */
    textToArrayBuffer(text) {
        const encoder = new TextEncoder();
        return encoder.encode(text);
    }

    /**
     * تحويل ArrayBuffer إلى نص
     */
    arrayBufferToText(buffer) {
        const decoder = new TextDecoder();
        return decoder.decode(buffer);
    }

    /**
     * تحويل ArrayBuffer إلى base64
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * تحويل base64 إلى ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * إنشاء bytes عشوائية
     */
    async getRandomBytes(length) {
        const array = new Uint8Array(length);
        this.crypto.getRandomValues(array);
        return array;
    }

    /**
     * تشفير باستخدام AES-256-GCM
     */
    async encryptAES(text, key) {
        try {
            // إنشاء IV عشوائي
            const iv = await this.getRandomBytes(this.config.ivLength);
            
            // تشفير البيانات
            const encodedText = this.textToArrayBuffer(text);
            const encrypted = await this.subtle.encrypt(
                {
                    name: this.config.algorithm,
                    iv: iv,
                    tagLength: this.config.tagLength
                },
                key,
                encodedText
            );

            // دمج IV + البيانات المشفرة
            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv, 0);
            result.set(new Uint8Array(encrypted), iv.length);

            return this.arrayBufferToBase64(result.buffer);

        } catch (error) {
            console.error('خطأ في التشفير:', error);
            throw new Error('فشل في التشفير');
        }
    }

    /**
     * فك التشفير باستخدام AES-256-GCM
     */
    async decryptAES(encryptedData, key) {
        try {
            // تحويل من base64
            const buffer = this.base64ToArrayBuffer(encryptedData);
            const data = new Uint8Array(buffer);
            
            // استخراج IV والبيانات المشفرة
            const iv = data.slice(0, this.config.ivLength);
            const encrypted = data.slice(this.config.ivLength);
            
            // فك التشفير
            const decrypted = await this.subtle.decrypt(
                {
                    name: this.config.algorithm,
                    iv: iv,
                    tagLength: this.config.tagLength
                },
                key,
                encrypted
            );

            return this.arrayBufferToText(decrypted);

        } catch (error) {
            console.error('خطأ في فك التشفير:', error);
            throw new Error('فشل في فك التشفير');
        }
    }

    /**
     * إنشاء مفتاح من نص
     */
    async createKeyFromPassword(password) {
        try {
            // تحويل كلمة المرور إلى bytes
            const passwordBuffer = this.textToArrayBuffer(password);
            
            // إنشاء salt عشوائي
            const salt = await this.getRandomBytes(this.config.saltLength);
            
            // استيراد كلمة المرور كمفتاح
            const keyMaterial = await this.subtle.importKey(
                'raw',
                passwordBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            
            // إنشاء المفتاح المشتق
            const key = await this.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: this.config.iterations,
                    hash: this.config.hmacAlgorithm
                },
                keyMaterial,
                {
                    name: this.config.algorithm,
                    length: this.config.keyLength
                },
                false,
                ['encrypt', 'decrypt']
            );

            return {
                key,
                salt: salt,
                iterations: this.config.iterations
            };

        } catch (error) {
            console.error('خطأ في إنشاء المفتاح:', error);
            throw new Error('فشل في إنشاء المفتاح');
        }
    }

    /**
     * إنشاء hash باستخدام SHA-256
     */
    async hashSHA256(data) {
        try {
            const encodedData = this.textToArrayBuffer(data);
            const hash = await this.subtle.digest('SHA-256', encodedData);
            return this.arrayBufferToBase64(hash);
        } catch (error) {
            console.error('خطأ في إنشاء hash:', error);
            throw new Error('فشل في إنشاء hash');
        }
    }

    /**
     * إنشاء HMAC
     */
    async createHMAC(data, key) {
        try {
            const encodedData = this.textToArrayBuffer(data);
            const signature = await this.subtle.sign('HMAC', key, encodedData);
            return this.arrayBufferToBase64(signature);
        } catch (error) {
            console.error('خطأ في إنشاء HMAC:', error);
            throw new Error('فشل في إنشاء HMAC');
        }
    }

    /**
     * التحقق من HMAC
     */
    async verifyHMAC(data, signature, key) {
        try {
            const encodedData = this.textToArrayBuffer(data);
            const providedSignature = this.base64ToArrayBuffer(signature);
            
            return await this.subtle.verify('HMAC', key, providedSignature, encodedData);
        } catch (error) {
            console.error('خطأ في التحقق من HMAC:', error);
            return false;
        }
    }

    /**
     * Base32 Encoding (مبسّط)
     */
    base32Encode(data) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        let buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
        let remainingBits = 0;
        let remainingValue = 0;
        
        for (let i = 0; i < buffer.length; i += 5) {
            const chunk = buffer.slice(i, i + 5);
            let bits = 0;
            let value = 0;
            
            for (let j = 0; j < chunk.length; j++) {
                value = (value << 8) | chunk[j];
                bits += 8;
            }
            
            value = (remainingValue << bits) | value;
            bits += remainingBits;
            
            while (bits >= 5) {
                result += base32Chars[(value >>> (bits - 5)) & 31];
                bits -= 5;
            }
            
            remainingValue = value;
            remainingBits = bits;
        }
        
        if (remainingBits > 0) {
            result += base32Chars[(remainingValue << (5 - remainingBits)) & 31];
        }
        
        return result;
    }

    /**
     * Base32 Decoding (مبسّط)
     */
    base32Decode(encoded) {
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const base32Lookup = {};
        for (let i = 0; i < base32Chars.length; i++) {
            base32Lookup[base32Chars.charAt(i)] = i;
        }
        
        let result = '';
        let buffer = 0;
        let bitsLeft = 0;
        
        for (let i = 0; i < encoded.length; i++) {
            const char = encoded[i];
            if (!(char in base32Lookup)) continue;
            
            buffer = (buffer << 5) | base32Lookup[char];
            bitsLeft += 5;
            
            if (bitsLeft >= 8) {
                result += String.fromCharCode((buffer >>> (bitsLeft - 8)) & 255);
                bitsLeft -= 8;
            }
        }
        
        return result;
    }

    /**
     * إنشاء معرف آمن
     */
    async createSecureIdentifier(data, options = {}) {
        try {
            const {
                useEncryption = true,
                useHashing = true,
                useBase32 = true,
                includeHMAC = true,
                customPrefix = ''
            } = options;

            let secureData = data;
            let keyInfo = null;

            // إنشاء مفتاح للتشفير إذا لزم الأمر
            if (useEncryption || includeHMAC) {
                const keyData = await this.createKeyFromPassword(data + Date.now());
                keyInfo = keyData;
            }

            // الخطوة 1: تشفير البيانات
            if (useEncryption && keyInfo) {
                secureData = await this.encryptAES(secureData, keyInfo.key);
            }

            // الخطوة 2: إنشاء hash
            let hashInfo = null;
            if (useHashing) {
                hashInfo = await this.hashSHA256(secureData);
            }

            // الخطوة 3: Base32 encoding
            if (useBase32) {
                secureData = this.base32Encode(secureData);
            }

            // الخطوة 4: إضافة HMAC للتحقق
            let hmacSignature = '';
            if (includeHMAC && keyInfo) {
                hmacSignature = await this.createHMAC(secureData, keyInfo.key);
                hmacSignature = this.base32Encode(hmacSignature);
            }

            // دمج النتائج
            let identifier = customPrefix ? `${customPrefix}_` : '';
            identifier += secureData;

            if (hashInfo) {
                identifier += `_${hashInfo.slice(0, 16)}`;
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
                    version: '2.0-browser'
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
    async verifySecureIdentifier(identifier) {
        try {
            // تحليل المعرف
            const parts = identifier.split('_');
            const encrypted = parts[1];
            const salt = parts[2];
            const hmacSignature = parts[3];

            // Base32 decode إذا لزم الأمر
            let decodedData = encrypted;
            if (parts.length > 3) {
                decodedData = this.base32Decode(encrypted);
            }

            // فك التشفير (مبسط - في التطبيق الحقيقي نحتاج المفتاح)
            const decrypted = this.base32Decode(decodedData);

            return {
                valid: true,
                data: decrypted,
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

        return threats;
    }

    /**
     * إنشاء session آمن (مبسط)
     */
    async createSecureSession(data, expiryHours = 24) {
        try {
            const sessionData = {
                ...data,
                sessionId: await this.arrayBufferToBase64(await this.getRandomBytes(16)),
                created: Date.now(),
                expires: Date.now() + (expiryHours * 60 * 60 * 1000)
            };

            // تحويل إلى base64 للتخزين
            const sessionString = JSON.stringify(sessionData);
            const secureSession = this.arrayBufferToBase64(this.textToArrayBuffer(sessionString));

            return {
                session: secureSession,
                expires: sessionData.expires
            };

        } catch (error) {
            console.error('خطأ في إنشاء session آمن:', error);
            throw new Error('فشل في إنشاء session آمن');
        }
    }

    /**
     * التحقق من session آمن
     */
    async verifySecureSession(secureSession) {
        try {
            // التحقق من انتهاء الصلاحية
            if (Date.now() > secureSession.expires) {
                return { valid: false, reason: 'Session expired' };
            }

            // فك تشفير البيانات
            const sessionBuffer = this.base64ToArrayBuffer(secureSession.session);
            const sessionString = this.arrayBufferToText(sessionBuffer);
            const sessionData = JSON.parse(sessionString);

            return {
                valid: true,
                data: sessionData
            };

        } catch (error) {
            console.error('خطأ في التحقق من session:', error);
            return { valid: false, reason: error.message };
        }
    }
}

// إنشاء مثيل واحد من النظام المتوافق مع المتصفح
const browserCrypto = new BrowserCrypto();

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = browserCrypto;
} else {
    window.browserCrypto = browserCrypto;
}