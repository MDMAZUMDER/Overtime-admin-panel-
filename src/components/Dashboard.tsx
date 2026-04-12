import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'motion/react';
import { useTranslation } from '../lib/useTranslation';

const data = [
  { name: 'Mon', hours: 45 },
  { name: 'Tue', hours: 52 },
  { name: 'Wed', hours: 38 },
  { name: 'Thu', hours: 65 },
  { name: 'Fri', hours: 48 },
  { name: 'Sat', hours: 24 },
  { name: 'Sun', hours: 12 },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedHours: 0,
    activeEmployees: 0
  });

  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snap) => {
      setStats(prev => ({ 
        ...prev, 
        totalEmployees: snap.size,
        activeEmployees: snap.docs.filter(d => d.data().status === 'ACTIVE').length
      }));
    });

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snap) => {
      const requests = snap.docs.map(d => d.data());
      setStats(prev => ({
        ...prev,
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
        approvedHours: requests.filter(r => r.status === 'APPROVED').reduce((acc, r) => acc + (r.hours || 0), 0)
      }));
    });

    return () => {
      unsubEmployees();
      unsubRequests();
    };
  }, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title={t.staff} 
          value={stats.totalEmployees.toString()} 
          icon={<Users className="w-5 h-5" />} 
          color="bg-blue-100 text-blue-700"
        />
        <StatCard 
          title={t.pending} 
          value={stats.pendingRequests.toString()} 
          icon={<AlertCircle className="w-5 h-5" />} 
          color="bg-amber-100 text-amber-700"
        />
        <StatCard 
          title="Approved" 
          value={`${stats.approvedHours}h`} 
          icon={<Clock className="w-5 h-5" />} 
          color="bg-green-100 text-green-700"
        />
        <StatCard 
          title={t.active} 
          value={stats.activeEmployees.toString()} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* Chart Section */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Overtime Trends</h3>
          <span className="text-[10px] bg-brand-container text-on-brand-container px-2 py-0.5 rounded-full font-bold">WEEKLY</span>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--on-surface-variant)' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)',
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  color: 'var(--on-surface)'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="var(--brand)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHours)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2">{t.systemOverview}</h3>
        <div className="space-y-2">
          <ActivityRow 
            icon={<TrendingUp className="w-4 h-4 text-green-600" />}
            title="Policy Update"
            desc="Overtime limit increased for Engineering."
            time="2h ago"
          />
          <ActivityRow 
            icon={<AlertCircle className="w-4 h-4 text-amber-600" />}
            title="Pending Alerts"
            desc="3 requests pending for over 48 hours."
            time="5h ago"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{title}</p>
        <p className="text-xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ActivityRow({ icon, title, desc, time }: { icon: React.ReactNode, title: string, desc: string, time: string }) {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="shrink-0 w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface truncate">{title}</p>
          <p className="text-[10px] text-on-surface-variant">{time}</p>
        </div>
        <p className="text-[10px] text-on-surface-variant truncate">{desc}</p>
      </div>
    </div>
  );
}
