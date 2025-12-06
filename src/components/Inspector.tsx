import { FC } from "react";
import { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

interface InspectorProps {
  module: PlacedModule | null;
  bgColor: string;
  onBgChange: (value: string) => void;
  onChangeField: (fieldId: string, value: string) => void;
}

const Inspector: FC<InspectorProps> = ({
  module,
  bgColor,
  onBgChange,
  onChangeField,
}) => {
  const def = module ? MODULES_BY_KEY[module.key] : null;

  return (
    <aside className="w-[420px] bg-white border-l border-slate-200 p-6 overflow-y-auto h-screen shadow-inner flex flex-col">

      {/* Sticky Header */}
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700">
          Content Block Settings
        </h2>
      </div>

      {/* Background Color */}
      <div className="pt-4 pb-6 border-b border-slate-200">
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Main Table Background Color (#HEX)
        </label>
        <input
          type="text"
          value={bgColor}
          onChange={(e) => onBgChange(e.target.value)}
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
          placeholder="#FFFFFF"
        />
      </div>

      {/* No block selected */}
      {!module || !def ? (
        <div className="mt-6 text-xs text-slate-500">
          No block selected. Click a module on the canvas to edit its content.
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {/* Module Title */}
          <div>
            <h3 className="text-base font-bold text-slate-700">
              {def.label}
            </h3>
          </div>

          {/* Organized Group Rendering */}
          {Object.entries(groupFields(def.fields, module.values)).map(
            ([groupName, fields]) => (
              <div key={groupName} className="space-y-3">
                <h4 className="text-xs tracking-wide uppercase text-slate-500 font-semibold">
                  {groupName}
                </h4>

                {fields.map((field) => {
                  const value = module.values[field.id] ?? "";
                  const isReadOnlyAlias = isAliasField(field.id);

                  // Hide alias until title exists
                  if (isReadOnlyAlias) {
                    const titleField = findTitleField(field.id, module.values);
                    if (!titleField || !module.values[titleField]) return null;
                  }

                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        {field.label}
                        {isReadOnlyAlias && (
                          <span className="ml-1 text-[10px] text-blue-500">
                            (auto-generated)
                          </span>
                        )}
                      </label>

                      {field.type === "textarea" && (
                        <textarea
                          value={value}
                          onChange={(e) => onChangeField(field.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[120px]"
                        />
                      )}

                      {field.type === "text" && (
                        <input
                          type="text"
                          value={value}
                          readOnly={isReadOnlyAlias}
                          onChange={(e) => {
                            if (!isReadOnlyAlias) {
                              onChangeField(field.id, e.target.value);
                            }
                          }}
                          className={`w-full rounded border px-2 py-1 text-xs ${
                            isReadOnlyAlias
                              ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                              : "border-slate-300"
                          }`}
                        />
                      )}

                      {field.type === "code" && (
                        <textarea
                          value={value}
                          onChange={(e) => onChangeField(field.id, e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[200px] font-mono bg-slate-50"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </aside>
  );
};

export default Inspector;

/* ============================================================
   GROUPING HELPERS
============================================================ */
function groupFields(fields: any[], values: Record<string, string>) {
  const groups: Record<string, any[]> = {
    "Titles & Metadata": [],
    "Links": [],
    "Buttons": [],
    "Images": [],
    "General Fields": [],
  };

  fields.forEach((f) => {
    if (isTitleField(f.id) || isAliasField(f.id)) groups["Titles & Metadata"].push(f);
    else if (f.id.includes("link")) groups["Links"].push(f);
    else if (f.id.includes("btn")) groups["Buttons"].push(f);
    else if (f.id.includes("image")) groups["Images"].push(f);
    else groups["General Fields"].push(f);
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, fields]) => fields.length > 0)
  );
}

/* ============================================================
   FIELD IDENTIFICATION HELPERS
============================================================ */
function isAliasField(id: string) {
  return id.endsWith("_alias") || id.endsWith("_link_alias") || id.endsWith("_btn_alias");
}

function isTitleField(id: string) {
  return id.endsWith("_title");
}

function findTitleField(aliasField: string, values: Record<string, string>) {
  const base = aliasField.replace(/_(alias|link_alias|btn_alias)$/, "");
  return Object.keys(values).find((k) => k === `${base}_title`);
}