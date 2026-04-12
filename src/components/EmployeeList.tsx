import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  UserPlus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'ON_BREAK' | 'INACTIVE';
  photoUrl?: string;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(docs);
    });
    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                         emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || emp.department === filter;
    return matchesSearch && matchesFilter;
  });

  const departments = ['All', ...new Set(employees.map(e => e.department))];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-[#E5E5E5] px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none"
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredEmployees.map((employee) => (
            <motion.div
              key={employee.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-4 flex items-center gap-4 group active:scale-95 transition-all"
            >
              <img 
                src={employee.photoUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} 
                alt={employee.name} 
                className="w-12 h-12 rounded-full object-cover border border-outline-variant"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-on-surface truncate">{employee.name}</h4>
                <p className="text-[10px] text-on-surface-variant font-medium truncate">{employee.position} • {employee.department}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    employee.status === 'ACTIVE' ? 'bg-green-500' : 
                    employee.status === 'ON_BREAK' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{employee.status}</span>
                </div>
              </div>

              <button className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-outline" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-brand text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
              <h3 className="text-xl font-bold">Add New Employee</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-[#F5F5F4] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              // Handle add logic
              setIsAddModalOpen(false);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-[#F5F5F4] border-none rounded-xl focus:ring-2 focus:ring-brand/20" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                  <input type="email" className="w-full px-4 py-2.5 bg-[#F5F5F4] border-none rounded-xl focus:ring-2 focus:ring-brand/20" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</label>
                  <select className="w-full px-4 py-2.5 bg-[#F5F5F4] border-none rounded-xl focus:ring-2 focus:ring-brand/20">
                    <option>Engineering</option>
                    <option>HR</option>
                    <option>Sales</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Position</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-[#F5F5F4] border-none rounded-xl focus:ring-2 focus:ring-brand/20" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-2xl font-bold mt-4 hover:bg-black transition-all">
                Create Employee Profile
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
