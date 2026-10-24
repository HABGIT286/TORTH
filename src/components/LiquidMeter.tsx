import React from 'react';

interface LiquidMeterProps {
  daysLeft: number;
  totalDays?: number;
  expirationDate: string;
  daysLabel: string;
  expiresLabel: string;
}

export const LiquidMeter: React.FC<LiquidMeterProps> = ({
  daysLeft,
  totalDays = 30,
  expirationDate,
  daysLabel,
  expiresLabel
}) => {
  // Clamp percentage between 8% and 94% so it's always aesthetically visible
  const fillPercent = Math.min(Math.max((daysLeft / totalDays) * 100, 8), 94);
  // Bottom offset mapping
  const bottomOffset = -115 + (fillPercent * 1.15);

  return (
    <div className="flex flex-col items-center justify-center my-3 select-none">
      {/* 3D Liquid Sphere Container */}
      <div className="relative w-44 h-44 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900/90 to-black/95 transition-transform hover:scale-105 duration-300">
        {/* Glow ambient circle */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-40 blur-md"
          style={{ background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)' }}
        />

        {/* Liquid Wave Layer 1 (Primary Wave) */}
        <div
          className="liquid-wave-layer-1 absolute -left-1/2 w-[200%] h-[200%] rounded-[40%] transition-all duration-1000 ease-out"
          style={{
            bottom: `${bottomOffset}%`,
            background: 'linear-gradient(45deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            opacity: 0.85
          }}
        />

        {/* Liquid Wave Layer 2 (Secondary Wave with translucent foam highlight) */}
        <div
          className="liquid-wave-layer-2 absolute -left-1/2 w-[200%] h-[200%] rounded-[43%] transition-all duration-1000 ease-out"
          style={{
            bottom: `${bottomOffset + 3}%`,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, var(--color-primary) 60%, var(--color-accent) 100%)',
            opacity: 0.55
          }}
        />

        {/* Glass Specular Glare (Top-Curved Highlight) */}
        <div className="absolute top-2 left-6 right-6 h-14 rounded-[50%] bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none blur-[0.5px]" />
        
        {/* Inner Radial Shadow for 3D depth */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.85)] pointer-events-none" />

        {/* Foreground Information */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          <span className="text-5xl font-black font-numbers tracking-tight text-white leading-none">
            {daysLeft}
          </span>
          <span className="text-xs font-bold text-white/95 mt-1 uppercase tracking-wider font-titles">
            {daysLabel}
          </span>
          <span className="text-[10px] text-white/80 font-numbers mt-0.5">
            {Math.round(fillPercent)}%
          </span>
        </div>
      </div>

      {/* Expiry Date Display */}
      <div className="mt-3.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5 backdrop-blur-md">
        <span className="text-slate-400 font-hints">{expiresLabel}:</span>
        <span className="font-semibold text-white tracking-wide font-numbers">
          {expirationDate}
        </span>
      </div>
    </div>
  );
};
