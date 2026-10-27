import React, { useState } from 'react';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { Wifi, User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, Radio } from 'lucide-react';
import { AnimatedIcon } from './AnimatedIcon';

interface LoginScreenProps {
  onLogin: (username: string, token: string) => void;
  t: Record<string, string>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, t }) => {
  const [username, setUsername] = useState(() => localStorage.getItem('EL_SAVED_USERNAME') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    playHapticSound('tap');

    try {
      const res = await fetch('/api/earthlink/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('EL_SAVED_USERNAME', username.trim());
        triggerLuxuryCelebration();
        onLogin(username.trim(), data.access_token);
      } else {
        const errorDetail = data.message || data.error_description || data.error || 'فشل تسجيل الدخول. يرجى التأكد من اسم المستخدم وكلمة المرور.';
        setErrorMsg(errorDetail);
        playHapticSound('tap');
      }
    } catch {
      setErrorMsg('تعذّر الاتصال بخادم إيرثلنك. يرجى التحقق من اتصال الشبكة والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background ambient orbs with dynamic gentle float */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-purple-600/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 rounded-full bg-cyan-600/25 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main Glassmorphic + Claymorphic Login Card */}
      <div className="w-full max-w-sm clay-card rounded-3xl p-6 shadow-2xl border border-white/15 relative z-10 transition-all duration-300 overflow-hidden bg-gradient-to-b from-purple-950/30 via-slate-900/60 to-black/85">
        {/* Shimmer sweep layer */}
        <div className="shimmer-sweep-layer" />

        {/* Emblem Header with Glowing Badge */}
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-purple-900/40 flex items-center justify-center transition-transform hover:scale-105 duration-300">
              <div className="w-full h-full rounded-[22px] bg-slate-950/85 backdrop-blur-md flex items-center justify-center text-white">
                <AnimatedIcon icon={Wifi} size="xl" className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
              </div>
            </div>
            {/* Pulsing online beacon */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm animate-ping opacity-75" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h2 className="text-2xl font-black text-white tracking-wide font-titles">
              {t.loginTitle}
            </h2>
            <AnimatedIcon icon={Sparkles} size="sm" className="text-amber-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px] leading-relaxed font-hints">
            {t.loginSubtitle}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-cyan-300 font-mono soft-pill">
            <AnimatedIcon icon={Radio} size="sm" className="text-cyan-400 animate-pulse" />
            <span>ubapi.earthlink.iq / Direct API</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium font-hints animate-in fade-in duration-200 relative z-10">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
          {/* Username Input with neu-inset */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block font-titles">
              {t.username}
            </label>
            <div className="neu-inset relative rounded-2xl overflow-hidden border border-white/10 bg-black/50">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <AnimatedIcon icon={User} size="sm" className="text-purple-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                required
                className="w-full h-12 bg-transparent pr-10 pl-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
              />
            </div>
          </div>

          {/* Password Input with neu-inset */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block font-titles">
              {t.password}
            </label>
            <div className="neu-inset relative rounded-2xl overflow-hidden border border-white/10 bg-black/50">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <AnimatedIcon icon={Lock} size="sm" className="text-purple-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full h-12 bg-transparent pr-10 pl-11 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  playHapticSound('tap');
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer active:scale-95"
              >
                {showPassword ? (
                  <AnimatedIcon icon={EyeOff} size="sm" className="text-slate-400" />
                ) : (
                  <AnimatedIcon icon={Eye} size="sm" className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Submit Button with clay-btn */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={(e) => createClickRipple(e)}
            className="clay-btn w-full h-13 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-xl shadow-purple-950/40 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-110 cursor-pointer disabled:opacity-60 tap-interactive font-titles"
          >
            {isLoading ? (
              <span>جاري التحقق والاتصال بسيرفر إيرثلنك...</span>
            ) : (
              <>
                <AnimatedIcon icon={ArrowRight} size="sm" className="text-white" />
                <span>{t.loginBtn}</span>
              </>
            )}
          </button>

          {/* Quick Demo Preview Button */}
          <button
            type="button"
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('success');
              triggerLuxuryCelebration();
              localStorage.setItem('EL_SAVED_USERNAME', 'erth_vip_preview');
              onLogin('erth_vip_preview', 'demo_jwt_token_vip_access');
            }}
            className="w-full h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>دخول تجريبي فوري وتصفح الواجهة (Demo VIP)</span>
          </button>

          {/* Security & Direct Connection Indicator */}
          <div className="neu-inset p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center gap-2 text-center text-slate-400 text-[11px] font-hints">
            <AnimatedIcon icon={ShieldCheck} size="sm" className="text-emerald-400 shrink-0" />
            <span>تسجيل دخول مباشر وجلسة مشفرة عبر API إيرثلنك الرسمي</span>
          </div>
        </form>
      </div>
    </div>
  );
};
