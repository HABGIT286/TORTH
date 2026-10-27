import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThemeId, BackgroundPattern, TypographySettings } from '../types/earthlink';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { CustomPickerModal, PickerOption } from './CustomPickerModal';
import { AnimatedIcon } from './AnimatedIcon';
import {
  Palette,
  Type,
  Globe,
  Sparkles,
  HelpCircle,
  Check,
  Clock,
  Hash,
  Languages,
  ImageIcon,
  Upload,
  RotateCcw,
  Trash2,
  Camera,
  Layers,
  Loader2,
  Smartphone,
  Download,
  ChevronLeft
} from 'lucide-react';

interface SettingsPanelProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  currentBg: BackgroundPattern;
  onBgChange: (bg: BackgroundPattern) => void;
  customBgImage: string | null;
  onCustomBgChange: (imgUrl: string | null) => void;
  typography: TypographySettings;
  onTypographyChange: (key: keyof TypographySettings, font: string) => void;
  userAvatar: string;
  onAvatarChange: (url: string) => void;
  currentLang: 'ar' | 'en';
  onLangToggle: () => void;
  onOpenInstallModal?: () => void;
  t: Record<string, string>;
}

const LUXURY_THEMES: { id: ThemeId; nameAr: string; nameEn: string; gradient: string; tag: string; accent: string }[] = [
  { id: 'theme-royal-purple', nameAr: 'بنفسجي إمبراطوري', nameEn: 'Royal Purple', gradient: 'radial-gradient(circle at top, #9333ea, #240a45 70%, #090214)', tag: 'Earthlink Official', accent: '#a855f7' },
  { id: 'theme-miro-soft', nameAr: 'ميرو سوفت كلاي', nameEn: 'Miro Soft Clay UI', gradient: 'radial-gradient(circle at top, #3b82f6, #111520 70%, #090c13)', tag: 'Miro Soft Surface', accent: '#3b82f6' },
  { id: 'theme-clay-neon', nameAr: 'كلايمورفيزم نيون 3D', nameEn: 'Claymorphism 3D', gradient: 'radial-gradient(circle at top, #d946ef, #1a082c 70%, #08020e)', tag: 'Clay 3D Neon', accent: '#ec4899' },
  { id: 'theme-glass-obsidian', nameAr: 'زجاجي أوبسيديان', nameEn: 'Obsidian Glass', gradient: 'radial-gradient(circle at top, #8b5cf6, #0d0b14 70%, #030205)', tag: 'Glassmorphism', accent: '#8b5cf6' },
  { id: 'theme-neumorphic-luxury', nameAr: 'نيومورفيزم فخم', nameEn: 'Neumorphism Dark', gradient: 'radial-gradient(circle at top, #6366f1, #161922 70%, #0e1017)', tag: 'Neumorphism', accent: '#6366f1' },
  { id: 'theme-cyber-neon', nameAr: 'سايبر نيون أزرق', nameEn: 'Cyber Neon 5G', gradient: 'radial-gradient(circle at top, #0284c7, #04243d 70%, #010a12)', tag: 'High Speed 5G', accent: '#38bdf8' },
  { id: 'theme-obsidian-gold', nameAr: 'أوبسيديان ذهبي', nameEn: 'Obsidian Gold VIP', gradient: 'radial-gradient(circle at top, #d97706, #2d2109 70%, #080602)', tag: 'VIP Titanium', accent: '#fbbf24' },
  { id: 'theme-emerald-cyber', nameAr: 'زمردي ملكي', nameEn: 'Emerald Pine Fiber', gradient: 'radial-gradient(circle at top, #059669, #08382b 70%, #020f0b)', tag: 'Eco Fiber', accent: '#34d399' },
  { id: 'theme-sunset-amber', nameAr: 'غروب كهرماني', nameEn: 'Sunset Amber Warm', gradient: 'radial-gradient(circle at top, #ea580c, #451505 70%, #120401)', tag: 'Warm Horizon', accent: '#fb923c' },
  { id: 'theme-sapphire-indigo', nameAr: 'ياقوت أزرق نيلي', nameEn: 'Sapphire Indigo', gradient: 'radial-gradient(circle at top, #4f46e5, #14164d 70%, #040517)', tag: 'Deep Ocean', accent: '#818cf8' },
  { id: 'theme-ruby-crimson', nameAr: 'ياقوتي قرمزي', nameEn: 'Ruby Crimson Velvet', gradient: 'radial-gradient(circle at top, #e11d48, #47091b 70%, #140106)', tag: 'Crimson Rose', accent: '#fb7185' },
  { id: 'theme-pearl-light', nameAr: 'لؤلؤي نهاري ساطع', nameEn: 'Daylight High Contrast', gradient: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)', tag: 'High Contrast Mode', accent: '#7c3aed' },
];

