import React, { useState } from 'react';
import { SubscriberData, AppTab } from '../types/earthlink';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';
import {
  X,
  User,
  Settings,
  Palette,
  MessageCircle,
  Share2,
  Info,
  LogOut,
  Send,
  Check,
  Copy,
  ExternalLink,
  ChevronLeft,
  Smartphone,
  Cpu,
  Sparkles
} from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onLogout: () => void;
  onOpenInstallModal?: () => void;
  data: SubscriberData;
  userAvatar?: string;
  userUUID: string;
  t: Record<string, string>;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onLogout,
  onOpenInstallModal,
  data,
  userAvatar,
  userUUID,
  t
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'contact' | 'social' | 'about'>('none');
  const [contactName, setContactName] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  if (!isOpen) return null;

  // Handle Contact Submission
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSendingContact(true);
    playHapticSound('send');

    try {
      const nowTimeStr = new Date().toLocaleString('ar-IQ');
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim() || data.fullName,
          message: contactMessage.trim(),
          subscriberUser: data.userID,
          userCode: userUUID,
          date: nowTimeStr
        })
      });

      setContactSent(true);
      triggerLuxuryCelebration();
      setTimeout(() => {
        setContactSent(false);
        setContactMessage('');
        setActiveModal('none');
      }, 3000);
    } catch {
      // Handled
    } finally {
      setIsSendingContact(false);
    }
  };

  const copyDiscordID = (e: React.MouseEvent<HTMLElement>) => {
    createClickRipple(e);
    navigator.clipboard.writeText('1487837632716079344');
    setCopiedDiscord(true);
    playHapticSound('tap');
    setTimeout(() => setCopiedDiscord(false), 3000);
  };

  return (
    <div className="absolute inset-0 z-50 flex justify-end animate-in fade-in duration-200 overflow-hidden">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Drawer Container with Clay & Neumorphic Edge */}
      <div className="relative w-80 max-w-[85vw] h-full bg-slate-950/95 border-l border-white/10 p-5 flex flex-col shadow-2xl z-10 backdrop-blur-2xl overflow-y-auto animate-in slide-in-from-right-8 duration-300">
        {/* Shimmer sweep layer */}
        <div className="shimmer-sweep-layer" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-md shadow-purple-950/50">
              <img
                src={userAvatar || data.accountImagePath || 'https://user.earthlink.iq/accountImages/138.png'}
                alt="User"
                className="w-full h-full rounded-[14px] object-cover bg-slate-900"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://user.earthlink.iq/accountImages/138.png';
                }}
              />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight font-titles">
                {data.fullName}
              </div>
              <div className="text-[11px] font-mono text-purple-400">
                @{data.userID}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => { createClickRipple(e); playHapticSound('tap'); onClose(); }}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer tap-interactive"
          >
            <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
          </button>
        </div>

        {/* Main Menu Links */}
        <div className="space-y-2 flex-1 relative z-10">
          {/* 0. تثبيت تطبيق أندرويد (APK) */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onClose();
              if (onOpenInstallModal) onOpenInstallModal();
            }}
            className="clay-btn w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25 hover:from-emerald-500/35 hover:to-cyan-500/35 text-white flex items-center justify-between transition-all border border-emerald-500/40 group cursor-pointer tap-interactive shadow-lg shadow-emerald-950/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
                <AnimatedIcon icon={Smartphone} size="sm" className="text-emerald-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black font-titles text-emerald-300">
                    تثبيت تطبيق أندرويد (APK)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-black rounded-full">
                    مباشر
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-hints block">
                  تثبيت كـ تطبيق أصلي للجوال
                </span>
              </div>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-emerald-400" />
          </button>

          {/* محرك الذكاء الاصطناعي (AI) */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onNavigateTab('ai');
              onClose();
            }}
            className="clay-btn w-full p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-white flex items-center justify-between transition-all border border-purple-500/30 group cursor-pointer tap-interactive"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-cyan-300 flex items-center justify-center border border-purple-400/30">
                <AnimatedIcon icon={Cpu} size="sm" className="text-cyan-300 animate-pulse" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-titles text-white block">
                  محرك الذكاء الاصطناعي (AI Brain)
                </span>
                <span className="text-[10px] text-purple-300 font-hints">
                  تحليل الباندويث ورادار أوقات الذروة
                </span>
              </div>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-purple-400" />
          </button>

          {/* 1. حسابي */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onNavigateTab('data');
              onClose();
            }}
            className="neu-card w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-between transition-colors group cursor-pointer tap-interactive border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <AnimatedIcon icon={User} size="sm" className="text-purple-400" />
              </div>
              <span className="text-xs font-bold font-titles">{t.myAccount}</span>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-slate-500" />
          </button>

          {/* 2. الإعدادات */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onNavigateTab('settings');
              onClose();
            }}
            className="neu-card w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-between transition-colors group cursor-pointer tap-interactive border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <AnimatedIcon icon={Settings} size="sm" className="text-cyan-400" />
              </div>
              <span className="text-xs font-bold font-titles">{t.appSettings}</span>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-slate-500" />
          </button>

          {/* 3. ثيمات فخمة */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              onNavigateTab('settings');
              onClose();
            }}
            className="neu-card w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-between transition-colors group cursor-pointer tap-interactive border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
                <AnimatedIcon icon={Palette} size="sm" className="text-pink-400" />
              </div>
              <span className="text-xs font-bold font-titles">{t.luxuryThemes} (12)</span>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-slate-500" />
          </button>

          {/* 4. تواصل مع الإدارة */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setActiveModal('contact');
            }}
            className="neu-card w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-between transition-colors group cursor-pointer tap-interactive border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <AnimatedIcon icon={MessageCircle} size="sm" className="text-amber-400" />
              </div>
              <span className="text-xs font-bold font-titles">{t.contactSupport}</span>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-slate-500" />
          </button>

          {/* 5. مواقع التواصل الاجتماعي */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setActiveModal('social');
            }}
            className="neu-card w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-between transition-colors group cursor-pointer tap-interactive border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <AnimatedIcon icon={Share2} size="sm" className="text-blue-400" />
              </div>
              <span className="text-xs font-bold font-titles">{t.socialMedia}</span>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-slate-500" />
          </button>

          {/* 6. حول التطبيق */}
          <button
            onClick={(e) => {
              createClickRipple(e);
              playHapticSound('tap');
              setActiveModal('about');
            }}
            className="neu-card w-full p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-between transition-colors group cursor-pointer tap-interactive border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <AnimatedIcon icon={Info} size="sm" className="text-emerald-400" />
              </div>
              <span className="text-xs font-bold font-titles">{t.aboutApp}</span>
            </div>
            <AnimatedIcon icon={ChevronLeft} size="sm" className="text-slate-500" />
          </button>
        </div>

        {/* User Unique Code Badge */}
        <div className="my-3 neu-inset p-3 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between relative z-10">
          <span className="text-[11px] text-slate-400 font-hints">معرفك الفريد:</span>
          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
            {userUUID}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={(e) => {
            createClickRipple(e);
            playHapticSound('tap');
            onLogout();
            onClose();
          }}
          className="clay-btn w-full p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer tap-interactive font-titles relative z-10"
        >
          <AnimatedIcon icon={LogOut} size="sm" className="text-rose-400" />
          <span>{t.logout}</span>
        </button>

        {/* Modal: Contact Form */}
        {activeModal === 'contact' && (
          <div className="absolute inset-0 bg-slate-950 p-5 flex flex-col z-20 overflow-y-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-titles">
                <AnimatedIcon icon={MessageCircle} size="sm" className="text-amber-400" />
                <span>{t.contactTitle}</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-hints">
              {t.contactSubtitle}
            </p>

            <form onSubmit={handleSubmitContact} className="space-y-3.5 flex-1 flex flex-col">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 font-titles">{t.yourName}</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t.yourNamePlaceholder}
                  className="neu-inset w-full h-11 rounded-xl bg-black/60 border border-white/10 px-3.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-300 font-titles">{t.yourMessage}</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={t.yourMessagePlaceholder}
                  required
                  rows={5}
                  className="neu-inset w-full flex-1 rounded-xl bg-black/60 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="neu-inset p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-hints">{t.yourUniqueCode}</span>
                <span className="font-mono text-cyan-400 font-bold">{userUUID}</span>
              </div>

              <button
                type="submit"
                disabled={isSendingContact}
                className="clay-btn w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all hover:brightness-110 cursor-pointer disabled:opacity-50 font-titles tap-interactive"
              >
                {isSendingContact ? (
                  <span>جاري الإرسال...</span>
                ) : contactSent ? (
                  <>
                    <AnimatedIcon icon={Check} size="sm" className="text-emerald-300" />
                    <span>تم إرسال رسالتك بنجاح!</span>
                  </>
                ) : (
                  <>
                    <AnimatedIcon icon={Send} size="sm" className="text-white" />
                    <span>{t.sendMessageBtn}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Modal: Social Channels */}
        {activeModal === 'social' && (
          <div className="absolute inset-0 bg-slate-950 p-5 flex flex-col z-20 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-titles">
                <AnimatedIcon icon={Share2} size="sm" className="text-blue-400" />
                <span>{t.socialMedia}</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@00.tnt"
                target="_blank"
                rel="noreferrer"
                className="clay-btn p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between text-white transition-all group tap-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-black">
                    TT
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-titles">TikTok</span>
                    <span className="text-[11px] text-pink-400 font-mono">@00.tnt</span>
                  </div>
                </div>
                <AnimatedIcon icon={ExternalLink} size="sm" className="text-slate-500" />
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/motrxvip"
                target="_blank"
                rel="noreferrer"
                className="clay-btn p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between text-white transition-all group tap-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
                    TG
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-titles">Telegram Channel</span>
                    <span className="text-[11px] text-sky-400 font-mono">@motrxvip</span>
                  </div>
                </div>
                <AnimatedIcon icon={ExternalLink} size="sm" className="text-slate-500" />
              </a>

              {/* Discord Profile */}
              <div
                onClick={copyDiscordID}
                className="clay-btn p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-between text-white transition-all cursor-pointer group tap-interactive"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                    DC
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-titles">Discord Account</span>
                    <span className="text-[11px] text-indigo-300 font-mono">1487837632716079344</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-white">
                  {copiedDiscord ? <AnimatedIcon icon={Check} size="sm" className="text-emerald-400" /> : <AnimatedIcon icon={Copy} size="sm" className="text-slate-400" />}
                  <span>{copiedDiscord ? 'تم النسخ!' : 'نسخ ID'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: About App */}
        {activeModal === 'about' && (
          <div className="absolute inset-0 bg-slate-950 p-5 flex flex-col z-20 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-titles">
                <AnimatedIcon icon={Info} size="sm" className="text-emerald-400" />
                <span>{t.aboutApp}</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="neu-card p-4 rounded-2xl bg-black/50 border border-white/10 text-center">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 mx-auto mb-2.5">
                  <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-xl font-black text-white">
                    EL
                  </div>
                </div>
                <h4 className="text-sm font-black text-white font-titles">Earthlink VIP Subscriber Portal</h4>
                <span className="text-[11px] text-purple-400 font-mono">{t.version}</span>
              </div>

              <p className="font-hints">{t.aboutDescription}</p>

              <div className="neu-inset p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-purple-200 font-hints">
                ⭐ <b>المميزات:</b> عداد مائي ثلاثي الأبعاد، ذكاء اصطناعي AI فائق، تحديث دائم للتوكن، إرسال تقارير منسقة للديسكورد وتلجرام، 12 ثيماً ملوكياً، وتصميم آيفون انسيابي فخم.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
