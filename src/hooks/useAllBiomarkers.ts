import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

type Biomarker = Tables<"biomarkers">;

export function useAllBiomarkers() {
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBiomarkers = async () => {
    if (!user) {
      setBiomarkers([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("biomarkers")
        .select("*")
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false });

      if (fetchError) throw fetchError;

      setBiomarkers(data || []);
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
      .channel("all-biomarkers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "biomarkers",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBiomarkers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get unique biomarker names for filtering
  const uniqueNames = useMemo(() => {
    const names = new Set(biomarkers.map((b) => b.name));
    return Array.from(names).sort();
  }, [biomarkers]);

  return {
    biomarkers,
    loading,
    error,
    uniqueNames,
    refetch: fetchBiomarkers,
  };
}
