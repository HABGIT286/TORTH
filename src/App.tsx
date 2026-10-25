/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { SubscriberData, ThemeId, BackgroundPattern, TypographySettings, AppTab, ManualAlertSchedule } from './types/earthlink';
import { translations } from './utils/i18n';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from './utils/effects';
import { DynamicIsland } from './components/DynamicIsland';
import { HeroSubCard } from './components/HeroSubCard';
import { ReportCard } from './components/ReportCard';
import { AlertsPanel } from './components/AlertsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { EarthlinkAIPanel } from './components/EarthlinkAIPanel';
import { SideDrawer } from './components/SideDrawer';
import { LoginScreen } from './components/LoginScreen';
import { BottomTabBar } from './components/BottomTabBar';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { GithubUploadApkModal } from './components/GithubUploadApkModal';
import { Sun, Moon, Menu, CheckCircle2, Bell, ChevronDown, Smartphone, Cpu, Sparkles } from 'lucide-react';

const EMPTY_SUBSCRIBER_DATA: SubscriberData = {
  fullName: 'مشترك إيرثلنك',
  userID: '',
  accountName: 'اشتراك إيرثلنك',
  accountPrice: '—',
  accountStatus: 'غير متصل',
  activeDaysLeft: 0,
  accountExpirationDate: '—',
  agentName: '—',
  userIP: '—',
  mobileNumber: '—',
  city: 'العراق',
  address: '—',
  email: '—',
  accountImagePath: 'https://user.earthlink.iq/accountImages/138.png',
  serviceStatusColor: 'Gray',
  lastUpdated: '—',
  isLiveConnection: false
};

