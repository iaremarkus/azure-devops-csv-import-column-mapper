import type { CustomValues, FieldMapping, TextModifiers } from "@/lib/types";
import { trackCustomFieldAdded, trackFieldMapping } from "@/lib/posthog";

/**
 * Updates a field mapping and clears related custom values if needed
 */
export function updateFieldMapping(
  field: string,
  column: string,
  currentMappings: FieldMapping,
  currentCustomValues: CustomValues,
  trackEvent: boolean = true,
): {
  mappings: FieldMapping;
  customValues: CustomValues;
} {
  const mappings = {
    ...currentMappings,
    [field]: column,
  };

  let customValues = { ...currentCustomValues };

  // Clear custom value if switching away from custom
  if (column !== "CUSTOM_VALUE") {
    const { [field]: removed, ...remaining } = customValues;
    customValues = remaining;
  } else {
    // Set default custom value for work item type
    if (field === "workItemType" && !customValues[field]) {
      customValues = {
        ...customValues,
        [field]: "Task",
      };
    }
  }

  // Track the field mapping event
  if (trackEvent) {
    const mappingType =
      column === "CUSTOM_VALUE"
        ? "custom_value"
        : column.startsWith("DEFAULT:")
          ? "default_value"
          : "source_column";

    trackFieldMapping({
      fieldType: field,
      mappingType,
      isRequired: field === "workItemType" || field === "title",
    });
  }

  return { mappings, customValues };
}

/**
 * Updates a custom value for a field
 */
export function updateCustomValue(
  field: string,
  value: string,
  currentCustomValues: CustomValues,
): CustomValues {
  return {
    ...currentCustomValues,
    [field]: value,
  };
}

/**
 * Updates text modifiers for a field
 */
export function updateTextModifier(
  field: string,
  type: string,
  value: string,
  currentTextModifiers: TextModifiers,
): TextModifiers {
  return {
    ...currentTextModifiers,
    [field]: {
      ...currentTextModifiers[field],
      [type]: value,
    },
  };
}

/**
 * Adds a new custom field with default mapping
 */
export function addCustomField(
  fieldName: string,
  currentCustomFields: string[],
  currentMappings: FieldMapping,
): {
  customFields: string[];
  mappings: FieldMapping;
} {
  if (!fieldName.trim() || currentCustomFields.includes(fieldName.trim())) {
    throw new Error("Field name is empty or already exists");
  }

  const customFields = [...currentCustomFields, fieldName.trim()];
  const mappings = {
    ...currentMappings,
    [fieldName]: "CUSTOM_VALUE",
  };

  // Track the custom field addition
  trackCustomFieldAdded({
    fieldName: fieldName.trim(),
    totalCustomFields: customFields.length,
  });

  return { customFields, mappings };
}

/**
 * Removes a custom field and its mappings
 */
export function removeCustomField(
  fieldName: string,
  currentCustomFields: string[],
  currentMappings: FieldMapping,
): {
  customFields: string[];
  mappings: FieldMapping;
} {
  const customFields = currentCustomFields.filter((f) => f !== fieldName);
  const { [fieldName]: removed, ...mappings } = currentMappings;

  return { customFields, mappings };
}
