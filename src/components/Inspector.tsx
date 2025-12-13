// src/components/Inspector.tsx
import { FC, useState } from "react";
import { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY, resolveSfmcImageUrl } from "../data/moduleDefinitions";

interface InspectorProps {
  module: PlacedModule | null;
  onChangeField: (fieldId: string, value: string) => void;
}

// Only true image fields (used for preview)
const IMAGE_FIELDS = new Set([
  "image",
  "image_left",
  "image_right",
  "image1_src",
  "image2_src",
]);

// Map alias field → title field (business logic)
function getTitleFieldForAlias(
  moduleKey: string,
  aliasId: string
): string | null {
  switch (moduleKey) {
    case "image_full_width":
      return aliasId === "link_alias" ? "image_title" : null;

    case "image_grid_1x2":
      if (aliasId === "alias_left") return "title_left";
      if (aliasId === "alias_right") return "title_right";
      return null;

    case "image_grid_1x2_cta":
      if (aliasId === "image1_alias") return "image1_title";
      if (aliasId === "image2_alias") return "image2_title";
      if (aliasId === "image1_btn_alias") return "image1_btn_title";
      if (aliasId === "image2_btn_alias") return "image2_btn_title";
      return null;

    case "cta_button":
      return aliasId === "alias" ? "title" : null;

    default:
      return null;
  }
}

const Inspector: FC<InspectorProps> = ({ module, onChangeField }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const def = module ? MODULES_BY_KEY[module.key] : null;

  return (
    <aside className="w-[420px] bg-white border-l border-slate-200 p-6 overflow-y-auto h-screen shadow-inner flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 pb-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700">
          Content Block Settings
        </h2>
      </div>

      {/* No block selected */}
      {!module || !def ? (
        <div className="mt-6 text-xs text-slate-500">
          No block selected. Click a module on the canvas to edit its content.
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Module Title */}
          <h3 className="text-base font-bold text-slate-700">
            {def.label}
          </h3>

          {/* Fields */}
          <div className="space-y-4">
            {def.fields.map((field) => {
              const value = module.values[field.id] ?? "";

              const titleFieldId = getTitleFieldForAlias(
                module.key,
                field.id
              );
              const isAlias = !!titleFieldId;

              // Hide alias until title exists
              if (isAlias) {
                const titleVal = module.values[titleFieldId!] ?? "";
                if (!titleVal.trim()) return null;
              }

              const isImageField = IMAGE_FIELDS.has(field.id);

              return (
                <div key={field.id} className="space-y-1">
                  {/* Label */}
                  <label className="block text-xs font-semibold text-slate-600">
                    {field.label}
                    {isAlias && (
                      <span className="ml-1 text-[10px] text-blue-500">
                        (auto-generated)
                      </span>
                    )}
                  </label>

                  {/* Text */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      value={value}
                      readOnly={isAlias}
                      onChange={(e) => {
                        if (!isAlias) {
                          onChangeField(field.id, e.target.value);
                        }
                      }}
                      className={`w-full rounded border px-2 py-1 text-xs ${
                        isAlias
                          ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                          : "border-slate-300"
                      }`}
                    />
                  )}

                  {/* Textarea */}
                  {field.type === "textarea" && (
                    <textarea
                      value={value}
                      onChange={(e) =>
                        onChangeField(field.id, e.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[120px]"
                    />
                  )}

                  {/* Code */}
                  {field.type === "code" && (
                    <textarea
                      value={value}
                      onChange={(e) =>
                        onChangeField(field.id, e.target.value)
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[200px] font-mono bg-slate-50"
                    />
                  )}

                  {/* Note */}
                  {field.type === "note" && (
                    <p className="text-[11px] text-slate-500 italic">
                      {field.label}
                    </p>
                  )}

                  {/* Image Preview */}
                  {isImageField && value && (
                    <div className="mt-1">
                      <img
                        src={resolveSfmcImageUrl(value)}
                        alt=""
                        className="w-24 h-24 object-contain border border-slate-200 rounded cursor-zoom-in bg-white"
                        onClick={() =>
                          setPreviewUrl(
                            resolveSfmcImageUrl(value)
                          )
                        }
                      />
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Click to enlarge
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-600">
                Image Preview
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-xs border border-slate-300 rounded px-2 py-1 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <img
                src={previewUrl}
                alt=""
                className="max-w-full h-auto block mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Inspector;