const DEFAULT_TYPOGRAPHY: TypographySettings = {
  clockFont: "'Outfit', sans-serif",
  hintsFont: "'Tajawal', sans-serif",
  numbersFont: "'Outfit', sans-serif",
  sectionTitlesFont: "'Cairo', sans-serif",
  englishWordsFont: "'Outfit', sans-serif",
};

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('EL_AUTH_TOKEN'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem('EL_AUTH_TOKEN'));
  const [subscriberData, setSubscriberData] = useState<SubscriberData>(() => {
    try {
      const cached = localStorage.getItem('EL_SUBSCRIBER_CACHE');
      return cached ? JSON.parse(cached) : EMPTY_SUBSCRIBER_DATA;
    } catch {
      return EMPTY_SUBSCRIBER_DATA;
    }
  });
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isGithubApkModalOpen, setIsGithubApkModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Manual specific alert schedule state (saved in localStorage)
  const [activeAlertSchedule, setActiveAlertSchedule] = useState<ManualAlertSchedule | null>(() => {
    try {
      const saved = localStorage.getItem('EL_SCHEDULED_ALERT');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleUpdateSchedule = (schedule: ManualAlertSchedule | null) => {
    setActiveAlertSchedule(schedule);
    if (schedule) {
      localStorage.setItem('EL_SCHEDULED_ALERT', JSON.stringify(schedule));
    } else {
      localStorage.removeItem('EL_SCHEDULED_ALERT');
    }
  };

  // Customization States
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('EL_THEME') as ThemeId) || 'theme-royal-purple';
  });

  const [currentBg, setCurrentBg] = useState<BackgroundPattern>(() => {
    return (localStorage.getItem('EL_BG_PATTERN') as BackgroundPattern) || 'pattern-aurora';
  });

  // Custom Studio Wallpaper
  const [customBgImage, setCustomBgImage] = useState<string | null>(() => {
    return localStorage.getItem('EL_CUSTOM_BG_IMAGE') || null;
  });

  const handleCustomBgChange = (imgDataUrl: string | null) => {
    setCustomBgImage(imgDataUrl);
    if (imgDataUrl) {
      try {
        localStorage.setItem('EL_CUSTOM_BG_IMAGE', imgDataUrl);
      } catch {
        // Handled if quota exceeded
      }
      showNotice('تم تطبيق وتغيير خلفية البرنامج بنجاح! 🎨');
    } else {
      localStorage.removeItem('EL_CUSTOM_BG_IMAGE');
      showNotice('تمت إزالة صورة الخلفية والعودة للأنماط الافتراضية.');
    }
  };

  // User Avatar from Studio / Gallery
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('EL_USER_AVATAR') || 'https://user.earthlink.iq/accountImages/138.png';
  });

  const handleAvatarChange = (avatarUrl: string) => {
    setUserAvatar(avatarUrl);
    try {
      localStorage.setItem('EL_USER_AVATAR', avatarUrl);
    } catch {
      // Handled
    }
    showNotice('تم تحديث لوغو المشترك بنجاح! ✨');
  };

  const [typography, setTypography] = useState<TypographySettings>(() => {
    try {
      const saved = localStorage.getItem('EL_TYPOGRAPHY');
      return saved ? { ...DEFAULT_TYPOGRAPHY, ...JSON.parse(saved) } : DEFAULT_TYPOGRAPHY;
    } catch {
      return DEFAULT_TYPOGRAPHY;
    }
  });

  const [currentLang, setCurrentLang] = useState<'ar' | 'en'>(() => {
    return (localStorage.getItem('EL_LANG') as 'ar' | 'en') || 'ar';
  });

  const [userUUID] = useState<string>(() => {
    let id = localStorage.getItem('EL_USER_UUID');
    if (!id) {
      id = 'EL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('EL_USER_UUID', id);
    }
    return id;
  });

  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const t = translations[currentLang];

  // Apply theme & background pattern classes (body edges remain clean and neutral)
  useEffect(() => {
    document.body.className = `${currentTheme} ${currentBg}`;
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';

    localStorage.setItem('EL_THEME', currentTheme);
    localStorage.setItem('EL_BG_PATTERN', currentBg);
  }, [currentTheme, currentBg]);

  // Apply user avatar persistence
  useEffect(() => {
    try {
      localStorage.setItem('EL_USER_AVATAR', userAvatar);
    } catch {
      // Handled
    }
  }, [userAvatar]);

  // Apply 5 Granular Typography Settings to CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-clock', typography.clockFont);
    root.style.setProperty('--font-hints', typography.hintsFont);
    root.style.setProperty('--font-numbers', typography.numbersFont);
    root.style.setProperty('--font-titles', typography.sectionTitlesFont);
    root.style.setProperty('--font-english', typography.englishWordsFont);
    root.style.setProperty('--font-ar', typography.sectionTitlesFont);
    root.style.setProperty('--font-en', typography.englishWordsFont);

    localStorage.setItem('EL_TYPOGRAPHY', JSON.stringify(typography));
  }, [typography]);

  const handleTypographyChange = (key: keyof TypographySettings, font: string) => {
    setTypography(prev => ({
      ...prev,
      [key]: font
    }));
  };

  // Apply language direction
  useEffect(() => {
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', currentLang);
    localStorage.setItem('EL_LANG', currentLang);
  }, [currentLang]);

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch verified user data from Earthlink proxy (matching Python session flow)
  const fetchUserData = useCallback(async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    setIsRefreshing(true);

    try {
      const res = await fetch('/api/earthlink/user-data', {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        // Session expired or rejected by Earthlink CheckSession
        localStorage.removeItem('EL_AUTH_TOKEN');
        localStorage.removeItem('EL_SUBSCRIBER_CACHE');
        setToken(null);
        setIsLoggedIn(false);
        setSubscriberData(EMPTY_SUBSCRIBER_DATA);
        showNotice('انتهت صلاحية جلسة إيرثلنك. يرجى تسجيل الدخول مجدداً.');
        return;
      }

      if (res.ok) {
        const d = await res.json();
        const payload = d.data || d;

        const updated: SubscriberData = {
          fullName: payload.fullName || 'مشترك إيرثلنك',
          userID: payload.userID || '',
          accountName: payload.accountName || 'اشتراك إيرثلنك',
          accountPrice: payload.accountPrice || '—',
          accountStatus: payload.accountStatus || 'فعال',
          activeDaysLeft: typeof payload.activeDaysLeft === 'number' ? payload.activeDaysLeft : 0,
          accountExpirationDate: payload.accountExpirationDate || '—',
          agentName: payload.agentName || 'وكيل إيرثلنك',
          userIP: payload.userIP || '—',
          mobileNumber: payload.mobileNumber || '—',
          city: payload.city || 'العراق',
          address: payload.address || '—',
          email: payload.email || '—',
          accountImagePath: payload.accountImagePath || 'https://user.earthlink.iq/accountImages/138.png',
          serviceStatusColor: payload.serviceStatusColor || (payload.activeDaysLeft > 0 ? 'Green' : 'Red'),
          lastUpdated: new Date().toLocaleString('ar-IQ'),
          isLiveConnection: true
        };

        setSubscriberData(updated);
        try {
          localStorage.setItem('EL_SUBSCRIBER_CACHE', JSON.stringify(updated));
          localStorage.setItem('EL_LAST_DAILY_CHECK', new Date().toDateString());
        } catch {
          // Handled
        }
      }
    } catch {
      // Keep existing data on transient network hiccups
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  // Dynamic Real-time auto-refresh & Daily auto-update
  useEffect(() => {
    if (!isLoggedIn) return;

    fetchUserData();

    // Daily automatic check: if a new calendar day arrives, refresh subscriber days
    const checkDailyUpdate = () => {
      const lastCheck = localStorage.getItem('EL_LAST_DAILY_CHECK');
      const today = new Date().toDateString();
      if (lastCheck && lastCheck !== today) {
        fetchUserData();
      }
    };

    const dailyTimer = setInterval(checkDailyUpdate, 60000);

    // Live sync interval every 60s
    const liveTimer = setInterval(() => {
      fetchUserData();
    }, 60000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        checkDailyUpdate();
        fetchUserData();
      }
    };

    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(dailyTimer);
      clearInterval(liveTimer);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoggedIn, fetchUserData]);

  // Handle Login
  const handleLogin = (user: string, authToken: string) => {
    localStorage.setItem('EL_AUTH_TOKEN', authToken);
    setToken(authToken);
    setIsLoggedIn(true);
    fetchUserData(authToken);
    showNotice(`مرحباً بك، تم تسجيل الدخول بنجاح بحساب ${user}`);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('EL_AUTH_TOKEN');
    localStorage.removeItem('EL_SUBSCRIBER_CACHE');
    setToken(null);
    setIsLoggedIn(false);
    setSubscriberData(EMPTY_SUBSCRIBER_DATA);
    showNotice('تم تسجيل الخروج وإغلاق الجلسة بنجاح');
  };

  // Toggle Day / Night mode
  const toggleThemeMode = () => {
    playHapticSound('switch');
    if (currentTheme === 'theme-pearl-light') {
      setCurrentTheme('theme-royal-purple');
    } else {
      setCurrentTheme('theme-pearl-light');
    }
  };

  // Banner notice helper
  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    triggerLuxuryCelebration();
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <LayoutGroup>
      <div className="h-screen w-full flex items-center justify-center p-0 sm:p-2 sm:py-3 select-none relative bg-[#06030c] overflow-hidden">
        {/* Outer iOS Device Frame (VIP App Container) with layout animation */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`w-full max-w-md h-full sm:h-[94vh] sm:max-h-[860px] sm:rounded-[40px] border-0 sm:border sm:border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden transition-all duration-300 z-10 ${
            customBgImage ? 'has-custom-app-theme' : ''
          }`}
          style={
            customBgImage
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(12, 6, 26, 0.45) 0%, rgba(7, 3, 16, 0.72) 50%, rgba(3, 1, 8, 0.94) 100%), url(${customBgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }
              : {
                  background: 'var(--app-bg)'
                }
          }
        >
          {/* Dynamic Island with 12h Clock & Live Status */}
          <DynamicIsland
            isOnline={isOnline}
            statusText={isOnline ? t.online : t.offline}
          />

          {/* Floating Banner Notification */}
          <AnimatePresence>
            {bannerNotice && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.92 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-12 left-4 right-4 z-50 p-3.5 rounded-2xl bg-slate-900/95 border border-purple-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white leading-tight font-hints">
                  {bannerNotice}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!isLoggedIn ? (
              /* Login Screen */
              <motion.div
                key="login-screen"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28 }}
                className="flex-1 overflow-y-auto"
              >
                <LoginScreen onLogin={handleLogin} t={t} />
              </motion.div>
            ) : (
              /* Main Application Views */
              <motion.div
                key="main-app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col overflow-hidden relative"
              >
                {/* Top Navigation Bar */}
                <div className="px-5 py-2.5 flex items-center justify-between z-20">
                  <div className="flex items-center gap-3">
                    {/* User Avatar with customizable logo */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        createClickRipple(e);
                        playHapticSound('tap');
                        setIsDrawerOpen(true);
                      }}
                      className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 cursor-pointer shadow-lg shadow-purple-950/40 transition-transform tap-interactive"
                    >
                      <img
                        src={userAvatar || subscriberData.accountImagePath || 'https://user.earthlink.iq/accountImages/138.png'}
                        alt="User"
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-[14px] object-cover bg-slate-900"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://user.earthlink.iq/accountImages/138.png';
                        }}
                      />
                    </motion.div>

                    <div
                      onClick={(e) => {
                        createClickRipple(e);
                        playHapticSound('tap');
                        setIsDrawerOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium font-hints">
                        <span>{t.welcomeBack}</span>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <h1 className="text-sm font-black text-white tracking-wide font-titles">
                          {subscriberData.fullName}
                        </h1>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: AI Hub, Android APK Install, Alerts Bell, Theme Mode & Drawer */}
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        createClickRipple(e);
                        playHapticSound('tap');
                        setActiveTab('ai');
                      }}
                      title="ذكاء Earthlink الاصطناعي (Gemini AI)"
                      className="h-10 px-2.5 rounded-2xl bg-gradient-to-r from-purple-600/25 via-indigo-600/20 to-cyan-500/25 border border-purple-400/40 text-cyan-300 hover:text-white flex items-center gap-1.5 cursor-pointer tap-interactive relative shadow-sm"
                    >
                      <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-black font-titles text-white">
                        AI
                      </span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        createClickRipple(e);
                        playHapticSound('tap');
                        setIsGithubApkModalOpen(true);
                      }}
                      title="تجميع تطبيق أندرويد 15 APK (ERTH)"
                      className="h-10 px-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/30 text-emerald-300 hover:text-white hover:bg-emerald-500/25 flex items-center gap-1.5 cursor-pointer tap-interactive relative"
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black font-titles text-emerald-300">
                        APK
                      </span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        createClickRipple(e);
                        playHapticSound('tap');
                        setActiveTab('alerts');
                      }}
                      title="التنبيهات"
                      className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer tap-interactive relative"
                    >
                      <Bell className="w-4 h-4 text-purple-300" />
                      {activeAlertSchedule?.isActive && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 text-[9px] font-black text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse">
                          1
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        createClickRipple(e);
                        toggleThemeMode();
                      }}
                      title="تبديل الوضع الليلي / الفاتح"
                      className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer tap-interactive"
                    >
                      {currentTheme === 'theme-pearl-light' ? (
                        <Moon className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-400" />
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        createClickRipple(e);
                        playHapticSound('tap');
                        setIsDrawerOpen(true);
                      }}
                      title="القائمة"
                      className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer tap-interactive"
                    >
                      <Menu className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Scrollable Screen Content (Tab Views with Smooth Layout Transitions) */}
                <div className="flex-1 overflow-y-auto px-5 pt-1 pb-28">
                  <AnimatePresence mode="wait" initial={false}>
                    {activeTab === 'home' && (
                      <motion.div
                        key="tab-home"
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <HeroSubCard
                          data={subscriberData}
                          t={t}
                          onNavigateToData={() => setActiveTab('data')}
                          onNavigateToAlerts={() => setActiveTab('alerts')}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'data' && (
                      <motion.div
                        key="tab-data"
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ReportCard
                          data={subscriberData}
                          t={t}
                          onRefreshData={() => fetchUserData()}
                          isRefreshing={isRefreshing}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'alerts' && (
                      <motion.div
                        key="tab-alerts"
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <AlertsPanel
                          data={subscriberData}
                          t={t}
                          activeSchedule={activeAlertSchedule}
                          onUpdateSchedule={handleUpdateSchedule}
                          onTriggerBannerNotice={showNotice}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'ai' && (
                      <motion.div
                        key="tab-ai"
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <EarthlinkAIPanel
                          data={subscriberData}
                          t={t}
                          onTriggerBannerNotice={showNotice}
                          onNavigateToAlerts={() => setActiveTab('alerts')}
                        />
                      </motion.div>
                    )}

                    {activeTab === 'settings' && (
                      <motion.div
                        key="tab-settings"
                        initial={{ opacity: 0, y: 15, filter: 'blur(3px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -15, filter: 'blur(3px)' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <SettingsPanel
                          currentTheme={currentTheme}
                          onThemeChange={setCurrentTheme}
                          currentBg={currentBg}
                          onBgChange={setCurrentBg}
                          customBgImage={customBgImage}
                          onCustomBgChange={handleCustomBgChange}
                          typography={typography}
                          onTypographyChange={handleTypographyChange}
                          userAvatar={userAvatar}
                          onAvatarChange={handleAvatarChange}
                          currentLang={currentLang}
                          onLangToggle={() => {
                            setCurrentLang(prev => (prev === 'ar' ? 'en' : 'ar'));
                          }}
                          onOpenInstallModal={() => setIsInstallModalOpen(true)}
                          t={t}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Floating iOS Tab Bar */}
                <BottomTabBar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  hasActiveAlert={!!activeAlertSchedule?.isActive}
                  t={t}
                />

                {/* Luxury Side Drawer (Styled after user's CSS Sidebar screenshots) */}
                <SideDrawer
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    setIsDrawerOpen(false);
                  }}
                  onLogout={handleLogout}
                  onOpenInstallModal={() => setIsInstallModalOpen(true)}
                  onOpenGithubApkModal={() => setIsGithubApkModalOpen(true)}
                  onToggleThemeMode={toggleThemeMode}
                  hasActiveAlert={!!activeAlertSchedule?.isActive}
                  data={subscriberData}
                  userAvatar={userAvatar}
                  userUUID={userUUID}
                  t={t}
                />

                {/* Android APK / WebAPK Installation Modal */}
                <AndroidInstallModal
                  isOpen={isInstallModalOpen}
                  onClose={() => setIsInstallModalOpen(false)}
                  onOpenGithubApkModal={() => setIsGithubApkModalOpen(true)}
                />

                {/* GitHub Actions Android 15 APK Builder (ERTH) */}
                <GithubUploadApkModal
                  isOpen={isGithubApkModalOpen}
                  onClose={() => setIsGithubApkModalOpen(false)}
                  repoName="ERTH"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
