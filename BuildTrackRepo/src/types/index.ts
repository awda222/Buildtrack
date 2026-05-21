/**
 * Core TypeScript types for BuildTrack
 */

export type UserRole = 'builder' | 'supervisor';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  company?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type MaterialCategory =
  | 'cement'
  | 'steel'
  | 'bricks'
  | 'sand'
  | 'paint'
  | 'electrical';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  projectId: string;
  supplier?: string;
  lastUpdated: string;
  usageHistory?: MaterialUsage[];
}

export interface MaterialUsage {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  assignedToName?: string;
  projectId: string;
  projectName?: string;
  deadline: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate?: string;
  supervisorId?: string;
  supervisorName?: string;
  imageUrls?: string[];
  documentUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'deadline' | 'ai_warning' | 'project_update' | 'task';
  read: boolean;
  createdAt: string;
  projectId?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  projectId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}
