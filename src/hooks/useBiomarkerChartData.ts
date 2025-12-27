import { useState, useEffect, useMemo } from "react";
import { format, subDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface BiomarkerChartData {
  data: ChartDataPoint[];
  unit: string;
  latestValue: number | null;
  change: string;
}

export function useBiomarkerChartData(biomarkerName: string, days: number = 7) {
  const [chartData, setChartData] = useState<BiomarkerChartData>({
    data: [],
    unit: "",
    latestValue: null,
    change: "",
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChartData = async () => {
    if (!user || !biomarkerName) {
      setChartData({ data: [], unit: "", latestValue: null, change: "" });
      setLoading(false);
      return;
    }

    try {
      const startDate = subDays(new Date(), days);
      
      const { data, error } = await supabase
        .from("biomarkers")
        .select("value, unit, measured_at")
        .eq("user_id", user.id)
        .eq("name", biomarkerName)
        .gte("measured_at", startDate.toISOString())
        .order("measured_at", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setChartData({ data: [], unit: "", latestValue: null, change: "" });
        setLoading(false);
        return;
      }

      // Transform to chart format
      const transformed: ChartDataPoint[] = data.map((item) => ({
        date: format(parseISO(item.measured_at), "MMM d"),
        value: item.value,
      }));

      // Calculate change
      let change = "";
      if (data.length >= 2) {
        const firstValue = data[0].value;
        const lastValue = data[data.length - 1].value;
        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
        change = percentChange > 0 ? `+${percentChange.toFixed(1)}%` : `${percentChange.toFixed(1)}%`;
      }

      setChartData({
        data: transformed,
        unit: data[0].unit,
        latestValue: data[data.length - 1].value,
        change,
      });
    } catch (err) {
      console.error("Error fetching chart data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [user, biomarkerName, days]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`chart-${biomarkerName}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "biomarkers",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchChartData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, biomarkerName]);

  return { ...chartData, loading, refetch: fetchChartData };
}

// Hook to get available biomarkers for chart selection
export function useAvailableBiomarkers() {
  const [biomarkers, setBiomarkers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBiomarkers = async () => {
      if (!user) {
        setBiomarkers([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("biomarkers")
          .select("name")
          .eq("user_id", user.id);

        if (error) throw error;

        const uniqueNames = Array.from(new Set(data?.map((b) => b.name) || []));
        setBiomarkers(uniqueNames.sort());
      } catch (err) {
        console.error("Error fetching biomarker names:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBiomarkers();
  }, [user]);

  return { biomarkers, loading };
}
