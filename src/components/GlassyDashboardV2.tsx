import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  Send,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Check,
  Sparkles,
  LayoutDashboard,
  BarChart2,
  PieChart,
  Calendar,
  Layers,
  Activity,
  Cpu,
  Share2,
  RefreshCw,
  Wallet,
  Globe,
  Sliders,
  X
} from 'lucide-react';
import { playHapticSound, triggerLuxuryCelebration, createClickRipple } from '../utils/effects';
import { SubscriberData } from '../types/earthlink';

interface GlassyDashboardV2Props {
  subscriberData: SubscriberData;
  onBackToMain?: () => void;
}

export const GlassyDashboardV2: React.FC<GlassyDashboardV2Props> = ({
  subscriberData,
  onBackToMain
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'reports'>('overview');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Can you send $250 to Jenny Wilson...');
  const [isPromptSubmitting, setIsPromptSubmitting] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [dataMode, setDataMode] = useState<'financial' | 'earthlink'>('financial');
  const [selectedCard, setSelectedCard] = useState<'black' | 'teal'>('black');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Exact code snippet shown in the user's attachment screenshots
  const snippetCode = `import { motion } from 'framer-motion';
import { ShoppingBag, Users, DollarSign, ArrowUpRight } from 'lucide-react';

const StatsCard = ({ title, value, change, icon: Icon, gradient }) => {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <h2 className="text-2xl font-bold text-white">{value}</h2>
          <p className="flex items-center gap-1 text-sm text-emerald-400">
            <ArrowUpRight size={16} /> {change}%
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopiedCode(true);
    playHapticSound('success');
    triggerLuxuryCelebration();
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsPromptSubmitting(true);
    playHapticSound('tap');
    setTimeout(() => {
      setIsPromptSubmitting(false);
      triggerLuxuryCelebration();
    }, 800);
  };

  // Bar Chart Data (Jan - Aug)
  const barChartData = [
    { month: 'Jan', profit: 45, loss: 20 },
    { month: 'Feb', profit: 62, loss: 25 },
    { month: 'Mar', profit: 55, loss: 18 },
    { month: 'Apr', profit: 80, loss: 30 },
    { month: 'May', profit: 70, loss: 22 },
    { month: 'Jun', profit: 92, loss: 35 },
    { month: 'Jul', profit: 68, loss: 24 },
    { month: 'Aug', profit: 85, loss: 28 },
  ];

  // Recent transactions table
  const activities = [
    { id: 'INV_003811', item: 'Mobile App Purchase', price: '$35.500', category: 'Software', status: 'Completed', date: '21 Apr, 2026 10:45 PM' },
    { id: 'INV_003775', item: 'Hotel Booking Luxury Suite', price: '$210.750', category: 'Travel', status: 'Completed', date: '19 Apr, 2026 11:32 AM' },
    { id: 'INV_003774', item: 'Flight Ticket Booking', price: '$45.200', category: 'Travel', status: 'Completed', date: '18 Apr, 2026 12:05 PM' },
    { id: 'INV_003612', item: 'Cloud Server Hosting & GPU', price: '$18.400', category: 'Software', status: 'In Progress', date: '16 Apr, 2026 09:15 PM' },
    { id: 'INV_003501', item: 'Earthlink VIP Turbo Quota', price: '$40.000', category: 'Bills', status: 'Completed', date: '14 Apr, 2026 08:00 AM' },
    { id: 'INV_003429', item: 'Coffee & Organic Groceries', price: '$12.800', category: 'Food', status: 'Pending', date: '12 Apr, 2026 04:20 PM' },
  ];

  const filteredActivities = activities.filter((act) => {
    const matchesSearch = act.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative w-full min-h-screen text-slate-100 font-sans select-none overflow-x-hidden p-2 sm:p-4 lg:p-6 pb-28">
      {/* Background Architectural Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#090611]">
        {/* Warm Golden/Bronze Travertine Glow from Top */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-br from-amber-600/15 via-rose-500/10 to-transparent blur-[120px] rounded-full" />
        {/* Soft Cool Teal/Cyan Glow from Bottom Right */}
        <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-gradient-to-tl from-cyan-600/15 via-indigo-600/10 to-transparent blur-[140px] rounded-full" />
        {/* Translucent grid matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="max-w-[1440px] mx-auto space-y-4 sm:space-y-6">
        {/* =========================================================================
            TOP GLASS BAR: Welcome Pill, AI Prompt Capsule, Quick Controls
            ========================================================================= */}
        <header className="w-full backdrop-blur-2xl bg-white/[0.04] dark:bg-black/30 border border-white/15 rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/50 flex flex-wrap items-center justify-between gap-3">
          {/* User Profile Pill */}
          <div className="flex items-center gap-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-full px-3 py-1.5 transition-all">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                XR
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090611]" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block leading-tight">Welcome,</span>
              <span className="text-xs font-bold text-white block">
                {subscriberData.userID ? subscriberData.fullName || 'Code XR' : 'Code XR'}
              </span>
            </div>
          </div>

          {/* Center AI Interactive Prompt Pill Capsule */}
          <form
            onSubmit={handlePromptSubmit}
            className="flex-1 min-w-[260px] max-w-[500px] relative flex items-center"
          >
            <div className="w-full relative flex items-center bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.1] border border-white/15 rounded-full px-4 py-1.5 transition-all shadow-inner">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 ml-2 animate-pulse" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="اسأل الذكاء الاصطناعي أو اكتب أمراً..."
                className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPromptSubmitting}
                className="w-7 h-7 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center transition-all shrink-0 mr-1 active:scale-95"
              >
                {isPromptSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </form>

          {/* Quick Action Buttons (Code view, Earthlink mode toggle, Back) */}
          <div className="flex items-center gap-2">
            {/* Earthlink / Financial Mode Switch */}
            <button
              onClick={() => {
                playHapticSound('tap');
                setDataMode(dataMode === 'financial' ? 'earthlink' : 'financial');
              }}
              className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">
                {dataMode === 'financial' ? 'البيانات المالية ($)' : 'شبكة إيرثلنك (GB)'}
              </span>
            </button>

            {/* Toggle JSX Code Snippet Drawer */}
            <button
              onClick={() => {
                playHapticSound('tap');
                setIsCodeDrawerOpen(!isCodeDrawerOpen);
              }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 text-xs font-bold text-purple-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-300" />
              <span>كود JSX</span>
            </button>

            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                title="العودة"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* =========================================================================
            SUBHEADER: Title, Overview/Reports Switcher, Time Filters, Export CSV
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{activeSubTab === 'overview' ? 'Good morning, Code XR' : 'Reports & Analytics'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Glassy V2
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeSubTab === 'overview'
                ? 'Stay on top of your tasks, activities and balance'
                : "See where your money comes from & how it's spent"}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Overview vs Reports Segmented Control */}
            <div className="flex items-center p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
              <button
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  setActiveSubTab('overview');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'overview'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={(e) => {
                  createClickRipple(e);
                  playHapticSound('tap');
                  setActiveSubTab('reports');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'reports'
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reports
              </button>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
              {(['week', 'month', 'year'] as const).map((r) => (
                <button
                  key={r}
                  onClick={(e) => {
                    createClickRipple(e);
                    playHapticSound('tap');
                    setDateRange(r);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    dateRange === r
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r === 'week' ? 'This week' : r === 'month' ? 'This month' : 'This year'}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={() => {
                playHapticSound('success');
                triggerLuxuryCelebration();
              }}
              className="px-3 py-1.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: OVERVIEW DASHBOARD (Screenshot 1)
            ========================================================================= */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Grid: Total Balance Card + 4 Stats Cards + Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Total Balance Card (4 Columns) */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="lg:col-span-4 backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Total Balance</span>
                    <div className="flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-full px-2 py-0.5 text-[11px] text-slate-300">
                      <span>USD</span>
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>

                  <div className="mt-2">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight tabular-nums">
                      {dataMode === 'financial' ? '$580,951.32' : '168.4 GB'}
                    </h2>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+12.8% vs last month</span>
                    </p>
                  </div>

                  {/* Transfer & Request Action Pills */}
                  <div className="flex items-center gap-2.5 mt-5">
                    <button
                      onClick={() => playHapticSound('tap')}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-lg shadow-white/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-900" />
                      <span>Transfer</span>
                    </button>
                    <button
                      onClick={() => playHapticSound('tap')}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-300" />
                      <span>Request</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Currency Pills List */}
                <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Currencies · Total 3 Accounts</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { code: 'USD', value: '$11,580.04', change: '+2.4%' },
                      { code: 'EUR', value: '€16,187.00', change: '+1.1%' },
                      { code: 'GBP', value: '£12,943.82', change: '-0.5%' },
                    ].map((cur) => (
                      <div
                        key={cur.code}
                        onClick={() => {
                          playHapticSound('tap');
                          setActiveCurrency(cur.code as 'USD' | 'EUR' | 'GBP');
                        }}
                        className={`p-2 rounded-2xl border transition-all cursor-pointer text-center ${
                          activeCurrency === cur.code
                            ? 'bg-cyan-500/15 border-cyan-500/40'
                            : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block font-bold">{cur.code}</span>
                        <span className="text-xs font-bold text-white block tabular-nums mt-0.5 truncate">{cur.value}</span>
                        <span className={`text-[9px] font-semibold block ${cur.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {cur.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* 4 Stats Cards in 2x2 Grid (4 Columns) */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
                {/* Total Savings Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="backdrop-blur-2xl bg-gradient-to-br from-emerald-950/40 via-teal-900/20 to-black/40 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-200/80 font-medium">Total Savings</span>
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-white tabular-nums">
                      {dataMode === 'financial' ? '$914' : '45.2 GB'}
                    </h3>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-semibold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+14% this month</span>
                    </p>
                  </div>
                </motion.div>

                {/* Total Spending Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Total Spending</span>
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-white tabular-nums">
                      {dataMode === 'financial' ? '$655' : '81.6 GB'}
                    </h3>
                    <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-semibold">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>-4% this month</span>
                    </p>
                  </div>
                </motion.div>

                {/* Total Income Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Total Income</span>
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-white tabular-nums">
                      {dataMode === 'financial' ? '$940' : '250 GB'}
                    </h3>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-semibold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+8% this month</span>
                    </p>
                  </div>
                </motion.div>

                {/* Total Revenue Card */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Total Revenue</span>
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5 text-purple-300" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-white tabular-nums">
                      {dataMode === 'financial' ? '$713' : '50 Mbps'}
                    </h3>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1 font-semibold">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+12% this month</span>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Total Income Multi-Bar Chart (4 Columns) */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="lg:col-span-4 backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Total Income</h3>
                      <p className="text-[10px] text-slate-400">Profit and Loss</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-sm bg-teal-400 inline-block" /> Profit
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 inline-block" /> Loss
                      </span>
                    </div>
                  </div>

                  {/* Multi-Bar Graph */}
                  <div className="h-44 mt-6 flex items-end justify-between gap-2 pt-6">
                    {barChartData.map((item, idx) => {
                      const isHovered = hoveredMonth === idx;
                      return (
                        <div
                          key={item.month}
                          onMouseEnter={() => setHoveredMonth(idx)}
                          onMouseLeave={() => setHoveredMonth(null)}
                          className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
                        >
                          <div className="w-full flex items-end justify-center gap-1 h-32">
                            {/* Profit Bar (Teal) */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${item.profit}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 }}
                              className={`w-full max-w-[14px] rounded-t-md transition-all ${
                                isHovered ? 'bg-cyan-300 shadow-lg shadow-cyan-400/40' : 'bg-teal-400/90'
                              }`}
                            />
                            {/* Loss Bar (Dark/Muted) */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${item.loss}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                              className="w-full max-w-[14px] rounded-t-md bg-slate-700/80 group-hover:bg-slate-600 transition-all"
                            />
                          </div>
                          <span className={`text-[10px] font-mono mt-1 ${isHovered ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Net Performance:</span>
                  <span className="text-emerald-400 font-bold">+28.4% Average Yield</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Spending Limit & Virtual Cards + Recent Activities Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Left Column: Spending Limit + Cards (4 Columns) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Monthly Spending Limit */}
                <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Monthly Spending Limit</span>
                    <span className="text-slate-400 font-mono">$1,500.00</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <h4 className="text-xl font-bold text-white tabular-nums">$1,231.50</h4>
                    <span className="text-xs text-amber-400 font-bold">82% spent</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '82%' }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400"
                    />
                  </div>
                </div>

                {/* My Cards Carousel/Selector */}
                <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">My Cards</span>
                    <button
                      onClick={() => playHapticSound('tap')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Obsidian Mastercard */}
                    <div
                      onClick={() => {
                        playHapticSound('tap');
                        setSelectedCard('black');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        selectedCard === 'black'
                          ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950 border-cyan-400/50 shadow-lg shadow-black/80'
                          : 'bg-black/40 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-mono">Mastercard</span>
                        <div className="w-4 h-4 rounded-full bg-amber-500/40" />
                      </div>
                      <div className="mt-4">
                        <span className="text-[11px] text-white font-mono block">•••• 4892</span>
                        <span className="text-xs font-bold text-slate-200 block mt-1">$4,850.00</span>
                      </div>
                    </div>

                    {/* Teal Visa Card */}
                    <div
                      onClick={() => {
                        playHapticSound('tap');
                        setSelectedCard('teal');
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        selectedCard === 'teal'
                          ? 'bg-gradient-to-br from-teal-900 via-cyan-900 to-slate-950 border-cyan-400/50 shadow-lg shadow-cyan-950/50'
                          : 'bg-teal-950/20 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-cyan-300 font-mono">Visa VIP</span>
                        <div className="w-4 h-4 rounded-full bg-cyan-400/40" />
                      </div>
                      <div className="mt-4">
                        <span className="text-[11px] text-white font-mono block">•••• 1034</span>
                        <span className="text-xs font-bold text-slate-200 block mt-1">$12,320.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Activities Table (8 Columns) */}
              <div className="lg:col-span-8 backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Recent Activities</h3>
                      <p className="text-xs text-slate-400">Transactions and network operations</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="bg-black/30 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 w-36 sm:w-44"
                        />
                      </div>

                      {/* Category Filter */}
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="all">All Categories</option>
                        <option value="Software">Software</option>
                        <option value="Travel">Travel</option>
                        <option value="Bills">Bills</option>
                        <option value="Food">Food</option>
                      </select>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="py-2.5 px-3 font-semibold text-right">Order ID</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Item</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Price</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Category</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredActivities.map((act) => (
                          <tr key={act.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-3 font-mono text-cyan-300 font-medium">{act.id}</td>
                            <td className="py-3 px-3 font-bold text-white">{act.item}</td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-100">{act.price}</td>
                            <td className="py-3 px-3 text-slate-400">{act.category}</td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  act.status === 'Completed'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : act.status === 'In Progress'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                }`}
                              >
                                {act.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                                {act.status === 'In Progress' && <Clock className="w-3 h-3 animate-spin" />}
                                <span>{act.status}</span>
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap">{act.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 mt-4">
                  <span>Showing {filteredActivities.length} of {activities.length} records</span>
                  <button
                    onClick={() => {
                      playHapticSound('tap');
                      triggerLuxuryCelebration();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                  >
                    View All Statements →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: REPORTS & ANALYTICS (Screenshot 2)
            ========================================================================= */}
        {activeSubTab === 'reports' && (
          <div className="space-y-6">
            {/* Top 4 Metrics Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { title: 'Income', value: '$423.9k', change: '+14%', sub: 'vs last period', positive: true },
                { title: 'Expenses', value: '$312.2k', change: '+3%', sub: 'on budget', positive: false },
                { title: 'Net profit', value: '$109.7k', change: '+21%', sub: 'above target', positive: true },
                { title: 'Savings rate', value: '25.8%', change: '+5%', sub: 'annual high', positive: true },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -5 }}
                  className="backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{card.title}</span>
                    <span className={`text-xs font-bold ${card.positive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {card.change}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tabular-nums">{card.value}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Middle Row: Dual-Line Wave Chart + Spending by Category Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Income vs Expenses Smooth Dual-Line Curve (7 Columns) */}
              <div className="lg:col-span-7 backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Income vs expenses</h3>
                      <p className="text-[10px] text-slate-400">Hover the chart to compare any point</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                        <span className="w-3 h-0.5 bg-rose-400 inline-block" /> Expenses
                      </span>
                      <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                        <span className="w-3 h-0.5 bg-teal-400 inline-block" /> Income
                      </span>
                    </div>
                  </div>

                  {/* SVG Spline Curves */}
                  <div className="h-56 mt-4 w-full relative">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="0" y1="160" x2="500" y2="160" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                      {/* Area Fill for Income */}
                      <path
                        d="M 0 140 C 80 160, 140 70, 220 90 C 300 110, 360 40, 440 60 L 500 80 L 500 200 L 0 200 Z"
                        fill="url(#incomeGradient)"
                      />

                      {/* Income Curve (Teal) */}
                      <path
                        d="M 0 140 C 80 160, 140 70, 220 90 C 300 110, 360 40, 440 60 L 500 80"
                        fill="none"
                        stroke="#2dd4bf"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Expense Curve (Coral/Rose) */}
                      <path
                        d="M 0 110 C 70 80, 130 140, 200 100 C 280 60, 360 160, 450 120 L 500 135"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Interactive Anchor Points */}
                      <circle cx="220" cy="90" r="5" fill="#2dd4bf" stroke="#090611" strokeWidth="2" />
                      <circle cx="200" cy="100" r="5" fill="#f43f5e" stroke="#090611" strokeWidth="2" />
                      <circle cx="440" cy="60" r="5" fill="#2dd4bf" stroke="#090611" strokeWidth="2" />
                    </svg>

                    {/* Timeline Labels */}
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                      <span>Apr 01</span>
                      <span>Apr 08</span>
                      <span>Apr 15</span>
                      <span>Apr 22</span>
                      <span>Apr 29</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Peak Differential:</span>
                  <span className="text-teal-300 font-bold">+$32.4k on April 22</span>
                </div>
              </div>

              {/* Spending by Category Donut Chart (5 Columns) */}
              <div className="lg:col-span-5 backdrop-blur-2xl bg-white/[0.05] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Spending by category</h3>
                  <p className="text-[10px] text-slate-400">Comprehensive expense portfolio</p>

                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
                    {/* Donut Graphic */}
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background ring */}
                        <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
                        {/* Travel 25% (Orange) */}
                        <circle cx="50" cy="50" r="38" stroke="#f97316" strokeWidth="12" fill="none" strokeDasharray="60 180" strokeDashoffset="0" />
                        {/* Shopping 20% (Rose) */}
                        <circle cx="50" cy="50" r="38" stroke="#f43f5e" strokeWidth="12" fill="none" strokeDasharray="48 192" strokeDashoffset="-60" />
                        {/* Software 15% (Teal) */}
                        <circle cx="50" cy="50" r="38" stroke="#2dd4bf" strokeWidth="12" fill="none" strokeDasharray="36 204" strokeDashoffset="-108" />
                        {/* Bills 12% (Blue) */}
                        <circle cx="50" cy="50" r="38" stroke="#38bdf8" strokeWidth="12" fill="none" strokeDasharray="28 212" strokeDashoffset="-144" />
                        {/* Food 8% (Green) */}
                        <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="20 220" strokeDashoffset="-172" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] text-slate-400">Total Spent</span>
                        <span className="text-sm font-black text-white tabular-nums">$209.7k</span>
                      </div>
                    </div>

                    {/* Category Breakdown Bars */}
                    <div className="flex-1 w-full space-y-2 text-xs">
                      {[
                        { label: 'Travel', pct: 25, color: 'bg-orange-500' },
                        { label: 'Shopping', pct: 20, color: 'bg-rose-500' },
                        { label: 'Software', pct: 15, color: 'bg-teal-400' },
                        { label: 'Bills', pct: 12, color: 'bg-sky-400' },
                        { label: 'Food', pct: 8, color: 'bg-emerald-400' },
                      ].map((cat) => (
                        <div key={cat.label} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">{cat.label}</span>
                            <span className="text-white font-mono font-bold">{cat.pct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct * 2}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 mt-4">
                  <span>Top Expense:</span>
                  <span className="text-orange-400 font-bold">Travel & Suites ($52.4k)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            JSX CODE SNIPPET PREVIEW WINDOW (Screenshot Window with Dots)
            ========================================================================= */}
        <div className="backdrop-blur-2xl bg-[#0d0718]/90 border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
          {/* macOS Title Bar with 3 Colored Dots and jsx badge */}
          <div className="bg-black/60 px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-slate-400 mr-2">StatsCard.jsx</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">jsx</span>
              <button
                onClick={copyCodeToClipboard}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Syntax Highlighted Code Area */}
          <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm text-left overflow-x-auto leading-relaxed" dir="ltr">
            <pre className="text-slate-300">
              <code>
                <span className="text-purple-400">import</span> {'{ motion }'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'framer-motion'</span>;<br />
                <span className="text-purple-400">import</span> {'{ ShoppingBag, Users, DollarSign, ArrowUpRight }'} <span className="text-purple-400">from</span> <span className="text-emerald-300">'lucide-react'</span>;<br /><br />
                <span className="text-purple-400">const</span> <span className="text-cyan-300">StatsCard</span> = {'({ title, value, change, icon: Icon, gradient }) => {'}<br />
                {'  '}<span className="text-purple-400">return</span> (<br />
                {'    '}&lt;<span className="text-rose-400">motion.div</span> <span className="text-amber-300">whileHover</span>={'{{ y: -5 }}'} <span className="text-amber-300">className</span>=<span className="text-emerald-300">"glass-card p-6 rounded-2xl"</span>&gt;<br />
                {'      '}&lt;<span className="text-rose-400">div</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">"flex items-center justify-between"</span>&gt;<br />
                {'        '}&lt;<span className="text-rose-400">div</span>&gt;<br />
                {'          '}&lt;<span className="text-rose-400">p</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">"text-sm text-white/60"</span>&gt;{'{title}'}&lt;/<span className="text-rose-400">p</span>&gt;<br />
                {'          '}&lt;<span className="text-rose-400">h2</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">"text-2xl font-bold text-white"</span>&gt;{'{value}'}&lt;/<span className="text-rose-400">h2</span>&gt;<br />
                {'          '}&lt;<span className="text-rose-400">p</span> <span className="text-amber-300">className</span>=<span className="text-emerald-300">"flex items-center gap-1 text-sm text-emerald-400"</span>&gt;<br />
                {'            '}&lt;<span className="text-rose-400">ArrowUpRight</span> <span className="text-amber-300">size</span>={'{16}'} /&gt; {'{change}'}%<br />
                {'          '}&lt;/<span className="text-rose-400">p</span>&gt;<br />
                {'        '}&lt;/<span className="text-rose-400">div</span>&gt;<br />
                {'      '}&lt;/<span className="text-rose-400">div</span>&gt;<br />
                {'    '}&lt;/<span className="text-rose-400">motion.div</span>&gt;<br />
                {'  '});<br />
                {'};'}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
