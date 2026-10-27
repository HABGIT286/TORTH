import React from 'react';
import { motion } from 'framer-motion';
import { AppTab } from '../types/earthlink';
import { playHapticSound, createClickRipple } from '../utils/effects';
import { Home, FileText, Bell, Sliders, Cpu, LayoutDashboard } from 'lucide-react';

interface BottomTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  hasActiveAlert?: boolean;
  t: Record<string, string>;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  hasActiveAlert = false,
  t
}) => {
  const tabs: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'glassyV2', label: 'Glassy V2', icon: LayoutDashboard },
    { id: 'data', label: t.navData, icon: FileText },
    { id: 'ai', label: t.navAI || 'ذكاء AI', icon: Cpu },
    { id: 'alerts', label: t.navAlerts, icon: Bell },
    { id: 'settings', label: t.navSettings, icon: Sliders },
  ];

  return (
    <div className="absolute bottom-3 left-3 right-3 z-30 select-none pointer-events-auto">
      <div className="h-16 px-2.5 rounded-full bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl flex items-center justify-around relative overflow-hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const isAlertTab = tab.id === 'alerts';

          return (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                onTabChange(tab.id);
              }}
              className={`flex-1 h-12 flex flex-col items-center justify-center relative cursor-pointer tap-interactive z-10 ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Floating Layout Pill Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/35 via-indigo-600/25 to-cyan-500/30 border border-white/15 shadow-[0_4px_16px_rgba(147,51,234,0.35)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}

              <div
                className={`transition-transform duration-200 flex items-center justify-center relative z-20 ${
                  isActive
                    ? 'scale-110 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {isAlertTab && hasActiveAlert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.95)] animate-pulse" />
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 transition-colors duration-200 font-titles relative z-20 ${
                  isActive ? 'font-bold text-white' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Dot indicator */}
              {isActive && (
                <motion.span
                  layoutId="activeTabDot"
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
