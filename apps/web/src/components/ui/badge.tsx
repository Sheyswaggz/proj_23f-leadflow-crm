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
        stage_new: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        stage_contacted: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        stage_qualified: 'bg-green-500/20 text-green-400 border border-green-500/30',
        stage_proposal: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        stage_won: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        stage_lost: 'bg-red-500/20 text-red-400 border border-red-500/30',
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
