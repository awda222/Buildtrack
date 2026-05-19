import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Project } from '../types';
import { Plus, MapPin, ChevronRight, HardHat, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { OperationType, handleFirestoreError } from '../lib/error-handler';

interface DashboardProps {
  onSelectProject: (id: string) => void;
}

export default function Dashboard({ onSelectProject }: DashboardProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '' });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'projects'), where('builderId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
    return unsubscribe;
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newProject.name) return;
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        builderId: user.uid,
        status: 'active',
        phase: 'Excavation',
        completion: 0,
        createdAt: new Date().toISOString()
      });
      setNewProject({ name: '', location: '' });
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'projects');
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Sites</h2>
          <p className="text-stone-500">Managing {projects.length} projects in your region</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-white hover:bg-orange-700 transition-all font-semibold shadow-lg shadow-orange-200"
        >
          <Plus className="h-5 w-5" />
          New Site
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Labor Today" 
          value="48" 
          icon={<HardHat className="h-5 w-5 text-blue-600" />} 
          trend="+5 from yesterday"
        />
        <StatCard 
          label="Material Alerts" 
          value="3" 
          icon={<AlertCircle className="h-5 w-5 text-red-600" />} 
          trend="Urgent reorder"
          urgent
        />
        <StatCard 
          label="Overall Progress" 
          value="42%" 
          icon={<TrendingUp className="h-5 w-5 text-green-600" />} 
          trend="On track"
        />
        <StatCard 
          label="Pending Tasks" 
          value="12" 
          icon={<ChevronRight className="h-5 w-5 text-stone-600" />} 
          trend="Across 4 sites"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={() => onSelectProject(project.id)} 
          />
        ))}
        {projects.length === 0 && !isAdding && (
          <div className="md:col-span-3 py-20 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center text-stone-400">
            <Plus className="h-12 w-12 mb-4 opacity-20" />
            <p>No sites found. Add your first construction site.</p>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6">New Site Details</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Project Name</label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Skyline Heights"
                  className="w-full rounded-xl border-stone-200 focus:border-orange-500 focus:ring-orange-500 py-3"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 45, Gurgaon"
                  className="w-full rounded-xl border-stone-200 focus:border-orange-500 focus:ring-orange-500 py-3"
                  value={newProject.location}
                  onChange={e => setNewProject({...newProject, location: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 py-3 text-white font-medium hover:bg-orange-700"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div className="h-32 bg-stone-100/50 relative overflow-hidden border-b border-stone-100">
        <div className="absolute inset-0 bg-stone-200/20" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-green-900 border border-stone-200">
          {project.phase}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-green-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{project.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5 text-stone-400">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">{project.location}</span>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-black text-green-900">{project.completion}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${project.completion}%` }}
              className="h-full bg-green-800" 
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-50">
          <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">
            {formatDate(project.createdAt)}
          </span>
          <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-orange-600 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, trend, urgent }: { label: string; value: string; icon: React.ReactNode; trend: string; urgent?: boolean }) {
  return (
    <div className={cn(
      "p-5 rounded-xl border transition-all h-32 flex flex-col justify-between",
      urgent ? "bg-red-50 border-red-200" : "bg-white border-stone-100 shadow-sm"
    )}>
      <span className={cn("text-[10px] font-black uppercase tracking-widest", urgent ? "text-red-800" : "text-stone-400")}>
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={cn("text-3xl font-black", urgent ? "text-red-600" : "text-green-900")}>{value}</span>
        {!urgent && <span className="text-[10px] font-bold text-stone-400 uppercase">{trend.split(' ')[0]}</span>}
      </div>
      <p className={cn("text-[9px] font-black uppercase tracking-widest", urgent ? "text-red-600 animate-pulse" : "text-green-800")}>
        {trend}
      </p>
    </div>
  );
}
