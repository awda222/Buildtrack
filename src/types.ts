export type Role = 'builder' | 'supervisor' | 'worker';
export type ProjectStatus = 'active' | 'completed' | 'delayed';
export type MaterialStatus = 'OK' | 'Low' | 'Out';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  photoURL?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  builderId: string;
  status: ProjectStatus;
  phase: string;
  completion: number;
  createdAt: string;
  _isSyncing?: boolean;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  currentStock: number;
  unit: string;
  threshold: number;
  status: MaterialStatus;
  updatedAt: string;
  _isSyncing?: boolean;
}

export interface Attendance {
  id: string;
  projectId: string;
  workerId: string;
  workerName: string;
  date: string;
  status: AttendanceStatus;
  photoUrl?: string;
  dailyWage?: number;
  timestamp: string;
  _isSyncing?: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status: TaskStatus;
  blockedReason?: string;
  photoUrls?: string[];
  date: string;
  createdAt: string;
  _isSyncing?: boolean;
}

export interface Expense {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  category: string;
  vendor?: string;
  date: string;
  createdAt: string;
  _isSyncing?: boolean;
}

export interface Announcement {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes?: string[];
  dislikes?: string[];
  _isSyncing?: boolean;
}

export interface Reply {
  id: string;
  announcementId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  _isSyncing?: boolean;
}
