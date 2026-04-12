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
  AlertCircle,
  Lock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import RequestList from './components/RequestList';
import AdminSettings from './components/AdminSettings';
import AdminProfile from './components/AdminProfile';
import { useTranslation } from './lib/useTranslation';
import { isNativeLockEnabled, authenticateNative, isNative } from './lib/security';

type View = 'dashboard' | 'employees' | 'requests' | 'settings' | 'profile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showPinLock, setShowPinLock] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const { t, isRTL } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user && isNativeLockEnabled()) {
        setIsAppLocked(true);
        handleNativeUnlock();
      }
    });

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

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

  const handleNativeUnlock = async () => {
    const success = await authenticateNative(t.biometricReason, t.biometricTitle);
    if (success) {
      setIsAppLocked(false);
    }
  };

  const handleViewChange = (view: View) => {
    const savedPin = localStorage.getItem('admin_pin');
    if (view === 'settings' && savedPin) {
      setShowPinLock(true);
      return;
    }
    setCurrentView(view);
  };

  const handlePinSubmit = () => {
    const savedPin = localStorage.getItem('admin_pin');
    if (enteredPin === savedPin) {
      setCurrentView('settings');
      setShowPinLock(false);
      setEnteredPin('');
    } else {
      alert('Incorrect PIN');
      setEnteredPin('');
    }
  };

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

  if (isAppLocked) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xs w-full glass-card p-10 space-y-8"
        >
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-brand" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">{t.nativeLock}</h2>
            <p className="text-sm text-on-surface-variant font-medium">{t.biometricReason}</p>
          </div>
          <button 
            onClick={handleNativeUnlock}
            className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            {t.unlockApp}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-full max-w-md mx-auto bg-surface flex flex-col shadow-2xl relative overflow-hidden border-x border-outline-variant/10 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* PIN Lock Modal */}
      <AnimatePresence>
        {showPinLock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-xs glass-card p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-brand" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black">{t.security}</h3>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{t.enterPin}</p>
              </div>
              <input 
                type="password" 
                maxLength={4} 
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="w-full bg-surface-variant/50 border-none rounded-2xl px-4 py-4 text-center text-2xl font-black tracking-[1em]"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPinLock(false)}
                  className="flex-1 py-3 bg-surface-variant text-on-surface-variant rounded-2xl text-xs font-bold"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={handlePinSubmit}
                  className="flex-1 py-3 bg-brand text-white rounded-2xl text-xs font-bold"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <h2 className="text-xl font-bold tracking-tight capitalize">
            {currentView === 'dashboard' && t.home}
            {currentView === 'employees' && t.staff}
            {currentView === 'requests' && t.tasks}
            {currentView === 'settings' && t.admin}
            {currentView === 'profile' && t.profile}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentView('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand/20 active:scale-90 transition-all"
          >
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Admin'}&background=random`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>
          <button className="p-2 hover:bg-surface-variant rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'employees' && <EmployeeList />}
            {currentView === 'requests' && <RequestList />}
            {currentView === 'settings' && <AdminSettings />}
            {currentView === 'profile' && <AdminProfile />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar (Android Style) */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-surface-variant/50 backdrop-blur-xl border-t border-outline-variant/20 flex items-center justify-around px-2 pb-2 z-20">
        <BottomNavItem 
          icon={<LayoutDashboard className="w-6 h-6" />} 
          label={t.home} 
          active={currentView === 'dashboard'} 
          onClick={() => handleViewChange('dashboard')}
        />
        <BottomNavItem 
          icon={<Users className="w-6 h-6" />} 
          label={t.staff} 
          active={currentView === 'employees'} 
          onClick={() => handleViewChange('employees')}
        />
        <BottomNavItem 
          icon={<ClipboardList className="w-6 h-6" />} 
          label={t.tasks} 
          active={currentView === 'requests'} 
          onClick={() => handleViewChange('requests')}
        />
        <BottomNavItem 
          icon={<Settings className="w-6 h-6" />} 
          label={t.admin} 
          active={currentView === 'settings'} 
          onClick={() => handleViewChange('settings')}
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
