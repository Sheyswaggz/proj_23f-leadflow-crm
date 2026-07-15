import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, getStageBadgeVariant } from '@/components/ui/badge';
import type { Lead } from '@/types/api';

interface RecentLeadsWidgetProps {
  leads: Partial<Lead>[];
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
}

export default function RecentLeadsWidget({ leads }: RecentLeadsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              No leads yet. Create your first lead.
            </p>
            <Link
              to="/leads"
              className="text-primary hover:underline font-medium"
            >
              Go to Leads
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between gap-3 p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="font-medium hover:underline text-foreground block truncate"
                  >
                    {lead.name}
                  </Link>
                  {lead.company && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {lead.company}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {lead.stage && (
                    <Badge variant={getStageBadgeVariant(lead.stage)}>
                      {lead.stage.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {lead.updatedAt && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getRelativeTime(lead.updatedAt)}
                    </span>
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
