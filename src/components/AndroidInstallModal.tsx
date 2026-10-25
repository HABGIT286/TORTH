import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  X,
  Github,
  Zap,
  Terminal
} from 'lucide-react';
import { AnimatedIcon } from './AnimatedIcon';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
  onOpenGithubApkModal?: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  appUrl = 'https://ais-pre-xp2flhhyblznglov7e57fx-123031168257.europe-west2.run.app',
  onOpenGithubApkModal
}) => {
  const { canInstall, triggerInstall } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const handleInstallClick = async () => {
    playHapticSound('tap');
    const result = await triggerInstall();
    if (result === 'accepted') {
      triggerLuxuryCelebration();
      setInstallStatus('جاري تثبيت تطبيق الأندرويد على هاتفك بنجاح! 🎉');
      setTimeout(() => {
        onClose();
        setInstallStatus(null);
      }, 2500);
    } else if (result === 'unavailable') {
      setInstallStatus('افتح الرابط في متصفح Chrome على هاتفك واضغط على (تثبيت التطبيق) أو خيارات القائمة (⋮)');
    }
  };

  const copyLiveLink = (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('tap');
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    triggerLuxuryCelebration();
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        {/* Backdrop */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-sm rounded-[32px] clay-card bg-gradient-to-b from-[#180a33] via-[#0f0622] to-[#06030c] border border-purple-500/35 p-5 shadow-2xl text-white z-10 overflow-hidden"
        >
          {/* Shimmer sweep layer */}
          <div className="shimmer-sweep-layer" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer tap-interactive relative z-10"
          >
            <AnimatedIcon icon={X} size="sm" className="text-slate-300" />
          </button>

          {/* App Emblem & Title */}
          <div className="flex flex-col items-center text-center mt-2 mb-4 relative z-10">
            <div className="relative mb-3">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-purple-950/60">
                <img
                  src="/pwa-192x192.png"
                  alt="Earthlink VIP"
                  className="w-full h-full rounded-[22px] object-cover bg-slate-900"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 border-2 border-slate-950">
                ✓
              </span>
            </div>

            <h3 className="text-lg font-black text-white font-titles">
              تثبيت وتجميع تطبيق أندرويد 15
            </h3>
            <span className="text-[11px] text-purple-300 font-hints mt-0.5">
              تطبيق رسمي متوافق مع Android 15 (API 35)
            </span>
          </div>

          {/* Feedback banner if triggered */}
          {installStatus && (
            <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-purple-600/40 to-cyan-600/40 border border-purple-400/40 text-xs font-bold font-hints text-center text-emerald-300 animate-in fade-in relative z-10">
              {installStatus}
            </div>
          )}

          {/* Main Actions */}
          <div className="space-y-2.5 relative z-10">
            {/* Featured Action: GitHub Actions Android 15 APK Builder (ERTH) */}
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                onClose();
                if (onOpenGithubApkModal) onOpenGithubApkModal();
              }}
              className="clay-btn w-full h-13 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-between cursor-pointer font-titles"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950/20 text-slate-950 flex items-center justify-center">
                  <AnimatedIcon icon={Github} size="sm" className="text-slate-950" />
                </div>
                <div className="text-right">
                  <span className="block leading-tight text-slate-950 font-black">تجميع APK عبر GitHub Actions (مستودع ERTH)</span>
                  <span className="text-[10px] text-slate-900/80 font-hints">بناء تلقائي بملف build-apk.yml لأندرويد 15</span>
                </div>
              </div>
              <span className="soft-pill text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 font-mono font-bold">
                API 35
              </span>
            </button>

            {/* Direct PWA Install if prompt available */}
            {canInstall && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="clay-btn w-full h-11 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer font-titles"
              >
                <AnimatedIcon icon={Download} size="sm" className="text-white" />
                <span>تثبيت مباشر فوري على الهاتف (PWA)</span>
              </button>
            )}

            {/* Copy Live Shared Link for Android Phone */}
            <div className="neu-inset p-3 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 font-titles flex items-center gap-1.5">
                  <AnimatedIcon icon={Smartphone} size="xs" className="text-cyan-400" />
                  <span>طريقة التثبيت المباشر بالمتصفح:</span>
                </span>
                <span className="text-[10px] font-semibold text-cyan-400 font-mono">Chrome WebAPK</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-hints">
                افتح الرابط في <b>Chrome</b> على هاتفك الأندرويد، واضغط على القائمة (⋮) ثم <b>"تثبيت التطبيق"</b>.
              </p>

              {/* Copy URL Box */}
              <div
                onClick={copyLiveLink}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 cursor-pointer transition-colors tap-interactive"
              >
                <span className="text-[11px] text-purple-300 font-mono truncate select-all">
                  {appUrl}
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 font-titles"
                >
                  {copiedLink ? (
                    <>
                      <AnimatedIcon icon={Check} size="xs" className="text-emerald-300" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <AnimatedIcon icon={Copy} size="xs" className="text-white" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Package APK Generator Button (PWABuilder / TWA) */}
            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playHapticSound('tap')}
              className="clay-btn w-full h-11 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-bold text-xs flex items-center justify-between transition-colors tap-interactive font-titles"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <AnimatedIcon icon={ExternalLink} size="xs" className="text-purple-300" />
                </div>
                <span>تجميع ملف APK إضافي عبر PWABuilder</span>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">1-Click</span>
            </a>

            {/* Quick Status Pill */}
            <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-hints">
              <AnimatedIcon icon={ShieldCheck} size="xs" className="text-emerald-400" />
              <span>مبني خصيصاً لأندرويد 15 مع كامل الصلاحيات والسرعة</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
