import { Watch, Smartphone, Activity, Heart, Moon, Footprints } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const devices = [
  {
    id: "1",
    name: "Apple Watch",
    icon: Watch,
    status: "connected",
    lastSync: "2 min ago",
    metrics: ["Heart Rate", "Steps", "Sleep"],
  },
  {
    id: "2",
    name: "Oura Ring",
    icon: Activity,
    status: "disconnected",
    lastSync: "Never",
    metrics: ["Sleep", "HRV", "Temperature"],
  },
  {
    id: "3",
    name: "Whoop",
    icon: Heart,
    status: "disconnected",
    lastSync: "Never",
    metrics: ["Strain", "Recovery", "Sleep"],
  },
  {
    id: "4",
    name: "Fitbit",
    icon: Footprints,
    status: "disconnected",
    lastSync: "Never",
    metrics: ["Steps", "Heart Rate", "Sleep"],
  },
];

const Wearables = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 p-8 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Wearables</h1>
          <p className="text-muted-foreground mt-1">Connect your devices to sync health data automatically</p>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-4xl">
          {devices.map((device) => (
            <Card key={device.id} variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <device.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{device.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Last sync: {device.lastSync}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={device.status === "connected" ? "default" : "secondary"}
                    className={device.status === "connected" 
                      ? "bg-success/20 text-success border-success/30" 
                      : ""
                    }
                  >
                    {device.status === "connected" ? "Connected" : "Not connected"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Available metrics</p>
                    <div className="flex flex-wrap gap-1.5">
                      {device.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant={device.status === "connected" ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                  >
                    {device.status === "connected" ? "Disconnect" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 max-w-4xl">
          <h2 className="text-lg font-semibold text-foreground mb-4">Coming Soon</h2>
          <Card variant="glass" className="border-dashed">
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-sm">Garmin</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">Levels CGM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  <span className="text-sm">Eight Sleep</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Wearables;
