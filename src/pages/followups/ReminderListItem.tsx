import { Link } from 'react-router-dom';
import { Bell, Check, Loader } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FollowUpReminder } from '@/types/api';

interface ReminderListItemProps {
  reminder: FollowUpReminder;
  onComplete: () => void;
  isCompleting: boolean;
}

export default function ReminderListItem({ reminder, onComplete, isCompleting }: ReminderListItemProps) {
  const isOverdue = new Date(reminder.dueAt) < new Date() && !reminder.isCompleted;

  const formatDueDate = (dueAt: string) => {
    const date = new Date(dueAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {reminder.isCompleted ? (
            <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-400" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full ${isOverdue ? 'bg-red-500/20 border border-red-500/30' : 'bg-blue-500/20 border border-blue-500/30'} flex items-center justify-center`}>
              <Bell className={`h-5 w-5 ${isOverdue ? 'text-red-400' : 'text-blue-400'}`} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/leads/${reminder.leadId}`}
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {reminder.lead?.name || 'Unknown Lead'}
            </Link>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground mb-1">
            {formatDueDate(reminder.dueAt)}
          </div>

          {reminder.note && (
            <p className="text-sm text-muted-foreground mt-2">
              {reminder.note}
            </p>
          )}

          {reminder.lead?.company && (
            <p className="text-xs text-muted-foreground mt-1">
              {reminder.lead.company}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {reminder.isCompleted ? (
            <div className="text-sm text-green-400 font-medium">
              Completed
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onComplete}
              disabled={isCompleting}
              className="gap-2"
            >
              {isCompleting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                'Mark Done'
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
