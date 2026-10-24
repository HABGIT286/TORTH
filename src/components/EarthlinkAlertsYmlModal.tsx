import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  X,
  Copy,
  Check,
  Download,
  Fingerprint,
  RefreshCw,
  Sparkles,
  Zap,
  Server,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';

interface EarthlinkAlertsYmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceFingerprint: string;
  deviceName: string;
}

export const EarthlinkAlertsYmlModal: React.FC<EarthlinkAlertsYmlModalProps> = ({
  isOpen,
  onClose,
  deviceFingerprint,
  deviceName
}) => {
  const [ymlContent, setYmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchYmlContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/alerts/yml-content');
      if (res.ok) {
        const data = await res.json();
        setYmlContent(data.content || '');
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchYmlContent();
      setTestResult(null);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!ymlContent) return;
    navigator.clipboard.writeText(ymlContent);
    setIsCopied(true);
    playHapticSound('success');
    triggerLuxuryCelebration();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!ymlContent) return;
    playHapticSound('tap');
    const blob = new Blob([ymlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'earthlink-alerts.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerLuxuryCelebration();
  };

  const handleTestTrigger = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('send');
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/alerts/test-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_fingerprint: deviceFingerprint })
      });
      const data = await res.json();
      if (data.success) {
        triggerLuxuryCelebration();
        playHapticSound('success');
        setTestResult('تم إرسال التنبيه الفوري بنجاح إلى القنوات المحددة!');
      } else {
        setTestResult(data.message || 'فشل إرسال التنبيه التجريبي.');
      }
    } catch {
      setTestResult('تعذر الاتصال بالخادم لإجراء الاختبار.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-xl max-h-[90vh] clay-card bg-gradient-to-b from-slate-900 via-[#0d0718] to-black rounded-3xl border border-purple-500/40 shadow-2xl flex flex-col overflow-hidden text-right select-none relative z-10"
            dir="rtl"
          >
            {/* Shimmer sweep layer */}
            <div className="shimmer-sweep-layer" />

            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/50">
                  <AnimatedIcon icon={FileCode} size="md" className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-titles flex items-center gap-2">
                    <span>ملف الأتمتة: earthlink-alerts.yml</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </h3>
                  <p className="text-[11px] text-purple-300 font-hints">
                    ملف تشغيل وحفظ مواعيد التنبيهات مع بصمة كل هاتف
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            {/* Device Fingerprint Card */}
            <div className="neu-inset p-4 mx-4 mt-4 rounded-2xl bg-black/60 border border-purple-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-titles text-purple-200 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-cyan-300 flex items-center justify-center border border-purple-400/30">
                  <AnimatedIcon icon={Fingerprint} size="sm" className="text-cyan-300" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-hints">بصمة هذا الهاتف المعتمدة في الملف:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      {deviceFingerprint}
                    </span>
                    <span className="text-[10px] text-purple-300 font-hints">({deviceName})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestTrigger}
                  disabled={isTesting}
                  className="clay-btn px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60 tap-interactive"
                >
                  <AnimatedIcon icon={Zap} size="sm" className="text-white" />
                  <span>{isTesting ? 'جاري الاختبار...' : 'فحص إرسال فوري'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="clay-btn px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer tap-interactive"
                >
                  <AnimatedIcon icon={Download} size="sm" className="text-white" />
                  <span>تحميل الملف</span>
                </button>
              </div>
            </div>

            {testResult && (
              <div className="p-3 mx-4 mt-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-hints text-center animate-in fade-in relative z-10">
                {testResult}
              </div>
            )}

            {/* YAML Content Preview */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[50vh] relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-titles flex items-center gap-1.5">
                  <AnimatedIcon icon={Server} size="sm" className="text-cyan-400" />
                  <span>محتوى ملف earthlink-alerts.yml المباشر على الخادم:</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchYmlContent}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all cursor-pointer active:scale-95"
                    title="تحديث"
                  >
                    <AnimatedIcon icon={RefreshCw} size="sm" className={`text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={handleCopy}
                    className="clay-btn px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <AnimatedIcon icon={Check} size="sm" className="text-emerald-400" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <AnimatedIcon icon={Copy} size="sm" className="text-slate-300" />
                        <span>نسخ الملف</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="neu-inset p-4 rounded-2xl bg-black/85 border border-white/10 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto text-left max-h-60 scrollbar-thin">
                {isLoading ? '# جاري قراءة ملف earthlink-alerts.yml...' : (ymlContent || '# لا توجد تنبيهات مسجلة بعد')}
              </pre>

              <div className="neu-inset p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 leading-relaxed font-hints space-y-1">
                <div className="font-bold flex items-center gap-1 text-cyan-300">
                  <AnimatedIcon icon={ShieldCheck} size="sm" className="text-emerald-400" />
                  <span>أمان وموثوقية الأتمتة 24/7:</span>
                </div>
                <p>
                  يتم تخزين موعد التنبيه في هذا الملف مع بصمة هاتفك، حيث يعمل خادم السحابة وسير العمل التلقائي على مراقبة هذا الملف كل دقيقة بتوقيت بغداد، ويرسل البيانات المحدثة كاملة إلى ديسكورد أو تليجرام في الموعد بدقة حتى لو كان التطبيق مغلقاً أو هاتفك غير متصل!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end relative z-10">
              <button
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  onClose();
                }}
                className="clay-btn px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-titles text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
