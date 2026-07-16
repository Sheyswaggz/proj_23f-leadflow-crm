import { Card, CardContent } from '@/components/ui/card';
import { Badge, getStageBadgeVariant } from '@/components/ui/badge';
import { Lead } from '@/types/api';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

function formatCurrency(value: string | undefined): string {
  if (!value) return '';
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numValue);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <Card
      className="hover:border-primary/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-foreground">{lead.name}</h3>
            <Badge variant={getStageBadgeVariant(lead.stage)}>
              {lead.stage.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            {lead.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <i className="fas fa-building w-4 text-center" />
                <span>{lead.company}</span>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <i className="fas fa-envelope w-4 text-center" />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.dealValue && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <i className="fas fa-dollar-sign w-4 text-center" />
                <span className="font-medium text-foreground">
                  {formatCurrency(lead.dealValue)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Updated {formatRelativeTime(lead.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
