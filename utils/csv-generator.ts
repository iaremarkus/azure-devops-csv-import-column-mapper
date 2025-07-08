import type {
  CSVRow,
  CustomValues,
  FieldMapping,
  TextModifiers,
} from "@/lib/types";
import { OPTIONAL_FIELDS_MAPPING } from "@/lib/types";

/**
 * Applies text modifiers (prepend/append) to a value
 */
export function applyTextModifiers(
  value: string,
  field: string,
  textModifiers: TextModifiers,
): string {
  if (!textModifiers[field]) return value;

  const { prepend = "", append = "" } = textModifiers[field];
  const baseValue = value || "";

  return `${prepend}${baseValue}${append}`;
}

/**
 * Generates CSV content from mapped data
 */
export function generateCSV(
  allSourceData: CSVRow[],
  mappings: FieldMapping,
  customFields: string[],
  customValues: CustomValues,
  textModifiers: TextModifiers,
): string {
  if (!allSourceData.length) return "";

  const headers = ["Work Item Type", "Title"];

  // Add mapped optional fields
  Object.entries(OPTIONAL_FIELDS_MAPPING).forEach(([fieldKey, fieldLabel]) => {
    if (mappings[fieldKey] === "CUSTOM_VALUE" || mappings[fieldKey]) {
      headers.push(fieldLabel);
    }
  });

  // Add custom fields
  customFields.forEach((field) => {
    if (mappings[field] === "CUSTOM_VALUE" || mappings[field]) {
      headers.push(field);
    }
  });

  const csvRows = [headers.join(",")];

  allSourceData.forEach((row) => {
    const csvRow: string[] = [];

    // Work Item Type (use mapped value, custom value, or default)
    if (mappings.workItemType === "CUSTOM_VALUE") {
      csvRow.push(`"${customValues.workItemType || "Task"}"`);
    } else if (
      mappings.workItemType &&
      mappings.workItemType.startsWith("DEFAULT:")
    ) {
      const defaultType = mappings.workItemType.replace("DEFAULT:", "");
      csvRow.push(`"${defaultType}"`);
    } else if (mappings.workItemType) {
      const value = applyTextModifiers(
        row[mappings.workItemType] || "Task",
        "workItemType",
        textModifiers,
      );
      csvRow.push(`"${value}"`);
    } else {
      csvRow.push('"Task"');
    }

    // Title (required)
    if (mappings.title) {
      const value = applyTextModifiers(
        row[mappings.title] || "",
        "title",
        textModifiers,
      );
      csvRow.push(`"${value}"`);
    } else {
      csvRow.push('""');
    }

    // Optional fields
    Object.entries(OPTIONAL_FIELDS_MAPPING).forEach(([fieldKey]) => {
      if (mappings[fieldKey] === "CUSTOM_VALUE") {
        if (customValues[fieldKey]) {
          csvRow.push(`"${customValues[fieldKey]}"`);
        }
      } else if (mappings[fieldKey]) {
        const value = applyTextModifiers(
          row[mappings[fieldKey]] || "",
          fieldKey,
          textModifiers,
        );
        csvRow.push(`"${value}"`);
      }
    });

    // Custom fields
    customFields.forEach((field) => {
      if (mappings[field] === "CUSTOM_VALUE") {
        if (customValues[field]) {
          csvRow.push(`"${customValues[field]}"`);
        }
      } else if (mappings[field]) {
        const value = applyTextModifiers(
          row[mappings[field]] || "",
          field,
          textModifiers,
        );
        csvRow.push(`"${value}"`);
      }
    });

    csvRows.push(csvRow.join(","));
  });

  return csvRows.join("\n");
}
