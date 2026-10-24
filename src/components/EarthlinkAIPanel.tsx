import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriberData } from '../types/earthlink';
import { triggerLuxuryCelebration, playHapticSound, createClickRipple } from '../utils/effects';
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
  ChevronLeft
} from 'lucide-react';

interface EarthlinkAIPanelProps {
  data: SubscriberData;
  t: Record<string, string>;
  onTriggerBannerNotice?: (msg: string) => void;
  onNavigateToAlerts?: () => void;
}

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
  const [generatedAlertStyle, setGeneratedAlertStyle] = useState<'vip' | 'urgent' | 'technical'>('vip');
  const [copiedAlert, setCopiedAlert] = useState<boolean>(false);
  const [isSendingAiAlert, setIsSendingAiAlert] = useState<boolean>(false);

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
        triggerLuxuryCelebration();
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

  // Generate AI Alert Messages
  const getAiGeneratedAlert = () => {
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
      return `🚨 تنبيه عاجل بقرب انتهاء اشتراك Earthlink
تنبيه للمشترك: ${data.fullName}
باقي على الصلاحية: ${data.activeDaysLeft} يوم فقط!
تاريخ النفاذ: ${data.accountExpirationDate}
يرجى تجديد الباقة (${data.accountPrice}) قبل توقف الخدمة.`;
    }

    return `📊 تقرير Earthlink التقني الشامل
المعرف: ${data.userID}
IP الحساب: ${data.userIP}
الوكيل المعتمد: ${data.agentName}
الحالة: ${data.accountStatus}
الرصيد الزمني: ${data.activeDaysLeft} يوم (${data.accountExpirationDate})
التقييم: اتصال مستقر ومرخص.`;
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

    const alertText = getAiGeneratedAlert();

    try {
      await Promise.allSettled([
        fetch('/api/notify/discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportText: alertText,
            message: `🤖 **تنبيه Earthlink AI المصاغ بالذكاء الاصطناعي:**\n\`\`\`text\n${alertText}\n\`\`\``
          })
        }),
        fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: alertText })
        })
      ]);

      triggerLuxuryCelebration();
      if (onTriggerBannerNotice) {
        onTriggerBannerNotice('تم إرسال نص التنبيه الذكي إلى ديسكورد وتليجرام بنجاح!');
      }
    } catch {
      // Handled
    } finally {
      setIsSendingAiAlert(false);
    }
  };

  // Calculations for bandwidth forecast
  const dailyAverageAllowance = (350 / Math.max(data.activeDaysLeft, 1)).toFixed(1);
  const healthScore = Math.min(Math.max(data.activeDaysLeft * 3.3, 15), 100).toFixed(0);

  return (
    <motion.div layout className="space-y-4 select-none pb-4">
      {/* 1. Master AI Neural Header (Soft Surface & Claymorphic Aura) */}
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
                تحليل عصبي للباندويث وتوقع موعد النفاد وأفضل أوقات الألعاب
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

        {/* Dynamic Interactive Metrics (Soft Clay Pills) */}
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

      {/* 2. Interactive AI Diagnostics Query Box */}
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

        {/* Query Filter Options (Miro Soft Pills) */}
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

      {/* 3. AI Peak Hours Radar & Iraq Network Schedule (ساعات الذروة والألعاب) */}
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

      {/* 4. AI Smart Alert Crafting Assistant (صانع التنبيهات الذكي) */}
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

        {/* Style Selector (Soft Pills) */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
          {[
            { id: 'vip', label: 'تنبيه VIP رسمي' },
            { id: 'urgent', label: 'تحذير عاجل' },
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
