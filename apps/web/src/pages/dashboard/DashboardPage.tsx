import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your pipeline.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Leads Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Leads
            </h3>
            <i className="fa-solid fa-users text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">--</div>
          <p className="text-xs text-muted-foreground mt-2">
            Data coming soon
          </p>
        </div>

        {/* Active Follow-ups Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Active Follow-ups
            </h3>
            <i className="fa-solid fa-bell text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">--</div>
          <p className="text-xs text-muted-foreground mt-2">
            Data coming soon
          </p>
        </div>

        {/* Deals Closing Soon Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Deals Closing Soon
            </h3>
            <i className="fa-solid fa-chart-line text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground">--</div>
          <p className="text-xs text-muted-foreground mt-2">
            Data coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
