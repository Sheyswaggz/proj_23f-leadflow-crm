import { useLeadReminders, useUpdateReminder, useDeleteReminder } from '@/hooks/useReminders';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReminderItem from './ReminderItem';
import AddReminderForm from './AddReminderForm';

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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No reminders scheduled. Add one above.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
