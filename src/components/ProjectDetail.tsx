import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project, Material, Task, Attendance, Announcement } from '../types';
import { 
  ArrowLeft, Package, CheckSquare, ClipboardList, 
  BarChart3, MessageSquare, Users, Loader2, MapPin, IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import Materials from './tabs/Materials';
import Tasks from './tabs/Tasks';
import AttendanceTab from './tabs/Attendance';
import Progress from './tabs/Progress';
import Assistant from './tabs/Assistant';
import Community from './tabs/Community';
import Expenses from './tabs/Expenses';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

type TabType = 'materials' | 'tasks' | 'attendance' | 'progress' | 'expenses' | 'assistant' | 'community';

export default function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  const [loading, setLoading] = useState(true);

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
    { id: 'community', label: 'Community', icon: Users, color: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBack}
            className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors text-green-900 border border-stone-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase text-green-900">{project.name}</h2>
            <div className="flex items-center gap-2 text-stone-400 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">{project.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Alert Bar for Materials */}
      <MaterialAlertBanner projectId={projectId} />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap font-black text-[10px] uppercase tracking-widest",
                isActive 
                  ? "bg-green-800 text-white border-green-800 shadow-md shadow-green-100" 
                  : "bg-white border-stone-200 text-stone-400 hover:border-stone-400"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-stone-300")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
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
            {activeTab === 'community' && <Community projectId={projectId} />}
          </motion.div>
        </AnimatePresence>
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-red-600 text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-lg shadow-red-200"
    >
      <div className="flex items-center gap-3">
        <Package className="h-5 w-5" />
        <p className="text-sm font-bold uppercase tracking-wider">
          Stock Warning: {lowStockMaterials.length} items {lowStockMaterials.some(m => m.status === 'Out') ? 'OUT OF STOCK' : 'LOW'}
        </p>
      </div>
      <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest backdrop-blur">
        Action Required
      </span>
    </motion.div>
  );
}
