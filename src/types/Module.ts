export interface PlacedModule {
  id: string;
  key: string;
  values: Record<string, string>;

  // NEW for the AMPscript Country Switcher
  parentId?: string;         // ID of the "ampscript_country" wrapper
  country?: "US" | "CA" | "AU" | "Default";
}

export interface ModuleField {
  id: string;
  label: string;
  type: "text" | "textarea" | "code" | "note";
}

export interface ModuleDefinition {
  key: string;
  label: string;
  fields: ModuleField[];
  renderHtml: (values: Record<string, string>) => string;
}