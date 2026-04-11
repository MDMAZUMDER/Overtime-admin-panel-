/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Home, 
  Users, 
  CheckCircle2, 
  User, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  LogOut,
  MessageSquare,
  Zap,
  LogIn,
  Moon,
  Sun,
  MoreVertical,
  ArrowUp,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { translations, Language } from './translations';
import { mockEmployees, initialPendingRequests, weeklyTrendData } from './mockData';
import { Employee, OvertimeRequest } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';

// --- Interfaces ---

interface DashboardProps {
  requests: OvertimeRequest[];
  employees: Employee[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  onShowSnackbar: (msg: string) => void;
  lang: Language;
}

interface EmployeesProps {
  employees: Employee[];
  onSelect: (emp: Employee) => void;
  lang: Language;
  onShowSnackbar?: (msg: string) => void;
}

interface ApprovalsProps {
  requests: OvertimeRequest[];
  onSelect: (req: OvertimeRequest) => void;
}

interface ApprovalDetailProps {
  request: OvertimeRequest;
  onBack: () => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

interface ProfileProps {
  onShowSnackbar: (msg: string) => void;
  onLogout: () => Promise<void>;
  onLogin: () => Promise<void>;
  user: FirebaseUser | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

// --- Components ---

const ModernTrendChart: React.FC<{ data: number[] }> = ({ data }) => {
  const chartData = data.map((val, i) => ({
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    hours: val
  }));

  return (
    <div className="w-full h-56 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '16px', 
              border: '1px solid #F1F5F9',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: '#4F46E5' }}
            cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="hours" 
            stroke="#4F46E5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorHours)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface SwipeableItemProps {
  request: OvertimeRequest;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ request, onApprove, onReject }) => {
  const x = useMotionValue(0);
  const background = useTransform(x, [-150, 0, 150], ['#fee2e2', 'var(--m3-surface)', '#dcfce7']);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      onApprove(request.id);
    } else if (info.offset.x < -100) {
      onReject(request.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative mb-3 group"
    >
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-2xl">
        <div className="text-red-600 font-semibold text-sm">Reject</div>
        <div className="text-green-600 font-semibold text-sm">Approve</div>
      </div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, background }}
        className="relative z-10 p-5 rounded-[24px] border border-slate-100 shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:border-slate-200"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
          {request.employeeInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-base mb-0.5">{request.employeeName}</h4>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {request.hours} hrs • {request.reason}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            Swipe
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Screens ---

const Dashboard: React.FC<DashboardProps> = ({ 
  requests, 
  employees,
  onApprove, 
  onReject,
  onShowSnackbar,
  lang
}) => {
  const activeCount = useMemo(() => employees.filter((e: Employee) => e.status === 'ACTIVE').length, [employees]);
  const t = translations[lang as Language];

  return (
    <div className="pb-32 animate-in fade-in duration-700 bg-slate-50/50 dark:bg-slate-950/50" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
      <header className="flex items-center justify-between p-8 sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl z-20 border-b border-white/20 dark:border-slate-800/50">
        <div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1"
          >
            {new Date().toLocaleDateString(lang, { weekday: 'long', month: 'short', day: 'numeric' })}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-black text-slate-900 dark:text-white leading-tight"
          >
            {t.dashboard}
          </motion.h1>
        </div>
      </header>

      <main className="px-8 space-y-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[40px] p-8 flex flex-col gap-6 text-white shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="p-3 bg-white/20 rounded-2xl w-fit backdrop-blur-md border border-white/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-2">{t.pending}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter">{requests.length}</span>
                <span className="text-sm font-medium opacity-60">Requests</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-[40px] p-8 flex flex-col gap-6 text-slate-900 dark:text-white shadow-xl shadow-slate-100 dark:shadow-none border border-slate-50 dark:border-slate-800 relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl w-fit border border-indigo-100 dark:border-indigo-800">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{t.activeEmployees}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">{activeCount}</span>
                <span className="text-sm font-medium text-slate-400">Staff</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <section className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.weeklyTrend}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Performance metrics for this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
               +12.5%
            </div>
          </div>
          <ModernTrendChart data={weeklyTrendData} />
        </section>

        {/* Quick Approvals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t.quickApprovals}</h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
              {requests.length} Pending
            </span>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {requests.length > 0 ? (
                requests.map((req: any) => (
                  <SwipeableItem 
                    key={req.id} 
                    request={req} 
                    onApprove={onApprove} 
                    onReject={onReject} 
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-indigo-500 opacity-40" />
                  </div>
                  <p className="text-slate-400 font-medium">All requests processed!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
};

const Employees: React.FC<EmployeesProps> = ({ employees, onSelect, lang, onShowSnackbar }) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const t = translations[lang as Language];

  const displayEmployees = employees.length > 0 ? employees : [
    { id: 101, name: "Andrea", initial: "A", department: "Design", status: 'ACTIVE', weeklyOvertime: 4.5 },
    { id: 102, name: "John", initial: "J", department: "Engineering", status: 'ACTIVE', weeklyOvertime: 5.2 },
    { id: 103, name: "Sarah", initial: "S", department: "Product", status: 'ACTIVE', weeklyOvertime: 3.8 },
    { id: 104, name: "Michael", initial: "M", department: "Sales", status: 'ACTIVE', weeklyOvertime: 2.1 },
    { id: 105, name: "Emma", initial: "E", department: "Marketing", status: 'ACTIVE', weeklyOvertime: 6.0 },
    { id: 106, name: "David", initial: "D", department: "Support", status: 'ACTIVE', weeklyOvertime: 1.5 }
  ] as Employee[];

  const filtered = displayEmployees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                         e.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = selectedFilter === "All" || 
                         (selectedFilter === "Active" && e.status === "ACTIVE") ||
                         (selectedFilter === "On Break" && e.status === "ON_BREAK") ||
                         (e.department === selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const departments = Array.from(new Set(displayEmployees.map(e => e.department)));

  if (showAll) {
    return (
      <div className="pb-32 animate-in slide-in-from-bottom duration-500 bg-white dark:bg-slate-900 min-h-screen" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
        <header className="p-8 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowAll(false)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90">
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Directory</h1>
          </div>
          <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full uppercase tracking-widest">
            {filtered.length} Staff
          </div>
        </header>

        <div className="px-8 mt-8 mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-8 mb-8 flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Active', 'On Break', ...departments].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedFilter === filter 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' 
                : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="px-8 space-y-4">
          {filtered.length > 0 ? filtered.map((emp, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={emp.id} 
              onClick={() => onSelect(emp)}
              className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-50 dark:border-slate-800 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group active:scale-[0.98]"
            >
              <div className="w-16 h-16 rounded-[24px] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden relative border-2 border-white dark:border-slate-800 shadow-sm">
                <img src={`https://picsum.photos/seed/${emp.id}/100/100`} alt={emp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white dark:border-slate-800 rounded-full shadow-sm ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 dark:text-white text-lg mb-0.5">{emp.name}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{emp.department}</p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{emp.weeklyOvertime}h</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onShowSnackbar?.(`Messaging ${emp.name}...`); }}
                    className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="py-24 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="w-10 h-10 text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold">No matches found for "{search}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-500 bg-slate-50 dark:bg-slate-950 min-h-screen" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
      <header className="p-8 flex items-center justify-between sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl z-20 border-b border-white/20 dark:border-slate-800/50">
        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90">
          <Search className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
      </header>

      <div className="px-8 mt-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-1">Directory</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Staff Members</h1>
          </div>
          <button onClick={() => setShowAll(true)} className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">See all</button>
        </div>

        <div className="flex gap-3 mb-12">
          {['All', 'Active', 'On Break'].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedFilter === filter 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' 
                : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-10 text-center">Featured Staff</h3>
        
        {/* Circular Selector */}
        <div className="relative w-80 h-80 mx-auto flex items-center justify-center mb-16">
          {/* Background Rings */}
          <div className="absolute w-72 h-72 rounded-full border border-slate-100 dark:border-slate-800" />
          <div className="absolute w-48 h-48 rounded-full border-2 border-slate-100 dark:border-slate-800 border-dashed animate-[spin_30s_linear_infinite]" />
          <div className="absolute w-full h-full rounded-full border border-indigo-500/5 animate-[ping_4s_ease-in-out_infinite]" />

          {/* Central Avatar */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(displayEmployees[0])}
            className="relative z-10 w-32 h-32 rounded-[48px] border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden cursor-pointer transition-all group p-1 bg-white dark:bg-slate-800"
          >
            <div className="w-full h-full rounded-[40px] overflow-hidden">
              <img src={`https://picsum.photos/seed/${displayEmployees[0].id}/200/200`} alt={displayEmployees[0].name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          {/* Orbiting Avatars */}
          {displayEmployees.slice(1, 6).map((emp, i) => {
            const angle = (i * (360 / Math.min(5, displayEmployees.length - 1))) - 90;
            const radius = 135;
            const x = radius * Math.cos(angle * Math.PI / 180);
            const y = radius * Math.sin(angle * Math.PI / 180);

            return (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.5 }}
                whileHover={{ scale: 1.1, zIndex: 20 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect(emp)}
                className="absolute w-16 h-16 rounded-[20px] border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden cursor-pointer transition-all group bg-white dark:bg-slate-800 p-0.5"
                style={{
                  x, y
                }}
              >
                <div className="w-full h-full rounded-[18px] overflow-hidden">
                  <img src={`https://picsum.photos/seed/${emp.id}/100/100`} alt={emp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>

        <button 
          onClick={() => setShowAll(true)}
          className="w-full h-20 bg-indigo-600 text-white rounded-[40px] font-black shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-sm"
        >
          <Users className="w-6 h-6" />
          View Full Directory
        </button>
      </div>
    </div>
  );
};

const EmployeeDetail = ({ employee, onBack }: { employee: Employee; onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-bottom duration-700 z-50 fixed inset-0 overflow-y-auto pb-32">
      <div className="bg-white dark:bg-slate-900 rounded-b-[80px] shadow-2xl shadow-slate-200/50 dark:shadow-none pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-indigo-600 to-indigo-400 opacity-10 dark:opacity-20" />
        
        <header className="flex items-center justify-between p-8 relative z-10">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700 shadow-sm flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">
            <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700 shadow-sm flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">
            <MoreVertical className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
        </header>

        <div className="flex flex-col items-center px-8 relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-36 h-36 rounded-[56px] border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden mb-8 group p-1.5 bg-white dark:bg-slate-800"
          >
            <div className="w-full h-full rounded-[48px] overflow-hidden border-2 border-slate-50 dark:border-slate-700">
              <img 
                src={`https://picsum.photos/seed/${employee.id}/200/200`} 
                alt={employee.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{employee.name}</h2>
          <p className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">{employee.department}</p>

          <div className="w-full grid grid-cols-3 gap-8 pt-10 border-t border-slate-50 dark:border-slate-800">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">${(employee.weeklyOvertime * 45).toFixed(0)}</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Income</p>
            </div>
            <div className="text-center border-x border-slate-100 dark:border-slate-800">
              <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">${(employee.weeklyOvertime * 12).toFixed(0)}</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">$890</p>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Loan</p>
            </div>
          </div>
        </div>
      </div>

      <main className="px-8 mt-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Activity Overview</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Recent financial and work activity</p>
          </div>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">Sept 2026</span>
        </div>

        <div className="space-y-5">
          {[
            { label: "Salary Sent", sub: "Monthly payroll processing", amount: "+$2,450", icon: <ArrowUp className="w-6 h-6" />, color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
            { label: "Bonus Received", sub: "Performance achievement", amount: "+$450", icon: <Zap className="w-6 h-6" />, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
            { label: "Loan Payment", sub: "Auto-deduction for car loan", amount: "-$400", icon: <CreditCard className="w-6 h-6" />, color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-7 rounded-[40px] shadow-sm border border-slate-50 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[24px] ${item.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-lg">{item.label}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{item.sub}</p>
                </div>
              </div>
              <span className={`font-black text-xl ${item.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                {item.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Approvals: React.FC<ApprovalsProps> = ({ requests, onSelect }) => {
  const displayRequests = requests.length > 0 ? requests : initialPendingRequests;
  
  return (
    <div className="pb-32 animate-in slide-in-from-right duration-500 bg-m3-background min-h-screen">
      <header className="p-8 sticky top-0 bg-m3-background/80 backdrop-blur-xl z-20">
        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-1">Queue</p>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Pending Approvals</h1>
      </header>

      <div className="px-8 space-y-4">
        <AnimatePresence mode="popLayout">
          {displayRequests.length > 0 ? (
            displayRequests.map((req: any, idx: number) => (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelect(req)}
                className="p-6 bg-white rounded-[32px] shadow-sm border border-slate-50 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-slate-100 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
                    {req.employeeInitial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{req.employeeName}</h4>
                    <p className="text-xs text-slate-400 font-medium">{req.date} • {req.hours} hrs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-amber-50 px-3 py-1.5 rounded-full text-amber-600 font-bold uppercase tracking-wider">Pending</span>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 opacity-40" />
              </div>
              <p className="text-slate-400 font-bold">All requests processed!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ApprovalDetail: React.FC<ApprovalDetailProps> = ({ request, onBack, onApprove, onReject }) => {
  return (
    <div className="min-h-screen bg-m3-background animate-in slide-in-from-bottom duration-700 z-50 fixed inset-0 overflow-y-auto pb-32">
      <header className="flex items-center p-8 sticky top-0 bg-m3-background/80 backdrop-blur-xl z-10">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95">
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h1 className="ml-5 text-xl font-bold text-slate-900">Request Details</h1>
      </header>

      <main className="px-8 flex flex-col items-center">
        <div className="w-28 h-28 rounded-[40px] bg-indigo-50 flex items-center justify-center text-4xl font-bold text-indigo-600 mb-8 shadow-inner">
          {request.employeeInitial}
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{request.employeeName}</h2>
        <div className="bg-indigo-50 px-5 py-2 rounded-2xl text-xs font-bold text-indigo-600 mb-12 uppercase tracking-widest">
          {request.date} • {request.hours} hrs
        </div>

        <div className="w-full text-left mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Reason for Overtime</h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] text-slate-600 leading-relaxed border border-slate-50 shadow-sm text-base font-medium">
            {request.reason}
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <button 
            onClick={() => onReject(request.id)}
            className="h-16 rounded-[24px] border-2 border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition-all active:scale-[0.98]"
          >
            Reject
          </button>
          <button 
            onClick={() => onApprove(request.id)}
            className="h-16 rounded-[24px] bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Approve
          </button>
        </div>
      </main>
    </div>
  );
};

const Profile: React.FC<ProfileProps> = ({ onShowSnackbar, onLogout, onLogin, user, theme, toggleTheme, lang, setLang }) => {
  const t = translations[lang as Language];
  
  return (
    <div className="pb-32 animate-in slide-in-from-right duration-700 bg-slate-50 dark:bg-slate-950 min-h-screen" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-b-[80px] shadow-2xl shadow-slate-200/50 dark:shadow-none">
        <img 
          src="https://picsum.photos/seed/modern-office/1200/800" 
          alt="Profile Background" 
          className="w-full h-full object-cover brightness-[0.5] scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-indigo-950/80" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-36 h-36 rounded-[56px] border-4 border-white/20 overflow-hidden mb-8 shadow-2xl bg-white/10 backdrop-blur-2xl flex items-center justify-center p-1.5"
          >
            <div className="w-full h-full rounded-[48px] overflow-hidden border-2 border-white/40">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                  <User className="w-14 h-14 text-white" />
                </div>
              )}
            </div>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white mb-2 tracking-tight"
          >
            {user?.displayName || "Guest User"}
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
          >
            {user?.email || "litoncomar95@gmail.com"}
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <span className="px-5 py-2 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">Senior Admin</span>
            <span className="px-5 py-2 bg-emerald-500/20 backdrop-blur-2xl border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified</span>
          </motion.div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-8 -mt-16 relative z-10 space-y-12">
        {/* Settings Group (Theme & Language) */}
        <div className="space-y-5">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-6">App Settings</h3>
          <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between p-7 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
                  {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                </div>
                <span className="font-black text-slate-700 dark:text-slate-200 text-lg">Dark Mode</span>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-16 h-9 rounded-full relative transition-all duration-500 p-1.5 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-7">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="font-black text-slate-700 dark:text-slate-200 text-lg">{t.language}</span>
              </div>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm font-black text-indigo-600 dark:text-indigo-400 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
                <option value="ar">العربية</option>
                <option value="ur">اردو</option>
              </select>
            </div>
          </div>
        </div>

        {/* Login/Logout Button */}
        <div className="pt-6">
          {user ? (
            <button 
              onClick={onLogout}
              className="w-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[40px] p-8 font-black flex items-center justify-center gap-4 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-[0.98] shadow-sm"
            >
              <LogOut className="w-6 h-6" />
              Sign Out Account
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="w-full bg-indigo-600 text-white rounded-[40px] p-8 font-black flex items-center justify-center gap-4 shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-6 h-6" />
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'employees' | 'approvals' | 'profile'>('home');
  const [lang, setLang] = useState<Language>('en');
  const [requests, setRequests] = useState<OvertimeRequest[]>(initialPendingRequests);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const t = translations[lang];

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Test Connection
  React.useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Listeners
  React.useEffect(() => {
    if (!isAuthReady || !user) {
      // Keep mock data if not logged in
      return;
    }

    const requestsPath = 'overtime_requests';
    const qRequests = query(collection(db, requestsPath), where('status', '==', 'PENDING'));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as OvertimeRequest));
      setRequests(reqs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, requestsPath);
    });

    const employeesPath = 'employees';
    const unsubEmployees = onSnapshot(collection(db, employeesPath), (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Employee));
      setEmployees(emps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, employeesPath);
    });

    return () => {
      unsubRequests();
      unsubEmployees();
    };
  }, [isAuthReady, user]);

  const showSnackbar = React.useCallback((msg: string) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 3000);
  }, []);

  const login = React.useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      showSnackbar("Login failed");
    }
  }, [showSnackbar]);

  const logout = React.useCallback(async () => {
    try {
      await signOut(auth);
      showSnackbar("Logged out");
    } catch (error) {
      showSnackbar("Logout failed");
    }
  }, [showSnackbar]);

  const approve = React.useCallback(async (id: number) => {
    const path = `overtime_requests/${id}`;
    try {
      await updateDoc(doc(db, 'overtime_requests', id.toString()), { status: 'APPROVED' });
      setSelectedRequest(null);
      showSnackbar("Request Approved");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [showSnackbar]);

  const reject = React.useCallback(async (id: number) => {
    const path = `overtime_requests/${id}`;
    try {
      await updateDoc(doc(db, 'overtime_requests', id.toString()), { status: 'REJECTED' });
      setSelectedRequest(null);
      showSnackbar("Request Rejected");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }, [showSnackbar]);

  if (!isAuthReady) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-m3-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-700 dark:selection:text-indigo-300">
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen shadow-2xl shadow-slate-200 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden" dir={lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr'}>
        {/* Content */}
        <div className="min-h-screen pb-24">
        {activeTab === 'home' && (
          <Dashboard 
            requests={requests} 
            employees={employees}
            onApprove={approve} 
            onReject={reject} 
            onShowSnackbar={showSnackbar}
            lang={lang}
          />
        )}
        {activeTab === 'employees' && <Employees employees={employees} onSelect={setSelectedEmployee} lang={lang} onShowSnackbar={showSnackbar} />}
        {activeTab === 'approvals' && (
          <Approvals 
            requests={requests} 
            onSelect={setSelectedRequest} 
          />
        )}
        {activeTab === 'profile' && (
          <Profile 
            onShowSnackbar={showSnackbar} 
            onLogout={logout}
            onLogin={login}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            lang={lang}
            setLang={setLang}
          />
        )}
      </div>

      {/* Detail Overlays */}
      <AnimatePresence>
        {selectedRequest && (
          <ApprovalDetail 
            request={selectedRequest} 
            onBack={() => setSelectedRequest(null)}
            onApprove={approve}
            onReject={reject}
          />
        )}
        {selectedEmployee && (
          <EmployeeDetail 
            employee={selectedEmployee} 
            onBack={() => setSelectedEmployee(null)}
          />
        )}
      </AnimatePresence>

      {/* Snackbar */}
      <AnimatePresence>
        {snackbar && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-6 right-6 bg-zinc-800 text-white px-6 py-4 rounded-2xl shadow-xl z-[60] flex items-center justify-between"
          >
            <span className="text-sm font-medium">{snackbar}</span>
            <button onClick={() => setSnackbar(null)} className="text-m3-primary font-bold text-xs uppercase tracking-widest">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 h-20 z-50">
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 dark:border-slate-800/50 flex items-center justify-between px-4">
          {[
            { id: 'home', icon: Home, label: t.dashboard },
            { id: 'employees', icon: Users, label: t.employees },
            { id: 'approvals', icon: CheckCircle2, label: t.approvals },
            { id: 'profile', icon: User, label: t.profile }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center transition-all duration-500 relative group flex-1 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                activeTab === item.id ? 'scale-110 -translate-y-1' : ''
              }`}>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                  activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'group-hover:bg-slate-50'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                
                <AnimatePresence>
                  {activeTab === item.id && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {activeTab === item.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-indigo-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
