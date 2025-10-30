/**
 * نظام Rate Limiting المتقدم والحماية من الهجمات
 * Advanced Rate Limiting and Attack Protection System
 * 
 * يوفر:
 * - حماية من Brute Force Attacks
 * - نظام Rate Limiting متقدم
 * - كشف أنماط الاستخدام المشبوهة
 * - إيقاف مؤقت للحسابات المشبوهة
 * - إدارة ذكية للمخاطر
 */

const crypto = require('crypto');

class AdvancedRateLimiter {
    constructor() {
        // إعدادات Rate Limiting
        this.config = {
            // الحدود الأساسية
            maxRequests: 100, // طلبات في الدقيقة
            windowMs: 60 * 1000, // نافذة زمنية دقيقة واحدة
            maxFailedAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 دقيقة
            maxLockouts: 3, // عدد الإيقافات قبل الحظر الدائم
            
            // حدود متقدمة
            burstLimit: 10, // طلبات متتالية مسموحة
            burstWindow: 1000, // نافذة الدُفعة بالميلي ثانية
            progressiveDelay: true,
            baseDelay: 1000, // تأخير أساسي بالميلي ثانية
            
            // حدود IP
            ipMaxRequests: 1000,
            ipWindowMs: 60 * 60 * 1000, // ساعة واحدة
            ipSuspiciousThreshold: 50,
            
            // حدود المستخدم
            userMaxRequests: 500,
            userWindowMs: 60 * 60 * 1000,
            userIdPatternThreshold: 10,
            
            // حدود API
            apiKeyMaxRequests: 10000,
            apiKeyWindowMs: 60 * 60 * 1000,
            
            // حدود المسارات
            pathLimits: new Map(),
            customLimits: new Map()
        };

        // تتبع معدلات الاستخدام
        this.requestTrackers = new Map(); // التتبع العام
        this.ipTrackers = new Map(); // تتبع عناوين IP
        this.userTrackers = new Map(); // تتبع المستخدمين
        this.sessionTrackers = new Map(); // تتبع الجلسات
        this.apiKeyTrackers = new Map(); // تتبع مفاتيح API
        this.pathTrackers = new Map(); // تتبع المسارات
        
        // حماية من الهجمات
        this.attackProtection = {
            blockedIPs: new Set(),
            blockedUsers: new Set(),
            blockedSessions: new Set(),
            suspiciousPatterns: new Map(),
            threatIntelligence: new Map(),
            attackSignatures: new Map()
        };
        
        // تحليل السلوك
        this.behaviorAnalysis = {
            normalPatterns: new Map(),
            anomalyDetection: new Map(),
            riskScoring: new Map(),
            adaptiveLimits: new Map()
        };
        
        // إحصائيات الأداء
        this.metrics = {
            totalRequests: 0,
            blockedRequests: 0,
            legitimateRequests: 0,
            attackAttempts: 0,
            falsePositives: 0,
            averageResponseTime: 0,
            peakLoad: 0
        };
        
        // تهيئة أنماط الهجمات المعروفة
        this.initializeAttackSignatures();
        
        // بدء التنظيف التلقائي
        this.startMaintenanceTasks();
    }

