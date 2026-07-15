import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  remindersService,
  type CreateReminderPayload,
  type UpdateReminderPayload,
} from '../services/reminders.service';

export function useLeadReminders(leadId: string) {
  return useQuery({
    queryKey: ['reminders', 'lead', leadId],
    queryFn: () => remindersService.getLeadReminders(leadId),
    enabled: !!leadId,
  });
}

export function useUserReminders(status?: 'pending' | 'completed') {
  return useQuery({
    queryKey: ['reminders', 'user', status],
    queryFn: () => remindersService.getUserReminders(status),
  });
}

export function useCreateReminder(leadId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReminderPayload) => remindersService.createReminder(leadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', 'lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', 'user'] });
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderPayload }) =>
      remindersService.updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => remindersService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}
