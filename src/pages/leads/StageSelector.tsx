import { Loader } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge, getStageBadgeVariant } from '@/components/ui/badge';
import { LeadStage } from '@/types/api';

interface StageSelectorProps {
  currentStage: LeadStage;
  onStageChange: (stage: LeadStage) => void;
  isLoading?: boolean;
}

const STAGE_LABELS: Record<LeadStage, string> = {
  [LeadStage.NEW]: 'New',
  [LeadStage.CONTACTED]: 'Contacted',
  [LeadStage.QUALIFIED]: 'Qualified',
  [LeadStage.PROPOSAL_SENT]: 'Proposal Sent',
  [LeadStage.CLOSED_WON]: 'Closed Won',
  [LeadStage.CLOSED_LOST]: 'Closed Lost',
};

const STAGE_COLORS: Record<LeadStage, string> = {
  [LeadStage.NEW]: 'bg-blue-500',
  [LeadStage.CONTACTED]: 'bg-yellow-500',
  [LeadStage.QUALIFIED]: 'bg-green-500',
  [LeadStage.PROPOSAL_SENT]: 'bg-purple-500',
  [LeadStage.CLOSED_WON]: 'bg-emerald-500',
  [LeadStage.CLOSED_LOST]: 'bg-red-500',
};

export default function StageSelector({ currentStage, onStageChange, isLoading }: StageSelectorProps) {
  return (
    <div className="relative">
      <Select
        value={currentStage}
        onValueChange={(value) => onStageChange(value as LeadStage)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            <Badge variant={getStageBadgeVariant(currentStage)}>
              {STAGE_LABELS[currentStage]}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STAGE_LABELS).map(([stage, label]) => (
            <SelectItem key={stage} value={stage}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${STAGE_COLORS[stage as LeadStage]}`} />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
