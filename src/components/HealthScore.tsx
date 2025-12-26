import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, Moon, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  icon: typeof Target;
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

const goals: Goal[] = [
  {
    id: "steps",
    icon: Footprints,
    label: "Daily Steps",
    current: 8432,
    target: 10000,
    unit: "steps",
    color: "bg-primary",
  },
  {
    id: "calories",
    icon: Flame,
    label: "Calories Burned",
    current: 1850,
    target: 2200,
    unit: "kcal",
    color: "bg-warning",
  },
  {
    id: "sleep",
    icon: Moon,
    label: "Sleep Score",
    current: 82,
    target: 85,
    unit: "pts",
    color: "bg-accent",
  },
];

export function HealthScore() {
  const overallScore = 78;

  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Circle */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="hsl(var(--secondary))"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(overallScore / 100) * 352} 352`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(174, 72%, 56%)" />
                  <stop offset="100%" stopColor="hsl(43, 96%, 56%)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{overallScore}</span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>
        </div>

        {/* Daily Goals */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">Daily Goals</p>
          {goals.map((goal) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <goal.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{goal.label}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", goal.color)}
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
