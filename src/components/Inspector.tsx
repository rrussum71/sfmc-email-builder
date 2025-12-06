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

      {/* No Block Selected */}
      {!module || !def ? (
        <div className="mt-6 text-xs text-slate-500">
          No block selected. Click a module on the canvas to edit its content.
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {/* Module Title */}
          <div>
            <h3 className="text-base font-bold text-slate-700">{def.label}</h3>
          </div>

          {/* Render grouped fields */}
          {Object.entries(groupFields(def.fields)).map(([groupName, fields]) => (
            <div key={groupName} className="space-y-3">
              <h4 className="text-xs tracking-wide uppercase text-slate-500 font-semibold">
                {groupName}
              </h4>

              {fields.map((field) => {
                const value = module.values[field.id] ?? "";
                const readOnly = isAliasField(field.id);

                // Hide alias field until its matching title exists
                if (readOnly) {
                  const titleField = findTitleField(field.id, module.values);
                  if (!titleField || !module.values[titleField]) return null;
                }

                return (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      {field.label}
                      {readOnly && (
                        <span className="ml-1 text-[10px] text-blue-500">
                          (auto-generated)
                        </span>
                      )}
                    </label>

                    {/* TEXTAREA */}
                    {field.type === "textarea" && (
                      <textarea
                        value={value}
                        onChange={(e) => onChangeField(field.id, e.target.value)}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[120px]"
                      />
                    )}

                    {/* INPUT TEXT */}
                    {field.type === "text" && (
                      <input
                        type="text"
                        value={value}
                        readOnly={readOnly}
                        onChange={(e) => {
                          if (!readOnly) onChangeField(field.id, e.target.value);
                        }}
                        className={`w-full rounded border px-2 py-1 text-xs ${
                          readOnly
                            ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            : "border-slate-300"
                        }`}
                      />
                    )}

                    {/* CODE AREA */}
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
          ))}
        </div>
      )}
    </aside>
  );
};

export default Inspector;

/* ============================================================
   GROUPING HELPERS
============================================================ */
function groupFields(fields: any[]) {
  const groups: Record<string, any[]> = {};

  fields.forEach((field) => {
    const group = getFieldGroup(field.id);
    if (!groups[group]) groups[group] = [];
    groups[group].push(field);
  });

  return groups;
}

function getFieldGroup(fieldId: string): string {
  if (fieldId.includes("_btn")) return "Buttons";
  if (fieldId.includes("image")) return "Images";
  if (fieldId.includes("link")) return "Links";
  if (isAliasField(fieldId) || isTitleField(fieldId)) return "Titles & Metadata";
  return "General Fields";
}

/* ============================================================
   FIELD HELPERS
============================================================ */
function isAliasField(id: string) {
  return (
    id.endsWith("_alias") ||
    id.endsWith("_link_alias") ||
    id.endsWith("_btn_alias")
  );
}

function isTitleField(id: string) {
  return id.endsWith("_title");
}

function findTitleField(aliasField: string, values: Record<string, string>) {
  const base = aliasField.replace(/_(alias|link_alias|btn_alias)$/, "");
  return Object.keys(values).find((k) => k === `${base}_title`);
}