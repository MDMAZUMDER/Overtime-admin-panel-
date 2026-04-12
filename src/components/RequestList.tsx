import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search,
  ChevronRight,
  Calendar,
  User,
  MoreHorizontal,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Timestamp;
}

export default function RequestList() {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as OvertimeRequest));
      setRequests(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await updateDoc(doc(db, 'requests', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${id}`);
    }
  };

  const filteredRequests = requests.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <FilterChip active={filter === 'PENDING'} label="Pending" onClick={() => setFilter('PENDING')} />
        <FilterChip active={filter === 'APPROVED'} label="Approved" onClick={() => setFilter('APPROVED')} />
        <FilterChip active={filter === 'REJECTED'} label="Rejected" onClick={() => setFilter('REJECTED')} />
        <FilterChip active={filter === 'ALL'} label="All" onClick={() => setFilter('ALL')} />
      </div>

      {/* Request List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="glass-card p-4 flex items-center gap-4 group active:bg-surface-variant/20 transition-all"
            >
              <div className="w-10 h-10 bg-surface-variant rounded-full flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-on-surface-variant" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-bold text-on-surface truncate">{request.employeeName}</h4>
                  <span className="text-[10px] font-mono font-bold text-brand">{request.hours}h</span>
                </div>
                <p className="text-[10px] text-on-surface-variant truncate">{request.date} • {request.reason}</p>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    request.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {request.status === 'PENDING' ? (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-outline" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
        active 
          ? 'bg-brand-container text-on-brand-container border-brand/20' 
          : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-variant'
      }`}
    >
      {label}
    </button>
  );
}
