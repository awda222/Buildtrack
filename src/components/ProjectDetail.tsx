import { useState, useEffect, lazy, Suspense } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, Material, Task, Attendance, Announcement, TabType } from '../types';
import { 
  ArrowLeft, Package, CheckSquare, ClipboardList, 
  BarChart3, MessageSquare, Users, Loader2, MapPin, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Materials = lazy(() => import('./tabs/Materials'));
const Tasks = lazy(() => import('./tabs/Tasks'));
const AttendanceTab = lazy(() => import('./tabs/Attendance'));
const Progress = lazy(() => import('./tabs/Progress'));
const Assistant = lazy(() => import('./tabs/Assistant'));
const Expenses = lazy(() => import('./tabs/Expenses'));
const WhatsApp = lazy(() => import('./tabs/WhatsApp'));

interface ProjectDetailProps {
  projectId: string;
  initialTab?: TabType;
  onBack: () => void;
}

export default function ProjectDetail({ projectId, initialTab, onBack }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'materials');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() } as Project);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!project) return <div>Project not found.</div>;

  const tabs = [
    { id: 'materials', label: 'Materials', icon: Package, color: 'text-blue-600' },
    { id: 'tasks', label: 'Work Log', icon: CheckSquare, color: 'text-emerald-600' },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList, color: 'text-purple-600' },
    { id: 'expenses', label: 'Expenses', icon: BarChart3, color: 'text-amber-600' },
    { id: 'progress', label: 'Progress', icon: BarChart3, color: 'text-orange-600' },
    { id: 'assistant', label: 'Assistant', icon: MessageSquare, color: 'text-indigo-600' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] ring-1 ring-stone-100">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="h-14 w-14 rounded-2xl bg-stone-50 hover:bg-stone-100 transition-all text-green-900 border border-stone-200 flex items-center justify-center shadow-inner hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="h-6 w-6 stroke-[3px]" />
          </button>
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight uppercase text-green-900 font-display leading-tight">{project.name}</h2>
            <div className="flex items-center gap-2 text-stone-400 mt-1">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{project.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Alert Bar for Materials */}
      <MaterialAlertBanner projectId={projectId} />

      {/* Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border-2 transition-colors whitespace-nowrap font-black text-[10px] uppercase tracking-[0.2em] relative overflow-hidden group",
                isActive 
                  ? "bg-green-900 text-white border-green-900 shadow-xl shadow-green-900/10" 
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeProjectTabGlow"
                  className="absolute inset-0 bg-white/10 pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                initial={false}
                animate={{ rotate: isActive ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.4 }}
              >
                 <Icon className={cn("h-4 w-4", isActive ? "text-orange-500" : tab.color)} />
              </motion.div>
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6 min-h-[400px]">
        <Suspense fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        }>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'materials' && <Materials projectId={projectId} />}
              {activeTab === 'tasks' && <Tasks projectId={projectId} />}
              {activeTab === 'attendance' && <AttendanceTab projectId={projectId} />}
              {activeTab === 'expenses' && <Expenses projectId={projectId} />}
              {activeTab === 'progress' && <Progress projectId={projectId} />}
              {activeTab === 'assistant' && <Assistant projectId={projectId} />}
              {activeTab === 'whatsapp' && <WhatsApp projectId={projectId} />}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}

function MaterialAlertBanner({ projectId }: { projectId: string }) {
  const [lowStockMaterials, setLowStockMaterials] = useState<Material[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, `projects/${projectId}/materials`),
      where('status', 'in', ['Low', 'Out'])
    );
    return onSnapshot(q, (snapshot) => {
      setLowStockMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
    });
  }, [projectId]);

  if (lowStockMaterials.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-600 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-red-200 border-b-4 border-red-700"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.1em]">Material Inventory Alert</p>
          <p className="text-[11px] font-bold text-red-100 mt-0.5">
            {lowStockMaterials.length} items {lowStockMaterials.some(m => m.status === 'Out') ? ' depleted from register' : ' dropping below threshold'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black bg-white text-red-600 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
          Action Required
        </span>
      </div>
    </motion.div>
  );
}
