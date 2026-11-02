import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThemeId,
  BackgroundPattern,
  TypographySettings,
  CardMaterial
} from '../types/earthlink';
import { playHapticSound, createClickRipple } from '../utils/effects';
import { CustomPickerModal, PickerOption } from './CustomPickerModal';
import { AnimatedIcon } from './AnimatedIcon';
import {
  Palette,
  Type,
  Globe,
  Sparkles,
  Check,
  Languages,
  ImageIcon,
  Upload,
  RotateCcw,
  Camera,
  Smartphone,
  Download,
  Zap,
  Sliders,
  Shield,
  Eye,
  Activity,
  Layers,
  Flame,
  MousePointerClick
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
  cardMaterial: CardMaterial;
  onCardMaterialChange: (material: CardMaterial) => void;
  enableParticles: boolean;
  onToggleParticles: (enable: boolean) => void;
  enableClickFlash: boolean;
  onToggleClickFlash: (enable: boolean) => void;
  t: Record<string, string>;
}

type SettingsSection = 'materials' | 'themes' | 'logo' | 'typography' | 'system';

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

const CARD_MATERIALS: { id: CardMaterial; nameAr: string; nameEn: string; desc: string; previewClass: string }[] = [
  {
    id: 'obsidian',
    nameAr: 'أوبسيديان كربوني داكن',
    nameEn: 'Carbon Obsidian',
    desc: 'مظهر داكن فخم مع حواف انعكاسية ميكرونية عميقة ووضوح فائق للنصوص',
    previewClass: 'card-obsidian'
  },
  {
    id: 'crystal',
    nameAr: 'كريستال زجاجي نقي',
    nameEn: 'Pure Crystal Glass',
    desc: 'شفافية بلورية فائقة النقاء مع هالات ضوئية وانعكاسات ناعمة',
    previewClass: 'card-crystal'
  },
  {
    id: 'frost',
    nameAr: 'جليدي ضبابي مطفي',
    nameEn: 'Frosted Matte Ice',
    desc: 'تغبيش وضبابية مخملية ناعمة تحاكي أرقى الواجهات الهندسية',
    previewClass: 'card-frost'
  },
  {
    id: 'pearl',
    nameAr: 'لؤلؤي فاخر عاكس',
    nameEn: 'Lustrous Pearl',
    desc: 'تدرجات لؤلؤية براقة تعكس الضوء بجمالية ملكية ناصعة',
    previewClass: 'card-pearl'
  },
  {
    id: 'liquid',
    nameAr: 'سائل نيون متوهج',
    nameEn: 'Liquid Ambient Glow',
    desc: 'انعكاسات سائلة متناغمة مع ألوان الثيم وتوهج ليزري خافت ومريح للعين',
    previewClass: 'card-liquid'
  }
];

