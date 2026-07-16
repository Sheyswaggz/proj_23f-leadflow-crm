import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateReminder } from '@/hooks/useReminders';
import { useToast } from '@/components/ui/toast';

interface AddReminderFormProps {
  leadId: string;
}

const reminderSchema = z.object({
  dueAt: z.string().min(1, 'Date and time required'),
  note: z.string().max(1000).optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

export default function AddReminderForm({ leadId }: AddReminderFormProps) {
  const { toast } = useToast();
  const createReminder = useCreateReminder(leadId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
  });

  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const onSubmit = async (data: ReminderFormData) => {
    try {
      const dueAtISO = new Date(data.dueAt).toISOString();
      await createReminder.mutateAsync({
        dueAt: dueAtISO,
        note: data.note || undefined,
      });
      toast({
        title: 'Reminder scheduled',
        description: 'Your follow-up reminder has been created.',
      });
      reset();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to schedule reminder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dueAt">Follow-up Date & Time</Label>
        <Input
          id="dueAt"
          type="datetime-local"
          min={minDateTime}
          {...register('dueAt')}
          className={errors.dueAt ? 'border-destructive' : ''}
        />
        {errors.dueAt && (
          <p className="text-sm text-destructive">{errors.dueAt.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="Add a note for this reminder..."
          rows={3}
          {...register('note')}
          className={errors.note ? 'border-destructive' : ''}
        />
        {errors.note && (
          <p className="text-sm text-destructive">{errors.note.message}</p>
        )}
      </div>

      <Button type="submit" disabled={createReminder.isPending} className="w-full">
        {createReminder.isPending ? 'Scheduling...' : 'Schedule Reminder'}
      </Button>
    </form>
  );
}
