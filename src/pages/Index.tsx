import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BiomarkerCard } from "@/components/BiomarkerCard";
import { TrendChart } from "@/components/TrendChart";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { HealthScore } from "@/components/HealthScore";
import { IntegrationsPanel } from "@/components/IntegrationsPanel";

// Sample data
const biomarkers = [
  { name: "hs-CRP", value: "0.8", unit: "mg/L", trend: "down" as const, status: "optimal" as const, icon: "heart" as const, change: "-12%" },
  { name: "ApoB", value: "82", unit: "mg/dL", trend: "down" as const, status: "optimal" as const, icon: "activity" as const, change: "-8%" },
  { name: "Fasting Glucose", value: "92", unit: "mg/dL", trend: "stable" as const, status: "optimal" as const, icon: "zap" as const, change: "0%" },
  { name: "VO2 Max", value: "48", unit: "ml/kg/min", trend: "up" as const, status: "optimal" as const, icon: "brain" as const, change: "+5%" },
];

const glucoseData = [
  { date: "Mon", value: 94 },
  { date: "Tue", value: 91 },
  { date: "Wed", value: 96 },
  { date: "Thu", value: 89 },
  { date: "Fri", value: 92 },
  { date: "Sat", value: 88 },
  { date: "Sun", value: 90 },
];

const hrvData = [
  { date: "Mon", value: 52 },
  { date: "Tue", value: 48 },
  { date: "Wed", value: 55 },
  { date: "Thu", value: 51 },
  { date: "Fri", value: 58 },
  { date: "Sat", value: 62 },
  { date: "Sun", value: 60 },
];

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
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 p-8">
        <Header />

        {/* Biomarker Cards Grid */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Key Biomarkers</h2>
            <span className="text-sm text-muted-foreground">Last updated: Today, 9:42 AM</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {biomarkers.map((biomarker) => (
              <BiomarkerCard key={biomarker.name} {...biomarker} />
            ))}
          </div>
        </section>

        {/* Charts and Insights Row */}
        <section className="grid grid-cols-3 gap-6 mb-8">
          <TrendChart
            title="Fasting Glucose Trend"
            data={glucoseData}
            color="hsl(174, 72%, 56%)"
            unit="mg/dL"
          />
          <TrendChart
            title="Heart Rate Variability"
            data={hrvData}
            color="hsl(43, 96%, 56%)"
            unit="ms"
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
