import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  X,
  Copy,
  Check,
  Download,
  Terminal,
  Smartphone,
  ShieldCheck,
  Globe,
  ExternalLink,
  Sparkles,
  Zap,
  Play,
  FileCode,
  CheckCircle2,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';

interface GithubUploadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
  githubUsername?: string;
}

export const GithubUploadApkModal: React.FC<GithubUploadApkModalProps> = ({
  isOpen,
  onClose,
  repoName = 'TORTH',
  githubUsername = 'HABGIT286'
}) => {
  const [activeTab, setActiveTab] = useState<'liveSite' | 'standaloneHtml' | 'upload' | 'workflow' | 'android15' | 'dartFile'>('standaloneHtml');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [customUser, setCustomUser] = useState<string>(githubUsername);
  const [customRepo, setCustomRepo] = useState<string>(repoName);

  const livePagesUrl = `https://${customUser.toLowerCase()}.github.io/${customRepo}/`;
  const repoSettingsUrl = `https://github.com/${customUser}/${customRepo}/settings/pages`;

  const gitCommands = `# ١. إضافة الملفات الجديدة ومنها إعدادات الموقع الحي (deploy-pages.yml و vite.config)
git add .
git commit -m "feat: enable GitHub Pages live site & Android 15 APK support"

# ٢. رفع التحديثات إلى مستودعك على GitHub
git push origin main`;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    playHapticSound('success');
    triggerLuxuryCelebration();
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownloadWorkflow = () => {
    playHapticSound('tap');
    fetch('/.github/workflows/deploy-pages.yml')
      .then(res => res.text())
      .then(content => {
        const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deploy-pages.yml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        triggerLuxuryCelebration();
      })
      .catch(() => {});
  };

  const handleDownloadDartFile = () => {
    playHapticSound('tap');
    const a = document.createElement('a');
    a.href = '/earthlink_vip_app.dart';
    a.download = 'earthlink_vip_app.dart';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerLuxuryCelebration();
  };

  const handleDownloadStandaloneHtml = () => {
    playHapticSound('tap');
    const a = document.createElement('a');
    a.href = '/standalone_index.html';
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerLuxuryCelebration();
  };

  const handleDownloadFlutterZip = () => {
    playHapticSound('tap');
    const a = document.createElement('a');
    a.href = '/flutter_earthlink_app.zip';
    a.download = 'flutter_earthlink_app.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerLuxuryCelebration();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        {/* Backdrop Dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-xl max-h-[92vh] clay-card bg-gradient-to-b from-[#120824] via-[#090414] to-black rounded-3xl border border-purple-500/40 shadow-2xl flex flex-col overflow-hidden text-right select-none relative z-10"
          dir="rtl"
        >
          {/* Shimmer sweep layer */}
          <div className="shimmer-sweep-layer" />

          {/* Modal Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-950/60 font-black">
                <AnimatedIcon icon={Globe} size="md" className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-titles flex items-center gap-2">
                  <span>الموقع الحي وتطبيق APK وملف index.html الشامل</span>
                  <span className="soft-pill text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                    {customRepo}
                  </span>
                </h3>
                <p className="text-[11px] text-purple-300 font-hints">
                  تشغيل الموقع كملف HTML مستقل كامل، وتطبيق أندرويد وملف دارت
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <AnimatedIcon icon={X} size="sm" className="text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-black/40 p-1.5 gap-1 relative z-10 overflow-x-auto scrollbar-none">
            {[
              { id: 'standaloneHtml', label: '📄 ملف index.html المستقل', icon: FileCode },
              { id: 'liveSite', label: '🌐 فتح الموقع الحي', icon: Globe },
              { id: 'dartFile', label: '🐦 كود Dart فلاتر', icon: Sparkles },
              { id: 'upload', label: '📤 رفع التحديثات', icon: Terminal },
              { id: 'workflow', label: '⚙️ ملفات Pages & APK', icon: FileCode },
              { id: 'android15', label: '📱 تطبيق Android 15', icon: Smartphone }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    setActiveTab(tab.id as 'liveSite' | 'upload' | 'workflow' | 'android15' | 'dartFile');
                  }}
                  className={`flex-1 min-w-[95px] py-2 px-2 rounded-xl text-xs font-bold font-titles flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'clay-btn bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <AnimatedIcon icon={Icon} size="xs" className={isSelected ? 'text-white' : 'text-slate-400'} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 max-h-[58vh] relative z-10">
            {/* TAB: STANDALONE SINGLE-FILE INDEX.HTML */}
            {activeTab === 'standaloneHtml' && (
              <div className="space-y-4">
                <div className="neu-inset p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900/60 border border-cyan-500/40 space-y-1.5 text-xs font-hints text-cyan-200">
                  <div className="flex items-center gap-2 font-bold text-white font-titles text-[13px]">
                    <AnimatedIcon icon={FileCode} size="sm" className="text-cyan-400" />
                    <span>نسخة الموقع المستقلة كملف index.html شامل واحد</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    تم إنشاء نسخة كاملة ومستقلة تماماً من موقعك في ملف <strong>index.html</strong> واحد يتضمن كل شيء: التصميم الزجاجي الفاخر، القائمة الجانبية V3، العداد المائي، تسجيل الدخول واتصالات إيرثلنك المباشرة، فاحص الذكاء الاصطناعي، وتبديل الثيمات، دون الحاجة لأي Node.js أو سيرفر خارجي!
                  </p>
                </div>

                <div className="clay-card p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-titles">خيارات استخدام وتشغيل ملف index.html:</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20">جاهز للتحميل</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={handleDownloadStandaloneHtml}
                      className="clay-btn p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل ملف index.html فوراً</span>
                    </button>

                    <a
                      href="/standalone_index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clay-btn p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                    >
                      <ExternalLink className="w-4 h-4 text-cyan-400" />
                      <span>معاينة وفتح الموقع في تبويب جديد</span>
                    </a>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px] text-slate-400">
                    <div className="text-white font-bold flex items-center gap-1.5 font-titles">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>كيف تستخدم هذا الملف على GitHub؟</span>
                    </div>
                    <p className="leading-relaxed">
                      ١. حمّل الملف باسم <strong>index.html</strong>.<br />
                      ٢. ضعه مباشرة في المجلد الرئيسي لمستودعك على GitHub.<br />
                      ٣. سيعمل موقعك مباشرة فوراً عند فتحه أو عبر GitHub Pages!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: HOW TO MAKE LIVE SITE (GITHUB PAGES) */}
            {activeTab === 'liveSite' && (
              <div className="space-y-4">
                {/* Explanation Banner */}
                <div className="neu-inset p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1.5 text-xs font-hints text-cyan-200">
                  <div className="flex items-center gap-2 font-bold text-cyan-100 font-titles text-[13px]">
                    <AnimatedIcon icon={Sparkles} size="sm" className="text-cyan-400" />
                    <span>لماذا لا يفتح الموقع بمجرد رفع الملفات على GitHub؟</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    مستودع GitHub مصمم كحاوية لحفظ الأكواد البرمجية وليس كموقع ويب مباشر تلقائياً. ليتحول كودك إلى موقع حي مفتوح للعالم، يوفر GitHub خدمة مجانية تسمى <strong>GitHub Pages</strong> تحتاج فقط تفعيلها بـ 3 خطوات بسيطة في الإعدادات!
                  </p>
                </div>

                {/* Expected Live URL Box */}
                <div className="clay-card p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                  <span className="text-xs font-bold text-white font-titles flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AnimatedIcon icon={Globe} size="xs" className="text-emerald-400" />
                      <span>رابط موقعك الحي بعد التفعيل:</span>
                    </span>
                    <span className="soft-pill text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      مجاني ودائم
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={livePagesUrl}
                      className="flex-1 neu-inset px-3 py-2 rounded-xl bg-black/80 border border-purple-500/30 text-emerald-300 font-mono text-xs text-left"
                    />
                    <button
                      onClick={() => copyText(livePagesUrl, 'live-url')}
                      className="clay-btn px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedSection === 'live-url' ? (
                        <>
                          <AnimatedIcon icon={Check} size="xs" className="text-emerald-300" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <AnimatedIcon icon={Copy} size="xs" className="text-white" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Steps to activate in GitHub Settings */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white font-titles flex items-center gap-1.5">
                    <AnimatedIcon icon={Settings} size="xs" className="text-amber-400" />
                    <span>خطوات تفعيل الموقع في مستودعك (3 خطوات فقط):</span>
                  </h4>

                  <div className="space-y-2 text-xs font-hints">
                    <div className="neu-inset p-3 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600/40 text-purple-200 font-bold flex items-center justify-center shrink-0 text-xs">
                        ١
                      </span>
                      <div className="space-y-1">
                        <span className="font-bold text-white block">الدخول إلى إعدادات المستودع (Settings)</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          افتح مستودعك <code className="text-cyan-300 font-mono">{customRepo}</code> على GitHub، ثم اضغط على زر <strong>Settings ⚙️</strong> الموجود في الشريط العلوي للمستودع.
                        </p>
                      </div>
                    </div>

                    <div className="neu-inset p-3 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600/40 text-purple-200 font-bold flex items-center justify-center shrink-0 text-xs">
                        ٢
                      </span>
                      <div className="space-y-1">
                        <span className="font-bold text-white block">اختيار تبويب Pages</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          من القائمة الجانبية اليسرى داخل الإعدادات، انزل قليلاً واضغط على <strong>Pages</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="neu-inset p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-600/40 text-emerald-200 font-bold flex items-center justify-center shrink-0 text-xs">
                        ٣
                      </span>
                      <div className="space-y-1">
                        <span className="font-bold text-emerald-300 block">اختيار Source: GitHub Actions</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          تحت قسم <strong>Build and deployment</strong>، في قائمة <strong>Source</strong>، قم باختيار: <strong className="text-white bg-purple-900/50 px-1.5 py-0.5 rounded font-mono">GitHub Actions</strong>.
                        </p>
                        <p className="text-[10px] text-cyan-300 font-semibold mt-1">
                          ✨ قمنا بإضافة ملف <code className="font-mono">deploy-pages.yml</code> في مشروعك؛ بمجرد اختيار GitHub Actions سيبدأ البناء تلقائياً ويصبح الموقع حياً خلال دقيقة واحدة!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternative 1-click free platforms (Vercel & Netlify) */}
                <div className="neu-inset p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                  <span className="text-xs font-bold text-purple-200 font-titles flex items-center gap-1.5">
                    <AnimatedIcon icon={Zap} size="xs" className="text-amber-400" />
                    <span>طريقة بديلة فورية (نشر بضغطة زر واحدة عبر Vercel أو Netlify):</span>
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-hints">
                    يمكنك أيضاً فتح موقع مجاني فائق السرعة عبر ربط مستودعك بـ <strong>Vercel</strong>:
                    ادخل إلى <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-bold underline inline-flex items-center gap-0.5 mr-1">vercel.com/new <ArrowUpRight className="w-3 h-3 inline" /></a> ثم اختر مستودعك <code className="text-purple-300 font-mono">{customRepo}</code> واضغط <strong>Deploy</strong> ليفتح موقعك فوراً.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: PUSH RECENT UPDATES */}
            {activeTab === 'upload' && (
              <div className="space-y-3.5">
                <div className="neu-inset p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs text-purple-200 font-hints">
                  <div className="flex items-center gap-2">
                    <AnimatedIcon icon={Github} size="sm" className="text-cyan-300" />
                    <span>
                      مستودعك: <strong className="text-white font-mono bg-purple-900/60 px-2 py-0.5 rounded border border-purple-400/30">{customUser}/{customRepo}</strong>
                    </span>
                  </div>
                  <span className="soft-pill text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    محدث وجاهز
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-titles flex items-center gap-1.5">
                      <AnimatedIcon icon={Terminal} size="sm" className="text-emerald-400" />
                      <span>أمر رفع إعدادات تشغيل الموقع وملف APK:</span>
                    </span>

                    <button
                      onClick={() => copyText(gitCommands, 'git-cmds')}
                      className="clay-btn px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedSection === 'git-cmds' ? (
                        <>
                          <AnimatedIcon icon={Check} size="xs" className="text-emerald-400" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <AnimatedIcon icon={Copy} size="xs" className="text-slate-300" />
                          <span>نسخ الأوامر</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="neu-inset p-4 rounded-2xl bg-black/85 border border-white/10 text-cyan-300 font-mono text-[11px] leading-relaxed overflow-x-auto text-left max-h-56 scrollbar-thin">
                    {gitCommands}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: WORKFLOW FILES */}
            {activeTab === 'workflow' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="neu-inset p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                    <span className="font-bold text-cyan-300 block font-titles">🌐 ملف نشر الموقع الحي:</span>
                    <code className="text-[11px] text-white font-mono block">.github/workflows/deploy-pages.yml</code>
                    <span className="text-[10px] text-slate-400 font-hints block">يبني الموقع ويرفعه مباشرة لـ GitHub Pages</span>
                  </div>

                  <div className="neu-inset p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                    <span className="font-bold text-purple-300 block font-titles">📱 ملف تجميع أندرويد 15:</span>
                    <code className="text-[11px] text-white font-mono block">.github/workflows/build-apk.yml</code>
                    <span className="text-[10px] text-slate-400 font-hints block">يبني تطبيق APK رسمي جاهز لهواتف أندرويد</span>
                  </div>
                </div>

                <div className="neu-inset p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed font-hints">
                  💎 <b>تعديل مهم:</b> تم تعديل إعدادات Vite بوضع <code className="text-cyan-300 font-mono">base: './'</code> لضمان فتح الموقع وكافة الأيقونات والتصميم الفخم على أي رابط بدون شاشة بيضاء.
                </div>
              </div>
            )}

            {/* TAB: DART FLUTTER ALL-IN-ONE */}
            {activeTab === 'dartFile' && (
              <div className="space-y-3">
                <div className="neu-inset p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 font-hints leading-relaxed">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-white text-sm font-titles">
                    <AnimatedIcon icon={Sparkles} size="sm" className="text-cyan-300" />
                    <span>تطبيق إيرثلنك VIP كامل بملف Dart واحد (Flutter Native)</span>
                  </div>
                  تمت برمجة التطبيق بالكامل داخل ملف واحد <code className="text-cyan-300 font-mono">earthlink_vip_app.dart</code> يحتوي على العداد المائي، قسم الذكاء الاصطناعي، فحص السرعة، والقائمة الجانبية الفاخرة!
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadDartFile}
                    className="clay-btn p-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>تحميل ملف earthlink_vip_app.dart</span>
                  </button>

                  <button
                    onClick={handleDownloadFlutterZip}
                    className="clay-btn p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>تحميل مشروع Flutter كامل (.zip)</span>
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-hints text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-titles">مسار الملف داخل مشروعك:</span>
                    <button
                      onClick={() => copyText('flutter_earthlink_app/lib/earthlink_vip_app.dart', 'dartPath')}
                      className="text-[10px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSection === 'dartPath' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'dartPath' ? 'تم النسخ' : 'نسخ المسار'}</span>
                    </button>
                  </div>
                  <code className="text-[11px] text-cyan-300 font-mono block bg-white/5 p-1.5 rounded-lg text-left" dir="ltr">
                    flutter_earthlink_app/lib/earthlink_vip_app.dart
                  </code>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    🚀 <b>للتجميع كـ APK أصلي فلاتر:</b> شغّل الإجراء الجديد <code className="text-purple-300 font-mono">Build Flutter VIP Android APK</code> عبر تبويب Actions في جيت هاب وسيتم إخراج الـ APK فوراً.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: ANDROID 15 SPECIFICATIONS */}
            {activeTab === 'android15' && (
              <div className="space-y-3">
                <div className="neu-inset p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-hints">
                  💎 <b>مواصفات تجميع أندرويد 15 (Android 15 - Vanilla Ice Cream):</b>
                  <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                      <span className="text-slate-400 block font-hints">Target SDK:</span>
                      <span className="text-white font-bold">API 35 (Android 15)</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                      <span className="text-slate-400 block font-hints">JDK Version:</span>
                      <span className="text-white font-bold">Java 21 Temurin</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                      <span className="text-slate-400 block font-hints">Min SDK:</span>
                      <span className="text-white font-bold">API 26 (Android 8.0+)</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/50 border border-white/5">
                      <span className="text-slate-400 block font-hints">Gradle Engine:</span>
                      <span className="text-white font-bold">Gradle 8.7 + AGP 8.5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between relative z-10">
            <span className="text-[11px] text-slate-400 font-hints">
              ملفات التشغيل جاهزة في مشروعك الآن
            </span>
            <button
              onClick={(e) => {
                createClickRipple(e);
                playHapticSound('tap');
                onClose();
              }}
              className="clay-btn px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all font-titles cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
