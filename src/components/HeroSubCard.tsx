import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { SubscriberData } from '../types/earthlink';
import { LiquidMeter } from './LiquidMeter';
import { NetworkQualityCard } from './NetworkQualityCard';
import { AnimatedIcon } from './AnimatedIcon';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import {
  Gauge,
  HardDrive,
  Wifi,
  Globe,
  ShieldCheck,
  PlusCircle,
  RotateCw,
  Share2,
  BarChart3,
  Sparkles,
  ChevronLeft,
  Tv,
  Check,
  Flame
} from 'lucide-react';

interface HeroSubCardProps {
  data: SubscriberData;
  t: Record<string, string>;
  onNavigateToData?: () => void;
  onNavigateToAlerts?: () => void;
}

export const HeroSubCard: React.FC<HeroSubCardProps> = ({
  data,
  t,
  onNavigateToData,
  onNavigateToAlerts
}) => {
  // Simulate subtle live network pulse
  const [liveSpeed, setLiveSpeed] = useState<number>(160);
  const [livePing, setLivePing] = useState<number>(16);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSpeed(prev => Math.max(152, Math.min(195, prev + (Math.floor(Math.random() * 7) - 3))));
      setLivePing(prev => Math.max(12, Math.min(24, prev + (Math.floor(Math.random() * 5) - 2))));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const triggerActionFeedback = (e: React.MouseEvent<HTMLElement>, title: string) => {
    createClickRipple(e);
    playHapticSound('success');
    triggerLuxuryCelebration();
    setActionNotice(title);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 320,
        damping: 28,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Action Toast Feedback if triggered */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-xs font-bold font-hints">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{actionNotice}</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">OK</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Main Curved Hero Subscription Card (Claymorphic + Glass + Shimmer Sweep) */}
      <motion.div
        variants={cardVariants}
        layout
        className="clay-card rounded-3xl p-5 shadow-2xl overflow-hidden relative border border-purple-500/35 bg-gradient-to-b from-purple-950/40 via-slate-900/60 to-black/80"
      >
        <div className="shimmer-sweep-layer" />

        {/* Glow Spheres */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ background: 'var(--color-primary)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: 'var(--color-secondary)' }}
        />

        {/* Plan Header Row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={data.accountImagePath || 'https://user.earthlink.iq/accountImages/138.png'}
                alt={data.accountName}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-2xl bg-white/10 p-1.5 border border-white/20 object-contain shadow-lg backdrop-blur-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://user.earthlink.iq/accountImages/138.png';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block font-hints">
                اشتراك إيرثلنك الفعلي
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-wide font-titles">
                  اشتراك {data.accountName || 'Plus'}
                </h3>
                <span className="soft-pill text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-titles shadow-sm">
                  {data.accountStatus || t.activeStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Speed Indicator in Header with Waves */}
          <div className="text-left bg-black/40 px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 soft-surface">
            <div className="relative flex items-center justify-center">
              <AnimatedIcon icon={Wifi} className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-black font-numbers text-cyan-300 block leading-tight">
                {liveSpeed}
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-bold block font-english">
                Mbps
              </span>
            </div>
          </div>
        </div>

        {/* 3D Liquid Wave Meter (Sphere showing remaining days) */}
        <LiquidMeter
          daysLeft={data.activeDaysLeft}
          totalDays={30}
          expirationDate={data.accountExpirationDate}
          daysLabel={t.daysLeft}
          expiresLabel={t.expiresOn}
        />

        {/* Live Network Metrics Grid (Neumorphic Inset Surfaces) */}
        <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3.5 border-t border-white/10 relative z-10">
          {/* Speed */}
          <div className="neu-inset p-3 rounded-2xl text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-1 border border-cyan-500/20">
              <AnimatedIcon icon={Gauge} className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-sm font-black font-numbers text-white tracking-tight">
              {liveSpeed} <span className="text-[10px] font-normal text-slate-400 font-english">Mbps</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-hints">{t.downloadSpeed}</span>
          </div>

          {/* Usage */}
          <div className="neu-inset p-3 rounded-2xl text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-1 border border-purple-500/20">
              <AnimatedIcon icon={HardDrive} className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm font-black font-numbers text-white tracking-tight">
              1.28 <span className="text-[10px] font-normal text-slate-400 font-english">TB</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-hints">{t.dataUsage}</span>
          </div>

          {/* Frequency & Ping */}
          <div className="neu-inset p-3 rounded-2xl text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-1 border border-pink-500/20">
              <AnimatedIcon icon={Wifi} className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-sm font-black font-numbers text-white tracking-tight">
              5.0 <span className="text-[10px] font-normal text-slate-400 font-english">GHz ({livePing}ms)</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 font-hints">{t.frequency}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Real-Time Internet Signal, Speed & Quality Dashboard */}
      <motion.div variants={cardVariants} layout>
        <NetworkQualityCard
          userIP={data.userIP}
          isOnline={true}
          t={t}
        />
      </motion.div>

      {/* 3. Wallet & Recharge Bar (Claymorphic Surface + Soft Pill) */}
      <motion.div
        variants={cardVariants}
        layout
        className="clay-card rounded-2xl p-4 flex items-center justify-between border border-purple-500/30 shadow-lg bg-gradient-to-r from-purple-950/30 via-slate-900/50 to-black/60 relative overflow-hidden"
      >
        <div className="shimmer-sweep-layer" />
        <div className="relative z-10">
          <span className="text-[11px] text-slate-400 font-medium block font-hints">
            رصيد الاشتراك / التكلفة
          </span>
          <div className="text-lg font-black font-numbers text-white tracking-tight">
            {data.accountPrice || '35,000 IQD'}
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => triggerActionFeedback(e, 'تم إرسال طلب إعادة التعبئة والتجديد')}
          className="h-10 px-4 rounded-xl clay-btn bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-md shadow-purple-950/40 flex items-center gap-1.5 transition-all cursor-pointer tap-interactive font-titles relative z-10"
        >
          <AnimatedIcon icon={PlusCircle} className="w-4 h-4 text-cyan-300" interactive={false} />
          <span>إعادة التعبئة</span>
        </motion.button>
      </motion.div>

      {/* 3. Quick Services Grid (3D Neumorphic Floating Cards) */}
      <motion.div variants={cardVariants} layout className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 font-titles">الخدمات السريعة</span>
          <span className="soft-pill text-[9px] text-purple-300 font-bold px-2 py-0.5 border border-purple-500/25">
            بوابة المشترك
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {/* Service 1: تجديد الاشتراك */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={(e) => triggerActionFeedback(e, 'جاري فتح مسار تجديد الاشتراك...')}
            className="neu-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group tap-interactive border border-white/10 hover:border-amber-400/50"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110 border border-amber-500/20">
              <AnimatedIcon icon={RotateCw} className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 text-center leading-tight font-titles">
              تجديد الاشتراك
            </span>
          </motion.button>

          {/* Service 2: دعوة صديق */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={(e) => triggerActionFeedback(e, 'تم نسخ رابط دعوة الأصدقاء')}
            className="neu-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group tap-interactive border border-white/10 hover:border-cyan-400/50"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-110 border border-cyan-500/20">
              <AnimatedIcon icon={Share2} className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 text-center leading-tight font-titles">
              دعوة صديق
            </span>
          </motion.button>

          {/* Service 3: بيانات الانترنت */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              if (onNavigateToData) onNavigateToData();
            }}
            className="neu-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group tap-interactive border border-white/10 hover:border-pink-400/50"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center transition-transform group-hover:scale-110 border border-pink-500/20">
              <AnimatedIcon icon={BarChart3} className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 text-center leading-tight font-titles">
              بيانات الانترنت
            </span>
          </motion.button>

          {/* Service 4: تغيير الاشتراك */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={(e) => triggerActionFeedback(e, 'قائمة باقات إيرثلنك المتاحة للترقية')}
            className="neu-card p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group tap-interactive border border-white/10 hover:border-emerald-400/50"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110 border border-emerald-500/20">
              <AnimatedIcon icon={Sparkles} className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 text-center leading-tight font-titles">
              تغيير الاشتراك
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* 4. Entertainment Banner (Claymorphic Rounded Surface) */}
      <motion.div
        variants={cardVariants}
        layout
        className="clay-card rounded-2xl p-4 border border-purple-500/25 bg-gradient-to-r from-purple-900/30 via-indigo-950/20 to-black/40 flex items-center justify-between relative overflow-hidden"
      >
        <div className="shimmer-sweep-layer" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <AnimatedIcon icon={Tv} className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-titles">منصة شبكتي والترفيه</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-hints">
              سينمانا، شاشتي، إيرثلنك TV
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => triggerActionFeedback(e, 'فتح بوابة شبكتي الترفيهية')}
          className="h-8 px-3 rounded-xl clay-btn bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] border border-white/15 flex items-center gap-1 transition-all cursor-pointer tap-interactive font-titles relative z-10"
        >
          <span>شوفه هنا</span>
          <ChevronLeft className="w-3.5 h-3.5 text-purple-300" />
        </motion.button>
      </motion.div>

      {/* 5. Quick Agent & IP Card (3D Neumorphic Surface) */}
      <motion.div
        variants={cardVariants}
        layout
        className="neu-card rounded-2xl p-3.5 flex items-center justify-between border border-cyan-500/25 bg-slate-950/80 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/25">
            <AnimatedIcon icon={Globe} className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block font-hints">
              {t.subscriberIp}
            </span>
            <span className="text-sm font-bold font-numbers text-white tracking-wider">
              {data.userIP || '100.119.247.67'}
            </span>
          </div>
        </div>

        <div className="text-left flex items-center gap-2">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block font-hints">
              {t.agentName}
            </span>
            <span className="text-sm font-bold font-numbers text-purple-300">
              {data.agentName || 'fgs116'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center border border-white/10">
            <AnimatedIcon icon={ShieldCheck} className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </motion.div>

      {/* 6. Promotional News Cards */}
      <motion.div variants={cardVariants} layout className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-300 font-titles">الأخبار والعروض</span>
          <span className="text-[10px] text-slate-400 font-mono">Earthlink VIP</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-panel rounded-2xl p-3.5 border border-white/5 bg-gradient-to-br from-purple-950/30 to-black/40 flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white leading-tight font-titles">
                الإنترنت هنا سرعة حقيقية
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 font-hints">
                مو بس حجي! استمتع بأعلى استقرار وأقل بنغ للألعاب والتصفح.
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="glass-panel rounded-2xl p-3.5 border border-white/5 bg-gradient-to-br from-cyan-950/30 to-black/40 flex flex-col justify-between"
          >
            <div>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white leading-tight font-titles">
                تطبيق إيرثلنك المطور
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 font-hints">
                تابع رصيدك وحدث بياناتك وتواصل مباشرة مع الدعم الفني.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
