export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST'
}

export interface ActivityLog {
  id: string;
  leadId: string;
  userId: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'OTHER';
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface FollowUpReminder {
  id: string;
  leadId: string;
  userId: string;
  dueAt: string;
  note?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    name: string;
    company?: string;
  };
}

export interface Lead {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  stage: LeadStage;
  notes?: string;
  dealValue?: string;
  createdAt: string;
  updatedAt: string;
  activityLogs?: ActivityLog[];
  followUpReminders?: FollowUpReminder[];
}

export interface PaginatedLeads {
  leads: Lead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  leadsByStage: Record<string, number>;
  upcomingReminders: FollowUpReminder[];
  overdueCount: number;
  recentLeads: Partial<Lead>[];
}
