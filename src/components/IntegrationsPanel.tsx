import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Watch, Smartphone, Activity, Link2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  icon: typeof Watch;
  connected: boolean;
  lastSync?: string;
}

const integrations: Integration[] = [
  { id: "apple", name: "Apple Health", icon: Activity, connected: true, lastSync: "2 min ago" },
  { id: "oura", name: "Oura Ring", icon: Watch, connected: true, lastSync: "15 min ago" },
  { id: "whoop", name: "WHOOP", icon: Watch, connected: false },
  { id: "google", name: "Google Fit", icon: Smartphone, connected: false },
];

export function IntegrationsPanel() {
  return (
    <Card variant="glass">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Integrations
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-primary">
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className={cn(
                "p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer",
                integration.connected
                  ? "bg-success/5 border-success/20"
                  : "bg-secondary/30 border-border/50 opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    integration.connected ? "bg-success/10" : "bg-secondary"
                  )}
                >
                  <integration.icon
                    className={cn(
                      "w-5 h-5",
                      integration.connected ? "text-success" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {integration.name}
                    </p>
                    {integration.connected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {integration.connected ? `Synced ${integration.lastSync}` : "Not connected"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
