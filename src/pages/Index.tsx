import { format } from "date-fns";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BiomarkerCard } from "@/components/BiomarkerCard";
import { DynamicTrendChart } from "@/components/DynamicTrendChart";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { HealthScore } from "@/components/HealthScore";
import { IntegrationsPanel } from "@/components/IntegrationsPanel";
import { AddBiomarkerModal } from "@/components/AddBiomarkerModal";
import { useBiomarkers } from "@/hooks/useBiomarkers";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical } from "lucide-react";

const insights = [
  {
    id: "1",
    type: "recommendation" as const,
    title: "Optimize your morning routine",
    description: "Your glucose levels spike after breakfast. Consider adding a 10-minute walk post-meal to improve glucose response.",
    action: "View details",
  },
  {
    id: "2",
    type: "success" as const,
    title: "Great progress on inflammation",
    description: "Your hs-CRP has decreased by 12% this month, indicating reduced systemic inflammation. Keep up the good work!",
  },
  {
    id: "3",
    type: "warning" as const,
    title: "Sleep quality declining",
    description: "Your deep sleep has decreased by 15% over the past week. Consider limiting screen time before bed.",
    action: "See recommendations",
  },
];

const Index = () => {
  const { biomarkers, loading, lastUpdated } = useBiomarkers();

  const formatLastUpdated = () => {
    if (!lastUpdated) return "No data yet";
    const now = new Date();
    const isToday = format(lastUpdated, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
    if (isToday) {
      return `Today, ${format(lastUpdated, "h:mm a")}`;
    }
    return format(lastUpdated, "MMM d, h:mm a");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 p-8">
        <Header />

        {/* Biomarker Cards Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Key Biomarkers</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Last updated: {formatLastUpdated()}
              </span>
              <AddBiomarkerModal />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : biomarkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border bg-card/50">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <FlaskConical className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No biomarkers yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Start tracking your health by adding your first biomarker reading. Track metrics like hs-CRP, glucose, ApoB, and more.
              </p>
              <AddBiomarkerModal />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {biomarkers.slice(0, 8).map((biomarker) => (
                <BiomarkerCard
                  key={biomarker.id}
                  name={biomarker.name}
                  value={biomarker.value}
                  unit={biomarker.unit}
                  trend={biomarker.trend}
                  status={biomarker.status}
                  icon={biomarker.icon}
                  change={biomarker.change}
                />
              ))}
            </div>
          )}
        </section>

        {/* Charts and Insights Row */}
        <section className="grid grid-cols-3 gap-6 mb-8">
          <DynamicTrendChart 
            color="hsl(174, 72%, 56%)"
            days={30}
          />
          <DynamicTrendChart 
            color="hsl(43, 96%, 56%)"
            days={30}
          />
          <HealthScore />
        </section>

        {/* Bottom Row */}
        <section className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <AIInsightsPanel insights={insights} />
          </div>
          <IntegrationsPanel />
        </section>
      </main>
    </div>
  );
};

export default Index;
