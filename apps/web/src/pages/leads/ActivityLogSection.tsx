import { useActivities } from '@/hooks/useActivities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ActivityItem from './ActivityItem';
import LogActivityForm from './LogActivityForm';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface ActivityLogSectionProps {
  leadId: string;
}

export default function ActivityLogSection({ leadId }: ActivityLogSectionProps) {
  const { data: activities, isLoading } = useActivities(leadId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Activity History</h2>
          {activities && activities.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
              {activities.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <LogActivityForm leadId={leadId} />

        <div className="border-t border-border pt-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted/50 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div>
              {activities.map((activity, index) => (
                <div key={activity.id} className={index === activities.length - 1 ? '' : ''}>
                  <ActivityItem activity={activity} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="fa-solid fa-comments"
              title="No activities yet"
              description="Log your first interaction above to start the timeline."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
