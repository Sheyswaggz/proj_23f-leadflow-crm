import { useLeadReminders, useUpdateReminder, useDeleteReminder } from '@/hooks/useReminders';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReminderItem from './ReminderItem';
import AddReminderForm from './AddReminderForm';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface ReminderSectionProps {
  leadId: string;
}

export default function ReminderSection({ leadId }: ReminderSectionProps) {
  const { data: reminders, isLoading } = useLeadReminders(leadId);
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();

  const sortedReminders = reminders
    ? [...reminders].sort((a, b) => {
        const aOverdue = new Date(a.dueAt) < new Date() && !a.isCompleted;
        const bOverdue = new Date(b.dueAt) < new Date() && !b.isCompleted;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      })
    : [];

  const overdueCount = reminders
    ? reminders.filter(
        (r) => new Date(r.dueAt) < new Date() && !r.isCompleted
      ).length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Follow-up Reminders</h2>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {overdueCount} Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <AddReminderForm leadId={leadId} />

        <div className="border-t border-border pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-lg animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : sortedReminders.length > 0 ? (
            <div className="space-y-3">
              {sortedReminders.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onComplete={() =>
                    updateReminder.mutate({
                      id: reminder.id,
                      data: { isCompleted: true },
                    })
                  }
                  onDelete={() => deleteReminder.mutate(reminder.id)}
                  isCompleting={
                    updateReminder.isPending &&
                    updateReminder.variables?.id === reminder.id
                  }
                  isDeleting={
                    deleteReminder.isPending &&
                    deleteReminder.variables === reminder.id
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="fa-solid fa-bell-slash"
              title="No reminders scheduled"
              description="Add a follow-up reminder above to stay on top of this lead."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
