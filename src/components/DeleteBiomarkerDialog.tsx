import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Biomarker = Tables<"biomarkers">;

interface DeleteBiomarkerDialogProps {
  biomarker: Biomarker;
  onSuccess?: () => void;
}

export function DeleteBiomarkerDialog({ biomarker, onSuccess }: DeleteBiomarkerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("biomarkers")
        .delete()
        .eq("id", biomarker.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: `${biomarker.name} reading has been deleted`,
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting biomarker:", error);
      toast({
        title: "Error",
        description: "Failed to delete biomarker reading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Delete biomarker reading?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will permanently delete the <strong>{biomarker.name}</strong> reading 
            from {new Date(biomarker.measured_at).toLocaleDateString()}. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-secondary border-border text-foreground hover:bg-secondary/80">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
