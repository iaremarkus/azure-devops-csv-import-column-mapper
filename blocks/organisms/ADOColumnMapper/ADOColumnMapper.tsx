"use client";

import {
  AlertCircle,
  Check,
  Download,
  ExternalLink,
  FileDown,
  Plus,
  Upload,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  type CSVRow,
  type CustomValues,
  type FieldMapping,
  REQUIRED_FIELDS,
  type TextModifiers,
  WORK_ITEM_TYPES,
} from "@/lib/types";
import { generateCSV } from "@/utils/csv-generator";
import { autoSuggestMappings, parseCSV } from "@/utils/csv-parser";
import {
  copyCSVToClipboard,
  downloadCSVFile,
  isValidCSVFile,
} from "@/utils/file-handlers";
import {
  addCustomField as addCustomFieldHelper,
  removeCustomField as removeCustomFieldHelper,
  updateCustomValue as updateCustomValueHelper,
  updateFieldMapping,
  updateTextModifier as updateTextModifierHelper,
} from "@/utils/mapping-helpers";

export function ADOColumnMapper() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [sourceData, setSourceData] = useState<CSVRow[]>([]);
  const [allSourceData, setAllSourceData] = useState<CSVRow[]>([]);
  const [mappings, setMappings] = useState<FieldMapping>({});
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newCustomField, setNewCustomField] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [customValues, setCustomValues] = useState<CustomValues>({});
  const [textModifiers, setTextModifiers] = useState<TextModifiers>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (uploadedFile: File): Promise<void> => {
    setError("");
    setFile(uploadedFile);

    try {
      const text = await uploadedFile.text();
      const { headers, rows } = parseCSV(text);

      setSourceColumns(headers);
      setSourceData(rows.slice(0, 3)); // Show first 3 rows as preview
      setAllSourceData(rows); // Store all data for CSV generation

      // Auto-suggest mappings
      const autoMappings = autoSuggestMappings(headers);
      setMappings(autoMappings);
      toast.success(
        `Successfully loaded ${rows.length} rows from ${uploadedFile.name}`
      );
    } catch (err) {
      const errorMsg =
        "Error reading file. Please ensure it's a valid CSV file.";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error reading file:", err);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidCSVFile(droppedFile)) {
      handleFileUpload(droppedFile);
    } else {
      const errorMsg = "Please upload a CSV file";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const updateMapping = (field: string, column: string): void => {
    const result = updateFieldMapping(field, column, mappings, customValues);
    setMappings(result.mappings);
    setCustomValues(result.customValues);
  };

  const updateCustomValue = (field: string, value: string): void => {
    setCustomValues(updateCustomValueHelper(field, value, customValues));
  };

  const updateTextModifier = (
    field: string,
    type: string,
    value: string
  ): void => {
    setTextModifiers(
      updateTextModifierHelper(field, type, value, textModifiers)
    );
  };

  const addCustomField = (): void => {
    try {
      const result = addCustomFieldHelper(
        newCustomField,
        customFields,
        mappings
      );
      setCustomFields(result.customFields);
      setMappings(result.mappings);
      setNewCustomField("");
      toast.success(`Added custom field: ${newCustomField.trim()}`);
    } catch (err) {
      // Field already exists or is empty - do nothing
      console.error("Error adding custom field:", err);
    }
  };

  const removeCustomField = (field: string): void => {
    const result = removeCustomFieldHelper(field, customFields, mappings);
    setCustomFields(result.customFields);
    setMappings(result.mappings);
    toast.success(`Removed custom field: ${field}`);
  };

  const generateCSVContent = (): string => {
    return generateCSV(
      allSourceData,
      mappings,
      customFields,
      customValues,
      textModifiers
    );
  };

  const copyToClipboard = async (): Promise<void> => {
    const csvContent = generateCSVContent();
    await copyCSVToClipboard(csvContent, allSourceData.length);
  };

  const downloadCSV = (): void => {
    const csvContent = generateCSVContent();
    downloadCSVFile(csvContent, allSourceData.length);
  };

  const canGenerate = mappings.title && allSourceData.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Azure DevOps CSV Import Mapper
            </h1>
            <p className="text-muted-foreground">
              Upload your spreadsheet and map columns to Azure DevOps work item
              fields. This tool will help you create a CSV file that can be
              imported into Azure DevOps. For more information, see{" "}
              <a
                href="https://learn.microsoft.com/en-us/azure/devops/boards/queries/import-work-items-from-csv?view=azure-devops#tree-items"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Import work items from CSV (Microsoft Docs)
                </span>
              </a>
              <a
                href="https://learn.microsoft.com/en-us/azure/devops/boards/work-items/guidance/work-item-field?view=azure-devops"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Work item field reference (Microsoft Docs)
                </span>
              </a>
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* File Upload */}
        <Card>
          <CardContent className="pt-6">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                Drop your CSV file here
              </p>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button variant="outline">Browse Files</Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {file && (
              <Alert className="mt-4">
                <Check className="h-4 w-4" />
                <AlertDescription>File uploaded: {file.name}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {sourceColumns.length > 0 && (
          <>
            {/* Source Data Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Source Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {sourceColumns.map((col, index) => (
                          <TableHead key={index}>{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourceData.map((row, index) => (
                        <TableRow key={index}>
                          {sourceColumns.map((col, colIndex) => (
                            <TableCell key={colIndex}>{row[col]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Field Mapping */}
            <Card>
              <CardHeader>
                <CardTitle>Field Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Header Row */}
                <div className="grid grid-cols-4 gap-4 mb-4 px-4 py-2 bg-muted rounded-lg border">
                  <div className="text-sm font-medium">Field</div>
                  <div className="text-sm font-medium text-center">Prepend</div>
                  <div className="text-sm font-medium text-center">Mapping</div>
                  <div className="text-sm font-medium text-center">Append</div>
                </div>

                <div className="space-y-4">
                  {REQUIRED_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-4 gap-4 items-center p-4 border rounded-lg"
                    >
                      {/* Field Name */}
                      <div>
                        <Label className="text-sm font-medium">
                          {field.label}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                      </div>

                      {/* Prepend Input */}
                      <div>
                        {mappings[field.key] &&
                        mappings[field.key] !== "CUSTOM_VALUE" &&
                        !mappings[field.key].startsWith("DEFAULT:") ? (
                          <Input
                            value={textModifiers[field.key]?.prepend || ""}
                            onChange={(e) =>
                              updateTextModifier(
                                field.key,
                                "prepend",
                                e.target.value
                              )
                            }
                            placeholder="Prepend..."
                            className="text-sm"
                          />
                        ) : (
                          <div className="w-full px-3 py-2 text-sm text-muted-foreground bg-muted border rounded-md">
                            -
                          </div>
                        )}
                      </div>

                      {/* Main Mapping Select */}
                      <div>
                        <Select
                          value={mappings[field.key] || ""}
                          onValueChange={(value) =>
                            updateMapping(field.key, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.key === "workItemType" ? (
                              <>
                                {sourceColumns.length > 0 && (
                                  <SelectGroup>
                                    <SelectLabel>Source Columns</SelectLabel>
                                    {sourceColumns.map((col, index) => (
                                      <SelectItem key={index} value={col}>
                                        {col}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                )}
                                {sourceColumns.length > 0 && (
                                  <SelectSeparator />
                                )}
                                <SelectGroup>
                                  <SelectLabel>Custom Value</SelectLabel>
                                  <SelectItem value="CUSTOM_VALUE">
                                    Custom Value
                                  </SelectItem>
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                  <SelectLabel>ADO Defaults</SelectLabel>
                                  {WORK_ITEM_TYPES.map((type) => (
                                    <SelectItem
                                      key={`default-${type}`}
                                      value={`DEFAULT:${type}`}
                                    >
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </>
                            ) : (
                              <>
                                {sourceColumns.map((col, index) => (
                                  <SelectItem key={index} value={col}>
                                    {col}
                                  </SelectItem>
                                ))}
                                <SelectItem value="CUSTOM_VALUE">
                                  Custom Value
                                </SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>

                        {/* Custom Value Input (below select) */}
                        {mappings[field.key] === "CUSTOM_VALUE" && (
                          <div className="mt-2">
                            <Input
                              value={customValues[field.key] || ""}
                              onChange={(e) =>
                                updateCustomValue(field.key, e.target.value)
                              }
                              placeholder="Enter custom value"
                            />
                          </div>
                        )}
                      </div>

                      {/* Append Input */}
                      <div>
                        {mappings[field.key] &&
                        mappings[field.key] !== "CUSTOM_VALUE" &&
                        !mappings[field.key].startsWith("DEFAULT:") ? (
                          <Input
                            value={textModifiers[field.key]?.append || ""}
                            onChange={(e) =>
                              updateTextModifier(
                                field.key,
                                "append",
                                e.target.value
                              )
                            }
                            placeholder="Append..."
                            className="text-sm"
                          />
                        ) : (
                          <div className="w-full px-3 py-2 text-sm text-muted-foreground bg-muted border rounded-md">
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Input
                    value={newCustomField}
                    onChange={(e) => setNewCustomField(e.target.value)}
                    placeholder="Enter custom field name (e.g., __bolt-Original-Estimate)"
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && addCustomField()}
                  />
                  <Button onClick={addCustomField} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                {customFields.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Custom Field Mappings
                    </h3>

                    {/* Header Row for Custom Fields */}
                    <div className="grid grid-cols-5 gap-4 mb-4 px-4 py-2 bg-muted rounded-lg border">
                      <div className="text-sm font-medium">Field</div>
                      <div className="text-sm font-medium text-center">
                        Prepend
                      </div>
                      <div className="text-sm font-medium text-center">
                        Mapping
                      </div>
                      <div className="text-sm font-medium text-center">
                        Append
                      </div>
                      <div className="text-sm font-medium text-center">
                        Actions
                      </div>
                    </div>

                    <div className="space-y-4">
                      {customFields.map((field, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-5 gap-4 items-center p-4 border rounded-lg"
                        >
                          {/* Field Name */}
                          <div>
                            <Label className="text-sm font-medium">
                              {field}
                            </Label>
                          </div>

                          {/* Prepend Input */}
                          <div>
                            {mappings[field] &&
                            mappings[field] !== "CUSTOM_VALUE" ? (
                              <Input
                                value={textModifiers[field]?.prepend || ""}
                                onChange={(e) =>
                                  updateTextModifier(
                                    field,
                                    "prepend",
                                    e.target.value
                                  )
                                }
                                placeholder="Prepend..."
                                className="text-sm"
                              />
                            ) : (
                              <div className="w-full px-3 py-2 text-sm text-muted-foreground bg-muted border rounded-md">
                                -
                              </div>
                            )}
                          </div>

                          {/* Main Mapping Select */}
                          <div>
                            <Select
                              value={mappings[field] || ""}
                              onValueChange={(value) =>
                                updateMapping(field, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a column..." />
                              </SelectTrigger>
                              <SelectContent>
                                {sourceColumns.map((col, colIndex) => (
                                  <SelectItem key={colIndex} value={col}>
                                    {col}
                                  </SelectItem>
                                ))}
                                <SelectItem value="CUSTOM_VALUE">
                                  Custom Value
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Custom Value Input (below select) */}
                            {mappings[field] === "CUSTOM_VALUE" && (
                              <div className="mt-2">
                                <Input
                                  value={customValues[field] || ""}
                                  onChange={(e) =>
                                    updateCustomValue(field, e.target.value)
                                  }
                                  placeholder="Enter custom value"
                                />
                              </div>
                            )}
                          </div>

                          {/* Append Input */}
                          <div>
                            {mappings[field] &&
                            mappings[field] !== "CUSTOM_VALUE" ? (
                              <Input
                                value={textModifiers[field]?.append || ""}
                                onChange={(e) =>
                                  updateTextModifier(
                                    field,
                                    "append",
                                    e.target.value
                                  )
                                }
                                placeholder="Append..."
                                className="text-sm"
                              />
                            ) : (
                              <div className="w-full px-3 py-2 text-sm text-muted-foreground bg-muted border rounded-md">
                                -
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomField(field)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={copyToClipboard}
                disabled={!canGenerate}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button onClick={downloadCSV} disabled={!canGenerate}>
                <FileDown className="h-4 w-4 mr-2" />
                Download CSV File
              </Button>
            </div>

            {!mappings.title && sourceColumns.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please map the Title field to generate the CSV
                </AlertDescription>
              </Alert>
            )}

            {/* Preview - Always Visible */}
            {canGenerate && (
              <Card>
                <CardHeader>
                  <CardTitle>CSV Output Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {generateCSVContent()}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
