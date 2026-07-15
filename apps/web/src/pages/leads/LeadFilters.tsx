import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LeadStage } from '@/types/api';

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  stage: string;
  onStageChange: (value: string) => void;
}

export default function LeadFilters({
  search,
  onSearchChange,
  stage,
  onStageChange,
}: LeadFiltersProps) {
  const hasFilters = search || stage;

  const clearFilters = () => {
    onSearchChange('');
    onStageChange('');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 w-full">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={stage} onValueChange={onStageChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Stages</SelectItem>
          <SelectItem value={LeadStage.NEW}>New</SelectItem>
          <SelectItem value={LeadStage.CONTACTED}>Contacted</SelectItem>
          <SelectItem value={LeadStage.QUALIFIED}>Qualified</SelectItem>
          <SelectItem value={LeadStage.PROPOSAL_SENT}>Proposal Sent</SelectItem>
          <SelectItem value={LeadStage.CLOSED_WON}>Closed Won</SelectItem>
          <SelectItem value={LeadStage.CLOSED_LOST}>Closed Lost</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
          Clear Filters
        </Button>
      )}
    </div>
  );
}
