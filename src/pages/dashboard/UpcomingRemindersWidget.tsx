import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FollowUpReminder } from '@/types/api';

interface UpcomingRemindersWidgetProps {
  reminders: FollowUpReminder[];
  overdueCount: number;
}

function formatDueDate(dueAt: string): string {
  const date = new Date(dueAt);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function truncateNote(note: string | undefined, maxLength: number = 50): string {
  if (!note) return '';
  if (note.length <= maxLength) return note;
  return note.slice(0, maxLength) + '...';
}

export default function UpcomingRemindersWidget({
  reminders,
  overdueCount,
}: UpcomingRemindersWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Follow-ups
          {overdueCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {overdueCount} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {overdueCount > 0 && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              You have {overdueCount} overdue follow-up{overdueCount !== 1 ? 's' : ''}.{' '}
              <Link
                to="/leads?filter=overdue"
                className="underline hover:no-underline font-medium"
              >
                View leads
              </Link>
            </p>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No upcoming follow-ups in the next 7 days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <i className="fa-solid fa-bell text-muted-foreground text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/leads/${reminder.leadId}`}
                    className="font-medium hover:underline text-foreground block"
                  >
                    {reminder.lead?.name || 'Unknown Lead'}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDueDate(reminder.dueAt)}
                  </p>
                  {reminder.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {truncateNote(reminder.note)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
