import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ParsedRow {
  name: string;
  value: number;
  unit: string;
  reference_min?: number;
  reference_max?: number;
  measured_at?: string;
  notes?: string;
}

interface ParseResult {
  valid: ParsedRow[];
  errors: string[];
}

export function ImportBiomarkersModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const parseCSV = (content: string): ParseResult => {
    const lines = content.trim().split("\n");
    const valid: ParsedRow[] = [];
    const errors: string[] = [];

    if (lines.length < 2) {
      errors.push("CSV file must have a header row and at least one data row");
      return { valid, errors };
    }

    // Parse header (case-insensitive)
    const headerLine = lines[0];
    const headers = headerLine.split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    
    // Required columns
    const nameIdx = headers.findIndex(h => h === "name");
    const valueIdx = headers.findIndex(h => h === "value");
    const unitIdx = headers.findIndex(h => h === "unit");
    
    // Optional columns
    const refMinIdx = headers.findIndex(h => h === "reference_min" || h === "ref_min" || h === "reference min");
    const refMaxIdx = headers.findIndex(h => h === "reference_max" || h === "ref_max" || h === "reference max");
    const measuredAtIdx = headers.findIndex(h => h === "measured_at" || h === "measured at" || h === "date");
    const notesIdx = headers.findIndex(h => h === "notes");

    if (nameIdx === -1 || valueIdx === -1 || unitIdx === -1) {
      errors.push("CSV must have 'Name', 'Value', and 'Unit' columns");
      return { valid, errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles quoted fields)
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const name = values[nameIdx]?.replace(/"/g, "").trim();
      const valueStr = values[valueIdx]?.replace(/"/g, "").trim();
      const unit = values[unitIdx]?.replace(/"/g, "").trim();

      if (!name) {
        errors.push(`Row ${i + 1}: Missing name`);
        continue;
      }
      if (!valueStr) {
        errors.push(`Row ${i + 1}: Missing value`);
        continue;
      }
      if (!unit) {
        errors.push(`Row ${i + 1}: Missing unit`);
        continue;
      }

      const value = parseFloat(valueStr);
      if (isNaN(value)) {
        errors.push(`Row ${i + 1}: Invalid value "${valueStr}"`);
        continue;
      }

      const row: ParsedRow = { name, value, unit };

      // Parse optional fields
      if (refMinIdx !== -1 && values[refMinIdx]) {
        const refMin = parseFloat(values[refMinIdx].replace(/"/g, ""));
        if (!isNaN(refMin)) row.reference_min = refMin;
      }
      if (refMaxIdx !== -1 && values[refMaxIdx]) {
        const refMax = parseFloat(values[refMaxIdx].replace(/"/g, ""));
        if (!isNaN(refMax)) row.reference_max = refMax;
      }
      if (measuredAtIdx !== -1 && values[measuredAtIdx]) {
        const dateStr = values[measuredAtIdx].replace(/"/g, "").trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          row.measured_at = date.toISOString();
        }
      }
      if (notesIdx !== -1 && values[notesIdx]) {
        row.notes = values[notesIdx].replace(/"/g, "").trim();
      }

      valid.push(row);
    }

    return { valid, errors };
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseCSV(content);
      setParseResult(result);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleImport = async () => {
    if (!parseResult?.valid.length || !user) return;

    setImporting(true);
    try {
      const rows = parseResult.valid.map(row => ({
        ...row,
        user_id: user.id,
        measured_at: row.measured_at || new Date().toISOString(),
      }));

      const { error } = await supabase.from("biomarkers").insert(rows);

      if (error) throw error;

      toast({
        title: "Import successful",
        description: `Imported ${rows.length} biomarker readings`,
      });

      queryClient.invalidateQueries({ queryKey: ["all-biomarkers"] });
      queryClient.invalidateQueries({ queryKey: ["biomarkers"] });
      
      setOpen(false);
      setFile(null);
      setParseResult(null);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing your data",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParseResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value);
      if (!value) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Biomarkers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: Name, Value, Unit. Optional: Reference Min, Reference Max, Measured At, Notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              file && "border-success bg-success/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-success" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetState();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </>
            )}
          </div>

          {/* Parse results */}
          {parseResult && (
            <div className="space-y-3">
              {parseResult.valid.length > 0 && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">{parseResult.valid.length} valid rows ready to import</span>
                </div>
              )}
              {parseResult.errors.length > 0 && (
                <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {parseResult.errors.length} error(s) found
                  </div>
                  <ul className="text-sm text-destructive/80 list-disc list-inside max-h-32 overflow-y-auto">
                    {parseResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseResult.errors.length > 5 && (
                      <li>...and {parseResult.errors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!parseResult?.valid.length || importing}
            >
              {importing ? "Importing..." : `Import ${parseResult?.valid.length || 0} rows`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
