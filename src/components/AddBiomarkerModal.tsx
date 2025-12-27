import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Common biomarkers with their typical units and reference ranges
const BIOMARKER_PRESETS = [
  { name: "hs-CRP", unit: "mg/L", refMin: 0, refMax: 1 },
  { name: "ApoB", unit: "mg/dL", refMin: 0, refMax: 90 },
  { name: "Fasting Glucose", unit: "mg/dL", refMin: 70, refMax: 100 },
  { name: "VO2 Max", unit: "ml/kg/min", refMin: 35, refMax: 60 },
  { name: "HbA1c", unit: "%", refMin: 4, refMax: 5.7 },
  { name: "LDL Cholesterol", unit: "mg/dL", refMin: 0, refMax: 100 },
  { name: "HDL Cholesterol", unit: "mg/dL", refMin: 40, refMax: 100 },
  { name: "Triglycerides", unit: "mg/dL", refMin: 0, refMax: 150 },
  { name: "Vitamin D", unit: "ng/mL", refMin: 30, refMax: 100 },
  { name: "Ferritin", unit: "ng/mL", refMin: 30, refMax: 300 },
  { name: "TSH", unit: "mIU/L", refMin: 0.4, refMax: 4 },
  { name: "Testosterone", unit: "ng/dL", refMin: 300, refMax: 1000 },
  { name: "Custom", unit: "", refMin: null, refMax: null },
];

const COMMON_UNITS = [
  "mg/L",
  "mg/dL",
  "ng/mL",
  "ng/dL",
  "pg/mL",
  "mIU/L",
  "IU/L",
  "mmol/L",
  "µmol/L",
  "%",
  "ml/kg/min",
  "bpm",
  "ms",
];

const formSchema = z.object({
  biomarkerType: z.string().min(1, "Please select a biomarker"),
  customName: z.string().optional(),
  value: z.string().min(1, "Value is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
    "Please enter a valid positive number"
  ),
  unit: z.string().min(1, "Unit is required"),
  measuredAt: z.date({ required_error: "Measurement date is required" }),
  referenceMin: z.string().optional(),
  referenceMax: z.string().optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBiomarkerModalProps {
  onSuccess?: () => void;
}

export function AddBiomarkerModal({ onSuccess }: AddBiomarkerModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      biomarkerType: "",
      customName: "",
      value: "",
      unit: "",
      measuredAt: new Date(),
      referenceMin: "",
      referenceMax: "",
      notes: "",
    },
  });

  const selectedBiomarker = form.watch("biomarkerType");
  const isCustom = selectedBiomarker === "Custom";

  // Auto-fill unit and reference ranges when biomarker is selected
  const handleBiomarkerChange = (value: string) => {
    form.setValue("biomarkerType", value);
    const preset = BIOMARKER_PRESETS.find((b) => b.name === value);
    if (preset && preset.name !== "Custom") {
      form.setValue("unit", preset.unit);
      form.setValue("referenceMin", preset.refMin?.toString() ?? "");
      form.setValue("referenceMax", preset.refMax?.toString() ?? "");
    } else {
      form.setValue("unit", "");
      form.setValue("referenceMin", "");
      form.setValue("referenceMax", "");
    }
  };

  async function onSubmit(data: FormValues) {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add biomarkers",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const biomarkerName = isCustom ? data.customName : data.biomarkerType;

      if (!biomarkerName) {
        toast({
          title: "Error",
          description: "Please enter a biomarker name",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("biomarkers").insert({
        user_id: user.id,
        name: biomarkerName,
        value: parseFloat(data.value),
        unit: data.unit,
        measured_at: data.measuredAt.toISOString(),
        reference_min: data.referenceMin ? parseFloat(data.referenceMin) : null,
        reference_max: data.referenceMax ? parseFloat(data.referenceMax) : null,
        notes: data.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${biomarkerName} reading added successfully`,
      });

      form.reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding biomarker:", error);
      toast({
        title: "Error",
        description: "Failed to add biomarker reading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-foreground">Add Biomarker Reading</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Record a new biomarker measurement to track your health
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Biomarker Selection */}
            <FormField
              control={form.control}
              name="biomarkerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biomarker</FormLabel>
                  <Select onValueChange={handleBiomarkerChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Select a biomarker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border z-50">
                      {BIOMARKER_PRESETS.map((preset) => (
                        <SelectItem key={preset.name} value={preset.name}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Name Input */}
            {isCustom && (
              <FormField
                control={form.control}
                name="customName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Biomarker Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter biomarker name"
                        className="bg-input border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Value and Unit Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.0"
                        className="bg-input border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border-border z-50">
                        {COMMON_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="measuredAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Measurement Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-input border-border",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="referenceMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Min (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Min value"
                        className="bg-input border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Max (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Max value"
                        className="bg-input border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant notes about this reading..."
                      className="bg-input border-border resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add context like fasting status, time of day, or lab name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Reading"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
