/**
 * App-wide data context — projects, materials, tasks, notifications
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import * as firestoreService from '../services/firestoreService';
import type {
  Project,
  Material,
  Task,
  Notification,
  ActivityItem,
  AIInsight,
} from '../types';

interface AppContextValue {
  projects: Project[];
  materials: Material[];
  tasks: Task[];
  notifications: Notification[];
  activities: ActivityItem[];
  insights: AIInsight[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveMaterial: (material: Material) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  saveTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  unreadCount: number;
  lowStockMaterials: Material[];
  delayedTasks: Task[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, m, t, n, a, i] = await Promise.all([
        firestoreService.getProjects(),
        firestoreService.getMaterials(),
        firestoreService.getTasks(),
        firestoreService.getNotifications(),
        firestoreService.getActivities(),
        firestoreService.getAIInsights(),
      ]);
      setProjects(p);
      setMaterials(m);
      setTasks(t);
      setNotifications(n);
      setActivities(a);
      setInsights(i);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProject = async (project: Project) => {
    await firestoreService.saveProject(project);
    await refresh();
  };

  const deleteProject = async (id: string) => {
    await firestoreService.deleteProject(id);
    await refresh();
  };

  const saveMaterial = async (material: Material) => {
    await firestoreService.saveMaterial(material);
    await refresh();
  };

  const deleteMaterial = async (id: string) => {
    await firestoreService.deleteMaterial(id);
    await refresh();
  };

  const saveTask = async (task: Task) => {
    await firestoreService.saveTask(task);
    await refresh();
  };

  const deleteTask = async (id: string) => {
    await firestoreService.deleteTask(id);
    await refresh();
  };

  const markNotificationRead = async (id: string) => {
    await firestoreService.markNotificationRead(id);
    await refresh();
  };

  const lowStockMaterials = materials.filter(
    (m) => m.quantity < m.minThreshold
  );

  const delayedTasks = tasks.filter(
    (t) =>
      t.status !== 'completed' && new Date(t.deadline) < new Date()
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        projects,
        materials,
        tasks,
        notifications,
        activities,
        insights,
        loading,
        refresh,
        saveProject,
        deleteProject,
        saveMaterial,
        deleteMaterial,
        saveTask,
        deleteTask,
        markNotificationRead,
        unreadCount,
        lowStockMaterials,
        delayedTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
