import { toast } from "sonner";
import { trackClipboardCopy, trackFileDownload } from "@/lib/posthog";

/**
 * Validates if a file is a CSV file
 */
export function isValidCSVFile(file: File): boolean {
  return file.type === "text/csv" || file.name.endsWith(".csv");
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSVFile(
  csvContent: string,
  rowCount: number,
  fieldCount?: number,
  customFieldCount?: number,
): void {
  try {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `azure-devops-import-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    // Track the download event
    trackFileDownload({
      rowCount,
      fieldCount: fieldCount || 0,
      customFieldCount: customFieldCount || 0,
    });

    toast.success(`Downloaded CSV file with ${rowCount} rows`);
  } catch (err) {
    console.error("Failed to download:", err);
    toast.error("Download failed. Please try copying to clipboard instead.");
  }
}

/**
 * Copies CSV content to clipboard
 */
export async function copyCSVToClipboard(
  csvContent: string,
  rowCount: number,
  fieldCount?: number,
  customFieldCount?: number,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(csvContent);

    // Track the clipboard copy event
    trackClipboardCopy({
      rowCount,
      fieldCount: fieldCount || 0,
      customFieldCount: customFieldCount || 0,
    });

    toast.success(`CSV content copied to clipboard! (${rowCount} rows)`);
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.error("Copy failed. Please try selecting the text manually.");
  }
}
