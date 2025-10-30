/**
 * نظام المراقبة والتدقيق الشامل
 * Comprehensive Audit and Monitoring System
 * 
 * يوفر:
 * - تسجيل شامل لجميع العمليات
 * - تنبيهات فورية للأنشطة المشبوهة
 * - تقارير استخدام مفصلة
 * - مراقبة عناوين IP والمتصفحات
 * - تحليل الأنماط والسلوك
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuditLogger {
    constructor() {
        // إعدادات التسجيل
        this.config = {
            logRetentionDays: 90,
            maxLogSize: 100 * 1024 * 1024, // 100 MB
            batchSize: 100,
            autoCleanup: true,
            compressionEnabled: true,
            encryptionEnabled: true,
            maxConcurrentLogs: 1000
        };

        // مناطق التخزين
        this.logs = new Map(); // Log entries
        this.userSessions = new Map(); // جلسات المستخدمين
        this.ipTracking = new Map(); // تتبع عناوين IP
        this.behavioralAnalysis = new Map(); // تحليل السلوك
        this.alertQueue = []; // قائمة التنبيهات
        
        // مؤشرات الأداء
        this.performanceMetrics = {
            totalLogs: 0,
            logsPerSecond: 0,
            errorsCount: 0,
            averageProcessingTime: 0
        };

        // إنشاء مجلد السجلات
        this.logDirectory = path.join(__dirname, '../logs');
        this.ensureLogDirectory();

        // بدء تنظيف البيانات القديمة
        if (this.config.autoCleanup) {
            this.scheduleCleanup();
        }
    }

    /**
     * ضمان وجود مجلد السجلات
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }

    /**
     * تسجيل عملية جديدة
     */
    logActivity(activityData) {
        const logEntry = this.createLogEntry(activityData);
        
        try {
            // إضافة إلى الذاكرة
            this.logs.set(logEntry.id, logEntry);
            this.performanceMetrics.totalLogs++;

            // تحديث تتبع IP
            this.updateIPTracking(logEntry);
            
            // تحليل السلوك
            this.analyzeBehavior(logEntry);
            
            // فحص الأنشطة المشبوهة
            this.checkForSuspiciousActivity(logEntry);
            
            // حفظ في ملف
            this.saveLogEntry(logEntry);
            
            // معالجة الدُفعات
            this.processBatch();
            
        } catch (error) {
            console.error('خطأ في تسجيل النشاط:', error);
            this.performanceMetrics.errorsCount++;
        }

        return logEntry.id;
    }

    /**
     * إنشاء سجل نشاط
     */
    createLogEntry(activityData) {
        const id = this.generateLogId();
        const timestamp = Date.now();
        
        return {
            id,
            timestamp,
            activity: activityData.activity,
            userId: activityData.userId || 'anonymous',
            sessionId: activityData.sessionId || this.generateSessionId(),
            ipAddress: activityData.ipAddress || 'unknown',
            userAgent: activityData.userAgent || 'unknown',
            success: activityData.success !== false,
            duration: activityData.duration || 0,
            data: this.sanitizeData(activityData.data || {}),
            metadata: {
                browser: this.parseUserAgent(activityData.userAgent),
                location: activityData.location || 'unknown',
                referer: activityData.referer || 'direct',
                ...activityData.metadata
            },
            severity: this.determineSeverity(activityData),
            category: this.categorizeActivity(activityData.activity)
        };
    }

    /**
     * تنظيف البيانات الحساسة
     */
    sanitizeData(data) {
        const sanitized = { ...data };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
        
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***HIDDEN***';
            }
        }
        
        return sanitized;
    }

    /**
     * تحديد مستوى الخطورة
     */
    determineSeverity(activityData) {
        const criticalActivities = [
            'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ADMIN_ACCESS',
            'SYSTEM_CONFIG', 'DATA_EXPORT', 'DELETE_DATA'
        ];
        
        const warningActivities = [
            'FAILED_LOGIN', 'RATE_LIMIT_EXCEEDED', 'INVALID_ACCESS',
            'SUSPICIOUS_PATTERN', 'BRUTE_FORCE_ATTEMPT'
        ];
        
        if (criticalActivities.includes(activityData.activity)) {
            return 'CRITICAL';
        }
        
        if (warningActivities.includes(activityData.activity)) {
            return 'WARNING';
        }
        
        return 'INFO';
    }

    /**
     * تصنيف النشاط
     */
    categorizeActivity(activity) {
        const categories = {
            'AUTH': ['LOGIN', 'LOGOUT', 'REGISTER', 'PASSWORD_CHANGE'],
            'DATA': ['CREATE', 'UPDATE', 'DELETE', 'READ'],
            'SECURITY': ['FAILED_LOGIN', 'RATE_LIMIT', 'SUSPICIOUS_PATTERN'],
            'SYSTEM': ['SYSTEM_CONFIG', 'BACKUP', 'MAINTENANCE'],
            'BUSINESS': ['SALE', 'PURCHASE', 'RETURN', 'INVOICE']
        };
        
        for (const [category, activities] of Object.entries(categories)) {
            if (activities.includes(activity)) {
                return category;
            }
        }
        
        return 'OTHER';
    }

    /**
     * تحديث تتبع IP
     */
    updateIPTracking(logEntry) {
        const ip = logEntry.ipAddress;
        const now = Date.now();
        
        if (!this.ipTracking.has(ip)) {
            this.ipTracking.set(ip, {
                firstSeen: now,
                lastSeen: now,
                totalActivities: 0,
                successfulActivities: 0,
                failedActivities: 0,
                uniqueUsers: new Set(),
                userAgents: new Set(),
                activities: []
            });
        }
        
        const ipData = this.ipTracking.get(ip);
        ipData.lastSeen = now;
        ipData.totalActivities++;
        ipData.activities.push(logEntry);
        
        if (logEntry.success) {
            ipData.successfulActivities++;
        } else {
            ipData.failedActivities++;
        }
        
        ipData.uniqueUsers.add(logEntry.userId);
        ipData.userAgents.add(logEntry.userAgent);
        
        // الاحتفاظ بآخر 1000 نشاط فقط لكل IP
        if (ipData.activities.length > 1000) {
            ipData.activities = ipData.activities.slice(-1000);
        }
        
        this.ipTracking.set(ip, ipData);
    }

    /**
     * تحليل السلوك
     */
    analyzeBehavior(logEntry) {
        const userId = logEntry.userId;
        const now = Date.now();
        
        if (!this.behavioralAnalysis.has(userId)) {
            this.behavioralAnalysis.set(userId, {
                firstActivity: now,
                lastActivity: now,
                totalActivities: 0,
                averageSessionDuration: 0,
                peakActivityHours: [],
                commonIPAddresses: new Map(),
                suspiciousActivities: [],
                riskScore: 0
            });
        }
        
        const userData = this.behavioralAnalysis.get(userId);
        userData.lastActivity = now;
        userData.totalActivities++;
        
        // تحديث IP الشائعة
        const ipCount = userData.commonIPAddresses.get(logEntry.ipAddress) || 0;
        userData.commonIPAddresses.set(logEntry.ipAddress, ipCount + 1);
        
        // تحليل أوقات النشاط
        const hour = new Date(now).getHours();
        const hourData = userData.peakActivityHours.find(h => h.hour === hour);
        if (hourData) {
            hourData.count++;
        } else {
            userData.peakActivityHours.push({ hour, count: 1 });
        }
        
        // حساب النقاط المشبوهة
        this.calculateRiskScore(userData, logEntry);
        
        // تنظيف البيانات القديمة
        this.cleanupUserData(userData);
    }

    /**
     * حساب النقاط المشبوهة
     */
    calculateRiskScore(userData, logEntry) {
        let risk = 0;
        
        // زيادة النقاط للأنشطة الفاشلة
        if (!logEntry.success) {
            risk += 10;
        }
        
        // زيادة النقاط لأنشطة الأمان
        if (logEntry.category === 'SECURITY') {
            risk += 20;
        }
        
        // زيادة النقاط للأنشطة الحرجة
        if (logEntry.severity === 'CRITICAL') {
            risk += 15;
        }
        
        // فحص سرعة الأنشطة غير العادية
        const recentActivities = userData.activities?.filter(
            a => logEntry.timestamp - a.timestamp < 60000 // آخر دقيقة
        ) || [];
        
        if (recentActivities.length > 10) {
            risk += 25; // معدل نشاط عالي
        }
        
        // فحص التوقيت غير العادي
        const hour = new Date(logEntry.timestamp).getHours();
        if (hour < 6 || hour > 23) { // خارج ساعات العمل
            risk += 5;
        }
        
        userData.riskScore = Math.min(100, risk);
    }

    /**
     * فحص الأنشطة المشبوهة
     */
    checkForSuspiciousActivity(logEntry) {
        const alerts = [];
        
        // فحص معدل الأنشطة العالي
        const ipData = this.ipTracking.get(logEntry.ipAddress);
        if (ipData && ipData.totalActivities > 100) {
            const recentActivities = ipData.activities.filter(
                a => logEntry.timestamp - a.timestamp < 300000 // آخر 5 دقائق
            );
            
            if (recentActivities.length > 20) {
                alerts.push({
                    type: 'HIGH_ACTIVITY_RATE',
                    message: 'معدل نشاط عالي من IP',
                    severity: 'MEDIUM',
                    data: {
                        ipAddress: logEntry.ipAddress,
                        activityCount: recentActivities.length,
                        timeWindow: 300000
                    }
                });
            }
        }
        
        // فحص نسبة الفشل العالية
        if (ipData && ipData.totalActivities > 10) {
            const failureRate = ipData.failedActivities / ipData.totalActivities;
            if (failureRate > 0.5) {
                alerts.push({
                    type: 'HIGH_FAILURE_RATE',
                    message: 'نسبة فشل عالية',
                    severity: 'HIGH',
                    data: {
                        ipAddress: logEntry.ipAddress,
                        failureRate: failureRate,
                        totalActivities: ipData.totalActivities
                    }
                });
            }
        }
        
        // فحص تغيير IP المفاجئ
        const userData = this.behavioralAnalysis.get(logEntry.userId);
        if (userData) {
            const commonIPs = Array.from(userData.commonIPAddresses.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            const isCommonIP = commonIPs.some(([ip]) => ip === logEntry.ipAddress);
            if (!isCommonIP && userData.totalActivities > 5) {
                alerts.push({
                    type: 'UNUSUAL_IP_ADDRESS',
                    message: 'IP غير مألوف للمستخدم',
                    severity: 'MEDIUM',
                    data: {
                        userId: logEntry.userId,
                        ipAddress: logEntry.ipAddress,
                        commonIPs: commonIPs.map(([ip]) => ip)
                    }
                });
            }
        }
        
        // إرسال التنبيهات
        alerts.forEach(alert => {
            this.createAlert(alert.type, alert.message, alert.severity, {
                ...alert.data,
                logEntry: logEntry.id
            });
        });
    }

    /**
     * إنشاء تنبيه
     */
    createAlert(type, message, severity = 'INFO', data = {}) {
        const alert = {
            id: this.generateAlertId(),
            type,
            message,
            severity,
            data,
            timestamp: Date.now(),
            acknowledged: false
        };
        
        this.alertQueue.push(alert);
        
        // طباعة التنبيه
        console.warn(`🚨 تنبيه أمني [${severity}]: ${message}`, data);
        
        // الاحتفاظ بآخر 500 تنبيه فقط
        if (this.alertQueue.length > 500) {
            this.alertQueue = this.alertQueue.slice(-500);
        }
        
        return alert.id;
    }

    /**
     * الحصول على التنبيهات
     */
    getAlerts(filters = {}) {
        let alerts = [...this.alertQueue];
        
        if (filters.severity) {
            alerts = alerts.filter(a => a.severity === filters.severity);
        }
        
        if (filters.type) {
            alerts = alerts.filter(a => a.type === filters.type);
        }
        
        if (filters.acknowledged !== undefined) {
            alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
        }
        
        if (filters.since) {
            alerts = alerts.filter(a => a.timestamp >= filters.since);
        }
        
        return alerts.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * تأكيد التنبيه
     */
    acknowledgeAlert(alertId) {
        const alert = this.alertQueue.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            return true;
        }
        return false;
    }

    /**
     * حفظ سجل في ملف
     */
    saveLogEntry(logEntry) {
        try {
            const date = new Date(logEntry.timestamp);
            const dateStr = date.toISOString().split('T')[0];
            const logFile = path.join(this.logDirectory, `audit_${dateStr}.log`);
            
            const logLine = JSON.stringify(logEntry) + '\\n';
            
            // تشفير إذا كان مفعل
            const finalLogLine = this.config.encryptionEnabled ? 
                this.encryptLogLine(logLine) : logLine;
            
            fs.appendFileSync(logFile, finalLogLine);
            
        } catch (error) {
            console.error('خطأ في حفظ السجل:', error);
        }
    }

    /**
     * تشفير سطر السجل
     */
    encryptLogLine(logLine) {
        try {
            const crypto = require('crypto');
            const key = crypto.randomBytes(32);
            const iv = crypto.randomBytes(16);
            
            const cipher = crypto.createCipherGCM('aes-256-gcm', key, { iv });
            let encrypted = cipher.update(logLine);
            cipher.final();
            const tag = cipher.getAuthTag();
            
            // دمج IV + tag + البيانات المشفرة
            const result = Buffer.concat([iv, tag, encrypted]);
            return result.toString('base64');
            
        } catch (error) {
            console.error('خطأ في تشفير السجل:', error);
            return logLine; // إرجاع النص الأصلي في حالة الخطأ
        }
    }

    /**
     * معالجة الدُفعات
     */
    processBatch() {
        if (this.logs.size >= this.config.batchSize) {
            // حفظ الدفعة الحالية
            this.saveCurrentBatch();
            
            // تنظيف الذاكرة
            const logsToKeep = Array.from(this.logs.entries()).slice(-100);
            this.logs.clear();
            logsToKeep.forEach(([id, log]) => {
                this.logs.set(id, log);
            });
        }
    }

    /**
     * حفظ الدفعة الحالية
     */
    saveCurrentBatch() {
        try {
            const batchFile = path.join(
                this.logDirectory, 
                `batch_${Date.now()}.json`
            );
            
            const batchData = {
                timestamp: Date.now(),
                logs: Array.from(this.logs.values())
            };
            
            fs.writeFileSync(batchFile, JSON.stringify(batchData));
            
        } catch (error) {
            console.error('خطأ في حفظ الدفعة:', error);
        }
    }

    /**
     * تنظيف البيانات القديمة
     */
    scheduleCleanup() {
        setInterval(() => {
            this.cleanupOldLogs();
            this.cleanupMemoryData();
        }, 60 * 60 * 1000); // كل ساعة
    }

    /**
     * تنظيف السجلات القديمة
     */
    cleanupOldLogs() {
        try {
            const cutoffTime = Date.now() - (this.config.logRetentionDays * 24 * 60 * 60 * 1000);
            
            // حذف الملفات القديمة
            const files = fs.readdirSync(this.logDirectory);
            files.forEach(file => {
                if (file.startsWith('audit_') || file.startsWith('batch_')) {
                    const filePath = path.join(this.logDirectory, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.mtime.getTime() < cutoffTime) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
            
        } catch (error) {
            console.error('خطأ في تنظيف السجلات القديمة:', error);
        }
    }

    /**
     * تنظيف البيانات من الذاكرة
     */
    cleanupMemoryData() {
        // تنظيف بيانات IP غير النشطة
        const now = Date.now();
        const inactiveThreshold = 24 * 60 * 60 * 1000; // 24 ساعة
        
        for (const [ip, data] of this.ipTracking) {
            if (now - data.lastSeen > inactiveThreshold) {
                this.ipTracking.delete(ip);
            }
        }
        
        // تنظيف بيانات المستخدمين غير النشطة
        for (const [userId, data] of this.behavioralAnalysis) {
            if (now - data.lastActivity > inactiveThreshold) {
                this.behavioralAnalysis.delete(userId);
            }
        }
    }

    /**
     * تنظيف بيانات المستخدم
     */
    cleanupUserData(userData) {
        // الاحتفاظ بآخر 1000 نشاط فقط
        if (userData.activities && userData.activities.length > 1000) {
            userData.activities = userData.activities.slice(-1000);
        }
    }

    /**
     * تحليل استخدام النظام
     */
    generateUsageReport(timeRange = 24 * 60 * 60 * 1000) {
        const endTime = Date.now();
        const startTime = endTime - timeRange;
        
        // فلترة السجلات حسب الفترة الزمنية
        const relevantLogs = Array.from(this.logs.values()).filter(
            log => log.timestamp >= startTime && log.timestamp <= endTime
        );
        
        const report = {
            timeRange: {
                start: startTime,
                end: endTime,
                duration: timeRange
            },
            summary: {
                totalActivities: relevantLogs.length,
                uniqueUsers: new Set(relevantLogs.map(l => l.userId)).size,
                uniqueIPs: new Set(relevantLogs.map(l => l.ipAddress)).size,
                successfulActivities: relevantLogs.filter(l => l.success).length,
                failedActivities: relevantLogs.filter(l => !l.success).length
            },
            categories: this.groupByCategory(relevantLogs),
            topUsers: this.getTopUsers(relevantLogs),
            topIPs: this.getTopIPs(relevantLogs),
            hourlyDistribution: this.getHourlyDistribution(relevantLogs),
            alerts: this.getAlerts({ since: startTime })
        };
        
        return report;
    }

    /**
     * تجميع حسب الفئة
     */
    groupByCategory(logs) {
        const grouped = {};
        
        logs.forEach(log => {
            if (!grouped[log.category]) {
                grouped[log.category] = {
                    total: 0,
                    successful: 0,
                    failed: 0
                };
            }
            
            grouped[log.category].total++;
            if (log.success) {
                grouped[log.category].successful++;
            } else {
                grouped[log.category].failed++;
            }
        });
        
        return grouped;
    }

    /**
     * الحصول على أهم المستخدمين
     */
    getTopUsers(logs) {
        const userCounts = new Map();
        
        logs.forEach(log => {
            const count = userCounts.get(log.userId) || 0;
            userCounts.set(log.userId, count + 1);
        });
        
        return Array.from(userCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([userId, count]) => ({ userId, count }));
    }

    /**
     * الحصول على أهم عناوين IP
     */
    getTopIPs(logs) {
        const ipCounts = new Map();
        
        logs.forEach(log => {
            const count = ipCounts.get(log.ipAddress) || 0;
            ipCounts.set(log.ipAddress, count + 1);
        });
        
        return Array.from(ipCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([ipAddress, count]) => ({ ipAddress, count }));
    }

    /**
     * التوزيع الساعي
     */
    getHourlyDistribution(logs) {
        const hourlyCounts = new Array(24).fill(0);
        
        logs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            hourlyCounts[hour]++;
        });
        
        return hourlyCounts.map((count, hour) => ({
            hour,
            count
        }));
    }

    /**
     * تحليل الاتجاهات الأمنية
     */
    getSecurityTrends(timeRange = 7 * 24 * 60 * 60 * 1000) {
        const trends = {
            threats: this.getAlerts({ type: 'SECURITY', since: Date.now() - timeRange }),
            riskUsers: this.getHighRiskUsers(),
            suspiciousIPs: this.getSuspiciousIPs(),
            securityScore: this.calculateSecurityScore()
        };
        
        return trends;
    }

    /**
     * الحصول على المستخدمين ذوي المخاطر العالية
     */
    getHighRiskUsers() {
        const highRiskUsers = [];
        
        for (const [userId, data] of this.behavioralAnalysis) {
            if (data.riskScore > 70) {
                highRiskUsers.push({
                    userId,
                    riskScore: data.riskScore,
                    totalActivities: data.totalActivities,
                    lastActivity: data.lastActivity
                });
            }
        }
        
        return highRiskUsers.sort((a, b) => b.riskScore - a.riskScore);
    }

    /**
     * الحصول على عناوين IP المشبوهة
     */
    getSuspiciousIPs() {
        const suspiciousIPs = [];
        
        for (const [ipAddress, data] of this.ipTracking) {
            const failureRate = data.failedActivities / data.totalActivities;
            
            if (failureRate > 0.3 && data.totalActivities > 10) {
                suspiciousIPs.push({
                    ipAddress,
                    failureRate,
                    totalActivities: data.totalActivities,
                    lastSeen: data.lastSeen
                });
            }
        }
        
        return suspiciousIPs.sort((a, b) => b.failureRate - a.failureRate);
    }

    /**
     * حساب نقاط الأمان
     */
    calculateSecurityScore() {
        let score = 100;
        
        // خصم النقاط حسب التنبيهات
        const recentAlerts = this.getAlerts({ since: Date.now() - 24 * 60 * 60 * 1000 });
        score -= recentAlerts.length * 5;
        
        // خصم النقاط للمستخدمين ذوي المخاطر العالية
        const highRiskUsers = this.getHighRiskUsers();
        score -= highRiskUsers.length * 10;
        
        return Math.max(0, score);
    }

    /**
     * إنشاء معرف فريد للسجل
     */
    generateLogId() {
        return 'LOG_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    /**
     * إنشاء معرف فريد للجلسة
     */
    generateSessionId() {
        return 'SESSION_' + crypto.randomBytes(8).toString('hex').toUpperCase();
    }

    /**
     * إنشاء معرف فريد للتنبيه
     */
    generateAlertId() {
        return 'ALERT_' + crypto.randomBytes(6).toString('hex').toUpperCase();
    }

    /**
     * تحليل User Agent
     */
    parseUserAgent(userAgent) {
        if (!userAgent) return { browser: 'unknown', version: 'unknown' };
        
        // تحليل بسيط لـ User Agent
        const patterns = {
            Chrome: /Chrome\/(\d+)/,
            Firefox: /Firefox\/(\d+)/,
            Safari: /Version\/(\d+).*Safari/,
            Edge: /Edg\/(\d+)/
        };
        
        for (const [browser, pattern] of Object.entries(patterns)) {
            const match = userAgent.match(pattern);
            if (match) {
                return {
                    browser,
                    version: match[1]
                };
            }
        }
        
        return { browser: 'unknown', version: 'unknown' };
    }

    /**
     * تصدير الإحصائيات
     */
    exportStatistics() {
        return {
            performance: this.performanceMetrics,
            logStats: {
                totalLogs: this.logs.size,
                ipTrackingCount: this.ipTracking.size,
                behavioralAnalysisCount: this.behavioralAnalysis.size,
                alertQueueSize: this.alertQueue.length
            },
            securityScore: this.calculateSecurityScore(),
            lastCleanup: this.lastCleanup || Date.now()
        };
    }
}

// إنشاء مثيل واحد من النظام
const auditLogger = new AuditLogger();

module.exports = auditLogger;