export type Country = "US" | "CA" | "AU" | "Default";

export interface ModuleDefinition {
  key: string;
  label: string;
  fields: { id: string; label: string; type: string }[];
  renderHtml: (values: Record<string, string>) => string;
  thumb?: string;
}

export interface PlacedModule {
  id: string;
  key: string;
  values: Record<string, string>;
  parentId?: string;      // NULL for top-level
  country?: Country;      // only used for nested modules inside switcher
}