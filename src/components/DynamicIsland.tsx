import React, { useState, useEffect } from 'react';

interface DynamicIslandProps {
  isOnline: boolean;
  statusText: string;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ isOnline, statusText }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full pt-3 px-5 pb-2 flex items-center justify-between z-40 select-none">
      {/* 12-Hour System Clock */}
      <div className="text-xs font-bold tracking-wider font-clock tabular-nums opacity-90">
        {timeStr || '12:00:00 PM'}
      </div>

      {/* Dynamic Island Capsule */}
      <div className="relative bg-black/90 border border-white/15 h-7 px-3 rounded-full flex items-center gap-2.5 shadow-lg shadow-black/50 transition-all hover:scale-105">
        {/* Camera aperture simulation */}
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-950/60" />
        </div>
        
        {/* Pulsing connection dot */}
        <div className="relative flex items-center justify-center">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          <span
            className={`absolute w-3.5 h-3.5 rounded-full animate-ping opacity-75 ${
              isOnline ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
        </div>
      </div>

      {/* Connection status badge */}
      <div
        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors flex items-center gap-1.5 ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        <span className="uppercase tracking-wider">{statusText}</span>
      </div>
    </div>
  );
};
