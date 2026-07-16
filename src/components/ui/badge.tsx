import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { LeadStage } from '@/types/api';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-border text-foreground',
        stage_new: 'bg-blue-500/25 text-blue-300 border border-blue-400/40',
        stage_contacted: 'bg-yellow-500/25 text-yellow-300 border border-yellow-400/40',
        stage_qualified: 'bg-green-500/25 text-green-300 border border-green-400/40',
        stage_proposal: 'bg-purple-500/25 text-purple-300 border border-purple-400/40',
        stage_won: 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40',
        stage_lost: 'bg-red-500/25 text-red-300 border border-red-400/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function getStageBadgeVariant(
  stage: string
): 'stage_new' | 'stage_contacted' | 'stage_qualified' | 'stage_proposal' | 'stage_won' | 'stage_lost' | 'default' {
  switch (stage) {
    case LeadStage.NEW:
      return 'stage_new';
    case LeadStage.CONTACTED:
      return 'stage_contacted';
    case LeadStage.QUALIFIED:
      return 'stage_qualified';
    case LeadStage.PROPOSAL_SENT:
      return 'stage_proposal';
    case LeadStage.CLOSED_WON:
      return 'stage_won';
    case LeadStage.CLOSED_LOST:
      return 'stage_lost';
    default:
      return 'default';
  }
}

export { Badge, badgeVariants };
