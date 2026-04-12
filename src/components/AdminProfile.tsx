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
  Camera,
  Edit2,
  Check,
  X,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { translations, Language } from '../lib/translations';
import { isNativeLockEnabled, setNativeLockEnabled, checkBiometricAvailability } from '../lib/security';

export default function AdminProfile() {
  const user = auth.currentUser;
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [pin, setPin] = useState(localStorage.getItem('admin_pin') || '');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [nativeLockEnabled, setNativeLockEnabledState] = useState(isNativeLockEnabled());
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, []);

  useEffect(() => {
    document.documentElement.dir = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang]);

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: newName });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePin = () => {
    localStorage.setItem('admin_pin', newPin);
    setPin(newPin);
    setIsSettingPin(false);
    setNewPin('');
  };

  const toggleNativeLock = () => {
    const newState = !nativeLockEnabled;
    setNativeLockEnabled(newState);
    setNativeLockEnabledState(newState);
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

        <div className="mt-4 w-full px-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 bg-surface-variant/50 border-none rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-brand/20"
                autoFocus
              />
              <button onClick={handleUpdateProfile} disabled={isSaving} className="p-2 bg-green-500 text-white rounded-xl">
                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500 text-white rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black tracking-tight">{user?.displayName || 'System Admin'}</h2>
              <button onClick={() => setIsEditing(true)} className="p-1 text-brand hover:bg-brand/10 rounded-full">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">{t.superAdmin}</p>
        </div>

        <div className="flex gap-4 mt-6">
          <div className="text-center px-4 py-2 bg-surface-variant/30 rounded-2xl">
            <p className="text-lg font-black text-brand">124</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">{t.staff}</p>
          </div>
          <div className="text-center px-4 py-2 bg-surface-variant/30 rounded-2xl">
            <p className="text-lg font-black text-brand">12</p>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant">{t.pending}</p>
          </div>
        </div>
      </div>

      {/* Theme & Language */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2">{t.settings}</h3>
        
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
                <p className="text-xs font-bold">{t.darkMode}</p>
                <p className="text-[10px] text-on-surface-variant">{isDark ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-brand' : 'bg-outline-variant'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDark ? (lang === 'ar' || lang === 'ur' ? 'left-1' : 'right-1') : (lang === 'ar' || lang === 'ur' ? 'right-1' : 'left-1')}`} />
            </div>
          </button>

          <div className="h-px bg-outline-variant/10 mx-4" />

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full p-4 flex items-center justify-between active:bg-surface-variant/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-brand" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">{t.language}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {lang === 'en' && 'English'}
                    {lang === 'bn' && 'বাংলা'}
                    {lang === 'ar' && 'العربية'}
                    {lang === 'ur' && 'اردو'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-outline transition-transform ${showLangMenu ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-surface-variant/10"
                >
                  {(['en', 'bn', 'ar', 'ur'] as Language[]).map((l) => (
                    <button 
                      key={l}
                      onClick={() => { setLang(l); setShowLangMenu(false); }}
                      className={`w-full p-3 text-xs font-bold flex items-center justify-between px-16 ${lang === l ? 'text-brand' : 'text-on-surface-variant'}`}
                    >
                      {l === 'en' && 'English'}
                      {l === 'bn' && 'বাংলা'}
                      {l === 'ar' && 'العربية'}
                      {l === 'ur' && 'اردو'}
                      {lang === l && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2">{t.security}</h3>
        
        <div className="glass-card overflow-hidden">
          {/* Native Lock Toggle */}
          <button 
            onClick={toggleNativeLock}
            className="w-full p-4 flex items-center justify-between active:bg-surface-variant/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-container rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-on-brand-container" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">{t.nativeLock}</p>
                <p className="text-[10px] text-on-surface-variant">{nativeLockEnabled ? 'Active' : 'Disabled'}</p>
              </div>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${nativeLockEnabled ? 'bg-brand' : 'bg-outline-variant'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${nativeLockEnabled ? (lang === 'ar' || lang === 'ur' ? 'left-1' : 'right-1') : (lang === 'ar' || lang === 'ur' ? 'right-1' : 'left-1')}`} />
            </div>
          </button>

          <div className="h-px bg-outline-variant/10 mx-4" />

          {/* PIN Lock Section */}
          <div className="p-4">
            {isSettingPin ? (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-outline">{t.setupPin}</p>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    maxLength={4} 
                    value={newPin} 
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="4-digit PIN"
                    className="flex-1 bg-surface-variant/50 border-none rounded-xl px-4 py-2 text-sm font-bold"
                  />
                  <button onClick={handleSavePin} className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold">
                    {t.save}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsSettingPin(true)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">{t.pinLock}</p>
                    <p className="text-[10px] text-on-surface-variant">{pin ? 'PIN Active' : 'Not Set'}</p>
                  </div>
                </div>
                <Edit2 className="w-4 h-4 text-brand" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={() => auth.signOut()}
        className="w-full p-4 glass-card border-red-100 bg-red-50/30 flex items-center justify-center gap-2 text-red-600 font-bold active:scale-95 transition-all"
      >
        <LogOut className="w-5 h-5" />
        {t.logout}
      </button>
    </div>
  );
}
