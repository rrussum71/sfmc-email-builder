// src/components/Inspector.tsx

import type { FC, ChangeEvent } from "react";
import type { PlacedModule } from "../types/Module";
import { MODULE_DEFINITIONS, resolveSfmcImageUrl } from "../data/moduleDefinitions";

interface InspectorProps {
  module: PlacedModule | null;
  onChangeField: (fieldId: string, value: string) => void;
}

// Heuristic: which field ids should show an image preview
function isImageField(fieldId: string): boolean {
  const lowered = fieldId.toLowerCase();
  return (
    lowered.includes("image") ||
    lowered.includes("img") ||
    lowered.endsWith("_src")
  );
}

const Inspector: FC<InspectorProps> = ({ module, onChangeField }) => {
  // No module selected
  if (!module) {
    return (
      <aside className="w-80 border-l border-slate-200 bg-white p-4 text-sm text-slate-500">
        <p className="text-xs text-slate-500">Select a module to edit.</p>
      </aside>
    );
  }

  const def = MODULE_DEFINITIONS.find((d) => d.key === module.key);

  const handleChange =
    (fieldId: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChangeField(fieldId, e.target.value);
    };

  // Special UI for the Table Wrapper
  if (module.key === "table_wrapper") {
    const bgValue = module.values["bg"] ?? "#FFFFFF";

    return (
      <aside className="w-80 border-l border-slate-200 bg-white p-4">
        <h2 className="text-xs font-semibold text-slate-700 mb-3">
          Table Wrapper (Section)
        </h2>

        <label className="block mb-2">
          <span className="block text-[11px] font-semibold text-slate-600 mb-1">
            Table Background Color (#HEX)
          </span>
          <input
            type="text"
            className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
            placeholder="#FFFFFF"
            value={bgValue}
            onChange={(e) => onChangeField("bg", e.target.value)}
          />
        </label>

        <p className="mt-3 text-[11px] text-slate-400">
          This color applies only to this table section. You can stack multiple
          table wrappers, each with its own background.
        </p>
      </aside>
    );
  }

  // Generic module inspector
  return (
    <aside className="w-80 border-l border-slate-200 bg-white p-4 overflow-auto">
      <h2 className="text-xs font-semibold text-slate-700 mb-3">
        {def?.label ?? "Module Settings"}
      </h2>

      {!def ? (
        <p className="text-[11px] text-slate-500">
          No definition found for <code>{module.key}</code>.
        </p>
      ) : (
        <div className="space-y-3">
          {def.fields.map((field) => {
            const value = module.values[field.id] ?? "";

            // NOTE fields are just informational
            if (field.type === "note") {
              return (
                <div key={field.id} className="text-[11px] text-slate-500 italic">
                  {field.label}
                </div>
              );
            }

            // Textarea / Code / Text
            let control: JSX.Element;
            if (field.type === "textarea") {
              control = (
                <textarea
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs min-h-[80px]"
                  value={value}
                  onChange={handleChange(field.id)}
                />
              );
            } else if (field.type === "code") {
              control = (
                <textarea
                  className="w-full border border-slate-300 rounded px-2 py-1 text-[11px] font-mono min-h-[140px]"
                  value={value}
                  onChange={handleChange(field.id)}
                />
              );
            } else {
              control = (
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                  value={value}
                  onChange={handleChange(field.id)}
                />
              );
            }

            const showPreview = isImageField(field.id) && !!value;
            const previewSrc = showPreview ? resolveSfmcImageUrl(value) : "";

            return (
              <div key={field.id}>
                <label className="block mb-1">
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {field.label}
                  </span>
                  {control}
                </label>

                {showPreview && (
                  <div className="mt-1 border border-slate-200 rounded bg-slate-50 p-2">
                    <div className="text-[10px] text-slate-500 mb-1">
                      Image Preview (resolved URL)
                    </div>
                    <div className="border border-slate-200 bg-white p-1 flex items-center justify-center">
                      {/* Keep height flexible but constrained */}
                      <img
                        src={previewSrc}
                        alt={field.label}
                        style={{ maxWidth: "100%", height: "auto", display: "block" }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 break-all">
                      {previewSrc}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default Inspector;
