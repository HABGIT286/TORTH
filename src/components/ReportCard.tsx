import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriberData } from '../types/earthlink';
import { triggerLuxuryCelebration, playHapticSound, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';
import {
  Copy,
  Check,
  Send,
  Sparkles,
  RefreshCw,
  User,
  Calendar,
  Clock,
  Phone,
  Globe,
  ShieldCheck,
  Tag,
  CreditCard,
  Wifi,
  ExternalLink,
  Info
} from 'lucide-react';

interface ReportCardProps {
  data: SubscriberData;
  t: Record<string, string>;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  data,
  t,
  onRefreshData,
  isRefreshing = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isSendingDiscord, setIsSendingDiscord] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual');

  // Generate full report text exactly in the specified format
  const generateReportText = () => {
    const now = new Date();
    const nowTimeStr = now.toLocaleString('ar-IQ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    return `EARTHLINK SUBSCRIBER REPORT
الاسم الكامل: ${data.fullName || '—'}
اسم المستخدم: ${data.userID || '—'}
نوع الاشتراك: ${data.accountName || '—'}
سعر الاشتراك: ${data.accountPrice || '—'}
حالة الاشتراك: ${data.accountStatus || '—'}
الأيام المتبقية: ${data.activeDaysLeft}
تاريخ انتهاء الصلاحية: ${data.accountExpirationDate || '—'}
اسم الوكيل: ${data.agentName || '—'}
عنوان IP: ${data.userIP || '—'}
رقم الهاتف: ${data.mobileNumber || '—'}
المدينة: ${data.city || '—'}
العنوان: ${data.address || '—'}
البريد الإلكتروني: ${data.email || '—'}
رابط صورة الاشتراك: ${data.accountImagePath || '—'}
وقت إنشاء التقرير: ${nowTimeStr}
آخر تحديث للبيانات: ${data.lastUpdated || 'تم التحديث بنجاح'}

التذكير: تذكير اشتراك Earthlink
وقت الإرسال: ${nowTimeStr}`;
  };

  const reportText = generateReportText();

  // Copy with celebration feedback
  const handleCopy = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('tap');
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      triggerLuxuryCelebration();
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  // Direct Discord Webhook transmission
  const handleSendToDiscord = async (e: React.MouseEvent<HTMLElement>) => {
    if (isSendingDiscord) return;
    createClickRipple(e);
    setIsSendingDiscord(true);
    playHapticSound('send');

    try {
      const res = await fetch('/api/notify/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: reportText,
          message: `📊 **تقرير اشتراك Earthlink الفعلي** للمشترك \`${data.userID}\`:\n\`\`\`text\n${reportText}\n\`\`\``
        })
      });

      if (res.ok) {
        setSentSuccess(true);
        triggerLuxuryCelebration();
        setTimeout(() => setSentSuccess(false), 4000);
      }
    } catch {
      // Handled
    } finally {
      setIsSendingDiscord(false);
    }
  };

  const subscriberDetails = [
    { label: 'الاسم الكامل', val: data.fullName, icon: User, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'اسم المستخدم', val: data.userID, icon: Tag, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'نوع الاشتراك', val: data.accountName, icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'سعر الاشتراك', val: data.accountPrice, icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'الأيام المتبقية', val: `${data.activeDaysLeft} يوم`, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'تاريخ النفاذ', val: data.accountExpirationDate, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'عنوان IP الحالي', val: data.userIP, icon: Globe, color: 'text-cyan-300', bg: 'bg-cyan-500/10' },
    { label: 'رقم الهاتف', val: data.mobileNumber || '—', icon: Phone, color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { label: 'اسم الوكيل', val: data.agentName, icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'حالة الاشتراك', val: data.accountStatus, icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  return (
    <motion.div layout className="space-y-4">
      {/* Title & Refresh & Mode Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 font-titles">
            <span>{t.reportTitle}</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-hints">
            بيانات الاشتراك المباشرة من سيرفر إيرثلنك
          </p>
        </div>

        {onRefreshData && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onRefreshData();
            }}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer tap-interactive font-hints"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>تحديث</span>
          </motion.button>
        )}
      </div>

      {/* Switcher: Visual Luxury Cards vs Text Code View */}
      <div className="flex rounded-2xl bg-black/40 border border-white/10 p-1 relative">
        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveTab('visual');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer relative z-10 font-titles ${
            activeTab === 'visual'
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {activeTab === 'visual' && (
            <motion.div
              layoutId="reportTabActive"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative z-10">بطاقات البيانات الفخمة</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            setActiveTab('raw');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer relative z-10 font-titles ${
            activeTab === 'raw'
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {activeTab === 'raw' && (
            <motion.div
              layoutId="reportTabActive"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative z-10">نص التقرير للنسخ المباشر</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'visual' ? (
          /* Visual Luxury Glassmorphic Breakdown Grid */
          <motion.div
            key="visual-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
            className="space-y-2.5"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {subscriberDetails.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <motion.div
                    key={idx}
                    layout
                    whileHover={{ scale: 1.02 }}
                    className="neu-card p-3 rounded-2xl flex flex-col justify-between border border-white/10 hover:border-purple-400/50 transition-all bg-slate-950/70"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center border border-white/10`}>
                        <AnimatedIcon icon={IconComp} className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-hints truncate">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-xs font-black text-white font-numbers tracking-wide truncate block">
                      {item.val || '—'}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Copy Action Banner */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              className="clay-card rounded-2xl p-4 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all tap-interactive relative overflow-hidden"
            >
              <div className="shimmer-sweep-layer" />
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-purple-600/25 text-purple-300 flex items-center justify-center border border-purple-400/30">
                  <AnimatedIcon icon={Copy} className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white font-titles block">
                    نسخ التقرير بالكامل للحافظة
                  </span>
                  <span className="text-[10px] text-slate-300 font-hints">
                    بصيغة Earthlink الرسمية الجاهزة للإرسال
                  </span>
                </div>
              </div>

              <span className="soft-pill text-xs font-bold text-cyan-300 px-3 py-1.5 font-titles relative z-10 border border-cyan-500/30">
                {copied ? 'تم النسخ ✓' : 'نسخ الآن'}
              </span>
            </motion.div>
          </motion.div>
        ) : (
          /* Raw Preformatted Report View (1-Click Copy) */
          <motion.div
            key="raw-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
            onClick={handleCopy}
            className="clay-card rounded-3xl p-5 cursor-pointer border border-purple-500/35 shadow-2xl transition-all duration-300 hover:border-purple-500/60 active:scale-[0.99] group relative overflow-hidden tap-interactive"
          >
            <div className="shimmer-sweep-layer" />

            {/* Copy Header Tag */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300 font-titles">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>EARTHLINK SUBSCRIBER REPORT</span>
              </div>

              <div className="soft-pill flex items-center gap-1.5 text-xs font-semibold px-3 py-1 text-white border border-white/15 font-hints">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <AnimatedIcon icon={Copy} className="w-3.5 h-3.5 text-cyan-300" />
                    <span>انقر للنسخ</span>
                  </>
                )}
              </div>
            </div>

            {/* Report Content in crisp typography */}
            <pre className="text-xs font-sans leading-relaxed text-slate-200 whitespace-pre-wrap select-text break-words font-mono relative z-10">
              {reportText}
            </pre>

            {/* Bottom Helper Notice */}
            <div className="mt-3.5 pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-cyan-400 font-semibold text-center font-hints relative z-10">
              <AnimatedIcon icon={Copy} className="w-3.5 h-3.5" />
              <span>{t.tapToCopy}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direct Discord Webhook Broadcast Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSendToDiscord}
        disabled={isSendingDiscord}
        className="w-full h-13 rounded-2xl clay-btn bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-110 disabled:opacity-60 cursor-pointer tap-interactive font-titles"
      >
        {isSendingDiscord ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{t.sending}</span>
          </>
        ) : sentSuccess ? (
          <>
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="text-emerald-200 font-bold">{t.sentSuccess}</span>
          </>
        ) : (
          <>
            <AnimatedIcon icon={Send} className="w-4 h-4 text-white" />
            <span>{t.sendToDiscordNow}</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
