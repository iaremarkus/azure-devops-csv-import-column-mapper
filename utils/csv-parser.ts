import type { CSVRow, FieldMapping } from "@/lib/types";

export interface ParsedCSV {
  headers: string[];
  rows: CSVRow[];
}

/**
 * Parses CSV text into headers and rows
 */
export function parseCSV(text: string): ParsedCSV {
  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error("File appears to be empty");
  }

  // Parse CSV (simple implementation)
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Auto-suggests field mappings based on column names
 */
export function autoSuggestMappings(headers: string[]): FieldMapping {
  const autoMappings: FieldMapping = {};

  headers.forEach((header) => {
    const lowerHeader = header.toLowerCase();

    if (lowerHeader.includes("type") || lowerHeader.includes("item")) {
      autoMappings.workItemType = header;
    } else if (lowerHeader.includes("title") || lowerHeader.includes("name")) {
      autoMappings.title = header;
    } else if (
      lowerHeader.includes("assign") ||
      lowerHeader.includes("owner")
    ) {
      autoMappings.assignedTo = header;
    } else if (
      lowerHeader.includes("description") ||
      lowerHeader.includes("detail")
    ) {
      autoMappings.description = header;
    } else if (lowerHeader.includes("priority")) {
      autoMappings.priority = header;
    } else if (
      lowerHeader.includes("effort") ||
      lowerHeader.includes("point") ||
      lowerHeader.includes("hour")
    ) {
      autoMappings.effort = header;
    }
  });

  return autoMappings;
}
