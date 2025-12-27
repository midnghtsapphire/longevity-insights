import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type Biomarker = Tables<"biomarkers">;

export function exportBiomarkersToCSV(biomarkers: Biomarker[], filename?: string) {
  if (biomarkers.length === 0) {
    return;
  }

  // Define CSV headers
  const headers = [
    "Name",
    "Value",
    "Unit",
    "Reference Min",
    "Reference Max",
    "Measured At",
    "Notes",
    "Created At",
  ];

  // Convert biomarkers to CSV rows
  const rows = biomarkers.map((biomarker) => [
    escapeCSVField(biomarker.name),
    biomarker.value.toString(),
    escapeCSVField(biomarker.unit),
    biomarker.reference_min?.toString() ?? "",
    biomarker.reference_max?.toString() ?? "",
    format(new Date(biomarker.measured_at), "yyyy-MM-dd"),
    escapeCSVField(biomarker.notes ?? ""),
    format(new Date(biomarker.created_at), "yyyy-MM-dd HH:mm:ss"),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const exportFilename = filename ?? `biomarkers-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
  
  link.setAttribute("href", url);
  link.setAttribute("download", exportFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Escape special characters in CSV fields
function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
