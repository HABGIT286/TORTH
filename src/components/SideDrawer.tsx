import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriberData, AppTab } from '../types/earthlink';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';
import {
  LayoutDashboard,
  Cpu,
  UserCheck,
  CreditCard,
  Activity,
  Bell,
  Smartphone,
  Palette,
  MessageCircle,
  Share2,
  Info,
  LogOut,
  Settings,
  Moon,
  Sun,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Send,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onLogout: () => void;
  onOpenInstallModal?: () => void;
  onOpenGithubApkModal?: () => void;
  onToggleThemeMode?: () => void;
  data: SubscriberData;
  userAvatar?: string;
  userUUID: string;
  t: Record<string, string>;
  hasActiveAlert?: boolean;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onLogout,
  onOpenInstallModal,
  onOpenGithubApkModal,
  onToggleThemeMode,
  data,
  userAvatar,
  userUUID,
  t,
  hasActiveAlert = false
}) => {
  // Collapsed vs Expanded Mode (like Screenshot 1 vs Screenshot 2)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'none' | 'contact' | 'social' | 'about'>('none');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  // List of navigation items matching the screenshot structure
  const menuItems = useMemo(() => [
    {
      id: 'glassy-v2',
      titleAr: 'واجهة Glassy Dashboard V2 الفاخرة',
      titleEn: 'Glassy Dashboard V2',
      icon: LayoutDashboard,
      badge: 'V2 PRO',
      tab: 'glassyV2' as AppTab,
      highlight: true
    },
    {
      id: 'dashboard',
      titleAr: 'لوحة التحكم والعداد المائي',
      titleEn: 'Dashboard & Meter',
      icon: LayoutDashboard,
      badge: null,
      tab: 'data' as AppTab,
      highlight: false
    },
    {
      id: 'ai-brain',
      titleAr: 'محرك الذكاء الاصطناعي (AI)',
      titleEn: 'AI Intelligence',
      icon: Cpu,
      badge: 'AI VIP',
      tab: 'ai' as AppTab,
      highlight: false
    },
    {
      id: 'account',
      titleAr: 'بيانات المشترك والاشتراك',
      titleEn: 'Customers & Account',
      icon: UserCheck,
      badge: null,
      tab: 'data' as AppTab,
      highlight: false
    },
    {
      id: 'network',
      titleAr: 'فحص جودة وسرعة النت (5G)',
      titleEn: 'Tickets & Speed',
      icon: Activity,
      badge: '185M',
      tab: 'data' as AppTab,
      highlight: false
    },
    {
      id: 'alerts',
      titleAr: 'جدولة التنبيهات والأتمتة',
      titleEn: 'Tasks & Alerts',
      icon: Bell,
      badge: hasActiveAlert ? 'نشط 2' : '2',
      badgeColor: 'bg-blue-500 text-white',
      tab: 'alerts' as AppTab,
      highlight: false
    },
    {
      id: 'apk-android15',
      titleAr: 'تطبيق أندرويد 15 (APK / ERTH)',
      titleEn: 'Android 15 APK',
      icon: Smartphone,
      badge: 'ERTH',
      badgeColor: 'bg-emerald-500 text-slate-950',
      action: () => {
        if (onOpenGithubApkModal) onOpenGithubApkModal();
        else if (onOpenInstallModal) onOpenInstallModal();
      },
      highlight: false
    },
    {
      id: 'themes',
      titleAr: 'مظهر وثيمات الواجهة الفخمة',
      titleEn: 'Themes & Styles',
      icon: Palette,
      badge: '12',
      tab: 'settings' as AppTab,
      highlight: false
    },
    {
      id: 'settings',
      titleAr: 'إعدادات النظام والخطوط',
      titleEn: 'System Settings',
      icon: Settings,
      badge: null,
      tab: 'settings' as AppTab,
      highlight: false
    },
    {
      id: 'support',
      titleAr: 'الدعم الفني وتواصل مع الإدارة',
      titleEn: 'Support & Help',
      icon: MessageCircle,
      badge: null,
      action: () => setActiveModal('contact'),
      highlight: false
    },
    {
      id: 'social',
      titleAr: 'قنوات ومواقع التواصل',
      titleEn: 'Social Media',
      icon: Share2,
      badge: null,
      action: () => setActiveModal('social'),
      highlight: false
    },
    {
      id: 'about',
      titleAr: 'حول التطبيق والإصدار',
      titleEn: 'About Application',
      icon: Info,
      badge: 'v3.0',
      action: () => setActiveModal('about'),
      highlight: false
    }
  ], [hasActiveAlert, onOpenGithubApkModal, onOpenInstallModal]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase().trim();
    return menuItems.filter(item =>
      item.titleAr.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q)
    );
  }, [menuItems, searchQuery]);

  if (!isOpen) return null;

  // Handle Contact Submission
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSendingContact(true);
    playHapticSound('send');

    try {
      const nowTimeStr = new Date().toLocaleString('ar-IQ');
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim() || data.fullName,
          message: contactMessage.trim(),
          subscriberUser: data.userID,
          userCode: userUUID,
          date: nowTimeStr
        })
      });

      setContactSent(true);
      triggerLuxuryCelebration();
      setTimeout(() => {
        setContactSent(false);
        setContactMessage('');
        setActiveModal('none');
      }, 3000);
    } catch {
      // Handled
    } finally {
      setIsSendingContact(false);
    }
  };

  const copyDiscordID = (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    navigator.clipboard.writeText('1487837632716079344');
    setCopiedDiscord(true);
    playHapticSound('tap');
    setTimeout(() => setCopiedDiscord(false), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end animate-in fade-in duration-200 overflow-hidden">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Main Floating Sidebar styled strictly matching the user's screenshot */}
      <motion.div
        layout
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className={`relative h-full my-auto sm:my-3 sm:mr-3 sm:rounded-[36px] bg-gradient-to-b from-white/95 via-slate-50/95 to-slate-100/95 dark:from-[#0f0b1a]/95 dark:via-[#090514]/95 dark:to-[#04020a]/98 text-slate-800 dark:text-white border-l sm:border border-slate-200/80 dark:border-purple-500/30 p-4 flex flex-col shadow-2xl z-10 backdrop-blur-2xl transition-all duration-300 select-none overflow-hidden ${
          isCollapsed ? 'w-20' : 'w-76 max-w-[88vw]'
        }`}
      >
        {/* Shimmer sweep layer */}
        <div className="shimmer-sweep-layer" />

        {/* 1. Header Profile Pill (as in Screenshot 1) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 dark:border-white/10 mb-3 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20">
                <img
                  src={userAvatar || data.accountImagePath || 'https://user.earthlink.iq/accountImages/138.png'}
                  alt="User"
                  className="w-full h-full rounded-[14px] object-cover bg-slate-900"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://user.earthlink.iq/accountImages/138.png';
                  }}
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
            </div>

            {/* User Title & Role (hidden in collapsed mode) */}
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white truncate font-titles">
                    {data.fullName || 'جعفر حيدر'}
                  </h3>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-mono font-bold">
                    Admin / مشترك VIP
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Expand/Collapse Toggle & Close Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                setIsCollapsed(!isCollapsed);
              }}
              title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة إلى شريط جانبي'}
              className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer tap-interactive"
            >
              {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {!isCollapsed && (
              <button
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  onClose();
                }}
                className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer tap-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Integrated Search Bar (as in Screenshot 1: "Search dashboard...") */}
        {!isCollapsed && (
          <div className="mb-3 relative z-10">
            <div className="relative rounded-2xl bg-slate-100/90 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 overflow-hidden flex items-center px-3 py-1.5 shadow-inner">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في لوحة التحكم..."
                className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-hints pr-1"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </div>
          </div>
        )}

        {/* 3. Navigation Items List (Smoothly animated, matching screenshot styling) */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 no-scrollbar relative z-10">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isHighlight = item.highlight && !searchQuery;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  if (item.action) {
                    item.action();
                  } else if (item.tab) {
                    onNavigateTab(item.tab);
                    onClose();
                  }
                }}
                className={`w-full rounded-2xl transition-all cursor-pointer tap-interactive flex items-center justify-between text-right group ${
                  isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2.5'
                } ${
                  isHighlight
                    ? 'bg-blue-500/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
                title={item.titleAr}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      isHighlight
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/40'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 group-hover:bg-blue-500/15 group-hover:text-blue-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <span className="text-xs font-bold font-titles truncate">
                      {item.titleAr}
                    </span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-numbers shadow-sm ${
                      item.badgeColor || 'bg-blue-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 4. Bottom Toolbar: 4 rounded buttons in a row (as in Screenshot 1 & 2) */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 mt-2 relative z-10">
          <div className="grid grid-cols-4 gap-1.5">
            {/* Button 1: Dark/Light Mode Moon/Sun */}
            <button
              type="button"
              onClick={() => {
                playHapticSound('switch');
                if (onToggleThemeMode) onToggleThemeMode();
              }}
              title="تبديل النمط المظلم / الفاتح"
              className="h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer tap-interactive"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Button 2: Settings Cog */}
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                onNavigateTab('settings');
                onClose();
              }}
              title="إعدادات التطبيق"
              className="h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer tap-interactive"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Button 3: Quick Action (+) */}
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                if (onOpenGithubApkModal) onOpenGithubApkModal();
                else onNavigateTab('alerts');
                onClose();
              }}
              title="تجميع APK أندرويد 15 وتنبيه فوري (+)"
              className="h-10 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all cursor-pointer tap-interactive shadow-md shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Button 4: Logout / Exit */}
            <button
              type="button"
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                onLogout();
                onClose();
              }}
              title="تسجيل الخروج"
              className="h-10 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center transition-all cursor-pointer tap-interactive"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal: Contact Form */}
        {activeModal === 'contact' && (
          <div className="absolute inset-0 bg-slate-950 p-5 flex flex-col z-30 overflow-y-auto animate-in fade-in duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-titles">
                <AnimatedIcon icon={MessageCircle} size="sm" className="text-amber-400" />
                <span>{t.contactTitle}</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-hints">
              {t.contactSubtitle}
            </p>

            <form onSubmit={handleSubmitContact} className="space-y-3.5 flex-1 flex flex-col">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 font-titles">{t.yourName}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t.yourNamePlaceholder}
                  className="neu-inset w-full h-11 rounded-xl bg-black/60 border border-white/10 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-300 font-titles">{t.yourMessage}</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={t.yourMessagePlaceholder}
                  required
                  rows={5}
                  className="neu-inset w-full flex-1 rounded-xl bg-black/60 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingContact}
                className="clay-btn w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all hover:brightness-110 cursor-pointer disabled:opacity-50 font-titles tap-interactive"
              >
                {isSendingContact ? (
                  <span>جاري الإرسال...</span>
                ) : contactSent ? (
                  <>
                    <AnimatedIcon icon={Check} size="sm" className="text-emerald-300" />
                    <span>تم إرسال رسالتك بنجاح!</span>
                  </>
                ) : (
                  <>
                    <AnimatedIcon icon={Send} size="sm" className="text-white" />
                    <span>{t.sendMessageBtn}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Modal: Social Channels */}
        {activeModal === 'social' && (
          <div className="absolute inset-0 bg-slate-950 p-5 flex flex-col z-30 animate-in fade-in duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-titles">
                <AnimatedIcon icon={Share2} size="sm" className="text-blue-400" />
                <span>{t.socialMedia}</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="https://www.tiktok.com/@00.tnt"
                target="_blank"
                rel="noreferrer"
                className="clay-btn p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between text-white transition-all group tap-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-black">
                    TT
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-titles">TikTok</span>
                    <span className="text-[11px] text-pink-400 font-mono">@00.tnt</span>
                  </div>
                </div>
                <AnimatedIcon icon={ExternalLink} size="sm" className="text-slate-500" />
              </a>

              <a
                href="https://t.me/motrxvip"
                target="_blank"
                rel="noreferrer"
                className="clay-btn p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between text-white transition-all group tap-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
                    TG
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-titles">Telegram Channel</span>
                    <span className="text-[11px] text-sky-400 font-mono">@motrxvip</span>
                  </div>
                </div>
                <AnimatedIcon icon={ExternalLink} size="sm" className="text-slate-500" />
              </a>

              <div
                onClick={copyDiscordID}
                className="clay-btn p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between text-white transition-all cursor-pointer group tap-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                    DC
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-titles">Discord Account</span>
                    <span className="text-[11px] text-indigo-300 font-mono">1487837632716079344</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  {copiedDiscord ? <AnimatedIcon icon={Check} size="sm" className="text-emerald-400" /> : <AnimatedIcon icon={Copy} size="sm" className="text-slate-400" />}
                  <span>{copiedDiscord ? 'تم النسخ!' : 'نسخ ID'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: About App */}
        {activeModal === 'about' && (
          <div className="absolute inset-0 bg-slate-950 p-5 flex flex-col z-30 animate-in fade-in duration-200 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-titles">
                <AnimatedIcon icon={Info} size="sm" className="text-emerald-400" />
                <span>{t.aboutApp}</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="neu-card p-4 rounded-2xl bg-black/50 border border-white/10 text-center">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 mx-auto mb-2.5">
                  <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-xl font-black text-white">
                    EL
                  </div>
                </div>
                <h4 className="text-sm font-black text-white font-titles">Earthlink VIP Subscriber Portal</h4>
                <span className="text-[11px] text-purple-400 font-mono">{t.version}</span>
              </div>

              <p className="font-hints">{t.aboutDescription}</p>

              <div className="neu-inset p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-purple-200 font-hints">
                ⭐ <b>المميزات:</b> عداد مائي ثلاثي الأبعاد، تجميع أندرويد 15 APK تلقائي عبر GitHub، ذكاء اصطناعي فائق، شريط ملاحة ناعم مستوحى من CSS Sidebar، و12 ثيماً ملوكياً.
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
