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
  Plus, 
  Bell, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  LogOut,
  Info,
  MapPin,
  Smartphone,
  Key,
  MessageSquare,
  Heart,
  ShoppingBag,
  Zap,
  Eye,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { mockEmployees, initialPendingRequests, weeklyTrendData } from './mockData';
import { Employee, OvertimeRequest } from './types';

// --- Components ---

const SimpleLineChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d / max) * 100
  }));

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="w-full h-40 relative px-4 py-8">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke="var(--color-m3-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="white"
            stroke="var(--color-m3-primary)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] text-zinc-400 uppercase tracking-wider">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
};

const SwipeableItem = ({ 
  request, 
  onApprove, 
  onReject 
}: { 
  request: OvertimeRequest; 
  onApprove: (id: number) => void; 
  onReject: (id: number) => void; 
  key?: React.Key;
}) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const background = useTransform(x, [-150, 0, 150], ['#fee2e2', '#ffffff', '#dcfce7']);

  const handleDragEnd = (_: any, info: any) => {
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
        className="relative z-10 p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-m3-primary/10 flex items-center justify-center text-m3-primary font-bold">
          {request.employeeInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-zinc-900 truncate">{request.employeeName}</h4>
          <p className="text-xs text-zinc-500 truncate">{request.hours} hrs • {request.reason}</p>
        </div>
        <div className="text-[10px] bg-zinc-100 px-2 py-1 rounded-full text-zinc-400 flex items-center gap-1">
          <span className="animate-pulse">↔️</span> Swipe
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Screens ---

const Dashboard = ({ 
  requests, 
  onApprove, 
  onReject,
  onShowSnackbar
}: any) => {
  const totalHours = useMemo(() => weeklyTrendData.reduce((a, b) => a + b, 0), []);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="flex items-center justify-between p-6 sticky top-0 bg-m3-background/80 backdrop-blur-md z-20">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <button 
          onClick={() => onShowSnackbar("No new notifications")}
          className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <Bell className="w-6 h-6 text-zinc-600" />
        </button>
      </header>

      <main className="px-6 space-y-8">
        {/* Summary Cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <div className="min-w-[200px] h-32 bg-m3-primary-container rounded-m3-xl p-5 flex flex-col justify-between text-white shadow-md">
            <span className="text-xs opacity-80 font-medium uppercase tracking-wider">Pending Approvals</span>
            <span className="text-4xl font-bold">{requests.length}</span>
          </div>
          <div className="min-w-[200px] h-32 bg-zinc-900 rounded-m3-xl p-5 flex flex-col justify-between text-white shadow-md">
            <span className="text-xs opacity-80 font-medium uppercase tracking-wider">Total Company Hours</span>
            <span className="text-4xl font-bold">{totalHours.toFixed(1)}</span>
          </div>
        </div>

        {/* Chart */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Weekly Overtime Trend</h3>
          <div className="bg-white rounded-m3-xl p-2 border border-zinc-100 shadow-sm">
            <SimpleLineChart data={weeklyTrendData} />
          </div>
        </section>

        {/* Quick Approvals */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">Quick Approvals</h3>
          <div className="space-y-1">
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center text-zinc-400"
                >
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>All caught up!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <button 
        onClick={() => onShowSnackbar("Broadcast options opened")}
        className="m3-fab"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

const Employees = () => {
  const [search, setSearch] = useState("");
  const filtered = mockEmployees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <header className="p-6 sticky top-0 bg-m3-background/80 backdrop-blur-md z-20">
        <h1 className="text-2xl font-bold text-zinc-900">Employees</h1>
      </header>

      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search by name or department"
            className="w-full h-14 pl-12 pr-4 bg-white border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-m3-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 space-y-4">
        {filtered.map(emp => (
          <div key={emp.id} className="m3-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-m3-primary/10 flex items-center justify-center text-m3-primary font-bold">
              {emp.initial}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-zinc-900">{emp.name}</h4>
              <p className="text-xs text-zinc-500">{emp.department}</p>
              <div className="mt-2 flex gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {emp.status === 'ACTIVE' ? 'Active' : 'On Break'}
                </span>
              </div>
            </div>
            <div className="bg-m3-primary/5 px-3 py-2 rounded-2xl text-center">
              <div className="text-xs font-bold text-m3-primary">{emp.weeklyOvertime}</div>
              <div className="text-[8px] uppercase text-m3-primary/60 font-bold">hrs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Approvals = ({ requests, onSelect }: any) => {
  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300">
      <header className="p-6 sticky top-0 bg-m3-background/80 backdrop-blur-md z-20">
        <h1 className="text-2xl font-bold text-zinc-900">Approvals</h1>
      </header>

      <div className="px-6 space-y-3">
        {requests.length > 0 ? (
          requests.map((req: any) => (
            <div 
              key={req.id} 
              onClick={() => onSelect(req)}
              className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
            >
              <div>
                <h4 className="font-bold text-zinc-900">{req.employeeName}</h4>
                <p className="text-xs text-zinc-500">{req.date} • {req.hours} hrs</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded-full text-zinc-500 font-medium">Pending</span>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-zinc-400">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ApprovalDetail = ({ request, onBack, onApprove, onReject }: any) => {
  return (
    <div className="min-h-screen bg-m3-background animate-in slide-in-from-bottom duration-300 z-50 fixed inset-0">
      <header className="flex items-center p-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-zinc-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-xl font-bold">Request Details</h1>
      </header>

      <main className="px-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-m3-primary/10 flex items-center justify-center text-3xl font-bold text-m3-primary mb-6">
          {request.employeeInitial}
        </div>
        <h2 className="text-2xl font-bold mb-2">{request.employeeName}</h2>
        <div className="bg-zinc-100 px-4 py-1.5 rounded-full text-sm font-medium text-zinc-600 mb-12">
          {request.date} • {request.hours} hrs
        </div>

        <div className="w-full text-left mb-8">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Reason for Overtime
          </h3>
          <div className="bg-zinc-50 p-6 rounded-3xl text-zinc-700 leading-relaxed border border-zinc-100">
            {request.reason}
          </div>
        </div>

        <div className="mt-auto w-full flex gap-4 pb-12">
          <button 
            onClick={() => onReject(request.id)}
            className="flex-1 h-14 rounded-2xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors"
          >
            Reject
          </button>
          <button 
            onClick={() => onApprove(request.id)}
            className="flex-1 h-14 rounded-2xl bg-m3-success text-white font-bold shadow-lg shadow-m3-success/20 hover:brightness-110 transition-all"
          >
            Approve
          </button>
        </div>
      </main>
    </div>
  );
};

const Profile = ({ onShowSnackbar }: any) => {
  const menuGroups = [
    {
      items: [
        { label: "My Address", icon: <MapPin className="w-5 h-5 text-zinc-400" />, id: "address" },
        { label: "Account", icon: <Users className="w-5 h-5 text-zinc-400" />, id: "account" },
      ]
    },
    {
      items: [
        { label: "Notifications", icon: <Bell className="w-5 h-5 text-zinc-400" />, id: "notifications" },
        { label: "Devices", icon: <Smartphone className="w-5 h-5 text-zinc-400" />, id: "devices" },
        { label: "Passwords", icon: <Key className="w-5 h-5 text-zinc-400" />, id: "passwords" },
        { label: "Language", icon: <MessageSquare className="w-5 h-5 text-zinc-400" />, id: "language" },
      ]
    }
  ];

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-300 bg-zinc-50 min-h-screen">
      {/* Header Section */}
      <div className="relative h-80 w-full overflow-hidden">
        <img 
          src="https://picsum.photos/seed/travel/800/600" 
          alt="Profile Background" 
          className="w-full h-full object-cover brightness-75"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-12 right-6 flex gap-4 text-white">
          <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </button>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
          <div className="w-24 h-24 rounded-full border-2 border-white overflow-hidden mb-4 shadow-xl">
            <img 
              src="https://picsum.photos/seed/miranda/200/200" 
              alt="Miranda West" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Miranda West</h2>
          <p className="text-white/80 text-xs text-center px-12 leading-relaxed">
            Work hard in silence. Let your<br />success be the noise.
          </p>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-6 -mt-10 relative z-10 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-zinc-100">
            {group.items.map((item, iIdx) => (
              <button 
                key={item.id}
                onClick={() => onShowSnackbar(`${item.label} clicked`)}
                className={`w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors ${
                  iIdx !== group.items.length - 1 ? 'border-bottom border-zinc-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="font-semibold text-zinc-700">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300" />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'employees' | 'approvals' | 'profile'>('home');
  const [requests, setRequests] = useState<OvertimeRequest[]>(initialPendingRequests);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const showSnackbar = (msg: string) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 3000);
  };

  const approve = (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelectedRequest(null);
    showSnackbar("Request Approved");
  };

  const reject = (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setSelectedRequest(null);
    showSnackbar("Request Rejected");
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-m3-background relative shadow-2xl overflow-hidden">
      {/* Simulation Frame Decorator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50 pointer-events-none" />
      
      {/* Content */}
      <div className="min-h-screen">
        {activeTab === 'home' && (
          <Dashboard 
            requests={requests} 
            onApprove={approve} 
            onReject={reject} 
            onShowSnackbar={showSnackbar}
          />
        )}
        {activeTab === 'employees' && <Employees />}
        {activeTab === 'approvals' && (
          <Approvals 
            requests={requests} 
            onSelect={setSelectedRequest} 
          />
        )}
        {activeTab === 'profile' && <Profile onShowSnackbar={showSnackbar} />}
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedRequest && (
          <ApprovalDetail 
            request={selectedRequest} 
            onBack={() => setSelectedRequest(null)}
            onApprove={approve}
            onReject={reject}
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
      <nav className="m3-bottom-nav">
        <button 
          onClick={() => setActiveTab('home')}
          className={`m3-nav-item ${activeTab === 'home' ? 'm3-nav-item-active' : 'text-zinc-400'}`}
        >
          <div className="m3-nav-icon-container">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Shop</span>
        </button>
        <button 
          onClick={() => setActiveTab('employees')}
          className={`m3-nav-item ${activeTab === 'employees' ? 'm3-nav-item-active' : 'text-zinc-400'}`}
        >
          <div className="m3-nav-icon-container">
            <Eye className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>
        <button 
          onClick={() => setActiveTab('approvals')}
          className={`m3-nav-item ${activeTab === 'approvals' ? 'm3-nav-item-active' : 'text-zinc-400'}`}
        >
          <div className="m3-nav-icon-container">
            <Bookmark className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Brands</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`m3-nav-item ${activeTab === 'profile' ? 'm3-nav-item-active' : 'text-zinc-400'}`}
        >
          <div className="m3-nav-icon-container">
            <User className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
      </nav>
    </div>
  );
}
