/**
 * Firestore CRUD operations with demo mode in-memory fallback
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { isFirebaseConfigured } from '../config/env';
import {
  DEMO_MATERIALS,
  DEMO_PROJECTS,
  DEMO_TASKS,
  DEMO_NOTIFICATIONS,
  DEMO_ACTIVITIES,
  DEMO_INSIGHTS,
} from '../constants/demoData';
import type {
  Material,
  Project,
  Task,
  Notification,
  ActivityItem,
  AIInsight,
} from '../types';

// In-memory store for demo mode mutations
let demoMaterials = [...DEMO_MATERIALS];
let demoProjects = [...DEMO_PROJECTS];
let demoTasks = [...DEMO_TASKS];
let demoNotifications = [...DEMO_NOTIFICATIONS];

// ——— Projects ———

export async function getProjects(): Promise<Project[]> {
  if (!isFirebaseConfigured()) return demoProjects;

  const db = getFirebaseDb();
  if (!db) return demoProjects;

  const snap = await getDocs(
    query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
}

export async function saveProject(project: Project): Promise<void> {
  if (!isFirebaseConfigured()) {
    const idx = demoProjects.findIndex((p) => p.id === project.id);
    if (idx >= 0) demoProjects[idx] = project;
    else demoProjects.unshift(project);
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, 'projects', project.id), project);
}

export async function deleteProject(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    demoProjects = demoProjects.filter((p) => p.id !== id);
    return;
  }
  const db = getFirebaseDb();
  if (db) await deleteDoc(doc(db, 'projects', id));
}

// ——— Materials ———

export async function getMaterials(projectId?: string): Promise<Material[]> {
  if (!isFirebaseConfigured()) {
    return projectId
      ? demoMaterials.filter((m) => m.projectId === projectId)
      : demoMaterials;
  }

  const db = getFirebaseDb();
  if (!db) return demoMaterials;

  const q = projectId
    ? query(collection(db, 'materials'), where('projectId', '==', projectId))
    : collection(db, 'materials');

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Material);
}

export async function saveMaterial(material: Material): Promise<void> {
  if (!isFirebaseConfigured()) {
    const idx = demoMaterials.findIndex((m) => m.id === material.id);
    if (idx >= 0) demoMaterials[idx] = material;
    else demoMaterials.unshift(material);
    return;
  }

  const db = getFirebaseDb();
  if (db) await setDoc(doc(db, 'materials', material.id), material);
}

export async function deleteMaterial(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    demoMaterials = demoMaterials.filter((m) => m.id !== id);
    return;
  }
  const db = getFirebaseDb();
  if (db) await deleteDoc(doc(db, 'materials', id));
}

// ——— Tasks ———

export async function getTasks(projectId?: string): Promise<Task[]> {
  if (!isFirebaseConfigured()) {
    return projectId
      ? demoTasks.filter((t) => t.projectId === projectId)
      : demoTasks;
  }

  const db = getFirebaseDb();
  if (!db) return demoTasks;

  const q = projectId
    ? query(collection(db, 'tasks'), where('projectId', '==', projectId))
    : collection(db, 'tasks');

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task);
}

export async function saveTask(task: Task): Promise<void> {
  if (!isFirebaseConfigured()) {
    const idx = demoTasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) demoTasks[idx] = task;
    else demoTasks.unshift(task);
    return;
  }

  const db = getFirebaseDb();
  if (db) await setDoc(doc(db, 'tasks', task.id), task);
}

export async function deleteTask(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    demoTasks = demoTasks.filter((t) => t.id !== id);
    return;
  }
  const db = getFirebaseDb();
  if (db) await deleteDoc(doc(db, 'tasks', id));
}

// ——— Notifications ———

export async function getNotifications(): Promise<Notification[]> {
  if (!isFirebaseConfigured()) return demoNotifications;

  const db = getFirebaseDb();
  if (!db) return demoNotifications;

  const snap = await getDocs(
    query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Notification);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    demoNotifications = demoNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    return;
  }

  const db = getFirebaseDb();
  if (db) await updateDoc(doc(db, 'notifications', id), { read: true });
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!isFirebaseConfigured()) {
    demoNotifications = demoNotifications.map((n) => ({ ...n, read: true }));
    return;
  }
}

// ——— Activity & Insights (read-only demo) ———

export async function getActivities(): Promise<ActivityItem[]> {
  return DEMO_ACTIVITIES;
}

export async function getAIInsights(): Promise<AIInsight[]> {
  return DEMO_INSIGHTS;
}

/** Reset demo data to defaults */
export function resetDemoData(): void {
  demoMaterials = [...DEMO_MATERIALS];
  demoProjects = [...DEMO_PROJECTS];
  demoTasks = [...DEMO_TASKS];
  demoNotifications = [...DEMO_NOTIFICATIONS];
}
