// ======================================
// Notification Sounds Service - خدمة الأصوات للإشعارات
// ======================================

// أصوات بديلة للـ Web Audio API عند عدم توفر ملفات صوتية
export const createFallbackSounds = () => {
  // إعداد Web Audio API
  let audioContext;
  
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio API غير مدعوم');
    return null;
  }

  // دالة لإنشاء نغمة صوتية
  const createTone = (frequency, duration, volume = 0.3) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // أصوات مختلفة لأنواع الإشعارات
  const sounds = {
    // صوت نجاح - نغمة متصاعدة
    success: () => {
      createTone(440, 0.2, 0.3);
      setTimeout(() => createTone(554, 0.2, 0.3), 100);
      setTimeout(() => createTone(659, 0.3, 0.3), 200);
    },

    // صوت خطأ - نغمة متنازلة
    error: () => {
      createTone(659, 0.3, 0.4);
      setTimeout(() => createTone(440, 0.5, 0.3), 150);
    },

    // صوت تحذير - نغمة متكررة
    warning: () => {
      createTone(880, 0.2, 0.4);
      setTimeout(() => createTone(880, 0.2, 0.4), 300);
      setTimeout(() => createTone(880, 0.2, 0.4), 600);
    },

    // صوت معلومات - نغمة واحدة
    info: () => {
      createTone(523, 0.3, 0.3);
    },

    // صوت افتراضي - نغمة بسيطة
    default: () => {
      createTone(392, 0.4, 0.3);
    }
  };

  return sounds;
};

// ملف الأصوات الأساسية (يجب وضعها في مجلد public/sounds/)
export const SOUND_FILES = {
  success: 'success.mp3',
  error: 'error.mp3',
  warning: 'warning.mp3', 
  info: 'info.mp3',
  default: 'notification.mp3'
};

// قائمة بالملفات الصوتية المقترحة
export const getSoundFileSuggestions = () => [
  {
    name: 'success.mp3',
    description: 'صوت نجح مريح ومفعم بالحيوية',
    type: 'success',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
  },
  {
    name: 'error.mp3',
    description: 'صوت خطأ واضح ومحدد',
    type: 'error',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav'
  },
  {
    name: 'warning.mp3',
    description: 'صوت تحذير جدي وواضح',
    type: 'warning',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav'
  },
  {
    name: 'info.mp3',
    description: 'صوت معلومة لطيف ومباشر',
    type: 'info',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav'
  },
  {
    name: 'notification.mp3',
    description: 'صوت إشعار عام ومتوازن',
    type: 'default',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav'
  }
];

// دالة لتحميل ملف صوتي
export const loadSoundFile = (fileName, volume = 0.5) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`/sounds/${fileName}`);
    audio.volume = volume;
    
    audio.addEventListener('loadeddata', () => {
      resolve(audio);
    });
    
    audio.addEventListener('error', (error) => {
      console.warn(`فشل في تحميل الصوت: ${fileName}`, error);
      reject(error);
    });
  });
};

// دالة لاختبار الأصوات
export const testNotificationSound = async (soundType, settings = {}) => {
  const {
    enabled = true,
    volume = 0.5,
    sounds = SOUND_FILES
  } = settings;

  if (!enabled) {
    console.log('الأصوات معطلة');
    return;
  }

  const soundFile = sounds[soundType] || sounds.default;
  
  try {
    // محاولة تحميل الملف الصوتي أولاً
    await loadSoundFile(soundFile, volume);
    console.log(`تم تشغيل الصوت: ${soundFile}`);
  } catch (error) {
    // إذا فشل تحميل الملف، استخدم الأصوات البديلة
    console.log(`استخدام الصوت البديل لنوع: ${soundType}`);
    
    if (window.createFallbackSounds) {
      const fallbackSounds = createFallbackSounds();
      if (fallbackSounds && fallbackSounds[soundType]) {
        fallbackSounds[soundType]();
      }
    }
  }
};