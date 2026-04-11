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
  Bookmark,
  TrendingUp,
  LogIn,
  Moon,
  Sun,
  QrCode
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

// --- Components ---

const ModernTrendChart = ({ data }: { data: number[] }) => {
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
              <stop offset="5%" stopColor="var(--m3-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--m3-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--zinc-100)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--zinc-400)', fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'var(--zinc-400)', fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--m3-surface)', 
              borderRadius: '16px', 
              border: '1px solid var(--zinc-100)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            itemStyle={{ color: 'var(--m3-primary)' }}
            cursor={{ stroke: 'var(--m3-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="hours" 
            stroke="var(--m3-primary)" 
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
  const background = useTransform(x, [-150, 0, 150], ['#fee2e2', 'var(--m3-surface)', '#dcfce7']);

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
        className="relative z-10 p-4 rounded-2xl border border-zinc-100 shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-4 transition-colors duration-300"
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
  onShowSnackbar,
  onLogout,
  theme,
  toggleTheme
}: any) => {
  const totalHours = useMemo(() => weeklyTrendData.reduce((a, b) => a + b, 0), []);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      <header className="flex items-center justify-between p-6 sticky top-0 bg-m3-background/80 backdrop-blur-md z-20">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-6 h-6 text-zinc-600" /> : <Sun className="w-6 h-6 text-zinc-600" />}
          </button>
          <button 
            onClick={() => onShowSnackbar("No new notifications")}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <Bell className="w-6 h-6 text-zinc-600" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-red-500"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8">
        {/* Summary Cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <div className="min-w-[200px] h-32 bg-m3-primary-container rounded-m3-xl p-5 flex flex-col justify-between text-m3-on-primary-container shadow-md transition-colors duration-300">
            <span className="text-xs opacity-80 font-medium uppercase tracking-wider">Pending Approvals</span>
            <span className="text-4xl font-bold">{requests.length}</span>
          </div>
          <div className="min-w-[200px] h-32 bg-m3-surface-variant rounded-m3-xl p-5 flex flex-col justify-between text-zinc-900 shadow-md transition-colors duration-300">
            <span className="text-xs opacity-80 font-medium uppercase tracking-wider">Total Company Hours</span>
            <span className="text-4xl font-bold">{totalHours.toFixed(1)}</span>
          </div>
        </div>

        {/* Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">Weekly Overtime Trend</h3>
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12%
            </div>
          </div>
          <div className="bg-m3-surface rounded-m3-xl p-4 border border-zinc-100 shadow-sm transition-colors duration-300">
            <ModernTrendChart data={weeklyTrendData} />
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

const Employees = ({ employees, onSelect }: { employees: Employee[]; onSelect: (emp: Employee) => void }) => {
  const [search, setSearch] = useState("");
  const filtered = employees.filter(e => 
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
            className="w-full h-14 pl-12 pr-4 bg-m3-surface border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-m3-primary/20 transition-all text-zinc-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="px-6 space-y-4">
        {filtered.map(emp => (
          <div 
            key={emp.id} 
            onClick={() => onSelect(emp)}
            className="m3-card flex items-center gap-4 cursor-pointer hover:bg-zinc-50 transition-colors"
          >
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

const EmployeeDetail = ({ employee, onBack }: { employee: Employee; onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-m3-background animate-in slide-in-from-bottom duration-300 z-50 fixed inset-0 overflow-y-auto pb-12">
      <header className="flex items-center p-6 sticky top-0 bg-m3-background/80 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-zinc-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-xl font-bold">Employee Profile</h1>
      </header>

      <main className="px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-m3-primary/10 flex items-center justify-center text-3xl font-bold text-m3-primary mb-4 shadow-inner">
            {employee.initial}
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">{employee.name}</h2>
          <p className="text-zinc-500 font-medium">{employee.department}</p>
          <div className="mt-3">
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${
              employee.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {employee.status === 'ACTIVE' ? 'Active' : 'On Break'}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-m3-surface p-4 rounded-3xl border border-zinc-100 shadow-sm text-center transition-colors duration-300">
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Weekly OT</p>
            <p className="text-lg font-bold text-m3-primary">{employee.weeklyOvertime}h</p>
          </div>
          <div className="bg-m3-surface p-4 rounded-3xl border border-zinc-100 shadow-sm text-center transition-colors duration-300">
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Efficiency</p>
            <p className="text-lg font-bold text-green-600">94%</p>
          </div>
          <div className="bg-m3-surface p-4 rounded-3xl border border-zinc-100 shadow-sm text-center transition-colors duration-300">
            <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Rank</p>
            <p className="text-lg font-bold text-orange-500">#4</p>
          </div>
        </div>

        {/* History Section */}
        <section>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent Overtime History</h3>
          <div className="space-y-3">
            {[
              { date: "Oct 10, 2023", hours: 2.0, reason: "Project deadline support" },
              { date: "Oct 08, 2023", hours: 1.5, reason: "System maintenance" },
              { date: "Oct 05, 2023", hours: 3.0, reason: "Client meeting preparation" }
            ].map((history, idx) => (
              <div key={idx} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex items-center gap-4">
                <div className="p-2 bg-m3-primary/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-m3-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-400">{history.date}</p>
                  <p className="text-sm font-semibold text-zinc-700">{history.reason}</p>
                </div>
                <div className="text-sm font-bold text-zinc-900">{history.hours}h</div>
              </div>
            ))}
          </div>
        </section>
      </main>
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
              className="p-4 bg-m3-surface rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors duration-300"
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
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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
      setRequests([]);
      setEmployees([]);
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

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      showSnackbar("Login failed");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showSnackbar("Logged out");
    } catch (error) {
      showSnackbar("Logout failed");
    }
  };

  const showSnackbar = (msg: string) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 3000);
  };

  const approve = async (id: number) => {
    const path = `overtime_requests/${id}`;
    try {
      await updateDoc(doc(db, 'overtime_requests', id.toString()), { status: 'APPROVED' });
      setSelectedRequest(null);
      showSnackbar("Request Approved");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const reject = async (id: number) => {
    const path = `overtime_requests/${id}`;
    try {
      await updateDoc(doc(db, 'overtime_requests', id.toString()), { status: 'REJECTED' });
      setSelectedRequest(null);
      showSnackbar("Request Rejected");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-m3-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-m3-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-m3-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-m3-primary/10 rounded-full flex items-center justify-center mb-6">
          <LogIn className="w-10 h-10 text-m3-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-zinc-500 mb-8">Please sign in to manage overtime requests and employees.</p>
        <button 
          onClick={login}
          className="w-full h-14 bg-m3-primary text-white rounded-2xl font-bold shadow-lg shadow-m3-primary/20 flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-6 h-6" alt="Google" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-m3-background relative shadow-2xl overflow-hidden">
      {/* Content */}
      <div className="min-h-screen">
        {activeTab === 'home' && (
          <Dashboard 
            requests={requests} 
            onApprove={approve} 
            onReject={reject} 
            onShowSnackbar={showSnackbar}
            onLogout={logout}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        )}
        {activeTab === 'employees' && <Employees employees={employees} onSelect={setSelectedEmployee} />}
        {activeTab === 'approvals' && (
          <Approvals 
            requests={requests} 
            onSelect={setSelectedRequest} 
          />
        )}
        {activeTab === 'profile' && <Profile onShowSnackbar={showSnackbar} />}
        {activeTab === 'scan' && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-[32px] relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-white/30 animate-pulse" />
              </div>
            </div>
            <p className="text-white mt-8 font-medium">Align QR Code within the frame</p>
            <button 
              onClick={() => setActiveTab('home')}
              className="mt-12 px-8 py-3 bg-white/10 text-white rounded-2xl font-bold"
            >
              Cancel
            </button>
          </div>
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
        <div className="absolute inset-0 bg-m3-surface rounded-[32px] shadow-2xl border border-zinc-100 flex items-center justify-around px-2 transition-colors duration-300">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${activeTab === 'home' ? 'text-m3-primary' : 'text-zinc-400'}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab('employees')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${activeTab === 'employees' ? 'text-m3-primary' : 'text-zinc-400'}`}
          >
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-bold">Search</span>
          </button>
          
          {/* Central Scan Button Spacer */}
          <div className="w-16 h-16" />

          <button 
            onClick={() => setActiveTab('approvals')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${activeTab === 'approvals' ? 'text-m3-primary' : 'text-zinc-400'}`}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="text-[10px] font-bold">History</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${activeTab === 'profile' ? 'text-m3-primary' : 'text-zinc-400'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>

        {/* Floating Scan Button */}
        <button 
          onClick={() => setActiveTab('scan')}
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-m3-primary text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform z-[60]"
        >
          <QrCode className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
