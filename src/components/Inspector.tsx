import { FC } from "react";
import { PlacedModule } from "../types/Module";
import {
  MODULES_BY_KEY,
  resolveSfmcImageUrl,
} from "../data/moduleDefinitions";

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
            <h3 className="text-base font-bold text-slate-700">{def.label}</h3>
          </div>

          {/* Grouped fields (titles, images, links, etc.) */}
          {Object.entries(groupFields(def.fields)).map(
            ([groupName, fields]) => (
              <div key={groupName} className="space-y-3">
                <h4 className="text-xs tracking-wide uppercase text-slate-500 font-semibold">
                  {groupName}
                </h4>

                {fields.map((field) => {
                  const value = module.values[field.id] ?? "";
                  const isAlias = isAliasField(field.id);
                  const isImage = isImageField(field.id);

                  // Hide alias fields until their title exists
                  if (isAlias) {
                    const titleField = findTitleField(
                      field.id,
                      module.values
                    );
                    if (!titleField || !module.values[titleField]) {
                      return null;
                    }
                  }

                  return (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-600">
                        {field.label}
                        {isAlias && (
                          <span className="ml-1 text-[10px] text-blue-500">
                            (auto-generated)
                          </span>
                        )}
                      </label>

                      {/* TEXTAREA */}
                      {field.type === "textarea" && (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            onChangeField(field.id, e.target.value)
                          }
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[120px]"
                        />
                      )}

                      {/* TEXT INPUT */}
                      {field.type === "text" && (
                        <>
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

                          {/* IMAGE PREVIEW (INSPECTOR) */}
                          {isImage && value && (
                            <div className="mt-1">
                              <div className="text-[10px] text-slate-400 mb-1">
                                Preview
                              </div>
                              <div className="border border-slate-200 rounded bg-slate-50 p-1 inline-block max-w-full">
                                <img
                                  src={resolveSfmcImageUrl(value)}
                                  alt={field.label}
                                  className="max-h-32 max-w-full rounded"
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* CODE BLOCK */}
                      {field.type === "code" && (
                        <textarea
                          value={value}
                          onChange={(e) =>
                            onChangeField(field.id, e.target.value)
                          }
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs min-h-[200px] font-mono bg-slate-50"
                        />
                      )}

                      {/* NOTE FIELD (read-only helper text) */}
                      {field.type === "note" && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded px-2 py-1">
                          {field.label}
                        </div>
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

function groupFields(fields: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {
    "Titles & Metadata": [],
    Images: [],
    Links: [],
    Buttons: [],
    "AMPscript / Code": [],
    "General Fields": [],
  };

  fields.forEach((f) => {
    if (isTitleField(f.id) || isAliasField(f.id)) {
      groups["Titles & Metadata"].push(f);
    } else if (isImageField(f.id)) {
      groups["Images"].push(f);
    } else if (f.id.includes("link") || f.id.includes("url")) {
      groups["Links"].push(f);
    } else if (f.id.includes("btn")) {
      groups["Buttons"].push(f);
    } else if (f.type === "code" || f.id.includes("ampscript")) {
      groups["AMPscript / Code"].push(f);
    } else {
      groups["General Fields"].push(f);
    }
  });

  // Strip empty groups to keep panel clean
  return Object.fromEntries(
    Object.entries(groups).filter(([_, arr]) => arr.length > 0)
  );
}

/* ============================================================
   FIELD IDENTIFICATION HELPERS
============================================================ */

function isAliasField(id: string): boolean {
  return (
    id.endsWith("_alias") ||
    id.endsWith("_link_alias") ||
    id.endsWith("_btn_alias")
  );
}

function isTitleField(id: string): boolean {
  return id.endsWith("_title") || id === "title";
}

function isImageField(id: string): boolean {
  // These are all your image-ish fields across modules
  return (
    id === "image" ||
    id === "image_left" ||
    id === "image_right" ||
    id === "image1_src" ||
    id === "image2_src" ||
    id.startsWith("image_") ||
    id.endsWith("_src")
  );
}

function findTitleField(
  aliasField: string,
  values: Record<string, string>
): string | undefined {
  const base = aliasField.replace(/_(alias|link_alias|btn_alias)$/, "");
  // Try "image_title", "image1_title", "title_left", etc.
  const candidates = [
    `${base}_title`,
    base === "alias" ? "title" : undefined,
  ].filter(Boolean) as string[];

  return candidates.find((name) => Object.prototype.hasOwnProperty.call(values, name));
}