import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HealthGoal, HealthGoalInput } from "@/hooks/useHealthGoals";

interface HealthGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: HealthGoalInput) => Promise<any>;
  existingGoal?: HealthGoal | null;
  availableBiomarkers: string[];
  existingGoalNames: string[];
}

export function HealthGoalModal({
  open,
  onOpenChange,
  onSave,
  existingGoal,
  availableBiomarkers,
  existingGoalNames,
}: HealthGoalModalProps) {
  const [biomarkerName, setBiomarkerName] = useState("");
  const [targetMin, setTargetMin] = useState("");
  const [targetMax, setTargetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = !!existingGoal;

  useEffect(() => {
    if (existingGoal) {
      setBiomarkerName(existingGoal.biomarker_name);
      setTargetMin(existingGoal.target_min?.toString() || "");
      setTargetMax(existingGoal.target_max?.toString() || "");
      setNotes(existingGoal.notes || "");
    } else {
      setBiomarkerName("");
      setTargetMin("");
      setTargetMax("");
      setNotes("");
    }
  }, [existingGoal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biomarkerName) return;

    setSaving(true);
    try {
      await onSave({
        biomarker_name: biomarkerName,
        target_min: targetMin ? parseFloat(targetMin) : null,
        target_max: targetMax ? parseFloat(targetMax) : null,
        notes: notes || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  // Filter out biomarkers that already have goals (unless editing)
  const availableOptions = availableBiomarkers.filter(
    (name) => !existingGoalNames.includes(name) || name === existingGoal?.biomarker_name
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Health Goal" : "Add Health Goal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="biomarker">Biomarker</Label>
            {isEditing ? (
              <Input value={biomarkerName} disabled />
            ) : (
              <Select value={biomarkerName} onValueChange={setBiomarkerName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a biomarker" />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetMin">Target Min</Label>
              <Input
                id="targetMin"
                type="number"
                step="any"
                value={targetMin}
                onChange={(e) => setTargetMin(e.target.value)}
                placeholder="Min value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMax">Target Max</Label>
              <Input
                id="targetMax"
                type="number"
                step="any"
                value={targetMax}
                onChange={(e) => setTargetMax(e.target.value)}
                placeholder="Max value"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this goal..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !biomarkerName}>
              {saving ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
