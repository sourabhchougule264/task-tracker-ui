// User and Authentication Types
export interface User {
  username: string;
  email: string;
  roles: string[];
}

export interface UserProfile {
  id?: number;
  username: string;
  email: string;
  cognitoSub?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roles?: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  challengeName?: string;
  session?: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ChallengeResponse {
  success: boolean;
  challenge?: string;
  session?: string;
  error?: string;
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  ownerId?: number;
  ownerUsername?: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectData {
  id: number;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

// Task Types
export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  NOT_STARTED = 'NOT_STARTED'
}

export interface Task {
  id: number;
  description: string;
  dueDate?: string;
  status: TaskStatus;
  projectId?: number;
  projectName?: string;
  ownerId?: number;
  ownerUsername?: string;
  assignedUserId?: number;
  assignedUsername?: string;
}

export interface CreateTaskData {
  description: string;
  projectId?: number;
  assignedUsername?: string;
  dueDate?: string;
}

export interface UpdateTaskData {
  id: number;
  description?: string;
  status?: TaskStatus;
  projectId?: number;
  assignedUsername?: string;
  dueDate?: string;
}

// User Management Types

export interface UpdateUserRoleData {
  username: string;
  role: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// UI State Types
export interface ModalState {
  isOpen: boolean;
  type: 'create-project' | 'create-task' | 'edit-project' | 'edit-task' | 'confirm' | null;
  data?: any;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Redux Store Types
export interface RootState {
  auth: AuthState;
  ui: UIState;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notification: NotificationState;
}

// Hook Return Types
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<ChallengeResponse | { success: boolean; error?: string }>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; error?: string }>;
  confirm: (username: string, code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  isAdmin: () => boolean;
  canCreateTasks: () => boolean;
}

