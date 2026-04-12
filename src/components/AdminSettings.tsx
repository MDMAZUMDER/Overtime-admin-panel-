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
import { motion, AnimatePresence } from 'motion/react';

import { seedDatabase } from '../seed';

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'policy' | 'access' | 'data'>('general');

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
      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <AdminTab active={activeTab === 'general'} label="General" onClick={() => setActiveTab('general')} />
        <AdminTab active={activeTab === 'policy'} label="Policy" onClick={() => setActiveTab('policy')} />
        <AdminTab active={activeTab === 'access'} label="Access" onClick={() => setActiveTab('access')} />
        <AdminTab active={activeTab === 'data'} label="Data" onClick={() => setActiveTab('data')} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6">Organization Details</h3>
                <div className="space-y-4">
                  <InputField label="Organization Name" defaultValue="Enterprise Excellence" />
                  <InputField label="Admin Email" defaultValue="admin@company.com" />
                  <InputField label="Support Contact" defaultValue="+1 (555) 000-1234" />
                </div>
              </div>
              
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">Notifications</h3>
                <div className="space-y-3">
                  <ToggleRow icon={<Bell className="w-5 h-5" />} title="Push Notifications" desc="Alerts for new OT requests" />
                  <ToggleRow icon={<Mail className="w-5 h-5" />} title="Email Reports" desc="Weekly summary to admin" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6">Overtime Rules</h3>
                <div className="space-y-4">
                  <InputField label="Standard OT Rate (x)" defaultValue="1.5" type="number" />
                  <InputField label="Max Weekly Hours" defaultValue="20" type="number" />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-outline ml-1">Approval Workflow</label>
                    <select className="w-full px-4 py-3 bg-surface-variant/50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 text-sm font-medium">
                      <option>Single Level (Admin Only)</option>
                      <option>Dual Level (Manager + Admin)</option>
                      <option>Auto-Approve (Below 2h)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-6">Role Management</h3>
                <div className="space-y-3">
                  <RoleItem title="Super Admin" count={2} />
                  <RoleItem title="Department Manager" count={8} />
                  <RoleItem title="Employee" count={124} />
                </div>
                <button className="w-full mt-6 py-3 border border-brand/20 text-brand rounded-2xl text-xs font-bold hover:bg-brand/5 transition-colors">
                  Manage Permissions
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">Maintenance</h3>
                <button 
                  onClick={handleSeed}
                  disabled={isSeeding}
                  className="w-full p-4 flex items-center justify-between bg-surface-variant/30 rounded-2xl active:bg-surface-variant/50 transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-brand" />
                    <div className="text-left">
                      <p className="text-xs font-bold">Seed Mock Data</p>
                      <p className="text-[10px] text-on-surface-variant">Reset DB with sample records</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline" />
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
          )}
        </motion.div>
      </AnimatePresence>

      {/* Save Button */}
      <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-brand text-white py-4 rounded-[28px] font-bold shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
        >
          {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Applying Changes...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function AdminTab({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
        active 
          ? 'bg-brand text-white border-brand shadow-md' 
          : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-variant'
      }`}
    >
      {label}
    </button>
  );
}

function InputField({ label, defaultValue, type = "text" }: { label: string, defaultValue: string, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-outline ml-1">{label}</label>
      <input 
        type={type} 
        defaultValue={defaultValue} 
        className="w-full px-4 py-3 bg-surface-variant/50 border-none rounded-2xl focus:ring-2 focus:ring-brand/20 text-sm font-medium" 
      />
    </div>
  );
}

function ToggleRow({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-variant/20 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="text-brand">{icon}</div>
        <div>
          <p className="text-xs font-bold">{title}</p>
          <p className="text-[10px] text-on-surface-variant">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked className="sr-only peer" />
        <div className="w-10 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
      </label>
    </div>
  );
}

function RoleItem({ title, count }: { title: string, count: number }) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-outline-variant/10">
      <p className="text-xs font-medium">{title}</p>
      <span className="text-[10px] font-bold bg-brand-container text-on-brand-container px-2 py-0.5 rounded-md">{count}</span>
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
