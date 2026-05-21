/**
 * Navigation type definitions
 */
import type { Material, Project, Task } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Materials: undefined;
  Tasks: undefined;
  Projects: undefined;
  AIAssistant: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  MaterialForm: { material?: Material };
  TaskForm: { task?: Task };
  ProjectForm: { project?: Project };
  ProjectDetail: { project: Project };
  Notifications: undefined;
};
