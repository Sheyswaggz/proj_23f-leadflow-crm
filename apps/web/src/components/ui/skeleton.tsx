import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/50', className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="h-32 rounded-lg bg-muted/50 animate-pulse" />
  );
}

export function SkeletonText() {
  return (
    <div className="h-4 bg-muted/50 rounded animate-pulse" />
  );
}

export function SkeletonLeadCard() {
  return (
    <Card className="p-4 space-y-3">
      <div className="space-y-2">
        <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted/50 rounded animate-pulse w-full" />
        <div className="h-3 bg-muted/50 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-muted/50 rounded animate-pulse w-2/3" />
      </div>
      <div>
        <div className="h-3 bg-muted/50 rounded animate-pulse w-1/3" />
      </div>
    </Card>
  );
}
