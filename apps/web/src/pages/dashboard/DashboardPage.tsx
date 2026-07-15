import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboard';
import PipelineHealthWidget from './PipelineHealthWidget';
import UpcomingRemindersWidget from './UpcomingRemindersWidget';
import RecentLeadsWidget from './RecentLeadsWidget';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  const totalLeads = stats?.leadsByStage
    ? Object.values(stats.leadsByStage).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          {getGreeting()}, {user?.name}!
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SkeletonCard className="h-64" />
            <SkeletonCard className="h-48" />
          </div>
          <div>
            <SkeletonCard className="h-80" />
          </div>
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            Failed to load dashboard data. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {stats && !isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <PipelineHealthWidget
              leadsByStage={stats.leadsByStage}
              totalLeads={totalLeads}
            />
            <RecentLeadsWidget leads={stats.recentLeads} />
          </div>
          <div>
            <UpcomingRemindersWidget
              reminders={stats.upcomingReminders}
              overdueCount={stats.overdueCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}
