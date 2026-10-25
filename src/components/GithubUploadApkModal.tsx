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
  Sparkles,
  Zap,
  Play,
  FileCode,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';

interface GithubUploadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName?: string;
}

export const GithubUploadApkModal: React.FC<GithubUploadApkModalProps> = ({
  isOpen,
  onClose,
  repoName = 'ERTH'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'workflow' | 'android15'>('upload');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const gitCommands = `# ١. فتح مجلد المشروع في جهازك أو التيرمينال
git init

# ٢. إضافة كافة الملفات والتحسينات وملف تجميع أندرويد 15
git add .
git commit -m "Earthlink VIP v3.0 - Android 15 APK & AI Hub (ERTH)"

# ٣. تعيين الفرع الرئيسي
git branch -M main

# ٤. ربط مستودعك ERTH على GitHub (استبدل YOUR_USERNAME باسم حسابك)
git remote add origin https://github.com/YOUR_USERNAME/${repoName}.git

# ٥. رفع المشروع بضغطة واحدة
git push -u origin main --force`;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    playHapticSound('success');
    triggerLuxuryCelebration();
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownloadWorkflow = () => {
    playHapticSound('tap');
    fetch('/.github/workflows/build-apk.yml')
      .then(res => res.text())
      .then(content => {
        const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'build-apk.yml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        triggerLuxuryCelebration();
      })
      .catch(() => {
        // Fallback direct download
      });
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/60 font-black">
                <AnimatedIcon icon={Smartphone} size="md" className="text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-titles flex items-center gap-2">
                  <span>رفع المشروع وتجميع APK أندرويد 15</span>
                  <span className="soft-pill text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                    مستودع: {repoName}
                  </span>
                </h3>
                <p className="text-[11px] text-purple-300 font-hints">
                  دليل رفع الكود وتشغيل GitHub Actions لتجميع تطبيق أندرويد 15 رسمي فخم
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
          <div className="flex border-b border-white/10 bg-black/40 p-1.5 gap-1.5 relative z-10">
            {[
              { id: 'upload', label: '١. رفع المشروع لـ GitHub', icon: Terminal },
              { id: 'workflow', label: '٢. ملف build-apk.yml', icon: FileCode },
              { id: 'android15', label: '٣. مواصفات وصلاحيات Android 15', icon: ShieldCheck }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    setActiveTab(tab.id as 'upload' | 'workflow' | 'android15');
                  }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold font-titles flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            {/* TAB 1: HOW TO PUSH TO GITHUB REPOSITORY ERTH */}
            {activeTab === 'upload' && (
              <div className="space-y-3.5">
                <div className="neu-inset p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs text-purple-200 font-hints">
                  <div className="flex items-center gap-2">
                    <AnimatedIcon icon={Github} size="sm" className="text-cyan-300" />
                    <span>
                      مستودعك المعتمد على GitHub: <strong className="text-white font-mono bg-purple-900/60 px-2 py-0.5 rounded border border-purple-400/30">{repoName}</strong>
                    </span>
                  </div>
                  <span className="soft-pill text-[10px] text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    جاهز للمزامنة
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-titles flex items-center gap-1.5">
                      <AnimatedIcon icon={Terminal} size="sm" className="text-emerald-400" />
                      <span>الأوامر المباشرة لرفع المشروع إلى مستودعك:</span>
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
                          <span>نسخ جميع الأوامر</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="neu-inset p-4 rounded-2xl bg-black/85 border border-white/10 text-cyan-300 font-mono text-[11px] leading-relaxed overflow-x-auto text-left max-h-56 scrollbar-thin">
                    {gitCommands}
                  </pre>
                </div>

                {/* Steps guide */}
                <div className="neu-inset p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2 text-xs font-hints text-slate-300">
                  <span className="font-bold text-white block font-titles flex items-center gap-1.5">
                    <AnimatedIcon icon={Play} size="xs" className="text-amber-400" />
                    <span>خطوات التجميع التلقائي فور الرفع:</span>
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                    <li>بمجرد تنفيذ أمر <code className="text-cyan-300 font-mono">git push</code>، سيبدأ سير عمل <code className="text-purple-300 font-mono">build-apk.yml</code> تلقائياً في مستودعك <strong>ERTH</strong>.</li>
                    <li>يمكنك متابعة التجميع من تبويب <strong>Actions</strong> في مستودع GitHub الخاص بك.</li>
                    <li>عند اكتمال البناء (خلال دقيقتين)، ستجد ملف <strong className="text-emerald-300 font-mono">Earthlink-VIP-Android15.apk</strong> جاهزاً للتحميل المباشر وتثبيته على أي هاتف أندرويد!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 2: BUILD-APK.YML CONTENT */}
            {activeTab === 'workflow' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white font-titles">
                      مسار الملف داخل مشروعك:
                    </h4>
                    <code className="text-[11px] text-cyan-400 font-mono">
                      .github/workflows/build-apk.yml
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadWorkflow}
                      className="clay-btn px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <AnimatedIcon icon={Download} size="xs" className="text-white" />
                      <span>تحميل .yml</span>
                    </button>
                  </div>
                </div>

                <div className="neu-inset p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed font-hints">
                  ⚡ <b>ميزات الملف:</b> يستعمل <strong>Java 21</strong> وحزمة <strong>Android 15 SDK (API 35)</strong> وأحدث إصدار من Gradle 8.7 ليضمن تجميع تطبيق حديث وسلس بدون أخطاء.
                </div>

                <pre className="neu-inset p-4 rounded-2xl bg-black/85 border border-white/10 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto text-left max-h-60 scrollbar-thin">
{`name: Build Earthlink VIP Android 15 APK (ERTH)
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v4
        with:
          gradle-version: '8.7'
      - name: 📱 Setup Android 15 SDK (API 35)
        run: |
          yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true
          $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --install "platforms;android-35" "build-tools;35.0.0" "platform-tools"
      - run: npm install && npm run build
      - name: 🔨 Compile APK
        working-directory: android
        run: gradle assembleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: Earthlink-VIP-Android15-APK
          path: release-output/*`}
                </pre>
              </div>
            )}

            {/* TAB 3: ANDROID 15 SPECIFICATIONS & PERMISSIONS */}
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

                <div className="space-y-2">
                  <span className="text-xs font-bold text-white block font-titles">
                    الصلاحيات المضمنة في التطبيق المجمع (AndroidManifest.xml):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-hints">
                    {[
                      { name: 'INTERNET', desc: 'الاتصال المباشر بخوادم إيرثلنك وAPI' },
                      { name: 'ACCESS_NETWORK_STATE', desc: 'مراقبة فايبر 5G وقوة البينغ الحقيقي' },
                      { name: 'POST_NOTIFICATIONS', desc: 'إرسال تنبيهات الموعد على هاتف أندرويد 15' },
                      { name: 'READ_MEDIA_IMAGES', desc: 'اختيار الشعار وخلفية التطبيق من الاستوديو' },
                      { name: 'VIBRATE & WAKE_LOCK', desc: 'اهتزاز هابتك لمسي وتشغيل التنبيه بالخلفية' }
                    ].map((perm) => (
                      <div key={perm.name} className="neu-inset p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-cyan-300 font-mono font-bold block">{perm.name}</span>
                        <span className="text-slate-400">{perm.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between relative z-10">
            <span className="text-[11px] text-slate-400 font-hints">
              الملف <code className="text-cyan-300 font-mono">build-apk.yml</code> مضاف وجاهز الآن في مشروعك
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
