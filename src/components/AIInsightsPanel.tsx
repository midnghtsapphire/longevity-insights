import { Lightbulb, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "recommendation" | "warning" | "success";
  title: string;
  description: string;
  action?: string;
}

interface AIInsightsPanelProps {
  insights: Insight[];
}

const typeStyles = {
  recommendation: {
    icon: Lightbulb,
    bg: "bg-primary/10",
    border: "border-primary/30",
    iconColor: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/30",
    iconColor: "text-warning",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-success/10",
    border: "border-success/30",
    iconColor: "text-success",
  },
};

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg gradient-primary">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Personalized recommendations based on your data
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const styles = typeStyles[insight.type];
          const Icon = styles.icon;

          return (
            <div
              key={insight.id}
              className={cn(
                "p-4 rounded-lg border transition-all hover:scale-[1.01] cursor-pointer animate-fade-up",
                styles.bg,
                styles.border
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-1.5 rounded-md", styles.bg)}>
                  <Icon className={cn("w-4 h-4", styles.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 px-0 text-primary hover:text-primary/80 hover:bg-transparent"
                    >
                      {insight.action}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