const BG_PATTERNS: { id: BackgroundPattern; nameAr: string; previewColor: string; desc: string }[] = [
  { id: 'pattern-aurora', nameAr: 'شفق أورورا السائل', previewColor: 'bg-purple-900', desc: 'تموجات بنفسجية ملكية عميقة' },
  { id: 'pattern-clay-soft', nameAr: 'سطح كلاي ناعم', previewColor: 'bg-indigo-900', desc: 'تدرج Miro Soft Clay الناعم' },
  { id: 'pattern-nebula', nameAr: 'سديم النجوم الكحلي', previewColor: 'bg-indigo-950', desc: 'أجواء الفضاء والفايبر الليلي' },
  { id: 'pattern-cyber-mesh', nameAr: 'شبكة فايبر الزمردية', previewColor: 'bg-teal-950', desc: 'تدرج تقني عالي الاستقرار' },
  { id: 'pattern-obsidian-glow', nameAr: 'كربون تيتانيوم داكن', previewColor: 'bg-zinc-900', desc: 'فخامة الأسود الملكي المطفي' },
  { id: 'pattern-pure-glass', nameAr: 'زجاج بلوري عميق', previewColor: 'bg-slate-950', desc: 'انعكاسات زجاجية مخملية' },
];

const FONT_OPTIONS: PickerOption[] = [
  { id: "'Cairo', sans-serif", title: 'خط كايرو (Cairo Luxury)', subtitle: 'الخط الرسمي الأكثر فخامة وتناسقاً', previewFontFamily: "'Cairo', sans-serif", previewText: 'أهلاً بك سيد جعفر 123' },
  { id: "'Tajawal', sans-serif", title: 'خط تجوال (Tajawal Sleek)', subtitle: 'انسيابي خفيف وسلس للتلميحات والنصوص', previewFontFamily: "'Tajawal', sans-serif", previewText: 'أيام متبقية وتفاصيل الاشتراك' },
  { id: "'Almarai', sans-serif", title: 'خط المراعي (Almarai Apple)', subtitle: 'نمط نظام iOS النظيف والدقيق', previewFontFamily: "'Almarai', sans-serif", previewText: 'بوابة إيرثلنك الذكية 2026' },
  { id: "'Readex Pro', sans-serif", title: 'خط ريدكس برو (Readex Pro)', subtitle: 'عصري هندسي مميز للواجهات الذكية', previewFontFamily: "'Readex Pro', sans-serif", previewText: 'اشتراك بلس الفعلي 35,000 IQD' },
  { id: "'IBM Plex Sans Arabic', sans-serif", title: 'خط آي بي إم بلكس (IBM Plex Arabic)', subtitle: 'تقني ومريح للقراءة السريعة', previewFontFamily: "'IBM Plex Sans Arabic', sans-serif", previewText: 'سيرفر إيرثلنك متصل بالكامل' },
  { id: "'Amiri', serif", title: 'خط أميري (Amiri Classic)', subtitle: 'أصيل بتفاصيل كلاسيكية فخمة', previewFontFamily: "'Amiri', serif", previewText: 'تقرير المشترك الرسمي' },
  { id: "'Outfit', sans-serif", title: 'خط آوتفيت (Outfit Neo)', subtitle: 'للأرقام والساعة والكلمات اللاتينية', previewFontFamily: "'Outfit', sans-serif", previewText: '160 Mbps • 12:45 PM • Plus' },
  { id: "'Plus Jakarta Sans', sans-serif", title: 'خط بلس جاكارتا (Plus Jakarta)', subtitle: 'تصميم أوروبي فاخر للأرقام والتقنية', previewFontFamily: "'Plus Jakarta Sans', sans-serif", previewText: 'Earthlink Gigabit 5.0 GHz' },
  { id: "'Inter', sans-serif", title: 'خط إنتر (Inter Modern)', subtitle: 'عالمي عالي الوضوح والدقة التكنولوجية', previewFontFamily: "'Inter', sans-serif", previewText: 'ONLINE 100.119.247.67' },
  { id: "'Montserrat', sans-serif", title: 'خط مونتسيرات (Montserrat Bold)', subtitle: 'أرقام هندسية بارزة وثابتة', previewFontFamily: "'Montserrat', sans-serif", previewText: '35,000 IQD • 5G Speed' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  currentTheme,
  onThemeChange,
  currentBg,
  onBgChange,
  customBgImage,
  onCustomBgChange,
  typography,
  onTypographyChange,
  userAvatar,
  onAvatarChange,
  currentLang,
  onLangToggle,
  onOpenInstallModal,
  t
}) => {
  const [showTips, setShowTips] = useState<boolean>(true);
  const [activePickerKey, setActivePickerKey] = useState<keyof TypographySettings | null>(null);
  const [pickerModalTitle, setPickerModalTitle] = useState<string>('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState<boolean>(false);
  const [customBgUrlInput, setCustomBgUrlInput] = useState<string>('');
  const [showCustomBgUrlInput, setShowCustomBgUrlInput] = useState<boolean>(false);

  const [isProcessingLogo, setIsProcessingLogo] = useState<boolean>(false);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);

  // Hidden File Input references for Studio / Gallery
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  // Safe image compressor with direct base64 fallback
  const processImageFile = (file: File, maxDimension: number, onDone: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      let completed = false;

      const finish = (result: string) => {
        if (!completed) {
          completed = true;
          onDone(result);
        }
      };

      const timer = setTimeout(() => finish(rawDataUrl), 2000);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          canvas.width = Math.max(width, 10);
          canvas.height = Math.max(height, 10);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            finish(compressed);
            return;
          }
        } catch {
          // Handled
        }
        finish(rawDataUrl);
      };

      img.onerror = () => {
        clearTimeout(timer);
        finish(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  };

  // Handle Logo from Studio / Gallery
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLogo(true);
    processImageFile(file, 350, (dataUrl) => {
      onAvatarChange(dataUrl);
      setIsProcessingLogo(false);
      playHapticSound('success');
      triggerLuxuryCelebration();
    });
    e.target.value = '';
  };

  // Handle Background Wallpaper from Studio / Gallery
  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingBg(true);
    processImageFile(file, 1080, (dataUrl) => {
      onCustomBgChange(dataUrl);
      setIsProcessingBg(false);
      playHapticSound('success');
      triggerLuxuryCelebration();
    });
    e.target.value = '';
  };

  const openFontPicker = (key: keyof TypographySettings, title: string) => {
    setActivePickerKey(key);
    setPickerModalTitle(title);
    playHapticSound('tap');
  };

  const getFontName = (fontFamilyStr: string) => {
    const match = FONT_OPTIONS.find(f => f.id === fontFamilyStr);
    if (match) return match.title.split('(')[0].trim();
    return fontFamilyStr.replace(/'/g, '').split(',')[0].trim() || 'مخصص';
  };

  return (
    <motion.div layout className="space-y-4">
      {/* Hidden File Inputs for Device Studio / Gallery */}
      <input
        ref={logoFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoFileChange}
        className="hidden"
      />
      <input
        ref={bgFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBgFileChange}
        className="hidden"
      />

      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2 font-titles">
          <span>{t.settingsTitle}</span>
          <AnimatedIcon icon={Palette} size="md" className="text-purple-400" />
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 font-hints">{t.settingsSubtitle}</p>
      </div>

      {/* 1. Change Subscriber Logo via Studio Gallery */}
      <div className="clay-card rounded-3xl p-5 border border-cyan-500/35 shadow-xl space-y-4 bg-gradient-to-b from-cyan-950/20 via-slate-900/50 to-black/80 relative overflow-hidden">
        <div className="shimmer-sweep-layer" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <AnimatedIcon icon={Camera} size="sm" className="text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white font-titles block">
                لوغو المشترك في الهيدر
              </span>
              <span className="text-[11px] text-cyan-300 font-hints">
                اختيار مباشر من استوديو جهازك
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-hints leading-relaxed relative z-10">
          انقر لفتح الاستوديو في هاتفك واختيار أي صورة أو شعار تريده ليظهر بجانب اسمك في أعلى التطبيق:
        </p>

        {/* Current Active Logo Preview & Studio Upload Button */}
        <div className="neu-inset p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-0.5 shadow-xl shadow-cyan-950/60 flex items-center justify-center overflow-hidden">
                <img
                  src={userAvatar || 'https://user.earthlink.iq/accountImages/138.png'}
                  alt="Current Logo"
                  className="w-full h-full object-cover rounded-[14px] bg-slate-900"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://user.earthlink.iq/accountImages/138.png';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-sm" />
            </div>

            <div>
              <span className="text-xs font-black text-white block font-titles">
                اللوغو النشط حالياً
              </span>
              <span className="text-[11px] text-slate-400 font-hints block mt-0.5">
                يظهر في شريط التنقل والقائمة الجانبية
              </span>
            </div>
          </div>

          {/* Open Studio Button */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isProcessingLogo}
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                logoFileInputRef.current?.click();
              }}
              className="clay-btn flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2 tap-interactive cursor-pointer font-titles disabled:opacity-50"
            >
              {isProcessingLogo ? (
                <>
                  <AnimatedIcon icon={Loader2} size="sm" className="text-white animate-spin" />
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <>
                  <AnimatedIcon icon={Upload} size="sm" className="text-white" />
                  <span>فتح الاستوديو لاختيار صورة</span>
                </>
              )}
            </button>

            {userAvatar && userAvatar !== 'https://user.earthlink.iq/accountImages/138.png' && (
              <button
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  onAvatarChange('https://user.earthlink.iq/accountImages/138.png');
                }}
                title="استعادة اللوغو الافتراضي"
                className="h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center justify-center transition-all cursor-pointer tap-interactive"
              >
                <AnimatedIcon icon={RotateCcw} size="sm" className="text-slate-300" />
              </button>
            )}
          </div>
        </div>

        {/* Custom Logo URL toggle */}
        <div className="pt-1 relative z-10">
          <button
            type="button"
            onClick={() => {
              playHapticSound('tap');
              setShowCustomAvatarInput(!showCustomAvatarInput);
            }}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer font-titles"
          >
            <AnimatedIcon icon={ImageIcon} size="sm" className="text-cyan-400" />
            <span>{showCustomAvatarInput ? 'إخفاء رابط الصورة المباشر' : '+ أو وضع رابط صورة من الإنترنت (URL)'}</span>
          </button>

          {showCustomAvatarInput && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                placeholder="ضع رابط صورة الشعار هنا (https://...)"
                className="neu-inset flex-1 h-11 rounded-xl bg-black/60 border border-white/15 px-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (customAvatarUrl.trim()) {
                    onAvatarChange(customAvatarUrl.trim());
                    triggerLuxuryCelebration();
                  }
                }}
                className="clay-btn h-11 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tap-interactive cursor-pointer shrink-0 font-titles"
              >
                تطبيق
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Change Program Background via Studio Gallery (خلفية البرنامج من الاستوديو) */}
      <div className="clay-card rounded-3xl p-5 border border-pink-500/35 shadow-xl space-y-4 bg-gradient-to-b from-pink-950/20 via-slate-900/50 to-black/80 relative overflow-hidden">
        <div className="shimmer-sweep-layer" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <AnimatedIcon icon={Layers} size="sm" className="text-pink-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white font-titles block">
                خلفية البرنامج (Background Wallpaper)
              </span>
              <span className="text-[11px] text-pink-300 font-hints">
                تغيير الخلفية بصورة كاملة من الاستوديو
              </span>
            </div>
          </div>

          {customBgImage && (
            <span className="soft-pill text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-titles">
              خلفية الاستوديو مفعلة
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 font-hints leading-relaxed relative z-10">
          يمكنك الآن فتح استوديو هاتفك واختيار أي صورة لتصبح خلفية كاملة للبرنامج فوراً:
        </p>

        {/* Upload Custom Wallpaper Button & Current Wallpaper Status */}
        <div className="neu-inset p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-3 relative z-10">
          {customBgImage ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0">
                  <img src={customBgImage} alt="Custom Background" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block font-titles">صورة الخلفية الحالية</span>
                  <span className="text-[10px] text-emerald-400 font-hints">مطبقة ومحفوظة بنجاح ✓</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isProcessingBg}
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    bgFileInputRef.current?.click();
                  }}
                  className="clay-btn px-3.5 h-10 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs tap-interactive cursor-pointer flex items-center gap-1.5 font-titles disabled:opacity-50"
                >
                  {isProcessingBg ? <AnimatedIcon icon={Loader2} size="sm" className="text-white animate-spin" /> : <AnimatedIcon icon={Upload} size="sm" className="text-white" />}
                  <span>تغيير</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    onCustomBgChange(null);
                  }}
                  className="clay-btn px-3 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold text-xs tap-interactive cursor-pointer flex items-center gap-1 font-titles"
                  title="إزالة صورة الخلفية"
                >
                  <AnimatedIcon icon={Trash2} size="sm" className="text-rose-300" />
                  <span>إزالة</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={isProcessingBg}
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                bgFileInputRef.current?.click();
              }}
              className="clay-btn w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-pink-950/40 flex items-center justify-center gap-2 tap-interactive cursor-pointer font-titles hover:brightness-110 disabled:opacity-50"
            >
              {isProcessingBg ? (
                <>
                  <AnimatedIcon icon={Loader2} size="sm" className="text-white animate-spin" />
                  <span>جاري معالجة وتطبيق الخلفية...</span>
                </>
              ) : (
                <>
                  <AnimatedIcon icon={Upload} size="sm" className="text-white" />
                  <span>فتح الاستوديو لاختيار خلفية البرنامج</span>
                </>
              )}
            </button>
          )}

          {/* Alternative URL Input for Background */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowCustomBgUrlInput(!showCustomBgUrlInput)}
              className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer font-titles"
            >
              <AnimatedIcon icon={ImageIcon} size="sm" className="text-pink-400" />
              <span>{showCustomBgUrlInput ? 'إخفاء رابط خلفية الإنترنت' : '+ أو وضع رابط صورة خلفية من الإنترنت (URL)'}</span>
            </button>

            {showCustomBgUrlInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customBgUrlInput}
                  onChange={(e) => setCustomBgUrlInput(e.target.value)}
                  placeholder="ضع رابط صورة الخلفية هنا (https://...)"
                  className="neu-inset flex-1 h-11 rounded-xl bg-black/60 border border-white/15 px-3 text-xs text-white focus:outline-none focus:border-pink-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customBgUrlInput.trim()) {
                      onCustomBgChange(customBgUrlInput.trim());
                      playHapticSound('success');
                      triggerLuxuryCelebration();
                    }
                  }}
                  className="clay-btn h-11 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs tap-interactive cursor-pointer shrink-0 font-titles"
                >
                  تطبيق
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Ambient Gradient Presets */}
        <div className="space-y-2 pt-1 border-t border-white/10 relative z-10">
          <span className="text-[11px] font-bold text-slate-300 font-titles block">
            أو اختيار نمط متدرج مسبق (Ambient Presets):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BG_PATTERNS.map((p) => {
              const isCurrent = currentBg === p.id && !customBgImage;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('switch');
                    onCustomBgChange(null);
                    onBgChange(p.id);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all tap-interactive cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'clay-btn bg-pink-500/20 border-pink-400 text-white shadow-md ring-1 ring-pink-400'
                      : 'neu-inset bg-black/40 border border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold font-titles block">{p.nameAr}</span>
                    <span className="text-[10px] text-slate-400 font-hints">{p.desc}</span>
                  </div>
                  <span className={`w-4 h-4 rounded-full ${p.previewColor} border border-white/30 shrink-0`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Redesigned Luxury Themes Showcase */}
      <div className="clay-card rounded-3xl p-5 border border-white/10 shadow-xl space-y-3 relative overflow-hidden bg-gradient-to-b from-slate-900/60 to-black/80">
        <div className="shimmer-sweep-layer" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Sparkles} size="sm" className="text-purple-400" />
            <span className="text-sm font-bold text-white font-titles">
              {t.pickTheme}
            </span>
          </div>
          <span className="soft-pill text-[10px] text-purple-300 font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 font-mono">
            12 ثيماً ملوكياً مجهزاً
          </span>
        </div>

        {showTips && (
          <p className="text-[11px] text-slate-400 leading-relaxed neu-inset p-3 rounded-2xl border border-white/5 font-hints relative z-10">
            💡 <span className="font-semibold text-slate-200">تلميح الثيمات:</span> تم ضبط درجات التباين وتأثيرات Claymorphism وNeumorphism والبطاقات الزجاجية بعناية فائقة لتلائم كلاً من الوضع المظلم والوضع النهاري فائق الوضوح.
          </p>
        )}

        {/* 2-Column Responsive Card Grid for Themes */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          {LUXURY_THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  playHapticSound('switch');
                  onThemeChange(theme.id);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 tap-interactive relative overflow-hidden flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'border-purple-400 shadow-xl shadow-purple-950/60 ring-2 ring-purple-500/50 scale-[1.01]'
                    : 'border-white/10 hover:border-white/20 bg-black/40'
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(145deg, rgba(255,255,255,0.12), rgba(0,0,0,0.5)), ${theme.gradient}`
                    : theme.gradient
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-slate-200 border border-white/10 font-mono">
                    {theme.tag}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-purple-600 border-white text-white shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                        : 'border-white/30 bg-black/40'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-white leading-tight font-titles">
                    {currentLang === 'ar' ? theme.nameAr : theme.nameEn}
                  </h4>
                  <span className="text-[10px] text-slate-300 opacity-80 block mt-0.5 font-english">
                    {theme.nameEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Luxury Font Customization Hub (5 Granular Font Settings) */}
      <div className="clay-card rounded-3xl p-5 border border-white/10 shadow-xl space-y-3.5 relative overflow-hidden bg-gradient-to-b from-slate-900/60 to-black/80">
        <div className="shimmer-sweep-layer" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Type} size="sm" className="text-purple-400" />
            <span className="text-sm font-bold text-white font-titles">
              منظومة الخطوط المخصصة
            </span>
          </div>
          <span className="soft-pill text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
            5 تصنيفات مستقلة
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-hints relative z-10">
          تغيير دقيق ومستقل لكل نوع خط مع معاينة بصرية كاملة وإمكانية كتابة اسم أي خط من مستودعك:
        </p>

        {/* Quick Apply Miro Modern Font (Plus Jakarta Sans) */}
        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('success');
            triggerLuxuryCelebration();
            const fontName = "'Plus Jakarta Sans', sans-serif";
            onTypographyChange('clockFont', fontName);
            onTypographyChange('hintsFont', fontName);
            onTypographyChange('numbersFont', fontName);
            onTypographyChange('sectionTitlesFont', fontName);
            onTypographyChange('englishWordsFont', fontName);
          }}
          className="clay-btn w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600/40 via-indigo-600/35 to-cyan-500/40 hover:from-blue-600/50 hover:to-cyan-500/50 border border-blue-400/40 text-blue-200 hover:text-white flex items-center justify-between transition-all cursor-pointer tap-interactive shadow-md relative z-10"
        >
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Sparkles} size="sm" className="text-cyan-300" />
            <span className="text-xs font-black font-titles text-white">
              تطبيق خط Miro العصري (Plus Jakarta Sans) لجميع الأقسام
            </span>
          </div>
          <span className="text-[10px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full font-titles">
            تطبيق فوري
          </span>
        </button>

        <div className="space-y-2 relative z-10">
          {/* 1. خط الساعة */}
          <div
            onClick={() => openFontPicker('clockFont', 'تحديد خط الساعة الرقمية (12H Digital Clock)')}
            className="neu-card p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between transition-all tap-interactive cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <AnimatedIcon icon={Clock} size="sm" className="text-purple-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-titles">خط الساعة الرقمية</span>
                <span className="text-[11px] text-purple-300 font-mono">
                  {getFontName(typography.clockFont)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 font-clock text-slate-200">
                12:45 PM
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
          </div>

          {/* 2. خط التلميحات */}
          <div
            onClick={() => openFontPicker('hintsFont', 'تحديد خط التلميحات والمساعد الذكي')}
            className="neu-card p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between transition-all tap-interactive cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <AnimatedIcon icon={HelpCircle} size="sm" className="text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-titles">خط التلميحات والمساعد</span>
                <span className="text-[11px] text-amber-300 font-mono">
                  {getFontName(typography.hintsFont)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 font-hints text-slate-200">
                تلميح ذكي
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
          </div>

          {/* 3. خط الأرقام */}
          <div
            onClick={() => openFontPicker('numbersFont', 'تحديد خط الأرقام والأسعار والسرعة')}
            className="neu-card p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between transition-all tap-interactive cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <AnimatedIcon icon={Hash} size="sm" className="text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-titles">خط الأرقام والسرعة والمتر</span>
                <span className="text-[11px] text-cyan-300 font-mono">
                  {getFontName(typography.numbersFont)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 font-numbers text-slate-200">
                35,000 IQD
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
          </div>

          {/* 4. خط أسماء الأقسام العربية */}
          <div
            onClick={() => openFontPicker('sectionTitlesFont', 'تحديد خط عناوين وأسماء الأقسام العربية')}
            className="neu-card p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between transition-all tap-interactive cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <AnimatedIcon icon={Languages} size="sm" className="text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-titles">خط أسماء الأقسام العربية</span>
                <span className="text-[11px] text-emerald-300 font-mono">
                  {getFontName(typography.sectionTitlesFont)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 font-titles text-slate-200">
                الرئيسية
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
          </div>

          {/* 5. خط الكلمات الإنجليزية */}
          <div
            onClick={() => openFontPicker('englishWordsFont', 'تحديد خط الكلمات الإنجليزية والمصطلحات')}
            className="neu-card p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between transition-all tap-interactive cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
                <AnimatedIcon icon={Type} size="sm" className="text-pink-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block font-titles">خط الكلمات الإنجليزية</span>
                <span className="text-[11px] text-pink-300 font-mono">
                  {getFontName(typography.englishWordsFont)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 font-english text-slate-200">
                Earthlink VIP
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Language & Tips Preference */}
      <div className="clay-card rounded-3xl p-5 border border-white/10 shadow-xl space-y-3 relative overflow-hidden bg-gradient-to-b from-slate-900/60 to-black/80">
        <div className="shimmer-sweep-layer" />

        {/* Language Switch */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <AnimatedIcon icon={Globe} size="sm" className="text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block font-titles">{t.appLanguage}</span>
              <span className="text-[11px] text-slate-400 font-hints">عربي / English</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playHapticSound('switch');
              onLangToggle();
            }}
            className="clay-btn px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all tap-interactive font-titles cursor-pointer"
          >
            {t.langToggle}
          </button>
        </div>

        {/* Tips Toggle */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-hints">
            <AnimatedIcon icon={HelpCircle} size="sm" className="text-amber-400" />
            <span>عرض التلميحات والمساعد الذكي في الواجهة</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playHapticSound('tap');
              setShowTips(!showTips);
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer tap-interactive ${
              showTips ? 'bg-purple-600' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                showTips ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 6. Android APK / PWA Mobile App Section */}
      <div className="clay-card rounded-3xl p-5 border border-emerald-500/35 shadow-xl space-y-3 bg-gradient-to-b from-emerald-950/20 via-slate-900/50 to-black/80 relative overflow-hidden">
        <div className="shimmer-sweep-layer" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
              <AnimatedIcon icon={Smartphone} size="md" className="text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block font-titles">
                تطبيق أندرويد (APK / WebAPK)
              </span>
              <span className="text-[11px] text-emerald-300 font-hints">
                تثبيت على الهاتف كأي تطبيق أصلي مع أيقونة رسمية
              </span>
            </div>
          </div>

          <span className="soft-pill text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-titles">
            جاهز للتثبيت
          </span>
        </div>

        <p className="text-xs text-slate-300 font-hints leading-relaxed relative z-10">
          يمكنك تشغيل وتثبيت هذا التطبيق مباشرة على هاتفك الأندرويد بشاشة كاملة وبدون متصفح مع تحديثات فورية وإشعارات:
        </p>

        <button
          type="button"
          onClick={() => {
            playHapticSound('tap');
            if (onOpenInstallModal) onOpenInstallModal();
          }}
          className="clay-btn w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer tap-interactive font-titles hover:brightness-110 transition-all relative z-10"
        >
          <AnimatedIcon icon={Download} size="sm" className="text-slate-950" />
          <span>فتح نافذة تثبيت وتحميل التطبيق (APK)</span>
        </button>
      </div>

      {/* Custom Picker Modal for Font Selection */}
      <CustomPickerModal
        isOpen={activePickerKey !== null}
        onClose={() => setActivePickerKey(null)}
        title={pickerModalTitle}
        description="اختر الخط المطلوب لمعاينته فورياً أو أضف اسم خط من مستودعك"
        options={FONT_OPTIONS}
        selectedId={activePickerKey ? typography[activePickerKey] : ''}
        onSelect={(fontId) => {
          if (activePickerKey) {
            onTypographyChange(activePickerKey, fontId);
          }
        }}
      />
    </motion.div>
  );
};
