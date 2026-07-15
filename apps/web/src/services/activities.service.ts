import api from '../lib/api';
import type { ApiResponse, ActivityLog } from '../types/api';

export interface CreateActivityPayload {
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE' | 'OTHER';
  content: string;
}

export const activitiesService = {
  getActivities: (leadId: string) =>
    api
      .get<ApiResponse<ActivityLog[]>>(`/leads/${leadId}/activities`)
      .then((r) => r.data.data!),

  createActivity: (leadId: string, data: CreateActivityPayload) =>
    api
      .post<ApiResponse<ActivityLog>>(`/leads/${leadId}/activities`, data)
      .then((r) => r.data.data!),
};
