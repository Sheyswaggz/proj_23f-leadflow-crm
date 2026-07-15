import api from '../lib/api';
import type { ApiResponse, Lead, PaginatedLeads } from '../types/api';

export interface LeadsQueryParams {
  page?: number;
  limit?: number;
  stage?: string;
  search?: string;
}

export interface CreateLeadPayload {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  stage?: string;
  notes?: string;
  dealValue?: number;
}

export const leadsService = {
  getLeads: (params: LeadsQueryParams) =>
    api.get<ApiResponse<PaginatedLeads>>('/leads', { params }).then((r) => r.data.data!),

  getLead: (id: string) =>
    api.get<ApiResponse<Lead>>(`/leads/${id}`).then((r) => r.data.data!),

  createLead: (data: CreateLeadPayload) =>
    api.post<ApiResponse<Lead>>('/leads', data).then((r) => r.data.data!),

  updateLead: (id: string, data: Partial<CreateLeadPayload>) =>
    api.patch<ApiResponse<Lead>>(`/leads/${id}`, data).then((r) => r.data.data!),

  deleteLead: (id: string) =>
    api.delete<ApiResponse<void>>(`/leads/${id}`).then((r) => r.data),
};
