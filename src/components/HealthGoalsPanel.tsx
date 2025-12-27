import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useHealthGoals, HealthGoal, HealthGoalInput } from "@/hooks/useHealthGoals";
import { useBiomarkers } from "@/hooks/useBiomarkers";
import { useAvailableBiomarkers } from "@/hooks/useBiomarkerChartData";
import { HealthGoalModal } from "@/components/HealthGoalModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface GoalWithProgress extends HealthGoal {
  currentValue: number | null;
  unit: string | null;
  progress: number;
  status: "optimal" | "warning" | "critical" | "no-data";
  trend: "up" | "down" | "stable" | null;
}

export function HealthGoalsPanel() {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useHealthGoals();
  const { biomarkers } = useBiomarkers();
  const { biomarkers: availableBiomarkerNames } = useAvailableBiomarkers();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<HealthGoal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<HealthGoal | null>(null);

  // Calculate progress for each goal based on current biomarker values
  const goalsWithProgress: GoalWithProgress[] = goals.map((goal) => {
    const biomarker = biomarkers.find((b) => b.name === goal.biomarker_name);
    
    if (!biomarker) {
      return {
        ...goal,
        currentValue: null,
        unit: null,
        progress: 0,
        status: "no-data" as const,
        trend: null,
      };
    }

    const { value, unit, trend } = biomarker;
    const { target_min, target_max } = goal;

    let progress = 0;
    let status: "optimal" | "warning" | "critical" = "optimal";

    if (target_min !== null && target_max !== null) {
      const range = target_max - target_min;
      if (value >= target_min && value <= target_max) {
        // Within range - calculate how centered the value is
        const center = (target_min + target_max) / 2;
        const distanceFromCenter = Math.abs(value - center);
        const maxDistance = range / 2;
        progress = 100 - (distanceFromCenter / maxDistance) * 50;
        status = "optimal";
      } else if (value < target_min) {
        const diff = target_min - value;
        const tolerance = range * 0.2;
        progress = Math.max(0, 50 - (diff / tolerance) * 50);
        status = diff > tolerance ? "critical" : "warning";
      } else {
        const diff = value - target_max;
        const tolerance = range * 0.2;
        progress = Math.max(0, 50 - (diff / tolerance) * 50);
        status = diff > tolerance ? "critical" : "warning";
      }
    } else if (target_max !== null) {
      // Only max set - lower is better
      if (value <= target_max) {
        progress = 100;
        status = "optimal";
      } else {
        const diff = value - target_max;
        const tolerance = target_max * 0.2;
        progress = Math.max(0, 100 - (diff / tolerance) * 100);
        status = diff > tolerance ? "critical" : "warning";
      }
    } else if (target_min !== null) {
      // Only min set - higher is better
      if (value >= target_min) {
        progress = 100;
        status = "optimal";
      } else {
        const diff = target_min - value;
        const tolerance = target_min * 0.2;
        progress = Math.max(0, 100 - (diff / tolerance) * 100);
        status = diff > tolerance ? "critical" : "warning";
      }
    }

    return {
      ...goal,
      currentValue: value,
      unit,
      progress: Math.round(progress),
      status,
      trend,
    };
  });

  const handleSave = async (input: HealthGoalInput) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, input);
    } else {
      await createGoal(input);
    }
    setEditingGoal(null);
  };

  const handleEdit = (goal: HealthGoal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleDeleteClick = (goal: HealthGoal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (goalToDelete) {
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: GoalWithProgress["status"]) => {
    switch (status) {
      case "optimal":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: GoalWithProgress["status"]) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">On Track</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Needs Attention</Badge>;
      case "critical":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Off Target</Badge>;
      default:
        return <Badge variant="secondary">No Data</Badge>;
    }
  };

  const getTrendIcon = (trend: GoalWithProgress["trend"]) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case "stable":
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Health Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading goals...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Health Goals
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingGoal(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          {goalsWithProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No health goals set yet.</p>
              <p className="text-sm">Add a goal to start tracking your progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goalsWithProgress.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg bg-background/50 border border-border/50 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{goal.biomarker_name}</h4>
                        {getTrendIcon(goal.trend)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {goal.currentValue !== null ? (
                          <>
                            <span>
                              Current: <span className="text-foreground font-medium">{goal.currentValue}</span>
                              {goal.unit && ` ${goal.unit}`}
                            </span>
                            <span>•</span>
                          </>
                        ) : null}
                        <span>
                          Target: {goal.target_min ?? "—"} – {goal.target_max ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(goal.status)}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEdit(goal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(goal)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress
                      value={goal.progress}
                      className={cn("h-2", goal.status === "no-data" && "opacity-50")}
                      indicatorClassName={getStatusColor(goal.status)}
                    />
                  </div>

                  {goal.notes && (
                    <p className="text-sm text-muted-foreground italic">
                      {goal.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <HealthGoalModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingGoal(null);
        }}
        onSave={handleSave}
        existingGoal={editingGoal}
        availableBiomarkers={availableBiomarkerNames}
        existingGoalNames={goals.map((g) => g.biomarker_name)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Health Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the goal for "{goalToDelete?.biomarker_name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
