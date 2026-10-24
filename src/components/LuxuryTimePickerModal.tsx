import React, { useState } from 'react';
import { Clock, X, Check, Sparkles, Sun, Moon, Plus, Minus } from 'lucide-react';
import { playHapticSound, createClickRipple, triggerLuxuryCelebration } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';

interface LuxuryTimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialHour: string;
  initialMinute: string;
  initialPeriod: 'AM' | 'PM';
  onConfirm: (hour: string, minute: string, period: 'AM' | 'PM') => void;
}

const PRESET_TIMES = [
  { label: '08:00 ص', sub: 'الصباح', hour: '08', minute: '00', period: 'AM' as const },
  { label: '12:00 م', sub: 'الظهيرة', hour: '12', minute: '00', period: 'PM' as const },
  { label: '06:30 م', sub: 'المساء', hour: '06', minute: '30', period: 'PM' as const },
  { label: '09:00 م', sub: 'الليلة', hour: '09', minute: '00', period: 'PM' as const },
  { label: '11:59 م', sub: 'نهاية اليوم', hour: '11', minute: '59', period: 'PM' as const }
];

export const LuxuryTimePickerModal: React.FC<LuxuryTimePickerModalProps> = ({
  isOpen,
  onClose,
  initialHour,
  initialMinute,
  initialPeriod,
  onConfirm
}) => {
  const [hour, setHour] = useState<string>(initialHour || '08');
  const [minute, setMinute] = useState<string>(initialMinute || '30');
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialPeriod || 'PM');
  const [activeTab, setActiveTab] = useState<'hours' | 'minutes'>('hours');

  // Sync state if opened with new props
  React.useEffect(() => {
    if (isOpen) {
      setHour(initialHour || '08');
      setMinute(initialMinute || '30');
      setPeriod(initialPeriod || 'PM');
    }
  }, [isOpen, initialHour, initialMinute, initialPeriod]);

  if (!isOpen) return null;

  const hoursList = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutesQuickList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  const adjustMinute = (delta: number) => {
    playHapticSound('tap');
    let current = parseInt(minute, 10);
    if (isNaN(current)) current = 0;
    current = (current + delta + 60) % 60;
    setMinute(String(current).padStart(2, '0'));
  };

  const handleConfirm = (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    playHapticSound('success');
    triggerLuxuryCelebration();
    onConfirm(hour, minute, period);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Surface with Clay & Neu Depth */}
      <div
        className="w-full max-w-md clay-card bg-slate-950/95 border border-purple-500/35 rounded-t-[32px] sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-300 relative text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Shimmer sweep layer */}
        <div className="shimmer-sweep-layer" />

        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full opacity-70" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pt-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                <AnimatedIcon icon={Clock} size="sm" className="text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black text-white font-titles flex items-center gap-1.5">
                <span>تحديد وقت التنبيه بدقة</span>
                <AnimatedIcon icon={Sparkles} size="sm" className="text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400 font-hints">
                حدد الساعة والدقيقة والفترة لحفظ موعد التنبيه
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer tap-interactive"
          >
            <AnimatedIcon icon={X} size="sm" className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Live Digital Display & Period Switcher with neu-inset */}
        <div className="neu-inset p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-slate-900/70 to-black/90 border border-purple-500/30 flex flex-col items-center gap-3 relative z-10">
          <div className="flex items-center justify-center gap-3 w-full">
            {/* Hour Block */}
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                setActiveTab('hours');
              }}
              className={`flex-1 py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer tap-interactive ${
                activeTab === 'hours'
                  ? 'clay-btn bg-purple-600/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] ring-1 ring-purple-400'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] text-slate-400 block font-hints">الساعة</span>
              <span className="text-3xl font-black text-white font-numbers tracking-widest">{hour}</span>
            </button>

            {/* Separator */}
            <span className="text-2xl font-black text-purple-400 animate-pulse font-numbers">:</span>

            {/* Minute Block */}
            <button
              type="button"
              onClick={() => {
                playHapticSound('tap');
                setActiveTab('minutes');
              }}
              className={`flex-1 py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer tap-interactive ${
                activeTab === 'minutes'
                  ? 'clay-btn bg-cyan-600/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] text-slate-400 block font-hints">الدقيقة</span>
              <span className="text-3xl font-black text-white font-numbers tracking-widest">{minute}</span>
            </button>

            {/* Period Toggle AM / PM */}
            <div className="flex flex-col gap-1 w-24">
              <button
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('switch');
                  setPeriod('AM');
                }}
                className={`h-9 px-2 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles flex items-center justify-center gap-1.5 ${
                  period === 'AM'
                    ? 'clay-btn bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-950/50'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <AnimatedIcon icon={Sun} size="sm" className="text-amber-300" />
                <span>صباحاً</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('switch');
                  setPeriod('PM');
                }}
                className={`h-9 px-2 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles flex items-center justify-center gap-1.5 ${
                  period === 'PM'
                    ? 'clay-btn bg-purple-600 text-white font-black shadow-md shadow-purple-950/50'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <AnimatedIcon icon={Moon} size="sm" className="text-purple-200" />
                <span>مساءً</span>
              </button>
            </div>
          </div>

          {/* Quick Presets row */}
          <div className="w-full pt-1">
            <span className="text-[10px] text-slate-400 font-hints block mb-1.5">أوقات نموذجية سريعة:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PRESET_TIMES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    setHour(preset.hour);
                    setMinute(preset.minute);
                    setPeriod(preset.period);
                  }}
                  className={`soft-pill px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer tap-interactive border ${
                    hour === preset.hour && minute === preset.minute && period === preset.period
                      ? 'bg-purple-600/40 border-purple-400 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="font-numbers">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Selector: Hours vs Minutes with neu-card */}
        <div className="flex rounded-2xl bg-black/50 border border-white/10 p-1 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setActiveTab('hours');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles flex items-center justify-center gap-1.5 ${
              activeTab === 'hours'
                ? 'clay-btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AnimatedIcon icon={Clock} size="sm" className="text-purple-200" />
            <span>اختيار الساعة ({hour})</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setActiveTab('minutes');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all tap-interactive cursor-pointer font-titles flex items-center justify-center gap-1.5 ${
              activeTab === 'minutes'
                ? 'clay-btn bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AnimatedIcon icon={Sparkles} size="sm" className="text-cyan-200" />
            <span>اختيار الدقيقة ({minute})</span>
          </button>
        </div>

        {/* TAB 1: Hours Selection (01 to 12) */}
        {activeTab === 'hours' && (
          <div className="space-y-2 animate-in fade-in duration-200 relative z-10">
            <span className="text-[11px] text-slate-300 font-hints block">
              اختر الساعة (1 إلى 12):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {hoursList.map((hr) => {
                const isSelected = hr === hour;
                return (
                  <button
                    key={hr}
                    type="button"
                    onClick={(e) => {
                      createClickRipple(e);
                      playHapticSound('tap');
                      setHour(hr);
                      // Auto-advance to minute selection for fluid UX
                      setTimeout(() => setActiveTab('minutes'), 180);
                    }}
                    className={`h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer tap-interactive border text-base font-black font-numbers active:scale-95 ${
                      isSelected
                        ? 'clay-btn bg-gradient-to-tr from-purple-600 to-indigo-500 border-purple-400 text-white shadow-lg shadow-purple-950/60 ring-2 ring-purple-400/80 scale-[1.04]'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <span>{hr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Minutes Selection (00 to 55 + Stepper) */}
        {activeTab === 'minutes' && (
          <div className="space-y-3 animate-in fade-in duration-200 relative z-10">
            {/* Fine-Tuning Stepper Controls with neu-inset */}
            <div className="neu-inset flex items-center justify-between p-2.5 rounded-2xl bg-black/60 border border-white/10">
              <span className="text-xs text-slate-300 font-hints">ضبط الدقيقة بدقة:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustMinute(-1)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer tap-interactive border border-white/10 active:scale-90"
                  title="نقصان دقيقة"
                >
                  <AnimatedIcon icon={Minus} size="sm" className="text-white" />
                </button>
                <span className="w-12 text-center text-lg font-black text-cyan-300 font-numbers">
                  {minute}
                </span>
                <button
                  type="button"
                  onClick={() => adjustMinute(1)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer tap-interactive border border-white/10 active:scale-90"
                  title="زيادة دقيقة"
                >
                  <AnimatedIcon icon={Plus} size="sm" className="text-white" />
                </button>
              </div>
            </div>

            {/* Quick minute intervals chips */}
            <span className="text-[11px] text-slate-300 font-hints block">
              دقائق سريعة:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {minutesQuickList.map((min) => {
                const isSelected = min === minute;
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={(e) => {
                      createClickRipple(e);
                      playHapticSound('tap');
                      setMinute(min);
                    }}
                    className={`h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer tap-interactive border text-sm font-black font-numbers active:scale-95 ${
                      isSelected
                        ? 'clay-btn bg-gradient-to-tr from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/80 scale-[1.04]'
                        : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <span>{min}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleConfirm}
            className="clay-btn flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-black text-sm shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 tap-interactive cursor-pointer hover:brightness-110 font-titles"
          >
            <AnimatedIcon icon={Check} size="sm" className="text-white" />
            <span>
              اعتماد الوقت ({hour}:{minute} {period === 'AM' ? 'صباحاً' : 'مساءً'})
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onClose();
            }}
            className="h-12 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs tap-interactive cursor-pointer font-titles active:scale-95"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
