// ======================================
// Sound Settings Component - مكون إعدادات الأصوات
// ======================================

import React, { useState, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';

const SoundSettings = () => {
  const { soundSettings, saveSoundSettings, testSound } = useNotification();
  const [localSettings, setLocalSettings] = useState(soundSettings);
  const [customSounds, setCustomSounds] = useState({});
  const fileInputRefs = useRef({});

  const handleToggleSound = () => {
    setLocalSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setLocalSettings(prev => ({
      ...prev,
      volume
    }));
  };

  const handleTestSound = (type) => {
    testSound(type);
  };

  const handleSave = () => {
    saveSoundSettings(localSettings);
  };

  const handleCancel = () => {
    setLocalSettings(soundSettings);
  };

  const soundTypes = [
    { key: 'success', label: 'نجاح', description: 'صوت للعمليات الناجحة' },
    { key: 'error', label: 'خطأ', description: 'صوت عند حدوث الأخطاء' },
    { key: 'warning', label: 'تحذير', description: 'صوت للتحذيرات' },
    { key: 'info', label: 'معلومة', description: 'صوت للرسائل الإخبارية' },
    { key: 'default', label: 'افتراضي', description: 'صوت عام للإشعارات' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">إعدادات الأصوات</h2>

      {/* الإعدادات العامة */}
      <Card title="الإعدادات العامة">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700">تفعيل الأصوات</h3>
              <p className="text-sm text-gray-500">تشغيل أو إيقاف جميع أصوات الإشعارات</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={handleToggleSound}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مستوى الصوت: {Math.round(localSettings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localSettings.volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </Card>

      {/* أصوات أنواع الإشعارات */}
      <Card title="أصوات أنواع الإشعارات">
        <div className="space-y-4">
          {soundTypes.map((soundType) => (
            <div key={soundType.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-700">{soundType.label}</h3>
                  <p className="text-sm text-gray-500">{soundType.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestSound(soundType.key)}
                  disabled={!localSettings.enabled}
                >
                  اختبار الصوت
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={localSettings.sounds[soundType.key]}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      sounds: {
                        ...prev.sounds,
                        [soundType.key]: e.target.value
                      }
                    }))}
                    placeholder="اسم ملف الصوت (mp3)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!localSettings.enabled}
                  />
                </div>
                
                <input
                  type="file"
                  ref={el => fileInputRefs.current[soundType.key] = el}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // في التطبيق الحقيقي، ستقوم برفع الملف إلى الخادم
                      console.log('ملف صوتي مختار:', file.name);
                      // هنا يمكن إضافة منطق رفع الملف
                      setLocalSettings(prev => ({
                        ...prev,
                        sounds: {
                          ...prev.sounds,
                          [soundType.key]: file.name
                        }
                      }));
                    }
                  }}
                  accept=".mp3,.wav,.ogg"
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[soundType.key]?.click()}
                  disabled={!localSettings.enabled}
                >
                  اختيار ملف
                </Button>
              </div>
              
              {fileInputRefs.current[soundType.key]?.files?.[0] && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ تم اختيار: {fileInputRefs.current[soundType.key].files[0].name}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* أزرار الحفظ والإلغاء */}
      <div className="flex gap-3">
        <Button variant="primary" onClick={handleSave}>
          حفظ الإعدادات
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
};

export default SoundSettings;