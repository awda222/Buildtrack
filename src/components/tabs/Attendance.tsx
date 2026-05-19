import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Attendance, AttendanceStatus } from '../../types';
import { User, Check, X, Clock, Camera, Calculator } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

export default function AttendanceTab({ projectId }: { projectId: string }) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', wage: 500 });
  const [today] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const q = query(
      collection(db, `projects/${projectId}/attendance`), 
      where('date', '==', today),
      orderBy('workerName')
    );
    return onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as Attendance)));
    });
  }, [projectId, today]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, `projects/${projectId}/attendance`), {
      projectId,
      workerId: `w_${Math.random().toString(36).substr(2, 9)}`,
      workerName: newWorker.name,
      dailyWage: newWorker.wage,
      date: today,
      status: 'present',
      timestamp: new Date().toISOString()
    });
    setNewWorker({ name: '', wage: 500 });
    setIsAdding(false);
  };

  const updateStatus = async (id: string, status: AttendanceStatus) => {
    await updateDoc(doc(db, `projects/${projectId}/attendance`, id), { status });
  };

  const totalWages = attendance.reduce((sum, a) => sum + (a.status === 'present' ? (a.dailyWage || 0) : 0), 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-green-900">Today's Roll Call</h3>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl px-4 py-2 border border-stone-100 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total Wages</p>
            <p className="text-lg font-black text-green-900 leading-none mt-1">{formatCurrency(totalWages)}</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-100 hover:bg-orange-100 transition-all"
          >
            <Calculator className="h-4 w-4" />
            Add Worker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map((record) => (
          <div 
            key={record.id}
            className={cn(
              "p-5 rounded-xl border transition-all flex items-center justify-between gap-4 site-card",
              record.status !== 'present' && "opacity-50 grayscale"
            )}
          >
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-stone-400" />
               </div>
               <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-xs uppercase tracking-tight text-green-900 truncate max-w-[100px]">{record.workerName}</h4>
                    {record._isSyncing && (
                      <div className="h-1 w-1 rounded-full bg-orange-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mt-0.5">{formatCurrency(record.dailyWage || 0)}/day</p>
               </div>
            </div>

            <div className="flex items-center gap-1.5">
               <button 
                 onClick={() => updateStatus(record.id, 'present')}
                 className={cn(
                   "p-2 rounded-lg transition-all border",
                   record.status === 'present' ? "bg-green-800 text-white border-green-800 shadow-sm" : "bg-white text-stone-300 border-stone-100 hover:border-stone-200"
                 )}
               >
                 <Check className="h-3.5 w-3.5" />
               </button>
               <button 
                 onClick={() => updateStatus(record.id, 'absent')}
                 className={cn(
                   "p-2 rounded-lg transition-all border",
                   record.status === 'absent' ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-white text-stone-300 border-stone-100 hover:border-stone-200"
                 )}
               >
                 <X className="h-3.5 w-3.5" />
               </button>
            </div>
          </div>
        ))}
      </div>

      {attendance.length === 0 && !isAdding && (
         <div className="text-center py-20 bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200 text-stone-400">
            No workers checked in for {today}.
         </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Register Worker</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Worker Name</label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-xl border-stone-200 py-3 font-semibold"
                  value={newWorker.name}
                  onChange={e => setNewWorker({...newWorker, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Daily Wage (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full rounded-xl border-stone-200 py-3 font-bold"
                  value={newWorker.wage}
                  onChange={e => setNewWorker({...newWorker, wage: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 py-3 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-orange-100"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
