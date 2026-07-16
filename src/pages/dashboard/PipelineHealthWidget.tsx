import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, getStageBadgeVariant } from '@/components/ui/badge';
import { LeadStage } from '@/types/api';

interface PipelineHealthWidgetProps {
  leadsByStage: Record<string, number>;
  totalLeads: number;
}

const stageConfig: Array<{
  key: LeadStage;
  label: string;
}> = [
  { key: LeadStage.NEW, label: 'New' },
  { key: LeadStage.CONTACTED, label: 'Contacted' },
  { key: LeadStage.QUALIFIED, label: 'Qualified' },
  { key: LeadStage.PROPOSAL_SENT, label: 'Proposal Sent' },
  { key: LeadStage.CLOSED_WON, label: 'Closed Won' },
  { key: LeadStage.CLOSED_LOST, label: 'Closed Lost' },
];

const stageBarColors: Record<LeadStage, string> = {
  [LeadStage.NEW]: 'bg-blue-500',
  [LeadStage.CONTACTED]: 'bg-yellow-500',
  [LeadStage.QUALIFIED]: 'bg-green-500',
  [LeadStage.PROPOSAL_SENT]: 'bg-purple-500',
  [LeadStage.CLOSED_WON]: 'bg-emerald-500',
  [LeadStage.CLOSED_LOST]: 'bg-red-500',
};

export default function PipelineHealthWidget({
  leadsByStage,
  totalLeads,
}: PipelineHealthWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Pipeline Health
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({totalLeads} {totalLeads === 1 ? 'lead' : 'leads'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stageConfig.map(({ key, label }) => {
            const count = leadsByStage[key] || 0;
            const percentage =
              totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            const badgeVariant = getStageBadgeVariant(key);

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={badgeVariant}>{label}</Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {totalLeads === 0 ? '--' : count}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stageBarColors[key]} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
