import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface HealthGoal {
  id: string;
  user_id: string;
  biomarker_name: string;
  target_min: number | null;
  target_max: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthGoalInput {
  biomarker_name: string;
  target_min: number | null;
  target_max: number | null;
  notes?: string | null;
}

export function useHealthGoals() {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("health_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("biomarker_name", { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error("Error fetching health goals:", err);
      toast.error("Failed to load health goals");
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (input: HealthGoalInput) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("health_goals")
        .insert({
          user_id: user.id,
          biomarker_name: input.biomarker_name,
          target_min: input.target_min,
          target_max: input.target_max,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Health goal created");
      await fetchGoals();
      return data;
    } catch (err: any) {
      console.error("Error creating health goal:", err);
      if (err.code === "23505") {
        toast.error("A goal for this biomarker already exists");
      } else {
        toast.error("Failed to create health goal");
      }
      return null;
    }
  };

  const updateGoal = async (id: string, input: Partial<HealthGoalInput>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("health_goals")
        .update({
          target_min: input.target_min,
          target_max: input.target_max,
          notes: input.notes,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Health goal updated");
      await fetchGoals();
      return true;
    } catch (err) {
      console.error("Error updating health goal:", err);
      toast.error("Failed to update health goal");
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("health_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Health goal deleted");
      await fetchGoals();
      return true;
    } catch (err) {
      console.error("Error deleting health goal:", err);
      toast.error("Failed to delete health goal");
      return false;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
