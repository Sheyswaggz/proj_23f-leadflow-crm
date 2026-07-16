import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService, type CreateActivityPayload } from '../services/activities.service';

export function useActivities(leadId: string) {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: () => activitiesService.getActivities(leadId),
    enabled: !!leadId,
  });
}

export function useCreateActivity(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityPayload) => activitiesService.createActivity(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', leadId] });
    },
  });
}
