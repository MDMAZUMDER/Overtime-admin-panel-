import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  ChevronRight, 
  LogOut,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';

export default function AdminProfile() {
  const user = auth.currentUser;
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-brand/10 -z-10" />
        
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-surface shadow-xl overflow-hidden bg-surface-variant">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Admin'}&background=random`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-brand text-white rounded-full shadow-lg active:scale-90 transition-all">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-black tracking-tight">{user?.displayName || 'System Admin'}</h2>
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">Super Administrator</p>
        </div>

        <div className="flex gap-4 mt-6">
          <div className="text-center px-4 py-2 bg-surface-variant/30 rounded-2xl">
            <p className="text-lg font-black text-brand">124</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Staff</p>
          </div>
          <div className="text-center px-4 py-2 bg-surface-variant/30 rounded-2xl">
            <p className="text-lg font-black text-brand">12</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">Pending</p>
          </div>
        </div>
      </div>

      {/* Theme & Preferences */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2">Preferences</h3>
        
        <div className="glass-card overflow-hidden">
          <button 
            onClick={toggleTheme}
            className="w-full p-4 flex items-center justify-between active:bg-surface-variant/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center">
                {isDark ? <Moon className="w-5 h-5 text-brand" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Dark Mode</p>
                <p className="text-[10px] text-on-surface-variant">{isDark ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-brand' : 'bg-outline-variant'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDark ? 'right-1' : 'left-1'}`} />
            </div>
          </button>

          <div className="h-px bg-outline-variant/10 mx-4" />

          <button className="w-full p-4 flex items-center justify-between active:bg-surface-variant/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-brand" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Language</p>
                <p className="text-[10px] text-on-surface-variant">English (US)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2">Account</h3>
        
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-container rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-on-brand-container" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-outline">Email Address</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-container rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-on-brand-container" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-outline">Security Level</p>
              <p className="text-sm font-medium">Level 4 (Full Access)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={() => auth.signOut()}
        className="w-full p-4 glass-card border-red-100 bg-red-50/30 flex items-center justify-center gap-2 text-red-600 font-bold active:scale-95 transition-all"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
