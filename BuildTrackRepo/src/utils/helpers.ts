/**
 * Utility helpers
 */
import type { MaterialCategory } from '../types';

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const MATERIAL_CATEGORIES: {
  value: MaterialCategory;
  label: string;
}[] = [
  { value: 'cement', label: 'Cement' },
  { value: 'steel', label: 'Steel' },
  { value: 'bricks', label: 'Bricks' },
  { value: 'sand', label: 'Sand' },
  { value: 'paint', label: 'Paint' },
  { value: 'electrical', label: 'Electrical' },
];

export const TASK_STATUSES = [
  { value: 'pending' as const, label: 'Pending' },
  { value: 'in_progress' as const, label: 'In Progress' },
  { value: 'completed' as const, label: 'Completed' },
];

export const PROJECT_STATUSES = [
  { value: 'planning' as const, label: 'Planning' },
  { value: 'active' as const, label: 'Active' },
  { value: 'on_hold' as const, label: 'On Hold' },
  { value: 'completed' as const, label: 'Completed' },
];
