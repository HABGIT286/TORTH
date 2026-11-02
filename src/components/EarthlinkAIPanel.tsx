import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriberData, AiScheduledUrgentAlert } from '../types/earthlink';
import { playHapticSound, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';
import {
  Cpu,
  Sparkles,
  Zap,
  Activity,
  Gauge,
  Wifi,
  ShieldCheck,
  Send,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Sliders,
  Layers,
  ChevronLeft,
  AlertTriangle,
  BellRing,
  Calendar,
  Radio,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface EarthlinkAIPanelProps {
  data: SubscriberData;
  t: Record<string, string>;
  onTriggerBannerNotice?: (msg: string) => void;
  onNavigateToAlerts?: () => void;
}

const DEFAULT_AI_SCHEDULE: AiScheduledUrgentAlert = {
  enabled: false,
  intervalHours: 6,
  triggerOnDaysLeft: 3,
  targetChannel: 'both',
  discordWebhookUrl: 'https://discord.com/api/webhooks/1543603322563330200/6iJFpnPCOsYGDeArxVpWVhrErAzd9UmuHWOL_-5CO0nXsNoLdj3rnBWRf2W7Gq6DJwCF',
  telegramBotToken: '',
  telegramChatId: '',
  lastSentAt: undefined,
  nextScheduledAt: undefined,
  totalSentCount: 0,
  autoDispatchActive: false,
  notifyOnCriticalOnly: false
};

export const EarthlinkAIPanel: React.FC<EarthlinkAIPanelProps> = ({
  data,
  t,
  onTriggerBannerNotice,
  onNavigateToAlerts
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [reportSource, setReportSource] = useState<string>('');
  const [selectedPromptType, setSelectedPromptType] = useState<'comprehensive' | 'speed' | 'gaming' | 'security'>('comprehensive');
  const [generatedAlertStyle, setGeneratedAlertStyle] = useState<'vip' | 'urgent' | 'technical'>('urgent');
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [isSendingAiAlert, setIsSendingAiAlert] = useState<boolean>(false);

  // Automated Urgent Warning Scheduler State (توقيت تلقائي مجدول يرسل عبر ديسكورد وتليجرام)
  const [aiSchedule, setAiSchedule] = useState<AiScheduledUrgentAlert>(() => {
    try {
      const saved = localStorage.getItem('EL_AI_SCHEDULED_ALERT');
      return saved ? { ...DEFAULT_AI_SCHEDULE, ...JSON.parse(saved) } : DEFAULT_AI_SCHEDULE;
    } catch {
      return DEFAULT_AI_SCHEDULE;
    }
  });

  const [timeRemainingText, setTimeRemainingText] = useState<string>('');
  const [isSendingTestAlert, setIsSendingTestAlert] = useState<boolean>(false);

  // Save schedule changes to localStorage
  const updateAiSchedule = (newSchedule: AiScheduledUrgentAlert) => {
    setAiSchedule(newSchedule);
    try {
      localStorage.setItem('EL_AI_SCHEDULED_ALERT', JSON.stringify(newSchedule));
    } catch {
      // Handled
    }
  };

  // Generate AI Alert Messages
  const getAiGeneratedAlert = useCallback(() => {
    const nowTime = new Date().toLocaleString('ar-IQ');
    if (generatedAlertStyle === 'vip') {
      return `💎 تنبيه اشتراك Earthlink VIP العصري
المشترك: ${data.fullName} (@${data.userID})
الباقة: ${data.accountName} (${data.accountPrice})
الأيام المتبقية: ${data.activeDaysLeft} يوم | الانتهاء: ${data.accountExpirationDate}
الـ IP: ${data.userIP} | الوكيل: ${data.agentName}
الوقت: ${nowTime}
— تم التوليد بنظام الذكاء الاصطناعي الفائق`;
    }

    if (generatedAlertStyle === 'urgent') {
      return `🚨 تحذير عاجل ومجدول: قرب نفاذ اشتراك Earthlink!
⚠️ تنبيه موجه للمشترك: ${data.fullName} (${data.userID})
⏳ المتبقي على الخدمة: ${data.activeDaysLeft} يوم فقط!
📅 تاريخ الانتهاء الفعلي: ${data.accountExpirationDate}
💵 سعر الباقة للتجديد: ${data.accountPrice}
🌐 الـ IP الحالي: ${data.userIP}
🏢 الوكيل المعتمد: ${data.agentName}
🕒 وقت الإرسال المجدول: ${nowTime}
يرجى المسارعة لتجديد الاشتراك لتفادي انقطاع الإنترنت فجأة.`;
    }

    return `📊 تقرير Earthlink التقني الشامل
المعرف: ${data.userID}
IP الحساب: ${data.userIP}
الوكيل المعتمد: ${data.agentName}
الحالة: ${data.accountStatus}
الرصيد الزمني: ${data.activeDaysLeft} يوم (${data.accountExpirationDate})
التقييم: اتصال مستقر ومرخص.`;
  }, [data, generatedAlertStyle]);

  // Dispatch scheduled urgent message to Discord & Telegram
  const dispatchScheduledUrgentNotice = useCallback(async (isTest = false) => {
    const messageContent = getAiGeneratedAlert();
    const tasks: Promise<any>[] = [];

    // Discord Dispatch
    if (aiSchedule.targetChannel === 'both' || aiSchedule.targetChannel === 'discord') {
      const webhookUrl = aiSchedule.discordWebhookUrl?.trim() || undefined;
      tasks.push(
        fetch('/api/notify/discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportText: messageContent,
            message: `🚨 **تنبيه عاجل مجدول (Earthlink AI Scheduler):**\n\`\`\`text\n${messageContent}\n\`\`\``,
            webhookUrl: webhookUrl
          })
        }).catch(err => console.error('Discord dispatch error:', err))
      );
    }

    // Telegram Dispatch
    if (aiSchedule.targetChannel === 'both' || aiSchedule.targetChannel === 'telegram') {
      tasks.push(
        fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: messageContent,
            botToken: aiSchedule.telegramBotToken?.trim() || undefined,
            chatId: aiSchedule.telegramChatId?.trim() || undefined
          })
        }).catch(err => console.error('Telegram dispatch error:', err))
      );
    }

    await Promise.allSettled(tasks);

    const now = new Date();
    const nextTime = new Date(now.getTime() + (aiSchedule.intervalHours || 6) * 3600 * 1000);

    const updated: AiScheduledUrgentAlert = {
      ...aiSchedule,
      lastSentAt: now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'numeric' }),
      nextScheduledAt: nextTime.toISOString(),
      totalSentCount: (aiSchedule.totalSentCount || 0) + 1,
      autoDispatchActive: true
    };

    updateAiSchedule(updated);

    if (onTriggerBannerNotice) {
      onTriggerBannerNotice(
        isTest
          ? 'تم إرسال التحذير التجريبي بنجاح عبر القنوات المحددة! 🚀'
          : `تم الإرسال التلقائي للتحذير العاجل! الإرسال التالي: ${nextTime.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}`
      );
    }
  }, [aiSchedule, getAiGeneratedAlert, onTriggerBannerNotice]);

  // Live Timer Countdown & Automatic Dispatch Loop
  useEffect(() => {
    const updateCountdown = () => {
      if (!aiSchedule.enabled || !aiSchedule.nextScheduledAt) {
        setTimeRemainingText('الجدولة متوقفة');
        return;
      }

      const nextTarget = new Date(aiSchedule.nextScheduledAt).getTime();
      const now = Date.now();
      const diffMs = nextTarget - now;

      if (diffMs <= 0) {
        // Time to auto-dispatch!
        setTimeRemainingText('جاري الإرسال التلقائي الآن...');
        // Condition check: if critical only, check days left
        if (!aiSchedule.notifyOnCriticalOnly || data.activeDaysLeft <= (aiSchedule.triggerOnDaysLeft || 3)) {
          dispatchScheduledUrgentNotice(false);
        } else {
          // Re-schedule without spamming if days are not critical
          const nextTime = new Date(now + (aiSchedule.intervalHours || 6) * 3600 * 1000);
          updateAiSchedule({
            ...aiSchedule,
            nextScheduledAt: nextTime.toISOString()
          });
        }
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        if (hours > 0) {
          setTimeRemainingText(`${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`);
        } else if (minutes > 0) {
          setTimeRemainingText(`${minutes} دقيقة و ${seconds} ثانية`);
        } else {
          setTimeRemainingText(`${seconds} ثانية فقط`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [aiSchedule, data.activeDaysLeft, dispatchScheduledUrgentNotice]);

  // Toggle Automated Urgent Scheduler
  const handleToggleSchedule = () => {
    playHapticSound('switch');
    const willEnable = !aiSchedule.enabled;
    const now = Date.now();
    const nextTime = willEnable
      ? new Date(now + (aiSchedule.intervalHours || 6) * 3600 * 1000).toISOString()
      : undefined;

    const updated: AiScheduledUrgentAlert = {
      ...aiSchedule,
      enabled: willEnable,
      autoDispatchActive: willEnable,
      nextScheduledAt: nextTime
    };

    updateAiSchedule(updated);

    if (onTriggerBannerNotice) {
      onTriggerBannerNotice(
        willEnable
          ? `تم تفعيل الجدولة التلقائية للتحذير العاجل كل ${aiSchedule.intervalHours} ساعات!`
          : 'تم إيقاف الجدولة التلقائية للتحذيرات.'
      );
    }
  };

  // Run AI Diagnostic
  const handleRunAiAnalysis = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('tap');
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberData: data,
          queryType: selectedPromptType
        })
      });

      const json = await res.json();
      if (json.success && json.analysis) {
        setAiReport(json.analysis);
        setReportSource(json.source || 'gemini-3.8-flash');
        playHapticSound('success');
        if (onTriggerBannerNotice) {
          onTriggerBannerNotice('تم إنجاز التحليل الذكي وتوليد تقرير الذكاء الاصطناعي بنجاح!');
        }
      }
    } catch {
      // Handled
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyAlert = (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    navigator.clipboard.writeText(getAiGeneratedAlert());
    setCopiedAlert(true);
    playHapticSound('success');
    setTimeout(() => setCopiedAlert(false), 2500);
  };

  const handleSendAiAlert = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('send');
    setIsSendingAiAlert(true);

    try {
      await dispatchScheduledUrgentNotice(true);
    } finally {
      setIsSendingAiAlert(false);
    }
  };

  const handleSendTestNow = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('send');
    setIsSendingTestAlert(true);
    try {
      await dispatchScheduledUrgentNotice(true);
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  // Calculations for bandwidth forecast
  const dailyAverageAllowance = (350 / Math.max(data.activeDaysLeft, 1)).toFixed(1);
  const healthScore = Math.min(Math.max(data.activeDaysLeft * 3.3, 15), 100).toFixed(0);

  return (
    <motion.div layout className="space-y-4 select-none pb-4">
      {/* 1. Master AI Neural Header */}
      <div className="clay-card p-5 relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950/80 border border-purple-500/35">
        <div className="shimmer-sweep-layer" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <AnimatedIcon icon={Cpu} className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white font-titles tracking-wide">
                  محرك Earthlink الذكي (AI Brain)
                </h2>
                <span className="soft-pill px-2 py-0.5 text-[9px] font-black text-cyan-300 font-numbers border border-cyan-500/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-purple-300 font-hints mt-0.5">
                جدولة التحذيرات العاجلة التلقائية، وتحليل الباندويث والرادار
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-hints">مؤشر جودة الاتصال</span>
            <span className="text-lg font-black text-emerald-400 font-numbers tracking-tight">
              {healthScore}%
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 relative z-10 text-center">
          <div className="neu-inset p-2.5 rounded-2xl">
            <span className="text-[9px] text-slate-400 block font-hints">المعدل اليومي المقترح</span>
            <span className="text-sm font-black text-cyan-300 font-numbers mt-0.5 block">
              {dailyAverageAllowance} GB/يوم
            </span>
          </div>
          <div className="neu-inset p-2.5 rounded-2xl">
            <span className="text-[9px] text-slate-400 block font-hints">توقع استقرار البنج</span>
            <span className="text-sm font-black text-emerald-300 font-numbers mt-0.5 block">
              ممتاز (28ms)
            </span>
          </div>
          <div className="neu-inset p-2.5 rounded-2xl">
            <span className="text-[9px] text-slate-400 block font-hints">أفضل وقت للتحميل</span>
            <span className="text-sm font-black text-purple-300 font-numbers mt-0.5 block">
              03:00 ص - 09:00 ص
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. NEW LUXURY FEATURE: AUTOMATED SCHEDULED URGENT ALERT
             (توقيت تلقائي يبقى كرسالة مجدولة وترسل تلقائي عبر ديسكورد وتلي)
         ========================================================================= */}
      <div className="clay-card p-5 space-y-4 border border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-slate-950/70 to-black/90 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white font-titles">
                  التحذير العاجل المجدول تلقائياً (AI Auto-Scheduler)
                </h3>
                {aiSchedule.enabled && (
                  <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full animate-pulse font-titles">
                    نشط مجدول
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-200/90 font-hints mt-0.5">
                توقيت تلقائي يرسل رسائل التحذير المجدولة بصورة مستمرة إلى ديسكورد وتليجرام
              </p>
            </div>
          </div>

          {/* Master Enable Toggle */}
          <button
            type="button"
            onClick={handleToggleSchedule}
            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 flex items-center cursor-pointer ${
              aiSchedule.enabled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 justify-end shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-slate-800 justify-start'
            }`}
          >
            <motion.div
              layout
              className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-slate-950"
            >
              {aiSchedule.enabled ? '✓' : ''}
            </motion.div>
          </button>
        </div>

        {/* Live Countdown & Dispatch Status Bar */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-hints">موعد الإرسال التالي:</span>
            <span className="font-bold text-cyan-300 font-numbers tracking-wide">
              {timeRemainingText}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-hints text-slate-400">
            <div>
              <span>آخر إرسال: </span>
              <span className="text-slate-200 font-numbers">{aiSchedule.lastSentAt || 'لم يتم بعد'}</span>
            </div>
            <div>
              <span>إجمالي المرسل: </span>
              <span className="text-emerald-400 font-black font-numbers">{aiSchedule.totalSentCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Frequency & Interval Selector (تكرار التوقيت التلقائي) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white font-titles block">
            تكرار التوقيت التلقائي (Interval):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold font-titles">
            {[
              { hours: 1, label: 'كل 1 ساعة (اختبار سريع)' },
              { hours: 6, label: 'كل 6 ساعات (موصى به)' },
              { hours: 12, label: 'كل 12 ساعة' },
              { hours: 24, label: 'كل 24 ساعة (يومياً)' },
            ].map(item => (
              <button
                key={item.hours}
                type="button"
                onClick={() => {
                  playHapticSound('tap');
                  const nextTime = new Date(Date.now() + item.hours * 3600 * 1000).toISOString();
                  updateAiSchedule({
                    ...aiSchedule,
                    intervalHours: item.hours,
                    nextScheduledAt: aiSchedule.enabled ? nextTime : undefined
                  });
                }}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  aiSchedule.intervalHours === item.hours
                    ? 'bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Dispatch Channels: Both, Discord, or Telegram */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white font-titles block">
            قناة الإرسال التلقائي:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold font-titles">
            {[
              { id: 'both', label: 'كلاهما (Discord + Telegram)' },
              { id: 'discord', label: 'ديسكورد فقط (Discord)' },
              { id: 'telegram', label: 'تليجرام فقط (Telegram)' },
            ].map(ch => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  playHapticSound('tap');
                  updateAiSchedule({ ...aiSchedule, targetChannel: ch.id as any });
                }}
                className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  aiSchedule.targetChannel === ch.id
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10">
          <div>
            <span className="text-xs font-bold text-white font-titles block">
              حصر الإرسال عند اقتراب النفاذ (3 أيام أو أقل)
            </span>
            <span className="text-[10px] text-slate-400 font-hints">
              إذا تم تفعيله، لن يتم الإرسال إلا إذا كانت الأيام المتبقية 3 أيام فأقل
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playHapticSound('switch');
              updateAiSchedule({ ...aiSchedule, notifyOnCriticalOnly: !aiSchedule.notifyOnCriticalOnly });
            }}
            className={`w-12 h-6 rounded-full p-0.5 transition-all flex items-center cursor-pointer ${
              aiSchedule.notifyOnCriticalOnly ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Discord Webhook Field with MOKO default */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-300 font-titles flex items-center gap-1.5">
            <span>رابط ويب هوك ديسكورد (Discord Webhook):</span>
            <span className="text-[9px] text-cyan-400 font-hints">(مُعد تلقائياً أو ضع رابطك)</span>
          </label>
          <input
            type="text"
            dir="ltr"
            value={aiSchedule.discordWebhookUrl || ''}
            onChange={(e) => updateAiSchedule({ ...aiSchedule, discordWebhookUrl: e.target.value })}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full h-10 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={isSendingTestAlert}
            onClick={handleSendTestNow}
            className="flex-1 min-w-[160px] h-11 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer tap-interactive transition-all font-titles shadow-lg shadow-rose-950/40"
          >
            <Send className="w-4 h-4 text-white" />
            <span>{isSendingTestAlert ? 'جاري الإرسال التجريبي...' : 'إرسال تحذير تجريبي الآن 🚀'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHapticSound('tap');
              updateAiSchedule(DEFAULT_AI_SCHEDULE);
              if (onTriggerBannerNotice) {
                onTriggerBannerNotice('تمت استعادة إعدادات الجدولة الافتراضية.');
              }
            }}
            className="h-11 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-titles"
            title="إعادة ضبط الجدولة"
          >
            <Trash2 className="w-4 h-4" />
            <span>إعادة ضبط</span>
          </button>
        </div>
      </div>

      {/* 3. Interactive AI Diagnostics Query Box */}
      <div className="glass-luxury rounded-3xl p-5 space-y-3.5 border border-white/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Sparkles} className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white font-titles">
              الفحص والتشخيص الذكي بالذكاء الاصطناعي
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-hints">
            تحليل فوري لحسابك
          </span>
        </div>

        {/* Query Filter Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { id: 'comprehensive', label: 'تحليل شامل' },
            { id: 'speed', label: 'فحص الباندويث' },
            { id: 'gaming', label: 'تحسين البنج (Gaming)' },
            { id: 'security', label: 'أمان الـ IP والراوتر' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('switch');
                setSelectedPromptType(item.id as any);
              }}
              className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer tap-interactive font-titles text-center ${
                selectedPromptType === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50 border border-purple-400/50'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Generate / Run AI Button */}
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleRunAiAnalysis}
          className="w-full h-12 rounded-2xl clay-btn bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 tap-interactive font-titles shadow-lg shadow-purple-950/40"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>جاري التحليل واستشارة محرك Gemini AI...</span>
            </>
          ) : (
            <>
              <AnimatedIcon icon={Zap} className="w-4 h-4 text-amber-300" />
              <span>تشغيل فحص الذكاء الاصطناعي الفوري (AI Run)</span>
            </>
          )}
        </button>

        {/* AI Result Card */}
        <AnimatePresence>
          {aiReport && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-4 rounded-2xl bg-black/60 border border-purple-500/40 shadow-inner space-y-2.5 text-right relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <AnimatedIcon icon={Activity} className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-titles">
                    نتيجة التقرير العصبي المباشر
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {reportSource}
                </span>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-hints whitespace-pre-line">
                {aiReport}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. AI Peak Hours Radar & Iraq Network Schedule */}
      <div className="neu-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Clock} className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-black text-white font-titles">
              رادار أوقات الذروة والبنج في العراق (AI Radar)
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold font-hints">
            مُحدَّث ومُوصى به
          </span>
        </div>

        <div className="space-y-2">
          {/* Time Window 1: Gold Hours */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-emerald-300 font-titles block">
                  02:00 صباحاً – 10:00 صباحاً
                </span>
                <span className="text-[10px] text-slate-300 font-hints">
                  العصر الذهبي: أدنى زمن استجابة (Ping)، أقصى سرعة تنزيل، ألعاب تنافسية خالية من الـ Lag
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-400 font-numbers shrink-0">
              أفضل وقت
            </span>
          </div>

          {/* Time Window 2: Balanced */}
          <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <div>
                <span className="text-xs font-bold text-cyan-300 font-titles block">
                  10:00 صباحاً – 06:00 مساءً
                </span>
                <span className="text-[10px] text-slate-300 font-hints">
                  أداء متزن: ممتاز للعمل المكتبي، مشاهدة اليوتيوب بدقة 4K، والمكالمات المرئية
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-cyan-300 font-numbers shrink-0">
              مستقر
            </span>
          </div>

          {/* Time Window 3: Peak Hours */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <span className="text-xs font-bold text-amber-300 font-titles block">
                  06:00 مساءً – 12:00 منتصف الليل
                </span>
                <span className="text-[10px] text-slate-300 font-hints">
                  ساعات الذروة: كثافة عالية في المنطقة. ينصح الـ AI بتأجيل التحميلات الضخمة
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-300 font-numbers shrink-0">
              ساعات ذروة
            </span>
          </div>
        </div>
      </div>

      {/* 5. AI Smart Alert Crafting Assistant */}
      <div className="clay-card p-5 space-y-3 bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-black/70 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AnimatedIcon icon={Layers} className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-black text-white font-titles">
              صانع التنبيهات الذكي (AI Alert Generator)
            </h3>
          </div>
          <span className="text-[10px] text-purple-300 font-hints">
            صياغة فورية راقية
          </span>
        </div>

        {/* Style Selector */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
          {[
            { id: 'urgent', label: 'تحذير عاجل' },
            { id: 'vip', label: 'تنبيه VIP رسمي' },
            { id: 'technical', label: 'تقرير تقني' }
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('switch');
                setGeneratedAlertStyle(style.id as any);
              }}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer tap-interactive font-titles text-center ${
                generatedAlertStyle === style.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Text Preview Box */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs font-hints text-slate-200 whitespace-pre-line leading-relaxed font-mono">
          {getAiGeneratedAlert()}
        </div>

        {/* Action Buttons: Copy / Send */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyAlert}
            className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer tap-interactive border border-white/10 transition-colors font-titles"
          >
            {copiedAlert ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>تم نسخ النص</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>نسخ النص المصاغ</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSendingAiAlert}
            onClick={handleSendAiAlert}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer tap-interactive transition-all font-titles shadow-lg shadow-purple-950/40"
          >
            <Send className="w-4 h-4 text-white" />
            <span>{isSendingAiAlert ? 'جاري الإرسال...' : 'إرسال لـ Discord و Telegram'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
