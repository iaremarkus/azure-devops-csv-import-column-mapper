import type { CustomValues, FieldMapping, TextModifiers } from "@/lib/types";

/**
 * Updates a field mapping and clears related custom values if needed
 */
export function updateFieldMapping(
  field: string,
  column: string,
  currentMappings: FieldMapping,
  currentCustomValues: CustomValues,
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