const FONT_OPTIONS: PickerOption[] = [
  { id: "'Cairo', sans-serif", title: 'خط كايرو (Cairo Luxury)', subtitle: 'الخط الرسمي الأكثر فخامة وتناسقاً', previewFontFamily: "'Cairo', sans-serif", previewText: 'أهلاً بك في المنظومة 123' },
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
  cardMaterial,
  onCardMaterialChange,
  enableParticles,
  onToggleParticles,
  enableClickFlash,
  onToggleClickFlash,
  t
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('materials');
  const [activePickerKey, setActivePickerKey] = useState<keyof TypographySettings | null>(null);
  const [pickerModalTitle, setPickerModalTitle] = useState<string>('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState<boolean>(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState<boolean>(false);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);

  // Hidden File Inputs
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  // Safe image compressor
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

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLogo(true);
    processImageFile(file, 350, (dataUrl) => {
      onAvatarChange(dataUrl);
      setIsProcessingLogo(false);
      playHapticSound('success');
    });
    e.target.value = '';
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingBg(true);
    processImageFile(file, 1080, (dataUrl) => {
      onCustomBgChange(dataUrl);
      setIsProcessingBg(false);
      playHapticSound('success');
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
      {/* Hidden File Inputs */}
      <input ref={logoFileInputRef} type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
      <input ref={bgFileInputRef} type="file" accept="image/*" onChange={handleBgFileChange} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 font-titles">
            <span>{t.settingsTitle}</span>
            <AnimatedIcon icon={Sliders} size="md" className="text-cyan-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-hints">
            تخصيص خامات الكاردات الزجاجية، الثيمات، الخطوط، وهوية المشترك
          </p>
        </div>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>منظومة متطورة</span>
        </div>
      </div>

      {/* Categorized Navigation Segmented Control */}
      <div className="p-1 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md grid grid-cols-5 gap-1 text-[11px] font-bold font-titles">
        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveSection('materials');
          }}
          className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'materials'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">خامات الكاردات</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveSection('themes');
          }}
          className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'themes'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">الثيمات والخلفيات</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveSection('logo');
          }}
          className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'logo'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">لوغو المشترك</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveSection('typography');
          }}
          className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'typography'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">الخطوط</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveSection('system');
          }}
          className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeSection === 'system'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">النظام والتطبيق</span>
        </button>
      </div>

      {/* Dynamic Content Views */}
      <AnimatePresence mode="wait">
        {/* =========================================================================
            1. TAB: MOKO LUXURY GLASS MATERIALS & AMBIENT EFFECTS
           ========================================================================= */}
        {activeSection === 'materials' && (
          <motion.div
            key="sec-materials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Card Material Presets Selection */}
            <div className="clay-card rounded-3xl p-5 border border-cyan-400/30 shadow-xl bg-gradient-to-b from-cyan-950/20 via-slate-950/60 to-black/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                    <Sparkles className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-titles">
                      خامات الزجاج الفاخرة للكاردات (Luxury Card Materials)
                    </h3>
                    <p className="text-xs text-slate-300 font-hints">
                      اختر خامة الزجاج المتقدمة التي تنعكس على جميع كاردات وأقسام التطبيق
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-400/30">
                  {cardMaterial.toUpperCase()}
                </span>
              </div>

              {/* 5 Material Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {CARD_MATERIALS.map((mat) => {
                  const isSelected = cardMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => {
                        playHapticSound('tap');
                        onCardMaterialChange(mat.id);
                      }}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                          : 'border-white/10 bg-black/40 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${isSelected ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`} />
                          <span className="text-sm font-black text-white font-titles">
                            {mat.nameAr}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 font-bold">
                          {mat.nameEn}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300/90 font-hints leading-relaxed">
                        {mat.desc}
                      </p>

                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 font-titles">
                          <Check className="w-3.5 h-3.5" />
                          <span>الخامة المفعلة حالياً</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Ambient Dust Particles & Specular Flash Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10">
                {/* 1. Starlight Particles Toggle */}
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white font-titles block">
                        جزيئات النجوم والشهب العائمة
                      </span>
                      <span className="text-[10px] text-slate-400 font-hints">
                        غبار ضوئي ناعم يطفو في الخلفية
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playHapticSound('switch');
                      onToggleParticles(!enableParticles);
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center cursor-pointer ${
                      enableParticles ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                {/* 2. Glass Click Specular Flash Toggle */}
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MousePointerClick className="w-4 h-4 text-cyan-300 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white font-titles block">
                        وميض الانعكاس الزجاجي (Click Flash)
                      </span>
                      <span className="text-[10px] text-slate-400 font-hints">
                        شعاع بلوري يمر عبر الكارد عند لمسه
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playHapticSound('switch');
                      onToggleClickFlash(!enableClickFlash);
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center cursor-pointer ${
                      enableClickFlash ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 font-hints flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>معاينة فورية لخامة الزجاج المختارة:</span>
                </span>
                <div className="clay-card p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white font-titles block">
                        كارد زجاجي بهندسة MOKO الفاخرة
                      </span>
                      <span className="text-[10px] text-slate-400 font-hints">
                        مظهر زجاجي عصري ثلاثي الأبعاد مع انعكاسات ضوئية نقية
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {cardMaterial}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            2. TAB: THEMES & WALLPAPERS
           ========================================================================= */}
        {activeSection === 'themes' && (
          <motion.div
            key="sec-themes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* 12 Luxury Themes Grid */}
            <div className="clay-card rounded-3xl p-5 border border-white/10 space-y-3">
              <div>
                <h3 className="text-sm font-black text-white font-titles">
                  الثيمات الملكية الفاخرة (12 ثيم حصري)
                </h3>
                <p className="text-xs text-slate-400 font-hints">
                  اختر الطابع اللوني العام للمنظومة:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {LUXURY_THEMES.map(theme => {
                  const isSelected = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        playHapticSound('tap');
                        onThemeChange(theme.id);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-24 cursor-pointer ${
                        isSelected
                          ? 'border-white bg-white/10 shadow-lg'
                          : 'border-white/10 bg-black/40 hover:bg-white/5 text-slate-300'
                      }`}
                      style={{
                        background: theme.gradient,
                        borderColor: isSelected ? theme.accent : undefined
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white font-mono">
                          {theme.tag}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>

                      <div>
                        <span className="text-xs font-bold text-white font-titles block truncate">
                          {theme.nameAr}
                        </span>
                        <span className="text-[10px] text-slate-300 font-english block truncate">
                          {theme.nameEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Patterns */}
            <div className="clay-card rounded-3xl p-5 border border-white/10 space-y-3">
              <h3 className="text-sm font-black text-white font-titles">
                أنماط خلفيات الشاشة (Background Textures)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BG_PATTERNS.map(pattern => {
                  const isSelected = currentBg === pattern.id && !customBgImage;
                  return (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => {
                        playHapticSound('tap');
                        onCustomBgChange(null);
                        onBgChange(pattern.id);
                      }}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 text-white'
                          : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold font-titles block text-white">
                        {pattern.nameAr}
                      </span>
                      <span className="text-[10px] text-slate-400 font-hints block mt-0.5">
                        {pattern.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Studio Background Image */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white font-titles block">
                    خلفية مخصصة من جهازك
                  </span>
                  <span className="text-[11px] text-slate-400 font-hints">
                    يمكنك رفع أي صورة من استوديو هاتفك
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isProcessingBg}
                    onClick={() => bgFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingBg ? 'جاري التحميل...' : 'فتح الاستوديو'}</span>
                  </button>
                  {customBgImage && (
                    <button
                      type="button"
                      onClick={() => onCustomBgChange(null)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            3. TAB: SUBSCRIBER LOGO
           ========================================================================= */}
        {activeSection === 'logo' && (
          <motion.div
            key="sec-logo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="clay-card rounded-3xl p-5 border border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-black text-white font-titles">
                  لوغو وشعار المشترك
                </h3>
                <p className="text-xs text-slate-400 font-hints">
                  اختر صورة من استوديو هاتفك لتكون أيقونتك في شريط التنقل والقائمة
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-xl shrink-0">
                    <img
                      src={userAvatar || 'https://user.earthlink.iq/accountImages/138.png'}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-[14px] bg-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white font-titles block">
                      اللوغو النشط حالياً
                    </span>
                    <span className="text-[11px] text-slate-400 font-hints">
                      يظهر في أعلى الهيدر والقائمة الجانبية
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isProcessingLogo}
                  onClick={() => logoFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isProcessingLogo ? 'جاري التحميل...' : 'اختيار من الاستوديو'}</span>
                </button>
              </div>

              {/* URL fallback */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                  className="text-xs font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                >
                  {showCustomAvatarInput ? '− إخفاء إدخال الرابط' : '+ استخدام رابط صورة مباشر'}
                </button>
                {showCustomAvatarInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrl.trim()) {
                          onAvatarChange(customAvatarUrl.trim());
                          setCustomAvatarUrl('');
                          setShowCustomAvatarInput(false);
                          playHapticSound('success');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      تطبيق
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            4. TAB: TYPOGRAPHY
           ========================================================================= */}
        {activeSection === 'typography' && (
          <motion.div
            key="sec-typography"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="clay-card rounded-3xl p-5 border border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-black text-white font-titles">
                  تخصيص الخطوط التفصيلية (Typography)
                </h3>
                <p className="text-xs text-slate-400 font-hints">
                  تحكم دقيق بنوع وحجم خط كل عنصر في الواجهة:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { key: 'sectionTitlesFont' as const, label: 'خط العناوين والتبويبات الرئيسية', current: typography.sectionTitlesFont },
                  { key: 'hintsFont' as const, label: 'خط النصوص والتلميحات والشروحات', current: typography.hintsFont },
                  { key: 'numbersFont' as const, label: 'خط الأرقام والبيانات والإحصائيات', current: typography.numbersFont },
                  { key: 'clockFont' as const, label: 'خط الساعة والتاريخ والعدادات', current: typography.clockFont },
                  { key: 'englishWordsFont' as const, label: 'خط العبارات والكلمات الإنجليزية', current: typography.englishWordsFont },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-bold text-white font-titles block">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-cyan-300 font-mono mt-0.5 block" style={{ fontFamily: item.current }}>
                        {getFontName(item.current)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openFontPicker(item.key, item.label)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      تغيير
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            5. TAB: SYSTEM & PWA
           ========================================================================= */}
        {activeSection === 'system' && (
          <motion.div
            key="sec-system"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="clay-card rounded-3xl p-5 border border-white/10 space-y-4">
              <div>
                <h3 className="text-sm font-black text-white font-titles">
                  إعدادات النظام والتطبيق
                </h3>
                <p className="text-xs text-slate-400 font-hints">
                  اللغة، التثبيت على الهاتف، وحالة الاتصال
                </p>
              </div>

              {/* Language Switch */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Languages className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white font-titles block">
                      لغة الواجهة (Language)
                    </span>
                    <span className="text-[11px] text-slate-400 font-hints">
                      {currentLang === 'ar' ? 'العربية (افتراضي)' : 'English'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playHapticSound('switch');
                    onLangToggle();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold cursor-pointer"
                >
                  {currentLang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
                </button>
              </div>

              {/* Install PWA Button */}
              {onOpenInstallModal && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white font-titles block">
                        تثبيت كـ تطبيق أصلي (PWA)
                      </span>
                      <span className="text-[11px] text-slate-400 font-hints">
                        يعمل بدون متصفح بشاشة كاملة وسرعة فائقة
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playHapticSound('tap');
                      onOpenInstallModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    تثبيت الآن
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font Picker Modal */}
      {activePickerKey && (
        <CustomPickerModal
          isOpen={!!activePickerKey}
          onClose={() => setActivePickerKey(null)}
          title={pickerModalTitle}
          options={FONT_OPTIONS}
          selectedId={typography[activePickerKey]}
          onSelect={(fontId) => {
            onTypographyChange(activePickerKey, fontId);
            setActivePickerKey(null);
            playHapticSound('success');
          }}
        />
      )}
    </motion.div>
  );
};
