import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import {
  Smartphone,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  appUrl = 'https://ais-pre-xp2flhhyblznglov7e57fx-123031168257.europe-west2.run.app'
}) => {
  const { isInstalled, canInstall, isAndroid, isIOS, triggerInstall } = usePWAInstall();
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#180a33] via-[#0f0622] to-[#06030c] border border-purple-500/30 p-5 shadow-2xl shadow-purple-950/80 text-white z-10 overflow-hidden"
        >
          {/* Header Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer tap-interactive"
          >
            <X className="w-4 h-4" />
          </button>

          {/* App Emblem & Title */}
          <div className="flex flex-col items-center text-center mt-2 mb-4">
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
              تثبيت تطبيق أندرويد (APK / WebAPK)
            </h3>
            <span className="text-[11px] text-purple-300 font-hints mt-0.5">
              بوابة مشتركي إيرثلنك الرسمية الفاخرة
            </span>
          </div>

          {/* Feedback banner if triggered */}
          {installStatus && (
            <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-purple-600/40 to-cyan-600/40 border border-purple-400/40 text-xs font-bold font-hints text-center text-emerald-300 animate-in fade-in">
              {installStatus}
            </div>
          )}

          {/* Main Actions */}
          <div className="space-y-2.5">
            {/* Primary Action 1: Install Directly if Prompt is Available */}
            {canInstall && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={handleInstallClick}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer font-titles"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>تثبيت التطبيق على جهازك الآن (مباشر)</span>
              </motion.button>
            )}

            {/* Primary Action 2: Copy Live Shared Link for Android Phone */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 font-titles flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>طريقة التثبيت على الهاتف:</span>
                </span>
                <span className="text-[10px] font-semibold text-cyan-400 font-mono">Chrome WebAPK</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-hints">
                افتح الرابط أدناه في متصفح <b>Google Chrome</b> على هاتفك الأندرويد، ثم اضغط على القائمة (⋮) واختر <b>"تثبيت التطبيق"</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b> ليتم تثبيت حزمة APK رسمية على هاتفك فوراً!
              </p>

              {/* Copy URL Box */}
              <div
                onClick={copyLiveLink}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-2 cursor-pointer transition-colors tap-interactive"
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
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Flutter Full Project Download Button */}
            <a
              href="/flutter_earthlink_app.zip"
              download="flutter_earthlink_app.zip"
              onClick={() => {
                playHapticSound('success');
                triggerLuxuryCelebration();
              }}
              className="w-full h-12 px-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs flex items-center justify-between transition-all shadow-lg shadow-blue-950/50 tap-interactive font-titles"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="block leading-tight">تحميل مشروع Flutter الكامل (.ZIP)</span>
                  <span className="text-[10px] text-cyan-200 font-hints">كود Dart كامل جاهز للبناء والتصدير كـ APK</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 text-cyan-300 font-mono">
                ZIP
              </span>
            </a>

            {/* Direct Package APK Generator Button (PWABuilder / TWA) */}
            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playHapticSound('tap')}
              className="w-full h-11 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white font-bold text-xs flex items-center justify-between transition-colors tap-interactive font-titles"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <span>تحميل ملف APK مستقل (عبر PWABuilder)</span>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">1-Click</span>
            </a>

            {/* Quick Status Pill */}
            <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-hints">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>كود Flutter نظيف متوافق مع Android و iOS</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
