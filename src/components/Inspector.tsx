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

      {/* Background Color Setting */}
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

      {/* No Module Selected */}
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

          {/* Grouped Fields */}
          {Object.entries(groupFields(def.fields)).map(([groupName, fields]) => (
            <div key={groupName} className="space-y-3">
              <h4 className="text-xs tracking-wide uppercase text-slate-500 font-semibold">
                {groupName}
              </h4>

              {fields.map((field) => {
                const value = module.values[field.id] ?? "";

                return (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      {field.label}
                    </label>

                    {field.type === "text" && (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          onChangeField(field.id, e.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          onChangeField(field.id, e.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[120px]"
                      />
                    )}

                    {field.type === "code" && (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          onChangeField(field.id, e.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[200px] font-mono bg-slate-50"
                        placeholder="%%[ /* AMPscript */ ]%%"
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

/* -----------------------------
   AUTO GROUP FIELD LOGIC
-------------------------------- */
function groupFields(fields: any[]) {
  const groups: Record<string, any[]> = {};

  fields.forEach((f) => {
    const group = getFieldGroup(f.id);
    if (!groups[group]) groups[group] = [];
    groups[group].push(f);
  });

  return groups;
}

/* -----------------------------
   FIELD → GROUP MATCHING
-------------------------------- */
function getFieldGroup(fieldId: string): string {
  if (fieldId.includes("_btn")) return "Button Settings";
  if (fieldId.includes("image") || fieldId.includes("_src")) return "Image Fields";
  if (fieldId.includes("link")) return "Link Settings";
  if (fieldId.includes("alt")) return "Accessibility";
  if (fieldId.includes("title") || fieldId.includes("alias")) return "Metadata";
  return "General Fields";
}

export default Inspector;