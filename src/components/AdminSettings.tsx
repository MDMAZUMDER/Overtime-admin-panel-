import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Mail, 
  Lock,
  ChevronRight,
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

import { seedDatabase } from '../seed';

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedDatabase();
    setIsSeeding(false);
    alert("Database seeded with mock data!");
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6">General Settings</h3>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Organization</label>
            <input type="text" defaultValue="Enterprise Excellence" className="w-full px-4 py-3 bg-surface-variant/50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20" />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Admin Email</label>
            <input type="email" defaultValue="admin@company.com" className="w-full px-4 py-3 bg-surface-variant/50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20" />
          </div>

          <div className="flex items-center justify-between p-4 bg-brand-container/30 rounded-[28px] border border-brand/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-container rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-on-brand-container" />
              </div>
              <div>
                <p className="text-xs font-bold">Push Alerts</p>
                <p className="text-[10px] text-on-surface-variant">Notify on new requests</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2">Maintenance</h3>
        <button 
          onClick={handleSeed}
          disabled={isSeeding}
          className="w-full glass-card p-4 flex items-center justify-between active:bg-surface-variant/20 transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-variant rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-on-surface-variant" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold">Seed Database</p>
              <p className="text-[10px] text-on-surface-variant">Load sample employees & requests</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-outline" />
        </button>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-brand text-white py-4 rounded-[28px] font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="glass-card p-6 border-red-100 bg-red-50/30">
        <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <button className="w-full py-3 border border-red-200 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-50 transition-colors">
          Wipe All System Data
        </button>
      </div>
    </div>
  );
}

function SettingNav({ active, icon, label, desc }: { active: boolean, icon: React.ReactNode, label: string, desc: string }) {
  return (
    <button className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 ${
      active 
        ? 'bg-white shadow-lg shadow-black/5 border border-[#E5E5E5]' 
        : 'hover:bg-white/50'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F5F4] text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${active ? 'text-[#1A1A1A]' : 'text-muted-foreground'}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {active && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}