    /**
     * تهيئة أنماط الهجمات المعروفة
     */
    initializeAttackSignatures() {
        this.attackProtection.attackSignatures.set('sql_injection', [
            /union|select|insert|update|delete|drop|create|alter/gi
        ]);
        
        this.attackProtection.attackSignatures.set('xss', [
            /<script|javascript:|on\w+=/gi,
            /<iframe|<object|<embed|<link/gi,
            /document\.cookie|window\.location/gi
        ]);
        
        this.attackProtection.attackSignatures.set('path_traversal', [
            /(\.\.\/|\.\.\\)/gi,
            /%2e%2e%2f|%2e%2e%5c/gi
        ]);
        
        this.attackProtection.attackSignatures.set('command_injection', [
            /[;\|\$()<>{}`]/gi,
            /rm\s+-rf|cat\s+\/etc\/passwd/gi
        ]);
        
        this.attackProtection.attackSignatures.set('brute_force', [
            /admin|administrator|root|sa/gi,
            /password|passwd|pwd/gi,
            /123456|password|qwerty|admin/gi
        ]);
    }

    /**
     * فحص معدل الطلب مع الحماية المتقدمة
     */
    async checkRateLimit(requestInfo) {
        const startTime = Date.now();
        
        try {
            // جمع معلومات الطلب
            const requestData = this.extractRequestData(requestInfo);
            
            // فحص الحظر الحالي
            if (await this.isBlocked(requestData)) {
                this.metrics.blockedRequests++;
                return {
                    allowed: false,
                    reason: 'BLOCKED',
                    retryAfter: await this.getBlockExpiry(requestData),
                    riskScore: 100
                };
            }
            
            // فحص أنماط الهجمات
            const attackThreats = await this.detectAttacks(requestData);
            if (attackThreats.length > 0) {
                await this.handleAttack(requestData, attackThreats);
                this.metrics.attackAttempts++;
                return {
                    allowed: false,
                    reason: 'ATTACK_DETECTED',
                    threats: attackThreats,
                    riskScore: 95
                };
            }
            
            // فحص حدود المعدل المتعددة
            const rateLimitResult = await this.checkMultipleLimits(requestData);
            if (!rateLimitResult.allowed) {
                this.metrics.blockedRequests++;
                await this.recordFailedAttempt(requestData);
                return rateLimitResult;
            }
            
            // تحليل السلوك المتقدم
            const behaviorAnalysis = await this.analyzeBehavior(requestData);
            if (behaviorAnalysis.riskScore > 80) {
                await this.handleSuspiciousActivity(requestData, behaviorAnalysis);
                return {
                    allowed: false,
                    reason: 'SUSPICIOUS_BEHAVIOR',
                    riskScore: behaviorAnalysis.riskScore,
                    anomalies: behaviorAnalysis.anomalies
                };
            }
            
            // تسجيل الطلب الناجح
            await this.recordSuccessfulRequest(requestData);
            this.metrics.legitimateRequests++;
            
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime);
            
            return {
                allowed: true,
                riskScore: behaviorAnalysis.riskScore,
                remainingRequests: rateLimitResult.remaining,
                resetTime: rateLimitResult.resetTime
            };
            
        } catch (error) {
            console.error('خطأ في فحص معدل الطلب:', error);
            
            // في حالة الخطأ، نمنح تقديراً محافظاً
            return {
                allowed: true,
                reason: 'SYSTEM_ERROR',
                riskScore: 50
            };
        }
    }

    /**
     * استخراج معلومات الطلب
     */
    extractRequestData(requestInfo) {
        return {
            ip: this.getClientIP(requestInfo),
            userId: requestInfo.userId || null,
            sessionId: requestInfo.sessionId || null,
            apiKey: requestInfo.apiKey || null,
            path: requestInfo.path || '/',
            method: requestInfo.method || 'GET',
            userAgent: requestInfo.userAgent || '',
            headers: requestInfo.headers || {},
            body: requestInfo.body || '',
            timestamp: Date.now(),
            requestId: requestInfo.requestId || crypto.randomBytes(8).toString('hex')
        };
    }

    /**
     * الحصول على عنوان IP الحقيقي
     */
    getClientIP(requestInfo) {
        // فحص headers مختلفة للحصول على IP الحقيقي
        const possibleIPs = [
            requestInfo.ip,
            requestInfo.headers['x-forwarded-for'],
            requestInfo.headers['x-real-ip'],
            requestInfo.headers['cf-connecting-ip'],
            requestInfo.connection?.remoteAddress,
            requestInfo.socket?.remoteAddress
        ];
        
        // أخذ أول IP صحيح
        for (const ip of possibleIPs) {
            if (ip && typeof ip === 'string') {
                // إزالة المساحات والفواصل
                const cleanIP = ip.split(',')[0].trim();
                if (this.isValidIP(cleanIP)) {
                    return cleanIP;
                }
            }
        }
        
        return 'unknown';
    }

    /**
     * التحقق من صحة عنوان IP
     */
    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        
        return ipRegex.test(ip) || ipv6Regex.test(ip);
    }

    /**
     * فحص الحدود المتعددة
     */
    async checkMultipleLimits(requestData) {
        const limits = [
            { type: 'general', tracker: this.requestTrackers, config: this.config },
            { type: 'ip', tracker: this.ipTrackers, config: this.config },
            { type: 'user', tracker: this.userTrackers, config: this.config },
            { type: 'session', tracker: this.sessionTrackers, config: this.config },
            { type: 'apiKey', tracker: this.apiKeyTrackers, config: this.config },
            { type: 'path', tracker: this.pathTrackers, config: this.config }
        ];
        
        let mostRestrictive = null;
        
        for (const limit of limits) {
            const result = await this.checkSingleLimit(requestData, limit);
            
            if (!result.allowed) {
                return result;
            }
            
            if (!mostRestrictive || result.remaining < mostRestrictive.remaining) {
                mostRestrictive = result;
            }
        }
        
        return mostRestrictive;
    }

    /**
     * فحص حد واحد
     */
    async checkSingleLimit(requestData, limit) {
        const key = this.getTrackerKey(requestData, limit.type);
        const tracker = limit.tracker;
        const config = limit.config;
        
        // الحصول على بيانات التتبع
        let trackerData = tracker.get(key);
        if (!trackerData) {
            trackerData = {
                requests: [],
                failedAttempts: 0,
                lockoutUntil: null,
                lockoutCount: 0,
                riskScore: 0
            };
            tracker.set(key, trackerData);
        }
        
        // فحص الإيقاف المؤقت
        if (trackerData.lockoutUntil && Date.now() < trackerData.lockoutUntil) {
            return {
                allowed: false,
                reason: 'LOCKED_OUT',
                retryAfter: trackerData.lockoutUntil - Date.now(),
                lockoutCount: trackerData.lockoutCount
            };
        }
        
        // تنظيف الطلبات القديمة
        this.cleanOldRequests(trackerData, config.windowMs || config.ipWindowMs || config.userWindowMs);
        
        // فحص عدد الطلبات
        const maxRequests = this.getMaxRequests(limit.type, requestData);
        if (trackerData.requests.length >= maxRequests) {
            return {
                allowed: false,
                reason: 'RATE_LIMIT_EXCEEDED',
                retryAfter: this.getResetTime(trackerData, config),
                remaining: 0,
                resetTime: this.getResetTime(trackerData, config)
            };
        }
        
        // إضافة الطلب الحالي
        trackerData.requests.push(Date.now());
        
        // حساب الطلبات المتبقية
        const remaining = maxRequests - trackerData.requests.length;
        
        return {
            allowed: true,
            remaining,
            resetTime: this.getResetTime(trackerData, config)
        };
    }

    /**
     * الحصول على الحد الأقصى للطلبات
     */
    getMaxRequests(type, requestData) {
        const baseLimits = {
            general: this.config.maxRequests,
            ip: this.config.ipMaxRequests,
            user: this.config.userMaxRequests,
            session: this.config.maxRequests * 2,
            apiKey: this.config.apiKeyMaxRequests
        };
        
        // حد مخصص للمسار
        if (type === 'path' && requestData.path) {
            const pathLimit = this.config.customLimits.get(requestData.path);
            if (pathLimit) {
                return pathLimit.maxRequests;
            }
        }
        
        return baseLimits[type] || this.config.maxRequests;
    }

    /**
     * تنظيف الطلبات القديمة
     */
    cleanOldRequests(trackerData, windowMs) {
        const now = Date.now();
        const cutoff = now - windowMs;
        
        trackerData.requests = trackerData.requests.filter(
            timestamp => timestamp > cutoff
        );
    }

    /**
     * حساب وقت إعادة التعيين
     */
    getResetTime(trackerData, config) {
        if (trackerData.requests.length === 0) {
            return Date.now();
        }
        
        const oldestRequest = Math.min(...trackerData.requests);
        const windowMs = config.windowMs || config.ipWindowMs || config.userWindowMs;
        
        return oldestRequest + windowMs;
    }

    /**
     * الحصول على مفتاح التتبع
     */
    getTrackerKey(requestData, type) {
        switch (type) {
            case 'ip':
                return `IP:${requestData.ip}`;
            case 'user':
                return `USER:${requestData.userId || 'anonymous'}`;
            case 'session':
                return `SESSION:${requestData.sessionId || 'default'}`;
            case 'apiKey':
                return `API:${requestData.apiKey || 'none'}`;
            case 'path':
                return `PATH:${requestData.path}`;
            case 'general':
            default:
                return `${requestData.ip}:${requestData.userId || 'anonymous'}`;
        }
    }

    /**
     * كشف الهجمات
     */
    async detectAttacks(requestData) {
        const threats = [];
        
        // فحص أنماط الهجمات في البيانات
        const dataToCheck = [
            requestData.path,
            requestData.userAgent,
            JSON.stringify(requestData.body),
            JSON.stringify(requestData.headers)
        ];
        
        for (const [attackType, patterns] of this.attackProtection.attackSignatures) {
            for (const data of dataToCheck) {
                if (typeof data !== 'string') continue;
                
                for (const pattern of patterns) {
                    if (pattern.test(data)) {
                        threats.push({
                            type: attackType,
                            pattern: pattern.toString(),
                            evidence: data.substring(0, 100),
                            confidence: this.calculateThreatConfidence(attackType, data)
                        });
                        break;
                    }
                }
            }
        }
        
        // فحص معدلات الطلبات غير الطبيعية
        const trafficThreats = await this.detectTrafficAnomalies(requestData);
        threats.push(...trafficThreats);
        
        return threats;
    }

    /**
     * حساب مستوى الثقة في التهديد
     */
    calculateThreatConfidence(attackType, data) {
        let confidence = 50; // مستوى أساسي
        
        // زيادة الثقة حسب نوع الهجوم
        const confidenceBoost = {
            'sql_injection': 30,
            'xss': 25,
            'command_injection': 35,
            'path_traversal': 20,
            'brute_force': 40
        };
        
        confidence += confidenceBoost[attackType] || 0;
        
        // فحص length البيانات
        if (data.length > 1000) confidence += 10;
        if (data.length > 5000) confidence += 20;
        
        // فحص تعدد الأنماط
        const patternCount = data.match(/[<>\"'&]/g)?.length || 0;
        if (patternCount > 10) confidence += 15;
        
        return Math.min(100, confidence);
    }

    /**
     * كشف الشذوذ في حركة المرور
     */
    async detectTrafficAnomalies(requestData) {
        const threats = [];
        
        // فحص معدل الطلبات المرتفع
        const ipData = this.ipTrackers.get(`IP:${requestData.ip}`);
        if (ipData) {
            const recentRequests = ipData.requests.filter(
                time => Date.now() - time < 60000 // آخر دقيقة
            );
            
            if (recentRequests.length > this.config.ipSuspiciousThreshold) {
                threats.push({
                    type: 'high_request_rate',
                    confidence: 80,
                    evidence: `${recentRequests.length} طلب في الدقيقة`
                });
            }
        }
        
        // فحص التكرار في المسارات
        const pathData = this.pathTrackers.get(`PATH:${requestData.path}`);
        if (pathData) {
            const recentPathRequests = pathData.requests.filter(
                time => Date.now() - time < 30000 // آخر 30 ثانية
            );
            
            if (recentPathRequests.length > 10) {
                threats.push({
                    type: 'path_flooding',
                    confidence: 90,
                    evidence: `${recentPathRequests.length} طلب للمسار نفسه`
                });
            }
        }
        
        return threats;
    }

    /**
     * التعامل مع الهجمات
     */
    async handleAttack(requestData, threats) {
        const primaryThreat = threats[0];
        
        // حساب مدة الحظر حسب نوع التهديد
        const banDuration = this.getBanDuration(primaryThreat.type);
        
        // حظر IP
        this.attackProtection.blockedIPs.add(requestData.ip);
        
        // حظر المستخدم إذا كان معروف
        if (requestData.userId) {
            this.attackProtection.blockedUsers.add(requestData.userId);
        }
        
        // تسجيل التهديد
        this.recordThreat(requestData, threats, banDuration);
        
        // إرسال تنبيه
        await this.sendThreatAlert(requestData, threats);
        
        console.warn(`🚨 تم اكتشاف هجوم: ${primaryThreat.type} من ${requestData.ip}`, threats);
    }

    /**
     * حساب مدة الحظر
     */
    getBanDuration(threatType) {
        const banDurations = {
            'sql_injection': 60 * 60 * 1000, // ساعة واحدة
            'xss': 30 * 60 * 1000, // 30 دقيقة
            'command_injection': 2 * 60 * 60 * 1000, // ساعتان
            'path_traversal': 60 * 60 * 1000, // ساعة واحدة
            'brute_force': 24 * 60 * 60 * 1000, // يوم واحد
            'high_request_rate': 15 * 60 * 1000, // 15 دقيقة
            'path_flooding': 5 * 60 * 1000 // 5 دقائق
        };
        
        return banDurations[threatType] || 15 * 60 * 1000;
    }

    /**
     * تسجيل التهديد
     */
    recordThreat(requestData, threats, banDuration) {
        const threatRecord = {
            id: crypto.randomBytes(8).toString('hex'),
            ip: requestData.ip,
            userId: requestData.userId,
            threats,
            timestamp: Date.now(),
            banDuration,
            bannedUntil: Date.now() + banDuration,
            severity: this.calculateThreatSeverity(threats),
            resolved: false
        };
        
        // حفظ في قاعدة البيانات (يمكن حفظها في قاعدة بيانات حقيقية)
        if (!this.threatRecords) {
            this.threatRecords = [];
        }
        
        this.threatRecords.push(threatRecord);
        
        // الاحتفاظ بآخر 1000 تهديد فقط
        if (this.threatRecords.length > 1000) {
            this.threatRecords = this.threatRecords.slice(-1000);
        }
    }

    /**
     * حساب خطورة التهديد
     */
    calculateThreatSeverity(threats) {
        const severityScores = {
            'sql_injection': 90,
            'command_injection': 95,
            'xss': 70,
            'path_traversal': 80,
            'brute_force': 85,
            'high_request_rate': 60,
            'path_flooding': 50
        };
        
        const maxScore = Math.max(...threats.map(t => severityScores[t.type] || 50));
        
        if (maxScore >= 90) return 'CRITICAL';
        if (maxScore >= 70) return 'HIGH';
        if (maxScore >= 50) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * إرسال تنبيه التهديد
     */
    async sendThreatAlert(requestData, threats) {
        const alert = {
            type: 'SECURITY_THREAT_DETECTED',
            severity: this.calculateThreatSeverity(threats),
            source: requestData.ip,
            userId: requestData.userId,
            threats: threats.map(t => t.type),
            timestamp: Date.now(),
            details: {
                userAgent: requestData.userAgent,
                path: requestData.path,
                evidence: threats.map(t => t.evidence)
            }
        };
        
        // طباعة التنبيه
        console.error('🔒 تنبيه أمني:', alert);
        
        // يمكن إرسال الإشعار إلى نظام مراقبة خارجي
        // await this.sendToExternalMonitor(alert);
        
        return alert.id;
    }

    /**
     * فحص الحظر
     */
    async isBlocked(requestData) {
        // فحص حظر IP
        if (this.attackProtection.blockedIPs.has(requestData.ip)) {
            return true;
        }
        
        // فحص حظر المستخدم
        if (requestData.userId && this.attackProtection.blockedUsers.has(requestData.userId)) {
            return true;
        }
        
        // فحص حظر الجلسة
        if (requestData.sessionId && this.attackProtection.blockedSessions.has(requestData.sessionId)) {
            return true;
        }
        
        return false;
    }

    /**
     * الحصول على وقت انتهاء الحظر
     */
    async getBlockExpiry(requestData) {
        // البحث عن أحدث حظر لـ IP
        const ipThreats = this.threatRecords?.filter(t => 
            t.ip === requestData.ip && !t.resolved
        ) || [];
        
        if (ipThreats.length > 0) {
            const latestThreat = ipThreats.sort((a, b) => b.timestamp - a.timestamp)[0];
            return latestThreat.bannedUntil;
        }
        
        return Date.now() + this.config.lockoutDuration;
    }

    /**
     * تحليل السلوك المتقدم
     */
    async analyzeBehavior(requestData) {
        const analysis = {
            riskScore: 0,
            anomalies: [],
            patterns: [],
            confidence: 0
        };
        
        // تحليل معدل الطلبات
        const requestRateAnalysis = await this.analyzeRequestRate(requestData);
        analysis.riskScore += requestRateAnalysis.risk;
        analysis.anomalies.push(...requestRateAnalysis.anomalies);
        
        // تحليل المسارات
        const pathAnalysis = await this.analyzePathPatterns(requestData);
        analysis.riskScore += pathAnalysis.risk;
        analysis.patterns.push(...pathAnalysis.patterns);
        
        // تحليل User Agent
        const userAgentAnalysis = await this.analyzeUserAgent(requestData);
        analysis.riskScore += userAgentAnalysis.risk;
        analysis.anomalies.push(...userAgentAnalysis.anomalies);
        
        // تحليل توقيت الطلب
        const timingAnalysis = await this.analyzeRequestTiming(requestData);
        analysis.riskScore += timingAnalysis.risk;
        
        // تحديد مستوى الثقة
        analysis.confidence = Math.min(100, analysis.riskScore + (analysis.anomalies.length * 5));
        
        return analysis;
    }

    /**
     * تحليل معدل الطلبات
     */
    async analyzeRequestRate(requestData) {
        const ipKey = `IP:${requestData.ip}`;
        const ipData = this.ipTrackers.get(ipKey);
        
        if (!ipData) {
            return { risk: 0, anomalies: [] };
        }
        
        const anomalies = [];
        let risk = 0;
        
        // فحص النمط المنتظم
        const intervals = this.calculateRequestIntervals(ipData.requests);
        const regularPattern = this.detectRegularPattern(intervals);
        
        if (regularPattern.regularity > 0.8) {
            anomalies.push('regular_request_pattern');
            risk += 30;
        }
        
        // فحص المعدل العالي
        const recentRequests = ipData.requests.filter(
            time => Date.now() - time < 30000 // آخر 30 ثانية
        );
        
        if (recentRequests.length > 5) {
            anomalies.push('high_burst_rate');
            risk += 20;
        }
        
        return { risk, anomalies };
    }

    /**
     * تحليل أنماط المسارات
     */
    async analyzePathPatterns(requestData) {
        const patterns = [];
        let risk = 0;
        
        // فحص المسارات الحساسة
        const sensitivePaths = ['/admin', '/config', '/api/admin', '/users'];
        if (sensitivePaths.some(path => requestData.path.includes(path))) {
            patterns.push('accessing_sensitive_path');
            risk += 15;
        }
        
        // فحص أنماط غير طبيعية في المسارات
        if (requestData.path.includes('..') || requestData.path.includes('%2e%2e')) {
            patterns.push('path_traversal_attempt');
            risk += 40;
        }
        
        return { risk, patterns };
    }

    /**
     * تحليل User Agent
     */
    async analyzeUserAgent(requestData) {
        const anomalies = [];
        let risk = 0;
        
        const userAgent = requestData.userAgent.toLowerCase();
        
        // فحص User Agents المريبة
        const suspiciousAgents = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget'
        ];
        
        if (suspiciousAgents.some(agent => userAgent.includes(agent))) {
            anomalies.push('suspicious_user_agent');
            risk += 25;
        }
        
        // فحص User Agent فارغ أو قصير جداً
        if (!userAgent || userAgent.length < 10) {
            anomalies.push('missing_or_short_user_agent');
            risk += 15;
        }
        
        // فحص User Agent متغير
        if (this.isUserAgentChanging(requestData)) {
            anomalies.push('changing_user_agent');
            risk += 20;
        }
        
        return { risk, anomalies };
    }

    /**
     * تحليل توقيت الطلب
     */
    async analyzeRequestTiming(requestData) {
        const now = new Date();
        const hour = now.getHours();
        let risk = 0;
        
        // فحص خارج ساعات العمل
        if (hour < 6 || hour > 22) {
            risk += 10;
        }
        
        // فحص عطلة نهاية الأسبوع
        if (now.getDay() === 0 || now.getDay() === 6) {
            risk += 5;
        }
        
        return { risk };
    }

    /**
     * التعامل مع النشاط المشبوه
     */
    async handleSuspiciousActivity(requestData, analysis) {
        // زيادة مستوى المراقبة
        this.increaseMonitoringLevel(requestData, analysis.riskScore);
        
        // تطبيق حدود أكثر تقييداً
        this.applyStrictLimits(requestData);
        
        // تسجيل النشاط المشبوه
        const alert = {
            type: 'SUSPICIOUS_ACTIVITY',
            riskScore: analysis.riskScore,
            anomalies: analysis.anomalies,
            source: requestData.ip,
            timestamp: Date.now()
        };
        
        console.warn('⚠️ نشاط مشبوه:', alert);
    }

    /**
     * زيادة مستوى المراقبة
     */
    increaseMonitoringLevel(requestData, riskScore) {
        const level = riskScore > 80 ? 'HIGH' : riskScore > 60 ? 'MEDIUM' : 'LOW';
        
        // يمكن تطبيق حدود أكثر صرامة حسب المستوى
        if (level === 'HIGH') {
            // تطبيق حدود صارمة مؤقتاً
            this.applyTemporaryStrictLimits(requestData);
        }
    }

    /**
     * تسجيل محاولة فاشلة
     */
    async recordFailedAttempt(requestData) {
        const key = this.getTrackerKey(requestData, 'general');
        const tracker = this.requestTrackers.get(key) || {
            requests: [],
            failedAttempts: 0,
            lockoutUntil: null,
            lockoutCount: 0,
            riskScore: 0
        };
        
        tracker.failedAttempts++;
        tracker.riskScore += 10;
        
        // فحص الحاجة للإيقاف المؤقت
        if (tracker.failedAttempts >= this.config.maxFailedAttempts) {
            await this.applyLockout(tracker, requestData);
        }
        
        this.requestTrackers.set(key, tracker);
    }

    /**
     * تطبيق الإيقاف المؤقت
     */
    async applyLockout(tracker, requestData) {
        const delay = this.config.baseDelay * Math.pow(2, tracker.lockoutCount);
        tracker.lockoutUntil = Date.now() + delay;
        tracker.lockoutCount++;
        
        console.warn(`🔒 تم إيقاف مؤقت: ${requestData.ip} لمدة ${delay / 1000} ثانية`);
        
        // حظر مؤقت إذا تعددت الإيقافات
        if (tracker.lockoutCount >= this.config.maxLockouts) {
            this.attackProtection.blockedIPs.add(requestData.ip);
            console.error(`🚫 حظر دائم: ${requestData.ip} لتعدد المخالفات`);
        }
    }

    /**
     * تسجيل طلب ناجح
     */
    async recordSuccessfulRequest(requestData) {
        const key = this.getTrackerKey(requestData, 'general');
        const tracker = this.requestTrackers.get(key);
        
        if (tracker) {
            // تقليل نقاط المخاطر تدريجياً
            tracker.riskScore = Math.max(0, tracker.riskScore - 5);
            
            // إعادة تعيين المحاولات الفاشلة
            if (tracker.failedAttempts > 0 && Math.random() < 0.1) {
                tracker.failedAttempts = Math.max(0, tracker.failedAttempts - 1);
            }
        }
    }

    /**
     * تحديث المقاييس
     */
    updateMetrics(responseTime) {
        this.metrics.totalRequests++;
        this.metrics.averageResponseTime = 
            (this.metrics.averageResponseTime + responseTime) / 2;
        
        // تحديث الذروة
        this.metrics.peakLoad = Math.max(
            this.metrics.peakLoad,
            this.requestTrackers.size
        );
    }

    /**
     * حساب فترات الطلبات
     */
    calculateRequestIntervals(requests) {
        const intervals = [];
        for (let i = 1; i < requests.length; i++) {
            intervals.push(requests[i] - requests[i - 1]);
        }
        return intervals;
    }

    /**
     * كشف النمط المنتظم
     */
    detectRegularPattern(intervals) {
        if (intervals.length < 3) {
            return { regularity: 0 };
        }
        
        // حساب التباين
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - mean, 2);
        }, 0) / intervals.length;
        
        const coefficientOfVariation = Math.sqrt(variance) / mean;
        const regularity = Math.max(0, 1 - coefficientOfVariation);
        
        return { regularity, coefficientOfVariation };
    }

    /**
     * فحص تغيير User Agent
     */
    isUserAgentChanging(requestData) {
        // هذا يتطلب تتبع تاريخ User Agents للـ IP
        // تنفيذ مبسط للعرض التوضيحي
        return false;
    }

    /**
     * تطبيق حدود صارمة مؤقتاً
     */
    applyTemporaryStrictLimits(requestData) {
        // تقليل الحدود مؤقتاً للـ IP المشبوه
        const ipKey = `IP:${requestData.ip}`;
        const ipTracker = this.ipTrackers.get(ipKey);
        
        if (ipTracker) {
            ipTracker.strictMode = true;
            ipTracker.strictUntil = Date.now() + 30 * 60 * 1000; // 30 دقيقة
        }
    }

    /**
     * تطبيق حدود صارمة
     */
    applyStrictLimits(requestData) {
        // تطبيق حدود صارمة للمستخدم المشبوه
        if (requestData.userId) {
            const userKey = `USER:${requestData.userId}`;
            const userTracker = this.userTrackers.get(userKey);
            
            if (userTracker) {
                userTracker.strictMode = true;
                userTracker.maxRequests = Math.floor(userTracker.maxRequests * 0.5); // تقليل 50%
            }
        }
    }

    /**
     * بدء مهام الصيانة
     */
    startMaintenanceTasks() {
        // تنظيف دوري كل 5 دقائق
        setInterval(() => {
            this.cleanupExpiredBlocks();
            this.resetOldTrackers();
            this.generateMaintenanceReport();
        }, 5 * 60 * 1000);
    }

    /**
     * تنظيف الحظر المنتهي
     */
    cleanupExpiredBlocks() {
        const now = Date.now();
        
        // حذف IP المحظورة المنتهية الصلاحية
        for (const threat of this.threatRecords || []) {
            if (threat.bannedUntil < now && !threat.permanent) {
                this.attackProtection.blockedIPs.delete(threat.ip);
                threat.resolved = true;
            }
        }
    }

    /**
     * إعادة تعيين المتتبعات القديمة
     */
    resetOldTrackers() {
        const now = Date.now();
        const maxAge = 60 * 60 * 1000; // ساعة واحدة
        
        const allTrackers = [
            this.requestTrackers,
            this.ipTrackers,
            this.userTrackers,
            this.sessionTrackers,
            this.apiKeyTrackers,
            this.pathTrackers
        ];
        
        allTrackers.forEach(trackerMap => {
            for (const [key, data] of trackerMap) {
                if (data.lastActivity && now - data.lastActivity > maxAge) {
                    trackerMap.delete(key);
                }
            }
        });
    }

    /**
     * إنشاء تقرير صيانة
     */
    generateMaintenanceReport() {
        const report = {
            timestamp: Date.now(),
            activeTrackers: {
                general: this.requestTrackers.size,
                ip: this.ipTrackers.size,
                user: this.userTrackers.size,
                session: this.sessionTrackers.size,
                apiKey: this.apiKeyTrackers.size,
                path: this.pathTrackers.size
            },
            blockedEntities: {
                ips: this.attackProtection.blockedIPs.size,
                users: this.attackProtection.blockedUsers.size,
                sessions: this.attackProtection.blockedSessions.size
            },
            metrics: this.metrics,
            threats: this.threatRecords?.length || 0
        };
        
        console.log('📊 تقرير صيانة Rate Limiter:', report);
        
        return report;
    }

    /**
     * تصدير الإحصائيات
     */
    exportStatistics() {
        return {
            metrics: this.metrics,
            activeTrackers: {
                general: this.requestTrackers.size,
                ip: this.ipTrackers.size,
                user: this.userTrackers.size,
                session: this.sessionTrackers.size,
                apiKey: this.apiKeyTrackers.size,
                path: this.pathTrackers.size
            },
            security: {
                blockedIPs: this.attackProtection.blockedIPs.size,
                blockedUsers: this.attackProtection.blockedUsers.size,
                threatsDetected: this.threatRecords?.length || 0
            },
            config: this.config
        };
    }

    /**
     * إضافة حد مخصص لمسار
     */
    addPathLimit(path, maxRequests, windowMs) {
        this.config.customLimits.set(path, {
            maxRequests,
            windowMs: windowMs || this.config.windowMs
        });
    }

    /**
     * إزالة حد مخصص
     */
    removePathLimit(path) {
        this.config.customLimits.delete(path);
    }

    /**
     * رفع الحظر عن IP
     */
    unblockIP(ip) {
        this.attackProtection.blockedIPs.delete(ip);
        
        // تنظيف متتبعات IP
        this.ipTrackers.delete(`IP:${ip}`);
        
        // تحديث التهديدات
        if (this.threatRecords) {
            this.threatRecords.forEach(threat => {
                if (threat.ip === ip) {
                    threat.resolved = true;
                }
            });
        }
    }

    /**
     * رفع الحظر عن مستخدم
     */
    unblockUser(userId) {
        this.attackProtection.blockedUsers.delete(userId);
        this.userTrackers.delete(`USER:${userId}`);
    }

    /**
     * الحصول على التهديدات
     */
    getThreats(filters = {}) {
        if (!this.threatRecords) {
            return [];
        }
        
        let threats = [...this.threatRecords];
        
        if (filters.severity) {
            threats = threats.filter(t => t.severity === filters.severity);
        }
        
        if (filters.resolved !== undefined) {
            threats = threats.filter(t => t.resolved === filters.resolved);
        }
        
        if (filters.since) {
            threats = threats.filter(t => t.timestamp >= filters.since);
        }
        
        return threats.sort((a, b) => b.timestamp - a.timestamp);
    }
}

// إنشاء مثيل واحد من النظام
const advancedRateLimiter = new AdvancedRateLimiter();

module.exports = advancedRateLimiter;