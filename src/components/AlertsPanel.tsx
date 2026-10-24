import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SubscriberData, ManualAlertSchedule } from '../types/earthlink';
import { triggerLuxuryCelebration, playHapticSound, createClickRipple } from '../utils/effects';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { LuxuryTimePickerModal } from './LuxuryTimePickerModal';
import { GitHubAutomationModal } from './GitHubAutomationModal';
import { EarthlinkAlertsYmlModal } from './EarthlinkAlertsYmlModal';
import { AnimatedIcon } from './AnimatedIcon';
import {
  Bell,
  Send,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  XCircle,
  Sparkles,
  Github,
  FileCode,
  Fingerprint,
  FileText,
  Radio,
  Check,
  Flame,
  ChevronLeft
} from 'lucide-react';

interface AlertsPanelProps {
  data: SubscriberData;
  t: Record<string, string>;
  activeSchedule: ManualAlertSchedule | null;
  onUpdateSchedule: (schedule: ManualAlertSchedule | null) => void;
  onTriggerBannerNotice?: (msg: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  data,
  t,
  activeSchedule,
  onUpdateSchedule,
  onTriggerBannerNotice
}) => {
  // Device Hardware Fingerprint (بصمة الهاتف الثابتة لربطها بملف earthlink-alerts.yml)
  const [deviceInfo] = useState(() => getDeviceFingerprint());

  // Current calendar context
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth(); // 0 to 11
  const currentMonthName = currentDate.toLocaleString('ar-IQ', { month: 'long' }) || 'الشهر الحالي';
  const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const todayDateNum = currentDate.getDate();

  // State for Instant Send
  const [instantChannel, setInstantChannel] = useState<'both' | 'telegram' | 'discord'>('both');
  const [isSendingImmediate, setIsSendingImmediate] = useState<boolean>(false);

  // State for Manual Specific Scheduled Alert
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    return activeSchedule?.dayOfMonth || Math.min(todayDateNum + 3, totalDaysInMonth);
  });
  const [selectedHour, setSelectedHour] = useState<string>(() => {
    return activeSchedule?.hour || '08';
  });
  const [selectedMinute, setSelectedMinute] = useState<string>(() => {
    return activeSchedule?.minute || '30';
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(() => {
    return activeSchedule?.period || 'PM';
  });
  const [isTimePickerModalOpen, setIsTimePickerModalOpen] = useState<boolean>(false);
  const [scheduleChannel, setScheduleChannel] = useState<'both' | 'telegram' | 'discord'>(() => {
    return activeSchedule?.targetChannel || 'both';
  });
  const [isGithubModalOpen, setIsGithubModalOpen] = useState<boolean>(false);
  const [isYmlModalOpen, setIsYmlModalOpen] = useState<boolean>(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);
  const [isServerActive, setIsServerActive] = useState<boolean>(false);

  // Sync with earthlink-alerts.yml on server
  useEffect(() => {
    fetch(`/api/alerts/schedule?fingerprint=${encodeURIComponent(deviceInfo.fingerprint)}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.schedule && result.schedule.is_active) {
          const s = result.schedule;
          setSelectedDay(s.scheduled_day);
          setSelectedHour(s.scheduled_hour);
          setSelectedMinute(s.scheduled_minute);
          setSelectedPeriod(s.scheduled_period);
          setScheduleChannel(s.target_channel);
          setIsServerActive(true);
          onUpdateSchedule({
            isActive: true,
            dayOfMonth: s.scheduled_day,
            monthName: currentMonthName,
            hour: s.scheduled_hour,
            minute: s.scheduled_minute,
            period: s.scheduled_period,
            targetChannel: s.target_channel,
            formattedScheduleText: s.formatted_text,
            createdAt: s.created_at
          });
        }
      })
      .catch(() => {});
  }, [deviceInfo.fingerprint, currentMonthName]);

  const isScheduledActive = !!(activeSchedule && activeSchedule.isActive) || isServerActive;

  // Real-time Live Countdown calculation
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    formatted: string;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, formatted: '' });

  useEffect(() => {
    const calcCountdown = () => {
      const now = new Date();
      const targetYear = now.getFullYear();
      let targetMonth = now.getMonth();
      
      let targetHour = parseInt(selectedHour, 10);
      if (selectedPeriod === 'PM' && targetHour < 12) targetHour += 12;
      if (selectedPeriod === 'AM' && targetHour === 12) targetHour = 0;
      const targetMinute = parseInt(selectedMinute, 10) || 0;

      let targetDate = new Date(targetYear, targetMonth, selectedDay, targetHour, targetMinute, 0);

      // If scheduled time has already passed this month, project to next month
      if (targetDate.getTime() <= now.getTime()) {
        targetMonth += 1;
        targetDate = new Date(targetYear, targetMonth, selectedDay, targetHour, targetMinute, 0);
      }

      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
          formatted: 'حان موعد التنبيه الآن!'
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isPast: false,
        formatted: `${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`
      });
    };

    calcCountdown();
    const timer = setInterval(calcCountdown, 1000);
    return () => clearInterval(timer);
  }, [selectedDay, selectedHour, selectedMinute, selectedPeriod]);

  // Test trigger directly to Discord & Telegram via earthlink-alerts.yml backend
  const [isTestingAlert, setIsTestingAlert] = useState<boolean>(false);
  const handleTestAlert = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('send');
    setIsTestingAlert(true);

    try {
      const res = await fetch('/api/alerts/test-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_fingerprint: deviceInfo.fingerprint,
          device_name: deviceInfo.deviceName,
          username: data.userID,
          full_name: data.fullName,
          day: selectedDay,
          hour: selectedHour,
          minute: selectedMinute,
          period: selectedPeriod,
          channel: scheduleChannel
        })
      });

      const json = await res.json();
      if (json.success) {
        triggerLuxuryCelebration();
        playHapticSound('success');
        if (onTriggerBannerNotice) {
          onTriggerBannerNotice('تم إرسال التنبيه التجريبي المباشر بنجاح إلى ديسكورد وتليجرام للتأكد!');
        }
      }
    } catch {
      // Handled
    } finally {
      setIsTestingAlert(false);
    }
  };

  // Format report for dispatch
  const formatDispatchReport = (customHeader?: string) => {
    const nowTimeStr = new Date().toLocaleString('ar-IQ');
    return `EARTHLINK SUBSCRIBER REPORT
الاسم الكامل: ${data.fullName}
اسم المستخدم: ${data.userID}
نوع الاشتراك: ${data.accountName}
سعر الاشتراك: ${data.accountPrice}
حالة الاشتراك: ${data.accountStatus}
الأيام المتبقية: ${data.activeDaysLeft}
تاريخ انتهاء الصلاحية: ${data.accountExpirationDate}
اسم الوكيل: ${data.agentName}
عنوان IP: ${data.userIP}
رقم الهاتف: ${data.mobileNumber || '—'}
وقت التنبيه: ${nowTimeStr}
التذكير: ${customHeader || 'تذكير رسمي بقرب انتهاء اشتراك Earthlink'}`;
  };

  // 1. Instant Send via Webhook / Telegram
  const handleInstantSend = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    setIsSendingImmediate(true);
    playHapticSound('send');

    const reportContent = formatDispatchReport('تنبيه إيرثلنك فوري ومباشر');

    try {
      if (instantChannel === 'discord' || instantChannel === 'both') {
        await fetch('/api/notify/discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportText: reportContent,
            message: `⚡ **تنبيه إيرثلنك فوري ومباشر** عبر Webhook للمشترك \`${data.userID}\`:\n\`\`\`text\n${reportContent}\n\`\`\``
          })
        });
      }

      if (instantChannel === 'telegram' || instantChannel === 'both') {
        const tgText = `🔔 <b>تنبيه اشتراك Earthlink VIP الفوري</b>\n\n` +
          `👤 المشترك: <b>${data.fullName}</b> (@${data.userID})\n` +
          `📦 الباقة: <b>${data.accountName}</b> (${data.accountPrice})\n` +
          `⏳ الأيام المتبقية: <b>${data.activeDaysLeft} يوم</b>\n` +
          `📅 تاريخ الانتهاء: <b>${data.accountExpirationDate}</b>\n` +
          `🌐 الـ IP: <code>${data.userIP}</code>\n` +
          `🏢 الوكيل: <b>${data.agentName}</b>\n\n` +
          `تم الإرسال فورياً من تطبيق المشتركين.`;

        await fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: tgText })
        });
      }

      triggerLuxuryCelebration();
      if (onTriggerBannerNotice) {
        onTriggerBannerNotice('تم إرسال التقرير والتنبيه الفوري بنجاح!');
      }
    } catch {
      // Error handled
    } finally {
      setIsSendingImmediate(false);
    }
  };

  // 2. Save Manual Specific Alert directly to earthlink-alerts.yml
  const handleSaveManualSchedule = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    setIsSavingSchedule(true);

    const formattedText = `يوم ${selectedDay} ${currentMonthName} الساعة ${selectedHour}:${selectedMinute} ${selectedPeriod === 'AM' ? 'صباحاً' : 'مساءً'}`;

    const newSchedule: ManualAlertSchedule = {
      isActive: true,
      dayOfMonth: selectedDay,
      monthName: currentMonthName,
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod,
      targetChannel: scheduleChannel,
      formattedScheduleText: formattedText,
      createdAt: new Date().toLocaleString('ar-IQ')
    };

    onUpdateSchedule(newSchedule);

    try {
      const res = await fetch('/api/alerts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_fingerprint: deviceInfo.fingerprint,
          device_name: deviceInfo.deviceName,
          username: data.userID,
          full_name: data.fullName,
          day: selectedDay,
          hour: selectedHour,
          minute: selectedMinute,
          period: selectedPeriod,
          channel: scheduleChannel,
          token: localStorage.getItem('EL_AUTH_TOKEN') || undefined
        })
      });

      if (res.ok) {
        setIsServerActive(true);
        playHapticSound('success');
        triggerLuxuryCelebration();
        if (onTriggerBannerNotice) {
          onTriggerBannerNotice(`تم حفظ وتفعيل التنبيه بنجاح في ملف earthlink-alerts.yml! سيبقى يعمل على السيرفر 24/7 حتى لو أغلقت الموقع أو الهاتف.`);
        }
      }
    } catch {
      // Local schedule still preserved
      playHapticSound('success');
      triggerLuxuryCelebration();
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // 3. Cancel Alert from earthlink-alerts.yml
  const handleCancelSchedule = async (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('tap');
    onUpdateSchedule(null);
    setIsServerActive(false);

    try {
      await fetch('/api/alerts/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_fingerprint: deviceInfo.fingerprint })
      });
    } catch {
      // Handled
    }

    if (onTriggerBannerNotice) {
      onTriggerBannerNotice('تم إلغاء التنبيه وإيقافه من ملف earthlink-alerts.yml وإزالة الشعار.');
    }
  };

  return (
    <motion.div layout className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 font-titles">
            <span>{t.alertsTitle}</span>
            <AnimatedIcon icon={Bell} size="md" className="text-purple-400" />
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-hints">{t.alertsSubtitle}</p>
        </div>

        <div className="soft-pill px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 flex items-center gap-1.5 text-[11px] text-purple-300 font-bold">
          <AnimatedIcon icon={Flame} size="sm" className="text-amber-400" />
          <span>مركز الأتمتة الذكي</span>
        </div>
      </div>

      {/* 1. Manual Specific Calendar Alert Scheduler (الميزة المطلوبة: تحديد يوم وساعة ووقت محدد) */}
      <div className="clay-card rounded-3xl p-5 border border-purple-500/35 shadow-2xl space-y-4 relative overflow-hidden bg-gradient-to-b from-purple-950/30 via-slate-900/50 to-black/80">
        {/* Shimmer sweep layer */}
        <div className="shimmer-sweep-layer" />

        {/* Glow Shimmer */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30 shadow-md">
              <AnimatedIcon icon={Calendar} size="sm" className="text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-titles">
                تحديد تنبيه يدوي ومخصص
              </h3>
              <span className="text-[11px] text-purple-300 font-hints">
                {currentMonthName} {currentYear}
              </span>
            </div>
          </div>

          {isScheduledActive ? (
            <span className="soft-pill text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 font-titles shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <AnimatedIcon icon={CheckCircle2} size="sm" className="text-emerald-300" />
              <span>مفعل على السيرفر 24/7 (شعار ظاهر)</span>
            </span>
          ) : (
            <span className="soft-pill text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-hints">
              غير محدد
            </span>
          )}
        </div>

        {/* Device Fingerprint & earthlink-alerts.yml Cloud Sync Badge */}
        <div className="neu-inset p-3.5 rounded-2xl bg-black/60 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-cyan-300 flex items-center justify-center border border-purple-400/30 shrink-0">
              <AnimatedIcon icon={Fingerprint} size="sm" className="text-cyan-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-400 font-hints">بصمة هذا الهاتف:</span>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {deviceInfo.fingerprint}
                </span>
                <span className="text-[10px] text-purple-300 font-hints">({deviceInfo.deviceName})</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-300 font-bold font-titles">
                  ملف الأتمتة: earthlink-alerts.yml (يعمل 24/7 حتى لو أغلقت الموقع)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                setIsYmlModalOpen(true);
              }}
              className="clay-btn px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white border border-purple-400/40 text-[11px] font-bold font-titles flex items-center gap-1.5 transition-all cursor-pointer tap-interactive shadow-sm"
            >
              <AnimatedIcon icon={FileText} size="sm" className="text-cyan-300" />
              <span>فحص ملف earthlink-alerts.yml</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-hints relative z-10">
          حدد اليوم من الشهر الحالي والوقت الدقيق بالدقيقة والساعة مع اختيار (صباحاً / مساءً). يتم حفظ الموعد في ملف <code className="text-cyan-300 font-mono">earthlink-alerts.yml</code> مع بصمة هاتفك ليرسل التنبيه في الموعد المحدد حتى لو أغلقت الموقع:
        </p>

        {/* Step 1: Pick Day of the Current Month */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 font-titles flex items-center gap-1.5">
              <span>١. اختر يوم الشهر:</span>
              <span className="text-purple-400 font-numbers text-sm font-black">
                (يوم {selectedDay} من {totalDaysInMonth})
              </span>
            </label>
            <span className="text-[10px] text-slate-400 font-hints">
              اليوم الحالي: {todayDateNum}
            </span>
          </div>

          {/* Scrollable / Grid Day Picker Chips with Neu-Inset frame */}
          <div className="neu-inset grid grid-cols-7 sm:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-2xl bg-black/60 border border-white/10">
            {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((dayNum) => {
              const isSelected = selectedDay === dayNum;
              const isToday = dayNum === todayDateNum;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    setSelectedDay(dayNum);
                  }}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer tap-interactive active:scale-95 ${
                    isSelected
                      ? 'clay-btn bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-black shadow-lg shadow-purple-950/60 ring-2 ring-purple-400'
                      : isToday
                      ? 'neu-convex bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-900/50'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <span className="text-xs font-numbers leading-none font-bold">{dayNum}</span>
                  {isToday && !isSelected && (
                    <span className="text-[7px] text-cyan-300 font-hints leading-none">اليوم</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Full Luxury Time Picker (Hour + Minute + Period) */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 font-titles block">
              ٢. وقت التنبيه (الساعة والدقيقة والفترة):
            </label>
            <span className="text-[10px] text-cyan-400 font-hints">
              انقر لفتح أداة التحديد الفخمة
            </span>
          </div>

          {/* Luxury Main Time Trigger Card */}
          <div
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setIsTimePickerModalOpen(true);
            }}
            className="neu-card p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/70 to-cyan-950/50 border border-purple-500/35 hover:border-purple-400 shadow-xl flex items-center justify-between cursor-pointer group transition-all tap-interactive relative overflow-hidden active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                <AnimatedIcon icon={Clock} size="md" className="text-purple-300" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-hints">الوقت المحدد حالياً:</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-white font-numbers tracking-wider">
                    {selectedHour}:{selectedMinute}
                  </span>
                  <span className="text-xs font-bold text-cyan-300 font-titles">
                    {selectedPeriod === 'AM' ? 'صباحاً (ص)' : 'مساءً (م)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="clay-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 text-xs font-bold font-titles group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <AnimatedIcon icon={Sparkles} size="sm" className="text-amber-300" />
              <span>تعديل التوقيت</span>
            </div>
          </div>

          {/* Quick 3-Chip Selector (Hour Box, Minute Box, Period Box) */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {/* Hour Chip */}
            <button
              type="button"
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                setIsTimePickerModalOpen(true);
              }}
              className="neu-inset py-2 px-2 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 hover:border-purple-400/60 transition-all text-center cursor-pointer tap-interactive"
            >
              <span className="text-[9px] text-slate-400 block font-hints">الساعة</span>
              <span className="text-base font-black text-white font-numbers">{selectedHour}</span>
            </button>

            {/* Minute Chip */}
            <button
              type="button"
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                setIsTimePickerModalOpen(true);
              }}
              className="neu-inset py-2 px-2 rounded-xl bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-400/60 transition-all text-center cursor-pointer tap-interactive"
            >
              <span className="text-[9px] text-slate-400 block font-hints">الدقيقة</span>
              <span className="text-base font-black text-cyan-300 font-numbers">{selectedMinute}</span>
            </button>

            {/* Period Quick Toggle */}
            <div className="neu-inset flex rounded-xl bg-black/50 border border-white/10 p-0.5 gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('switch');
                  setSelectedPeriod('AM');
                }}
                className={`flex-1 rounded-lg text-[11px] font-bold transition-all tap-interactive cursor-pointer font-titles flex items-center justify-center ${
                  selectedPeriod === 'AM'
                    ? 'clay-btn bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ص
              </button>
              <button
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('switch');
                  setSelectedPeriod('PM');
                }}
                className={`flex-1 rounded-lg text-[11px] font-bold transition-all tap-interactive cursor-pointer font-titles flex items-center justify-center ${
                  selectedPeriod === 'PM'
                    ? 'clay-btn bg-purple-600 text-white font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                م
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Destination Channel */}
        <div className="space-y-1.5 relative z-10">
          <label className="text-xs font-bold text-slate-200 font-titles block">
            ٣. وسيلة استلام التنبيه:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'both', label: 'كلاهما (DC + TG)' },
              { id: 'discord', label: 'Discord' },
              { id: 'telegram', label: 'Telegram' }
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('switch');
                  setScheduleChannel(ch.id as 'both' | 'telegram' | 'discord');
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles text-center ${
                  scheduleChannel === ch.id
                    ? 'clay-btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border border-purple-400/50'
                    : 'neu-inset bg-black/40 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Real-Time Live Countdown & Scheduled Status (مرتبط مباشرة بملف earthlink-alerts.yml) */}
        <div className="clay-card p-4 rounded-3xl bg-gradient-to-br from-purple-950/50 via-black/85 to-cyan-950/50 border border-purple-500/35 shadow-xl relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-black text-white font-titles">
                العد التنازلي التلقائي للموعد المحدد
              </span>
            </div>

            <span className={`soft-pill text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-titles ${
              isScheduledActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {isScheduledActive ? 'نشط في earthlink-alerts.yml' : 'بانتظار التأكيد'}
            </span>
          </div>

          {/* 4-Box Luxury Countdown Timer Display with Neu-Inset */}
          <div className="grid grid-cols-4 gap-2 text-center py-1">
            {/* Days */}
            <div className="neu-inset p-2.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white font-numbers leading-none">
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-hints mt-1">يوم</span>
            </div>

            {/* Hours */}
            <div className="neu-inset p-2.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-purple-300 font-numbers leading-none">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-hints mt-1">ساعة</span>
            </div>

            {/* Minutes */}
            <div className="neu-inset p-2.5 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-cyan-300 font-numbers leading-none">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-hints mt-1">دقيقة</span>
            </div>

            {/* Seconds (Active Ticking) */}
            <div className="neu-inset p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <span className="text-xl font-black text-amber-300 font-numbers leading-none animate-pulse">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-amber-300/80 font-hints mt-1">ثانية</span>
            </div>
          </div>

          {/* Scheduled Details & 24/7 Guarantee */}
          <div className="neu-inset p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <AnimatedIcon icon={Clock} size="sm" className="text-cyan-400 shrink-0" />
              <span className="text-slate-300 font-titles">
                الموعد المختار: <strong className="text-white">يوم {selectedDay} {currentMonthName}</strong> الساعة <strong className="text-cyan-300 font-numbers">{selectedHour}:{selectedMinute}</strong> ({selectedPeriod === 'AM' ? 'صباحاً' : 'مساءً'})
              </span>
            </div>
            <span className="text-emerald-400 font-bold font-hints text-[10px]">
              {isScheduledActive ? 'يعمل في الخلفية 24/7 حتى مع إغلاق الموقع' : 'احفظ التنبيه لبدء العمل في الخلفية'}
            </span>
          </div>

          {/* Quick Test Alert Button */}
          <button
            type="button"
            disabled={isTestingAlert}
            onClick={handleTestAlert}
            className="clay-btn w-full py-2.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-100 border border-purple-400/40 text-xs font-bold font-titles flex items-center justify-center gap-2 transition-all cursor-pointer tap-interactive"
          >
            <AnimatedIcon icon={Send} size="sm" className="text-cyan-300" />
            <span>
              {isTestingAlert
                ? 'جاري إرسال التنبيه التجريبي...'
                : '⚡ تجربة إرسال تنبيه اختباري الآن للتأكد (Discord & Telegram)'}
            </span>
          </button>
        </div>

        {/* Action Buttons: Save / Cancel */}
        <div className="flex gap-2 pt-1 relative z-10">
          <button
            type="button"
            disabled={isSavingSchedule}
            onClick={handleSaveManualSchedule}
            className="clay-btn flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-xl shadow-purple-950/40 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-110 cursor-pointer disabled:opacity-60 tap-interactive font-titles"
          >
            {isSavingSchedule ? (
              <span>جاري الحفظ في ملف earthlink-alerts.yml...</span>
            ) : (
              <>
                <AnimatedIcon icon={CheckCircle2} size="sm" className="text-white" />
                <span>تأكيد وحفظ التنبيه في ملف earthlink-alerts.yml</span>
              </>
            )}
          </button>

          {isScheduledActive && (
            <button
              type="button"
              onClick={handleCancelSchedule}
              className="clay-btn h-12 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-interactive font-titles"
            >
              <AnimatedIcon icon={XCircle} size="sm" className="text-rose-300" />
              <span>إلغاء التنبيه</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Autonomous GitHub Actions 24/7 Cloud Dispatcher Card */}
      <div className="clay-card rounded-3xl p-5 border border-purple-500/35 shadow-2xl space-y-3.5 bg-gradient-to-br from-black/85 via-slate-950/80 to-purple-950/40 relative overflow-hidden">
        {/* Shimmer sweep layer */}
        <div className="shimmer-sweep-layer" />

        <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/25 text-purple-300 flex items-center justify-center border border-purple-500/30 shadow-md">
              <AnimatedIcon icon={Github} size="md" className="text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-titles flex items-center gap-1.5">
                <span>أتمتة السحابة 24/7 (GitHub Actions)</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h3>
              <span className="text-[10px] text-cyan-300 font-hints">
                ملف يعمل طوال الوقت حتى مع إغلاق الموقع أو إطفاء الهاتف
              </span>
            </div>
          </div>

          <span className="soft-pill text-[10px] font-mono px-2.5 py-0.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-bold">
            24/7 Cloud
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-hints relative z-10">
          عند الخروج من موقع إيرثلنك، يتولى ملف <code className="text-purple-300 font-mono">.github/workflows/alert_dispatcher.yml</code> والسكريبت المرفوع في مستودع GitHub الخاص بك فحص الموعد والاتصال المباشر بخوادم إيرثلنك وإرسال التقرير كامل إلى ديسكورد أو تليجرام تلقائياً!
        </p>

        {/* Action Trigger for GitHub modal */}
        <div className="flex gap-2 pt-1 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setIsGithubModalOpen(true);
            }}
            className="clay-btn flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/50 cursor-pointer tap-interactive font-titles"
          >
            <AnimatedIcon icon={FileCode} size="sm" className="text-cyan-300" />
            <span>عرض وتحميل ملف تشغيل GitHub (.yml)</span>
          </button>
        </div>
      </div>

      {/* 3. Instant Webhook Command Box */}
      <div className="clay-card rounded-3xl p-5 border border-white/10 shadow-xl space-y-3 relative overflow-hidden bg-gradient-to-b from-slate-900/50 to-black/70">
        <div className="shimmer-sweep-layer" />

        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm font-titles relative z-10">
          <AnimatedIcon icon={Zap} size="sm" className="text-amber-400" />
          <span>{t.instantWebhook}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-hints relative z-10">
          {t.instantWebhookDesc}
        </p>

        {/* Channel Selection for instant dispatch */}
        <div className="grid grid-cols-3 gap-2 pt-1 relative z-10">
          <button
            type="button"
            onClick={(e) => { createClickRipple(e); playHapticSound('switch'); setInstantChannel('both'); }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles ${
              instantChannel === 'both'
                ? 'clay-btn bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                : 'neu-inset bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            كلاهما (Discord + Telegram)
          </button>
          <button
            type="button"
            onClick={(e) => { createClickRipple(e); playHapticSound('switch'); setInstantChannel('discord'); }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles ${
              instantChannel === 'discord'
                ? 'clay-btn bg-indigo-600 text-white shadow-lg'
                : 'neu-inset bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            Discord Webhook
          </button>
          <button
            type="button"
            onClick={(e) => { createClickRipple(e); playHapticSound('switch'); setInstantChannel('telegram'); }}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles ${
              instantChannel === 'telegram'
                ? 'clay-btn bg-sky-600 text-white shadow-lg'
                : 'neu-inset bg-black/40 text-slate-400 hover:text-white'
            }`}
          >
            Telegram Bot
          </button>
        </div>

        <button
          onClick={handleInstantSend}
          disabled={isSendingImmediate}
          className="clay-btn w-full h-12 mt-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all hover:brightness-110 cursor-pointer disabled:opacity-60 tap-interactive font-titles relative z-10"
        >
          {isSendingImmediate ? (
            <span>جاري الإرسال الفوري...</span>
          ) : (
            <>
              <AnimatedIcon icon={Send} size="sm" className="text-white" />
              <span>إرسال فوري الآن</span>
            </>
          )}
        </button>
      </div>

      {/* Luxury Time Picker Modal (Tactile Hours & Minutes selector) */}
      <LuxuryTimePickerModal
        isOpen={isTimePickerModalOpen}
        onClose={() => setIsTimePickerModalOpen(false)}
        initialHour={selectedHour}
        initialMinute={selectedMinute}
        initialPeriod={selectedPeriod}
        onConfirm={(h, m, p) => {
          setSelectedHour(h);
          setSelectedMinute(m);
          setSelectedPeriod(p);
        }}
      />

      {/* GitHub 24/7 Cloud Automation Modal */}
      <GitHubAutomationModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        selectedDay={selectedDay}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        selectedPeriod={selectedPeriod}
        selectedChannel={scheduleChannel}
      />

      {/* earthlink-alerts.yml Live Viewer & Tester Modal */}
      <EarthlinkAlertsYmlModal
        isOpen={isYmlModalOpen}
        onClose={() => setIsYmlModalOpen(false)}
        deviceFingerprint={deviceInfo.fingerprint}
        deviceName={deviceInfo.deviceName}
      />
    </motion.div>
  );
};
