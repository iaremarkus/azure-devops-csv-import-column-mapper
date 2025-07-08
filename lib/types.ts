export interface CSVRow {
  [column: string]: string;
}

export interface FieldMapping {
  [fieldKey: string]: string;
}

export interface CustomValues {
  [fieldKey: string]: string;
}

export interface TextModifiers {
  [fieldKey: string]: {
    prepend?: string;
    append?: string;
  };
}

export interface RequiredField {
  key: string;
  label: string;
  required: boolean;
}

export interface AppState {
  file: File | null;
  sourceColumns: string[];
  sourceData: CSVRow[];
  allSourceData: CSVRow[];
  mappings: FieldMapping;
  customFields: string[];
  newCustomField: string;
  error: string;
  customValues: CustomValues;
  textModifiers: TextModifiers;
}

export type WorkItemType =
  | "Task"
  | "Bug"
  | "User Story"
  | "Issue"
  | "Feature"
  | "Epic";

export const WORK_ITEM_TYPES: WorkItemType[] = [
  "Task",
  "Bug",
  "User Story",
  "Issue",
  "Feature",
  "Epic",
];

export const REQUIRED_FIELDS: RequiredField[] = [
  { key: "workItemType", label: "Work Item Type", required: true },
  { key: "title", label: "Title", required: true },
  { key: "assignedTo", label: "Assigned To", required: false },
  { key: "description", label: "Description", required: false },
  { key: "priority", label: "Priority", required: false },
  { key: "effort", label: "Effort", required: false },
];

export const OPTIONAL_FIELDS_MAPPING = {
  assignedTo: "Assigned To",
  description: "Description",
  priority: "Priority",
  effort: "Effort",
} as const;
