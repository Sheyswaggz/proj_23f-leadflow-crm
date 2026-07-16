import api from '../lib/api';
import type { ApiResponse, FollowUpReminder } from '../types/api';

export interface CreateReminderPayload {
  dueAt: string;
  note?: string;
}

export interface UpdateReminderPayload {
  dueAt?: string;
  note?: string;
  isCompleted?: boolean;
}

export const remindersService = {
  getLeadReminders: (leadId: string) =>
    api
      .get<ApiResponse<FollowUpReminder[]>>(`/leads/${leadId}/reminders`)
      .then((r) => r.data.data!),

  getUserReminders: (status?: 'pending' | 'completed') =>
    api
      .get<ApiResponse<FollowUpReminder[]>>('/reminders', { params: { status } })
      .then((r) => r.data.data!),

  createReminder: (leadId: string, data: CreateReminderPayload) =>
    api
      .post<ApiResponse<FollowUpReminder>>(`/leads/${leadId}/reminders`, data)
      .then((r) => r.data.data!),

  updateReminder: (id: string, data: UpdateReminderPayload) =>
    api
      .patch<ApiResponse<FollowUpReminder>>(`/reminders/${id}`, data)
      .then((r) => r.data.data!),

  deleteReminder: (id: string) =>
    api.delete<ApiResponse<void>>(`/reminders/${id}`).then((r) => r.data),
};
