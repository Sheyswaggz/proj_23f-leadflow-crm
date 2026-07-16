import api from '../lib/api';
import type { ApiResponse, DashboardStats } from '../types/api';

export const dashboardService = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats').then((r) => r.data.data!),
};
