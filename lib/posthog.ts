import posthog from "posthog-js";

// Client-side PostHog instance
let posthogClient: typeof posthog | null = null;

export function initPostHog() {
  if (typeof window !== "undefined" && !posthogClient) {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const isDevelopment = process.env.NODE_ENV === "development";
    const isLocalhost = typeof window !== "undefined" && 
      (window.location.hostname === "localhost" || 
       window.location.hostname === "127.0.0.1" ||
       window.location.hostname.includes("localhost"));

    // Only initialize PostHog in production and when API key is available
    if (apiKey && !isDevelopment && !isLocalhost) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
      });
      posthogClient = posthog;
    }
  }
  return posthogClient;
}

export function getPostHog() {
  return posthogClient || initPostHog();
}

// Event tracking functions
export function trackFileUploaded(properties: {
  filename: string;
  fileSize: number;
  rowCount: number;
  columnCount: number;
}) {
  const posthog = getPostHog();
  if (posthog) {
    posthog.capture("file_uploaded", {
      filename: properties.filename,
      file_size_kb: Math.round(properties.fileSize / 1024),
      row_count: properties.rowCount,
      column_count: properties.columnCount,
    });
  }
}

export function trackClipboardCopy(properties: {
  rowCount: number;
  fieldCount: number;
  customFieldCount: number;
}) {
  const posthog = getPostHog();
  if (posthog) {
    posthog.capture("csv_copied_to_clipboard", {
      row_count: properties.rowCount,
      field_count: properties.fieldCount,
      custom_field_count: properties.customFieldCount,
    });
  }
}

export function trackFileDownload(properties: {
  rowCount: number;
  fieldCount: number;
  customFieldCount: number;
}) {
  const posthog = getPostHog();
  if (posthog) {
    posthog.capture("csv_file_downloaded", {
      row_count: properties.rowCount,
      field_count: properties.fieldCount,
      custom_field_count: properties.customFieldCount,
    });
  }
}

export function trackCustomFieldAdded(properties: {
  fieldName: string;
  totalCustomFields: number;
}) {
  const posthog = getPostHog();
  if (posthog) {
    posthog.capture("custom_field_added", {
      field_name: properties.fieldName,
      total_custom_fields: properties.totalCustomFields,
    });
  }
}

export function trackFieldMapping(properties: {
  fieldType: string;
  mappingType: "source_column" | "custom_value" | "default_value";
  isRequired: boolean;
}) {
  const posthog = getPostHog();
  if (posthog) {
    posthog.capture("field_mapped", {
      field_type: properties.fieldType,
      mapping_type: properties.mappingType,
      is_required: properties.isRequired,
    });
  }
}
