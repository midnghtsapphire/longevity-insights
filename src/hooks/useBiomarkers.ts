import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

type Biomarker = Tables<"biomarkers">;

interface BiomarkerWithMeta extends Biomarker {
  trend: "up" | "down" | "stable";
  status: "optimal" | "warning" | "critical";
  change: string;
  icon: "activity" | "brain" | "heart" | "zap";
}

// Map biomarker names to icons
const getIconForBiomarker = (name: string): "activity" | "brain" | "heart" | "zap" => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes("crp") || lowercaseName.includes("cholesterol") || lowercaseName.includes("ldl") || lowercaseName.includes("hdl")) {
    return "heart";
  }
  if (lowercaseName.includes("vo2") || lowercaseName.includes("brain") || lowercaseName.includes("cognitive")) {
    return "brain";
  }
  if (lowercaseName.includes("glucose") || lowercaseName.includes("hba1c") || lowercaseName.includes("insulin")) {
    return "zap";
  }
  return "activity";
};

// Determine status based on value and reference range
const getStatus = (value: number, refMin: number | null, refMax: number | null): "optimal" | "warning" | "critical" => {
  if (refMin === null || refMax === null) return "optimal";
  
  const range = refMax - refMin;
  const warningBuffer = range * 0.1; // 10% buffer for warning
  
  if (value >= refMin && value <= refMax) {
    return "optimal";
  }
  
  if (value < refMin - warningBuffer || value > refMax + warningBuffer) {
    return "critical";
  }
  
  return "warning";
};

// Calculate trend and change by comparing with previous reading
const calculateTrendAndChange = (
  currentValue: number,
  previousValue: number | null
): { trend: "up" | "down" | "stable"; change: string } => {
  if (previousValue === null) {
    return { trend: "stable", change: "New" };
  }
  
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  
  if (Math.abs(percentChange) < 1) {
    return { trend: "stable", change: "0%" };
  }
  
  if (percentChange > 0) {
    return { trend: "up", change: `+${percentChange.toFixed(0)}%` };
  }
  
  return { trend: "down", change: `${percentChange.toFixed(0)}%` };
};

export function useBiomarkers() {
  const [biomarkers, setBiomarkers] = useState<BiomarkerWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user } = useAuth();

  const fetchBiomarkers = async () => {
    if (!user) {
      setBiomarkers([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch all biomarkers for the user, ordered by date
      const { data, error: fetchError } = await supabase
        .from("biomarkers")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setBiomarkers([]);
        setLoading(false);
        return;
      }

      // Group by biomarker name and get the latest reading for each
      const latestByName = new Map<string, { latest: Biomarker; previous: Biomarker | null }>();
      
      data.forEach((biomarker) => {
        const existing = latestByName.get(biomarker.name);
        if (!existing) {
          latestByName.set(biomarker.name, { latest: biomarker, previous: null });
        } else if (!existing.previous) {
          // This is the second occurrence, so it's the previous value
          existing.previous = biomarker;
        }
      });

      // Transform to BiomarkerWithMeta
      const transformed: BiomarkerWithMeta[] = Array.from(latestByName.values()).map(
        ({ latest, previous }) => {
          const { trend, change } = calculateTrendAndChange(
            latest.value,
            previous?.value ?? null
          );
          
          return {
            ...latest,
            trend,
            change,
            status: getStatus(latest.value, latest.reference_min, latest.reference_max),
            icon: getIconForBiomarker(latest.name),
          };
        }
      );

      // Sort by most recently measured
      transformed.sort((a, b) => 
        new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
      );

      setBiomarkers(transformed);
      setLastUpdated(new Date(transformed[0]?.measured_at || Date.now()));
    } catch (err) {
      console.error("Error fetching biomarkers:", err);
      setError("Failed to load biomarkers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiomarkers();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("biomarkers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "biomarkers",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch biomarkers on any change
          fetchBiomarkers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    biomarkers,
    loading,
    error,
    lastUpdated,
    refetch: fetchBiomarkers,
  };
}
