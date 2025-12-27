import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useBiomarkerChartData, useAvailableBiomarkers } from "@/hooks/useBiomarkerChartData";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

interface DynamicTrendChartProps {
  defaultBiomarker?: string;
  color?: string;
  days?: number;
}

export function DynamicTrendChart({ 
  defaultBiomarker = "", 
  color = "hsl(174, 72%, 56%)",
  days = 30
}: DynamicTrendChartProps) {
  const { biomarkers: availableBiomarkers } = useAvailableBiomarkers();
  const [selectedBiomarker, setSelectedBiomarker] = useState(defaultBiomarker);
  
  // Use first available biomarker if none selected
  const activeBiomarker = selectedBiomarker || availableBiomarkers[0] || "";
  
  const { data, unit, latestValue, change, loading } = useBiomarkerChartData(activeBiomarker, days);

  const getTrendIcon = () => {
    if (!change) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (change.startsWith("+")) return <TrendingUp className="w-4 h-4 text-success" />;
    if (change.startsWith("-")) return <TrendingDown className="w-4 h-4 text-primary" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (availableBiomarkers.length === 0 && !loading) {
    return (
      <Card variant="glass" className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <div className="p-3 rounded-full bg-primary/10 mb-3">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Add biomarker readings to see trends
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Select value={activeBiomarker} onValueChange={setSelectedBiomarker}>
            <SelectTrigger className="w-[180px] bg-input border-border text-sm h-8">
              <SelectValue placeholder="Select biomarker" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              {availableBiomarkers.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {latestValue !== null && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">{latestValue}</span>
              <span className="text-muted-foreground">{unit}</span>
              {change && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className="text-xs text-muted-foreground">{change}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No data for selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${activeBiomarker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }}
                  width={40}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 11%)",
                    border: "1px solid hsl(222, 30%, 18%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
                  }}
                  labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                  itemStyle={{ color }}
                  formatter={(value: number) => [`${value} ${unit}`, activeBiomarker]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${activeBiomarker})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
