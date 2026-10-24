import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  X,
  Copy,
  Check,
  FileCode,
  Key,
  ShieldCheck,
  Sparkles,
  Zap,
  Server
} from 'lucide-react';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { AnimatedIcon } from './AnimatedIcon';

interface GitHubAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: number;
  selectedHour: string;
  selectedMinute: string;
  selectedPeriod: 'AM' | 'PM';
  selectedChannel: 'both' | 'telegram' | 'discord';
}

export const GitHubAutomationModal: React.FC<GitHubAutomationModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  selectedHour,
  selectedMinute,
  selectedPeriod,
  selectedChannel
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'script' | 'secrets'>('workflow');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

  const workflowYmlContent = `name: Earthlink 24/7 Subscriber Alert Dispatcher

# يعمل هذا الملف طوال الوقت (24/7) على سحابة GitHub Actions
# حتى لو قمت بإغلاق موقع إيرثلنك أو أغلقت هاتفك أو حاسوبك
# حيث يتصل مباشرة بخوادم إيرثلنك ويجلب البيانات ويرسلها في موعدك المحدد

on:
  schedule:
    # يعمل تلقائياً كل ساعة لفحص موعد التنبيه والأيام المتبقية
    - cron: '0 * * * *'
  workflow_dispatch:
    inputs:
      force_send:
        description: 'إرسال التنبيه فوراً الآن وتخطي انتظار الموعد'
        required: true
        type: boolean
        default: true

jobs:
  check-and-dispatch:
    name: Fetch Live Earthlink Data & Dispatch Alerts
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout Repository Code
        uses: actions/checkout@v4

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Execute Live Earthlink Alert Runner
        run: node scripts/github_alert_runner.js
        env:
          # بيانات حساب إيرثلنك من أسرار المستودع
          EARTHLINK_USERNAME: \${{ secrets.EARTHLINK_USERNAME }}
          EARTHLINK_PASSWORD: \${{ secrets.EARTHLINK_PASSWORD }}
          EARTHLINK_TOKEN: \${{ secrets.EARTHLINK_TOKEN }}

          # قنوات الإرسال المحددة
          DISCORD_WEBHOOK: \${{ secrets.DISCORD_WEBHOOK }}
          TELEGRAM_TOKEN: \${{ secrets.TELEGRAM_TOKEN }}
          TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}

          # إعدادات التنبيه المحددة من قبلك
          ALERT_DAY: \${{ secrets.ALERT_DAY || '${selectedDay}' }}
          ALERT_TIME: \${{ secrets.ALERT_TIME || '${formattedTime}' }}
          ALERT_CHANNEL: \${{ secrets.ALERT_CHANNEL || '${selectedChannel}' }}
          ALERT_DAYS_LEFT_THRESHOLD: \${{ secrets.ALERT_DAYS_LEFT_THRESHOLD || '3' }}

          FORCE_SEND: \${{ inputs.force_send || 'false' }}
          TIMEZONE: 'Asia/Baghdad'
`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    playHapticSound('success');
    triggerLuxuryCelebration();
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          {/* Backdrop Dismiss */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-xl max-h-[90vh] clay-card bg-gradient-to-b from-slate-900 via-[#0b0816] to-black rounded-3xl border border-purple-500/40 shadow-2xl flex flex-col overflow-hidden text-right select-none relative z-10"
            dir="rtl"
          >
            {/* Shimmer sweep layer */}
            <div className="shimmer-sweep-layer" />

            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/50">
                  <AnimatedIcon icon={Github} size="md" className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-titles flex items-center gap-2">
                    <span>تشغيل التنبيهات 24/7 عبر GitHub Actions</span>
                    <AnimatedIcon icon={Sparkles} size="sm" className="text-amber-400" />
                  </h3>
                  <p className="text-[11px] text-purple-300 font-hints">
                    ملف أتمتة يعمل تلقائياً في السحابة حتى لو أغلقت الموقع أو الهاتف
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
                { id: 'workflow', label: 'ملف الأتمتة (.yml)', icon: FileCode },
                { id: 'secrets', label: 'المتغيرات والأسرار (Secrets)', icon: Key },
                { id: 'script', label: 'السكريبت (Runner)', icon: Zap }
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      createClickRipple(e);
                      playHapticSound('tap');
                      setActiveTab(tab.id as 'workflow' | 'script' | 'secrets');
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-titles flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'clay-btn bg-purple-600 text-white shadow-md shadow-purple-950/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <AnimatedIcon icon={Icon} size="sm" className={isSelected ? 'text-white' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 max-h-[55vh] relative z-10">
              {/* TAB 1: WORKFLOW YAML */}
              {activeTab === 'workflow' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-titles">
                        ضع هذا الملف داخل مستودعك في المسار التالي:
                      </h4>
                      <code className="text-[11px] text-cyan-400 font-mono">
                        .github/workflows/alert_dispatcher.yml
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(workflowYmlContent, 'yml')}
                      className="clay-btn px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedKey === 'yml' ? (
                        <>
                          <AnimatedIcon icon={Check} size="sm" className="text-emerald-400" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <AnimatedIcon icon={Copy} size="sm" className="text-slate-300" />
                          <span>نسخ الكود بالكامل</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="neu-inset p-4 rounded-2xl bg-black/80 border border-white/10 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto text-left max-h-64 scrollbar-thin">
                    {workflowYmlContent}
                  </pre>

                  <div className="neu-inset p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 leading-relaxed font-hints">
                    💡 <b>كيف يعمل؟</b> يقوم GitHub Actions بتشغيل سكريبت الرانر كل ساعة في السحابة بدون أن تفتح أي متصفح. عندما يطابق اليوم والساعة موعدك، يقوم بالاتصال المباشر بإيرثلنك وإرسال التقرير كامل إلى ديسكورد أو تليجرام.
                  </div>
                </div>
              )}

              {/* TAB 2: SECRETS CONFIG */}
              {activeTab === 'secrets' && (
                <div className="space-y-3">
                  <div className="neu-inset p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 leading-relaxed font-hints">
                    🔒 لحماية معلوماتك، أضف هذه المتغيرات في مستودع GitHub الخاص بك من خلال:
                    <br />
                    <b>Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret</b>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        key: 'EARTHLINK_USERNAME',
                        desc: 'اسم مستخدم اشتراك إيرثلنك الخاص بك',
                        example: 'usr123456'
                      },
                      {
                        key: 'EARTHLINK_PASSWORD',
                        desc: 'كلمة مرور اشتراك إيرثلنك الخاصة بك',
                        example: '••••••••'
                      },
                      {
                        key: 'DISCORD_WEBHOOK',
                        desc: 'رابط ويب هوك ديسكورد لاستلام التقرير التلقائي',
                        example: 'https://discord.com/api/webhooks/...'
                      },
                      {
                        key: 'TELEGRAM_TOKEN',
                        desc: 'توكن بوت تليجرام الخاص بك (من @BotFather)',
                        example: '8873866209:AAExp-CQ...'
                      },
                      {
                        key: 'TELEGRAM_CHAT_ID',
                        desc: 'معرف الشات الخاص بك في تليجرام',
                        example: '7753969972'
                      },
                      {
                        key: 'ALERT_DAY',
                        desc: 'يوم التنبيه من كل شهر (محدد حالياً في التطبيق)',
                        example: String(selectedDay)
                      },
                      {
                        key: 'ALERT_TIME',
                        desc: 'وقت التنبيه الدقيق (محدد حالياً في التطبيق)',
                        example: formattedTime
                      },
                      {
                        key: 'ALERT_CHANNEL',
                        desc: 'قناة الإرسال: both أو discord أو telegram',
                        example: selectedChannel
                      }
                    ].map((secret) => (
                      <div
                        key={secret.key}
                        className="neu-inset p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-purple-500/30 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-300">
                              {secret.key}
                            </span>
                            <span className="text-[10px] text-purple-400 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded">
                              {secret.example}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-hints mt-0.5">
                            {secret.desc}
                          </p>
                        </div>

                        <button
                          onClick={() => copyToClipboard(secret.key, secret.key)}
                          className="clay-btn px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold font-titles flex items-center gap-1 shrink-0"
                        >
                          {copiedKey === secret.key ? (
                            <AnimatedIcon icon={Check} size="sm" className="text-emerald-400" />
                          ) : (
                            <AnimatedIcon icon={Copy} size="sm" className="text-slate-300" />
                          )}
                          <span>نسخ الاسم</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: RUNNER SCRIPT */}
              {activeTab === 'script' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-titles">
                        ملف تشغيل Node.js المستقل في مستودعك:
                      </h4>
                      <code className="text-[11px] text-purple-400 font-mono">
                        scripts/github_alert_runner.js
                      </code>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-hints">
                    تم إنشاء هذا الملف في مشروعك مسبقاً داخل مجلد <code className="text-cyan-400">scripts/github_alert_runner.js</code>. هذا الملف يعتمد على Node 20 الداخلي وبدون الحاجة لأي حزم إضافية، ليضمن عمله بأعلى سرعة وموثوقية في كل دورة تشغيل.
                  </p>

                  <div className="neu-inset p-4 rounded-2xl bg-black/60 border border-white/10 text-xs text-slate-300 space-y-2 font-hints">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold font-titles">
                      <AnimatedIcon icon={ShieldCheck} size="sm" className="text-emerald-400" />
                      <span>الميزات المدمجة في الرانر السحابي:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                      <li>تسجيل دخول مباشر وموثق إلى خادم إيرثلنك الرسمي.</li>
                      <li>جلب الأيام المتبقية وتاريخ الانتهاء وعنوان IP لحظياً.</li>
                      <li>إرسال Embed فخم لديسكورد ورسالة HTML منسقة لتليجرام.</li>
                      <li>يعمل بتوقيت بغداد بدقة (Asia/Baghdad).</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between relative z-10">
              <span className="text-[11px] text-slate-400 font-hints">
                جميع الملفات جاهزة ومحفوظة في مشروعك الآن
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
      )}
    </AnimatePresence>
  );
};
