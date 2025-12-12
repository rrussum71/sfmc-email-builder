export type Country = "US" | "CA" | "AU" | "Default";

/**
 * Adds support for:
 * - text
 * - textarea
 * - code
 * - note
 * - select  <-- NEW
 */
export interface ModuleField {
  id: string;
  label: string;
  type: "text" | "textarea" | "code" | "note" | "select";
  options?: { label: string; value: string }[]; // only for type = select
}

export interface ModuleDefinition {
  key: string;
  label: string;
  fields: ModuleField[];
  renderHtml: (values: Record<string, string>) => string;
  thumb?: string;
}

export interface PlacedModule {
  id: string;
  key: string;
  values: Record<string, string>;
  parentId?: string;
  country?: Country;
}
