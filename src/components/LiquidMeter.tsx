import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface LiquidMeterProps {
  daysLeft: number;
  totalDays?: number;
  expirationDate: string;
  daysLabel: string;
  expiresLabel: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const LiquidMeter: React.FC<LiquidMeterProps> = ({
  daysLeft,
  totalDays = 30,
  expirationDate,
  daysLabel,
  expiresLabel,
}) => {
  // حساب نسبة امتلاء السائل بدقة 100% حسب عدد الأيام (سائل راكد مستقر)
  const rawPercent = (daysLeft / totalDays) * 100;
  const clampedPercent = Math.min(100, Math.max(0, rawPercent));

  // لون مائي واحد موحد وفخم (أزرق سماوي كريستالي نقي بدون دوران وبدون تداخل ألوان)
  const singleFluidColor = 'linear-gradient(180deg, #00d2ff 0%, #0091ff 45%, #0055d4 100%)';
  const surfaceGlowColor = '#00f0ff';

  return (
    <div className="flex flex-col items-center justify-center my-4 select-none relative">
      {/* الإطار الخارجي الهادئ للكرة */}
      <div className="relative p-2 rounded-full">
        <div
          className="absolute inset-0 rounded-full border border-cyan-400/30 shadow-[0_0_20px_rgba(0,240,255,0.25)]"
        />

        {/* الحاوية الزجاجية الكروية ثلاثية الأبعاد (3D Glass Sphere) */}
        <div
          className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)] border-2 border-cyan-400/40 select-none"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #0d1527 0%, #040814 65%, #010308 100%)',
            boxShadow: '0 0 30px rgba(0,240,255,0.25), inset 0 0 35px rgba(0,0,0,0.95)'
          }}
        >
          {/* عمق الظل الداخلي للزجاج */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_8px_20px_rgba(0,0,0,0.95)] z-20 pointer-events-none" />

          {/* لمعان وانعكاس زجاجي نقي في أعلى الكرة */}
          <div className="absolute top-2 left-8 right-8 h-12 rounded-[50%] bg-gradient-to-b from-white/35 via-white/5 to-transparent pointer-events-none z-30 blur-[0.5px]" />
          
          {/* انعكاس زجاجي ناعم في أسفل الكرة */}
          <div className="absolute bottom-2 left-10 right-10 h-5 rounded-[50%] bg-gradient-to-t from-white/15 to-transparent pointer-events-none z-30 blur-[1px]" />

          {/* سائل راكد ومستقر بلون واحد نقي (يرتفع وينخفض بدقة حسب الأيام فقط دون دوران) */}
          <motion.div
            className="absolute left-0 right-0 bottom-0 z-10 transition-all duration-700 ease-out"
            style={{
              height: `${clampedPercent}%`,
              background: singleFluidColor,
              boxShadow: `0 -4px 20px rgba(0, 240, 255, 0.45)`
            }}
          >
            {/* خط سطح السائل المستقر الراكد (Meniscus Surface Line) */}
            {clampedPercent > 0 && (
              <div
                className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-200/90 shadow-[0_0_10px_#00f0ff]"
                style={{
                  boxShadow: `0 0 12px ${surfaceGlowColor}`
                }}
              />
            )}
          </motion.div>

          {/* الشاشة المركزية للأيام والنسبة */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center pointer-events-none">
            <div className="flex items-baseline justify-center">
              <motion.span
                key={daysLeft}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-5xl sm:text-6xl font-black font-numbers tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
              >
                {daysLeft}
              </motion.span>
            </div>

            <span className="text-xs font-bold text-white uppercase tracking-wider font-titles drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-0.5">
              {daysLabel}
            </span>

            {/* شارة نسبة الامتلاء */}
            <span
              className="mt-1 px-3 py-0.5 rounded-full text-[10px] font-mono font-black border border-cyan-400/50 bg-black/60 text-cyan-200 backdrop-blur-md shadow-md"
            >
              {Math.round(clampedPercent)}% ممتلئ
            </span>
          </div>
        </div>
      </div>

      {/* كبسولة تاريخ انتهاء الاشتراك */}
      <div className="mt-3.5 px-4 py-2 rounded-2xl bg-black/60 border border-white/10 text-xs text-slate-300 flex items-center justify-between gap-3 backdrop-blur-xl shadow-lg w-full max-w-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-hints">{expiresLabel}:</span>
            <span className="font-bold text-white tracking-wide font-mono text-[11px]">
              {expirationDate || '—'}
            </span>
          </div>
        </div>

        <div className="text-left font-mono text-[11px] font-bold text-cyan-300">
          {daysLeft > 0 ? `${daysLeft} يوم` : 'منتهي'}
        </div>
      </div>
    </div>
  );
};
