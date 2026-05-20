import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../App';
import { Project, TabType } from '../types';
import { Plus, MapPin, ChevronRight, HardHat, TrendingUp, AlertCircle, Package, CheckSquare, Trash2, Camera, Upload, X, Users, MessageSquare, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { OperationType, handleFirestoreError } from '../lib/error-handler';

interface DashboardProps {
  onSelectProject: (id: string, tab?: TabType) => void;
  displayMode: 'dashboard' | 'sites';
  onNavigate?: (view: 'sites' | 'community' | 'assistant' | 'dashboard') => void;
}

export default function Dashboard({ onSelectProject, displayMode, onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '', imageUrl: '' });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Dashboard Aggregated Stats
  const [stats, setStats] = useState({
    laborCount: 0,
    alertCount: 0,
    avgProgress: 0,
    pendingTasks: 0,
    expenditure: 0
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'projects'), where('builderId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
      
      // Basic progress aggregation
      const totalProgress = projs.reduce((acc, p) => acc + (p.completion || 0), 0);
      setStats(prev => ({
        ...prev,
        avgProgress: projs.length > 0 ? Math.round(totalProgress / projs.length) : 0
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
    return unsubscribe;
  }, [user]);

  // Aggregation of subcollection data
  useEffect(() => {
    if (projects.length === 0) {
      setStats(prev => ({ ...prev, laborCount: 0, alertCount: 0, pendingTasks: 0 }));
      return;
    }

    const unsubscribes: (() => void)[] = [];
    const siteStats: Record<string, { labor: number; alerts: number; tasks: number; expenses: number; wages: number; matCosts: number }> = {};

    projects.forEach(project => {
      // 1. Attendance aggregation (Labor Today)
      const today = new Date().toISOString().split('T')[0];
      const attendanceTodayQ = query(collection(db, `projects/${project.id}/attendance`), where('date', '==', today));
      unsubscribes.push(onSnapshot(attendanceTodayQ, (snap) => {
        const count = snap.docs.filter(doc => doc.data().status === 'present').length;
        siteStats[project.id] = { ...(siteStats[project.id] || { labor: 0, alerts: 0, tasks: 0, expenses: 0, wages: 0, matCosts: 0 }), labor: count };
        updateGlobalStats();
      }));

      // 1b. Attendance total wages (All time)
      const attendanceAllQ = collection(db, `projects/${project.id}/attendance`);
      unsubscribes.push(onSnapshot(attendanceAllQ, (snap) => {
        const totalWages = snap.docs.reduce((sum, doc) => {
          const data = doc.data();
          if (data.status === 'present') return sum + (data.dailyWage || 0);
          if (data.status === 'half-day') return sum + ((data.dailyWage || 0) / 2);
          return sum;
        }, 0);
        // Note: this overwrites expenses if expenses loaded first? No, we need to store wages and materials separately or just add them.
        // Let's store them on the object:
        const currentStats = siteStats[project.id] || { labor: 0, alerts: 0, tasks: 0, expenses: 0, wages: 0, matCosts: 0 };
        currentStats.wages = totalWages;
        currentStats.expenses = (currentStats.wages || 0) + (currentStats.matCosts || 0);
        siteStats[project.id] = currentStats;
        updateGlobalStats();
      }));

      // 2. Materials aggregation (Alerts)
      const materialsQ = collection(db, `projects/${project.id}/materials`);
      unsubscribes.push(onSnapshot(materialsQ, (snap) => {
        const count = snap.docs.filter(doc => ['Low', 'Out'].includes(doc.data().status)).length;
        const currentStats = siteStats[project.id] || { labor: 0, alerts: 0, tasks: 0, expenses: 0, wages: 0, matCosts: 0 };
        currentStats.alerts = count;
        siteStats[project.id] = currentStats;
        updateGlobalStats();
      }));

      // 3. Tasks aggregation (Pending)
      const tasksQ = collection(db, `projects/${project.id}/tasks`);
      unsubscribes.push(onSnapshot(tasksQ, (snap) => {
        const count = snap.docs.filter(doc => ['pending', 'in-progress'].includes(doc.data().status)).length;
        const currentStats = siteStats[project.id] || { labor: 0, alerts: 0, tasks: 0, expenses: 0, wages: 0, matCosts: 0 };
        currentStats.tasks = count;
        siteStats[project.id] = currentStats;
        updateGlobalStats();
      }));

      // 4. Expenses aggregation (Material / other costs)
      const expensesQ = collection(db, `projects/${project.id}/expenses`);
      unsubscribes.push(onSnapshot(expensesQ, (snap) => {
        const totalCosts = snap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        const currentStats = siteStats[project.id] || { labor: 0, alerts: 0, tasks: 0, expenses: 0, wages: 0, matCosts: 0 };
        currentStats.matCosts = totalCosts;
        currentStats.expenses = (currentStats.wages || 0) + (currentStats.matCosts || 0);
        siteStats[project.id] = currentStats;
        updateGlobalStats();
      }));
    });

    const updateGlobalStats = () => {
      const totals = Object.values(siteStats).reduce((acc, curr) => ({
        labor: acc.labor + curr.labor,
        alerts: acc.alerts + curr.alerts,
        tasks: acc.tasks + curr.tasks,
        expenses: acc.expenses + curr.expenses
      }), { labor: 0, alerts: 0, tasks: 0, expenses: 0 });

      setStats(prev => ({
        ...prev,
        laborCount: totals.labor,
        alertCount: totals.alerts,
        pendingTasks: totals.tasks,
        expenditure: totals.expenses
      }));
    };

    return () => unsubscribes.forEach(unsub => unsub());
  }, [projects]);

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
      setNewProject({ name: '', location: '', imageUrl: '' });
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'projects');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'projects');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, useCamera = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject(prev => ({ ...prev, imageUrl: reader.result as string }));
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Photo processing error:', err);
      setIsProcessingImage(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className={cn("flex gap-4 justify-between", displayMode === 'sites' ? "flex-col items-center text-center justify-center" : "flex-col md:flex-row md:items-center")}>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-green-900 font-display">
            {displayMode === 'dashboard' ? 'Overview' : 'All Sites'}
          </h2>
          <p className="text-stone-500 font-medium text-sm mt-1">Managing {projects.length} active construction sites</p>
        </div>
        <div className={cn("flex items-center gap-3", displayMode === 'sites' && "justify-center")}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDeleting(!isDeleting)}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all shadow-xl",
              isDeleting 
                ? "bg-red-600 border-red-600 text-white shadow-red-200/50" 
                : "bg-white border-stone-200 text-stone-400 hover:border-red-500 hover:text-red-500 shadow-stone-200/20"
            )}
            title="Delete Site"
          >
            <Trash2 className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-8 py-4 text-white hover:bg-orange-700 transition-all font-bold shadow-xl shadow-orange-200/50"
          >
            <Plus className="h-5 w-5 stroke-[3px]" />
            Add New Site
          </motion.button>
        </div>
      </div>

      {/* Stats Overview */}
      {displayMode === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard 
            label="Total Labor Today" 
            value={stats.laborCount.toString()} 
            icon={<HardHat className="h-5 w-5 text-emerald-600" />} 
            trend="Active workers"
            onClick={() => projects.length > 0 && onSelectProject(projects[0].id, 'attendance')}
          />
          <StatCard 
            label="Material Alerts" 
            value={stats.alertCount.toString()} 
            icon={<AlertCircle className={cn("h-5 w-5", stats.alertCount > 0 ? "text-red-600" : "text-stone-400")} />} 
            trend={stats.alertCount > 0 ? "Urgent reorder needed" : "Stock is healthy"}
            urgent={stats.alertCount > 0}
            onClick={() => projects.length > 0 && onSelectProject(projects[0].id, 'materials')}
          />
          <StatCard 
            label="Overall Progress" 
            value={`${stats.avgProgress}%`} 
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />} 
            trend="Avg completion"
            onClick={() => projects.length > 0 && onSelectProject(projects[0].id, 'progress')}
          />
          <StatCard 
            label="Pending Tasks" 
            value={stats.pendingTasks.toString()} 
            icon={<CheckSquare className="h-5 w-5 text-rose-600" />} 
            trend={`Across ${projects.length} sites`}
            onClick={() => projects.length > 0 && onSelectProject(projects[0].id, 'tasks')}
          />
          <StatCard 
            label="Expenditure" 
            value={formatCurrency(stats.expenditure)} 
            icon={<IndianRupee className="h-5 w-5 text-green-600" />} 
            trend="Total cost to date"
            onClick={() => projects.length > 0 && onSelectProject(projects[0].id, 'expenses')}
          />
        </div>
      )}

      {displayMode === 'sites' && (
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            isDeletable={isDeleting}
            onDelete={() => handleDeleteProject(project.id)}
            onClick={(tab) => onSelectProject(project.id, tab)} 
          />
        ))}
        {projects.length === 0 && !isAdding && (
          <div className="md:col-span-3 py-20 border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center text-center text-stone-400 bg-white/50 w-full mx-auto">
            <Plus className="h-12 w-12 mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-[10px]">No active sites found</p>
          </div>
        )}
      </motion.div>
      )}

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
              <div>
                <label className="block text-sm font-bold uppercase tracking-widest text-stone-500 mb-3">Site Photo</label>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 p-4 text-stone-400 hover:border-orange-500 hover:text-orange-600 transition-all bg-stone-50 hover:bg-orange-50/10"
                  >
                    <Camera className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Take Photo</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 p-4 text-stone-400 hover:border-green-500 hover:text-green-600 transition-all bg-stone-50 hover:bg-green-50/10"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                  </motion.button>
                </div>

                <input 
                  type="file"
                  ref={cameraInputRef}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, true)}
                />
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                />

                <AnimatePresence>
                  {newProject.imageUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative h-40 w-full rounded-[2rem] overflow-hidden border-2 border-orange-100 shadow-2xl group ring-4 ring-white"
                    >
                      <img src={newProject.imageUrl} className="h-full w-full object-cover" alt="Preview" />
                      <button 
                        type="button"
                        onClick={() => setNewProject(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {isProcessingImage && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-3 font-medium hover:bg-stone-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 rounded-xl bg-orange-600 py-3 text-white font-medium hover:bg-orange-700"
                >
                  Create
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onClick, isDeletable, onDelete }: { project: Project; onClick: (tab?: TabType) => void; isDeletable?: boolean; onDelete?: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isDeletable) setConfirmDelete(false);
  }, [isDeletable]);

  const handleAction = (e: React.MouseEvent, tab?: TabType) => {
    e.stopPropagation();
    if (isDeletable) return;
    onClick(tab);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete?.();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={isDeletable ? {} : { y: -6 }}
      onClick={() => !isDeletable && onClick()}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-[2rem] border transition-all flex flex-col relative",
        isDeletable 
          ? "border-red-200 bg-red-50/10 ring-2 ring-red-100" 
          : "border-stone-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
      )}
    >
      <div className="h-40 bg-stone-100 relative overflow-hidden border-b border-stone-100 flex-shrink-0">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            className="absolute inset-0 h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" 
            alt={project.name} 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-200/50 to-transparent" />
        )}
        
        <AnimatePresence>
          {isDeletable && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleDelete}
              className={cn(
                "absolute top-6 left-6 z-10 h-10 w-10 md:w-auto md:px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all",
                confirmDelete ? "bg-black text-white" : "bg-red-600 text-white shadow-red-200"
              )}
            >
              <Trash2 className="h-5 w-5" />
              {confirmDelete && <span className="text-[10px] font-black uppercase whitespace-nowrap">Confirm?</span>}
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute top-6 right-6 bg-green-900 text-white rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-white/20">
          {project.phase}
        </div>
        <div className="absolute bottom-6 left-6 flex items-center gap-2">
           <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-sm">
             {project.name.substring(0, 2).toUpperCase()}
           </div>
        </div>
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-green-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight font-display leading-none">{project.name}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-stone-400 mb-6">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">{project.location}</span>
        </div>
        
        {/* Quick Actions / Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8" role="group" aria-label="Project Actions">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleAction(e, 'attendance')}
            aria-label="View live crew status"
            className="flex flex-col p-3 rounded-2xl bg-blue-50/30 border border-blue-100/50 hover:bg-blue-50 transition-colors group/btn text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between mb-2 w-full" aria-hidden="true">
              <HardHat className="h-4 w-4 text-blue-600" />
              <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-widest">Crew</span>
            </div>
            <span className="text-sm font-black text-blue-900">Live Status</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => handleAction(e, 'materials')}
            aria-label="View material stock and alerts"
            className="flex flex-col p-3 rounded-2xl bg-orange-50/30 border border-orange-100/50 hover:bg-orange-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <div className="flex items-center justify-between mb-2 w-full" aria-hidden="true">
              <Package className="h-4 w-4 text-orange-600 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-black text-orange-900/40 uppercase tracking-widest">Stock</span>
            </div>
            <span className="text-sm font-black text-orange-900">Alerts</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => handleAction(e, 'tasks')}
            aria-label="View open tasks"
            className="flex flex-col p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 hover:bg-emerald-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex items-center justify-between mb-2 w-full" aria-hidden="true">
              <CheckSquare className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-black text-emerald-900/40 uppercase tracking-widest">Tasks</span>
            </div>
            <span className="text-sm font-black text-emerald-900">All Open</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={(e) => handleAction(e, 'progress')}
            aria-label={`View progress, current completion is ${project.completion}%`}
            className="flex flex-col p-3 rounded-2xl bg-purple-50/30 border border-purple-100/50 hover:bg-purple-50 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <div className="flex items-center justify-between mb-2 w-full" aria-hidden="true">
              <TrendingUp className="h-4 w-4 text-purple-600 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-black text-purple-900/40 uppercase tracking-widest">Goal</span>
            </div>
            <span className="text-sm font-black text-purple-900">{project.completion}% Comp.</span>
          </motion.button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-stone-100">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em]">
            SITE ID: {project.id.substring(0, 8).toUpperCase()}
          </span>
          <div className="flex items-center gap-2 text-stone-400 group-hover:text-orange-600 transition-colors">
            <span className="text-[10px] font-black uppercase tracking-widest">Open Details</span>
            <ChevronRight className="h-4 w-4 stroke-[3px]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, trend, urgent, onClick }: { label: string; value: string; icon: React.ReactNode; trend: string; urgent?: boolean; onClick?: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={`${label}, ${value}, ${trend}`}
      className={cn(
        "p-6 rounded-[2rem] border transition-all h-36 flex flex-col justify-between text-left group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-900",
        urgent 
          ? "bg-red-50 border-red-200 hover:bg-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.1)] focus:ring-red-600" 
          : "bg-white border-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-stone-300"
      )}
    >
      <div className="flex justify-between items-start w-full">
        <span className={cn("text-[10px] font-black uppercase tracking-[0.15em]", urgent ? "text-red-800" : "text-stone-400")}>
          {label}
        </span>
        <div className={cn("p-2.5 rounded-2xl transition-colors", urgent ? "bg-red-200/50" : "bg-stone-50 group-hover:bg-white")} aria-hidden="true">
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-black font-display truncate", urgent ? "text-red-600" : "text-green-900")}>{value}</span>
        </div>
        <p className={cn("text-[10px] font-black uppercase tracking-widest mt-1 opacity-80", urgent ? "text-red-600 animate-pulse" : "text-green-700")}>
          {trend}
        </p>
      </div>
    </motion.button>
  );
}
