import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Task, TaskStatus } from '../../types';
import { Plus, Clock, CheckCircle2, AlertCircle, Camera, User, RefreshCw } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';

export default function Tasks({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', description: '' });

  useEffect(() => {
    const q = query(collection(db, `projects/${projectId}/tasks`), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        _isSyncing: doc.metadata.hasPendingWrites
      } as Task)));
    });
  }, [projectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, `projects/${projectId}/tasks`), {
      ...newTask,
      projectId,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      photoUrls: []
    });
    setNewTask({ title: '', assignedTo: '', description: '' });
    setIsAdding(false);
  };

  const updateStatus = async (id: string, status: TaskStatus) => {
    await updateDoc(doc(db, `projects/${projectId}/tasks`, id), { status });
  };

  const statusIcons = {
    'pending': <Clock className="h-5 w-5 text-stone-400" />,
    'in-progress': <Clock className="h-5 w-5 text-blue-600 animate-pulse" />,
    'completed': <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    'blocked': <AlertCircle className="h-5 w-5 text-red-600" />
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase tracking-tight text-green-900">Today's Work Log</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-100 hover:bg-orange-100 transition-all"
        >
          <Plus className="h-4 w-4" />
          Assign Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="group site-card p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {statusIcons[task.status]}
                  <h4 className="font-black text-lg text-green-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                    {task.title}
                  </h4>
                  {task._isSyncing && (
                    <RefreshCw className="h-3 w-3 text-orange-400 animate-spin" />
                  )}
                </div>
                {task.description && (
                  <p className="text-stone-500 text-sm font-medium">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-50 border border-stone-100">
                    <User className="h-3 w-3 text-stone-400" />
                    <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest">
                      {task.assignedTo || 'Unassigned'}
                    </span>
                  </div>
                  <div className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
                    {formatDate(task.date)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                 <select 
                   value={task.status}
                   onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                   className={cn(
                     "rounded-lg border-stone-100 text-[9px] font-black uppercase tracking-widest py-1.5 pl-2 pr-7 focus:ring-0",
                     task.status === 'completed' ? "bg-green-50 text-green-700 border-green-100" :
                     task.status === 'in-progress' ? "bg-blue-50 text-blue-700 border-blue-100" :
                     task.status === 'blocked' ? "bg-red-50 text-red-700 border-red-100" : "bg-stone-50 text-stone-500"
                   )}
                 >
                   <option value="pending">Pending</option>
                   <option value="in-progress">Building</option>
                   <option value="completed">Done</option>
                   <option value="blocked">Blocked</option>
                 </select>
              </div>
            </div>
            
            {task.status === 'blocked' && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Cause: Missing Materials (Check Materials Tab)
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && !isAdding && (
          <div className="text-center py-12 text-stone-400 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
            No tasks logged today. Get building!
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Assign New Task</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Task Title</label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Pillar Casting (Block A)"
                  className="w-full rounded-xl border-stone-200 py-3 font-semibold"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Assigned To</label>
                <input
                  type="text"
                  placeholder="Supervisor or Gang Leader"
                  className="w-full rounded-xl border-stone-200 py-3"
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Brief (Optional)</label>
                <textarea
                  placeholder="Details for the team..."
                  className="w-full rounded-xl border-stone-200 py-3 h-24"
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
