import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Plus, 
  Search,
  Bell,
  UserCircle,
  Menu,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import RequestList from './components/RequestList';
import AdminSettings from './components/AdminSettings';

type View = 'dashboard' | 'employees' | 'requests' | 'settings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card p-8 text-center"
        >
          <div className="w-16 h-16 bg-brand-container rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-on-brand-container" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">OT Manager</h1>
          <p className="text-on-surface-variant mb-8">Native Overtime Control</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-brand text-white py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <UserCircle className="w-5 h-5" />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-surface flex flex-col shadow-2xl relative overflow-hidden border-x border-outline-variant/10">
      {/* Android Status Bar Simulation */}
      <div className="h-8 w-full bg-surface flex items-center justify-between px-6 shrink-0 z-30">
        <span className="text-[10px] font-bold text-on-surface">9:41</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border border-on-surface rounded-sm"></div>
          <div className="w-3 h-3 bg-on-surface rounded-full"></div>
          <div className="w-4 h-2 bg-on-surface rounded-sm"></div>
        </div>
      </div>

      {/* Top App Bar */}
      <header className="h-16 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight capitalize">{currentView}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-surface-variant rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
          </button>
          <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'employees' && <EmployeeList />}
            {currentView === 'requests' && <RequestList />}
            {currentView === 'settings' && <AdminSettings />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar (Android Style) */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-surface-variant/50 backdrop-blur-xl border-t border-outline-variant/20 flex items-center justify-around px-2 pb-2 z-20">
        <BottomNavItem 
          icon={<LayoutDashboard className="w-6 h-6" />} 
          label="Home" 
          active={currentView === 'dashboard'} 
          onClick={() => setCurrentView('dashboard')}
        />
        <BottomNavItem 
          icon={<Users className="w-6 h-6" />} 
          label="Staff" 
          active={currentView === 'employees'} 
          onClick={() => setCurrentView('employees')}
        />
        <BottomNavItem 
          icon={<ClipboardList className="w-6 h-6" />} 
          label="Tasks" 
          active={currentView === 'requests'} 
          onClick={() => setCurrentView('requests')}
        />
        <BottomNavItem 
          icon={<Settings className="w-6 h-6" />} 
          label="Admin" 
          active={currentView === 'settings'} 
          onClick={() => setCurrentView('settings')}
        />
      </nav>
    </div>
  );
}

function BottomNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 min-w-[64px] relative group"
    >
      <div className={`px-5 py-1 rounded-full transition-all duration-300 ${
        active ? 'bg-brand-container text-on-brand-container' : 'text-on-surface-variant hover:bg-surface-variant'
      }`}>
        {icon}
      </div>
      <span className={`text-[11px] font-bold tracking-wide transition-colors ${
        active ? 'text-on-surface' : 'text-on-surface-variant'
      }`}>
        {label}
      </span>
    </button>
  );
}
