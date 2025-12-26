import { Activity, Brain, Heart, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BiomarkerCardProps {
  name: string;
  value: number | string;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "optimal" | "warning" | "critical";
  icon: "activity" | "brain" | "heart" | "zap";
  change?: string;
}

const iconMap = {
  activity: Activity,
  brain: Brain,
  heart: Heart,
  zap: Zap,
};

const statusStyles = {
  optimal: {
    badge: "bg-success/20 text-success border-success/30",
    glow: "shadow-success/10",
    icon: "text-success",
  },
  warning: {
    badge: "bg-warning/20 text-warning border-warning/30",
    glow: "shadow-warning/10",
    icon: "text-warning",
  },
  critical: {
    badge: "bg-destructive/20 text-destructive border-destructive/30",
    glow: "shadow-destructive/10",
    icon: "text-destructive",
  },
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export function BiomarkerCard({
  name,
  value,
  unit,
  trend,
  status,
  icon,
  change,
}: BiomarkerCardProps) {
  const Icon = iconMap[icon];
  const TrendIcon = trendIcons[trend];
  const styles = statusStyles[status];

  return (
    <Card
      variant="glass"
      className={cn(
        "group hover:scale-[1.02] hover:border-primary/30 cursor-pointer",
        styles.glow
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-2.5 rounded-lg bg-secondary/50 transition-colors group-hover:bg-primary/10",
              styles.icon
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
              styles.badge
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {change && <span>{change}</span>}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{name}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
