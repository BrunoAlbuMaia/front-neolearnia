import { Card, CardContent, CardHeader } from "./card";
import { cn } from "../../lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <Card className={cn("animate-pulse border-border/50", className)}>
      <CardHeader className="space-y-2">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-20 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded flex-1" />
          <div className="h-9 bg-muted rounded w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

