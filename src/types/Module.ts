export type Country = "US" | "CA" | "AU" | "Default";

export type BaseField = {
  id: string;
  label: string;
  type: string;
};

export type SimpleField = BaseField & {
  type: "text" | "textarea" | "code" | "note";
};

export type RepeaterField = BaseField & {
  type: "repeater";
  itemLabel: string;
  fields: ModuleField[];
};

export type ModuleField = SimpleField | RepeaterField;

export interface ModuleDefinition {
  key: string;
  label: string;
  fields: ModuleField[];
  renderHtml: (values: Record<string, any>) => string;
  thumb?: string;
}

export interface PlacedModule {
  id: string;
  key: string;
  values: Record<string, any>;
  parentId?: string;      // NULL for top-level
  country?: Country;      // only used for nested modules inside switcher
}