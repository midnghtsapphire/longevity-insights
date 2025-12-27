import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Pencil } from "lucide-react";
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
import { Tables } from "@/integrations/supabase/types";

type Biomarker = Tables<"biomarkers">;

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
  name: z.string().min(1, "Name is required").max(100),
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

interface EditBiomarkerModalProps {
  biomarker: Biomarker;
  onSuccess?: () => void;
}

export function EditBiomarkerModal({ biomarker, onSuccess }: EditBiomarkerModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: biomarker.name,
      value: biomarker.value.toString(),
      unit: biomarker.unit,
      measuredAt: new Date(biomarker.measured_at),
      referenceMin: biomarker.reference_min?.toString() ?? "",
      referenceMax: biomarker.reference_max?.toString() ?? "",
      notes: biomarker.notes ?? "",
    },
  });

  // Reset form when biomarker changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: biomarker.name,
        value: biomarker.value.toString(),
        unit: biomarker.unit,
        measuredAt: new Date(biomarker.measured_at),
        referenceMin: biomarker.reference_min?.toString() ?? "",
        referenceMax: biomarker.reference_max?.toString() ?? "",
        notes: biomarker.notes ?? "",
      });
    }
  }, [open, biomarker, form]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("biomarkers")
        .update({
          name: data.name,
          value: parseFloat(data.value),
          unit: data.unit,
          measured_at: data.measuredAt.toISOString(),
          reference_min: data.referenceMin ? parseFloat(data.referenceMin) : null,
          reference_max: data.referenceMax ? parseFloat(data.referenceMax) : null,
          notes: data.notes || null,
        })
        .eq("id", biomarker.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Biomarker reading updated successfully",
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating biomarker:", error);
      toast({
        title: "Error",
        description: "Failed to update biomarker reading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Biomarker Reading</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the details of this biomarker measurement
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Biomarker Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biomarker Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., hs-CRP, Glucose"
                      className="bg-input border-border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
