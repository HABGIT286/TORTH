import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTab, SubscriberData } from '../types/earthlink';
import { playHapticSound, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';
import {
  Home,
  FileText,
  Mail,
  Users,
  Bell,
  Layers,
  Activity,
  Gamepad2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Wifi,
  ShieldCheck
} from 'lucide-react';

interface GlassySidebarV3Props {
  activeTab: AppTab;
  onNavigateTab: (tab: AppTab) => void;
  onLogout: () => void;
  subscriberData: SubscriberData;
  userAvatar?: string;
  isOnline?: boolean;
}

export const GlassySidebarV3: React.FC<GlassySidebarV3Props> = ({
  activeTab,
  onNavigateTab,
  onLogout,
  subscriberData,
  userAvatar,
  isOnline = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navItems = [
    {
      id: 'home',
      tab: 'home' as AppTab,
      labelEn: 'Home',
      labelAr: 'الرئيسية',
      icon: Home,
      badge: null
    },
    {
      id: 'post',
      tab: 'data' as AppTab,
      labelEn: 'Post',
      labelAr: 'بيانات الاشتراك',
      icon: FileText,
      badge: null
    },
    {
      id: 'messages',
      tab: 'alerts' as AppTab,
      labelEn: 'Messages',
      labelAr: 'الرسائل والملاحظات',
      icon: Mail,
      badge: null
    },
    {
      id: 'friends',
      tab: 'data' as AppTab,
      labelEn: 'Friends',
      labelAr: 'الوكيل والمشتركون',
      icon: Users,
      badge: null
    },
    {
      id: 'notifications',
      tab: 'alerts' as AppTab,
      labelEn: 'Notifications',
      labelAr: 'الإشعارات والتنبيهات',
      icon: Bell,
      badge: '2'
    },
    {
      id: 'group',
      tab: 'data' as AppTab,
      labelEn: 'Group',
      labelAr: 'الشبكة والبرج',
      icon: Layers,
      badge: null
    },
    {
      id: 'pages',
      tab: 'data' as AppTab,
      labelEn: 'Pages',
      labelAr: 'فحص الاتصال',
      icon: Activity,
      badge: null
    },
    {
      id: 'games',
      tab: 'ai' as AppTab,
      labelEn: 'Games',
      labelAr: 'الفاحص الذكي (AI)',
      icon: Gamepad2,
      badge: 'VIP'
    },
    {
      id: 'setting',
      tab: 'settings' as AppTab,
      labelEn: 'Setting',
      labelAr: 'الإعدادات والمظهر',
      icon: Settings,
      badge: null
    }
  ];

  const toggleCollapse = (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('tap');
    setIsCollapsed(prev => !prev);
  };

  const handleItemClick = (e: React.MouseEvent<HTMLElement>, tab: AppTab) => {
    createClickRipple(e);
    playHapticSound('tap');
    onNavigateTab(tab);
  };

  const displayName = subscriberData.fullName || subscriberData.userID || 'softysta.com';
  const displayUser = subscriberData.userID || 'erth_vip';

  return (
    <aside
      aria-label="Glassy Sidebar V3"
      className="relative shrink-0 z-30 select-none transition-all duration-300 py-3 px-2 sm:px-3 flex flex-col justify-center items-center h-full"
    >
      {/* Outer Floating Glass Card matching screenshots Glassy Sidebar V3 */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className={`relative rounded-[32px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl bg-gradient-to-b from-white/[0.12] via-slate-900/60 to-black/80 flex flex-col overflow-visible transition-all duration-300 ${
          isCollapsed ? 'w-[72px] px-2 py-4' : 'w-[250px] sm:w-[260px] px-4 py-5'
        }`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)'
        }}
      >
        {/* Floating Collapse / Expand Circular Toggle Button on Border */}
        <button
          type="button"
          onClick={toggleCollapse}
          title={isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          className={`absolute -right-3 top-12 sm:top-14 w-7 h-7 rounded-full bg-slate-900/90 border border-white/30 text-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all z-40 backdrop-blur-md group hover:border-cyan-400`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* 1. Traffic Lights (macOS dots) */}
        <div className="flex items-center gap-1.5 mb-4 pl-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        </div>

        {/* 2. Brand Wordmark (CODEXR / CXR) */}
        <div className="flex items-center justify-between mb-4 px-1">
          {isCollapsed ? (
            <div className="w-full flex justify-center">
              <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 font-mono">
                CXR
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-mono drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
                CODEXR
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 font-mono">
                V3
              </span>
            </div>
          )}
        </div>

        {/* 3. User Profile Card */}
        <div className="mb-4 relative">
          <div
            onClick={() => setIsProfileDropdownOpen(prev => !prev)}
            className={`rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 ${
              isCollapsed
                ? 'justify-center p-1.5 hover:bg-white/10'
                : 'p-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10'
            }`}
          >
            {/* Avatar Squircle */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-[10px] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-white font-black text-sm font-mono">
                    {displayName.charAt(0).toUpperCase() || 'S'}
                  </div>
                )}
              </div>
              {/* Online beacon */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate block">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  {subscriberData.accountName ? 'مشترك VIP' : 'Super Admin'} · {displayUser}
                </span>
              </div>
            )}
          </div>

          {/* Profile Quick Stats Dropdown */}
          <AnimatePresence>
            {!isCollapsed && isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[10px] text-slate-400">حالة الاشتراك:</span>
                  <span className="text-emerald-400 font-bold">{subscriberData.accountStatus || 'فعال'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[10px] text-slate-400">الأيام المتبقية:</span>
                  <span className="text-cyan-300 font-mono font-bold">{subscriberData.activeDaysLeft} يوم</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-[10px] text-slate-400">عنوان IP:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{subscriberData.userIP || '10.x.x.x'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Section Label "MENU" */}
        <div className="mb-2 px-2">
          {isCollapsed ? (
            <div className="w-full flex justify-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                •
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              MENU
            </span>
          )}
        </div>

        {/* 5. Navigation Items List */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleItemClick(e, item.tab)}
                title={`${item.labelEn} - ${item.labelAr}`}
                className={`w-full flex items-center rounded-2xl transition-all cursor-pointer group relative ${
                  isCollapsed
                    ? 'justify-center p-2.5 my-1'
                    : 'justify-between px-3.5 py-2.5 my-0.5'
                } ${
                  isActive
                    ? 'bg-white/20 text-white font-bold shadow-md shadow-cyan-950/20 border border-white/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <span className="text-xs truncate font-medium">
                      {item.labelEn}
                    </span>
                  )}
                </div>

                {/* Badge if present */}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                      item.badge === 'VIP'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-cyan-500 text-black font-extrabold'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed dot active indicator */}
                {isCollapsed && isActive && (
                  <span className="absolute left-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 6. Footer Log Out Button */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onLogout();
            }}
            title="تسجيل الخروج - Log Out"
            className={`w-full flex items-center rounded-2xl transition-all cursor-pointer text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!isCollapsed && (
              <span className="text-xs font-semibold">Log Out</span>
            )}
          </button>
        </div>
      </motion.div>
    </aside>
  );
};
