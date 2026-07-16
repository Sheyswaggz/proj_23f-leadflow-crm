import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { FollowUpReminder } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReminderItemProps {
  reminder: FollowUpReminder;
  onComplete: () => void;
  onDelete: () => void;
  isCompleting: boolean;
  isDeleting: boolean;
}

export default function ReminderItem({
  reminder,
  onComplete,
  onDelete,
  isCompleting,
  isDeleting,
}: ReminderItemProps) {
  const dueDate = new Date(reminder.dueAt);
  const now = new Date();
  const isOverdue = dueDate < now && !reminder.isCompleted;

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = dueDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const bellColor = reminder.isCompleted
    ? 'text-green-500'
    : isOverdue
    ? 'text-red-500'
    : 'text-yellow-500';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors">
      <Bell className={`h-5 w-5 ${bellColor} mt-0.5 flex-shrink-0`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {formattedDate} at {formattedTime}
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
              {reminder.isCompleted && (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  Completed
                </Badge>
              )}
            </div>
            {reminder.note && (
              <p className="text-sm text-muted-foreground mt-1 break-words">
                {reminder.note}
              </p>
            )}
          </div>
        </div>
      </div>

      {!reminder.isCompleted && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={onComplete}
            disabled={isCompleting || isDeleting}
            className="h-8 w-8 p-0"
            title="Mark as complete"
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={isCompleting || isDeleting}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Delete reminder"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
