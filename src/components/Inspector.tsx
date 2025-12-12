// src/components/Inspector.tsx
import type { PlacedModule } from "../types/Module";
import { MODULE_DEFINITIONS, resolveSfmcImageUrl } from "../data/moduleDefinitions";

interface InspectorProps {
  module: PlacedModule | null;
  onChangeField: (fieldId: string, value: string) => void;
}

export default function Inspector({ module, onChangeField }: InspectorProps) {
  if (!module) {
    return (
      <aside className="w-80 border-l bg-white p-4 text-sm text-slate-500">
        Select a module to edit.
      </aside>
    );
  }

  const def = MODULE_DEFINITIONS.find((m) => m.key === module.key);
  if (!def) {
    return (
      <aside className="w-80 border-l bg-white p-4 text-sm text-red-500">
        Unknown module type.
      </aside>
    );
  }

  const values = module.values ?? {};

  // ------------------------------------------------------
  // IMAGE FIELD DETECTION (real images only)
  // ------------------------------------------------------
  function isImageField(id: string): boolean {
    return (
      id.includes("image") &&
      !id.includes("title") &&
      !id.includes("alias") &&
      !id.includes("btn")
    );
  }

  function renderImagePreview(id: string, val: string) {
    if (!isImageField(id)) return null;
    if (!val) return null;

    let url = val.trim();
    if (!/^https?:\/\//.test(url)) {
      url = resolveSfmcImageUrl(url);
    }

    return (
      <div className="mt-2 mb-4">
        <div className="text-[11px] text-slate-600 mb-1">Image Preview (resolved URL)</div>

        <div className="border rounded p-2 bg-white flex items-center justify-center">
          <img
            src={url}
            alt="preview"
            style={{ maxWidth: "100%", height: "auto" }}
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        </div>

        <div className="text-[11px] text-blue-700 break-all mt-1">{url}</div>
      </div>
    );
  }

  // ------------------------------------------------------
  // FIELD ORDERING LOGIC (TS SAFE)
  // ------------------------------------------------------
  function getOrderedFields() {
    const fields = def?.fields ?? [];

    if (!module) return fields;

    // ------------------------------
    // Full Width Image
    // ------------------------------
    if (module.key === "image_full_width") {
      const order = ["image", "alt", "image_title", "link", "link_alias"];
      return [...fields].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    }

    // ------------------------------
    // 2-Col Image
    // ------------------------------
    if (module.key === "image_grid_1x2") {
      const leftOrder = ["image_left", "alt_left", "title_left", "link_left", "alias_left"];
      const rightOrder = ["image_right", "alt_right", "title_right", "link_right", "alias_right"];

      const left = fields.filter((f) => f.id.endsWith("_left"));
      const right = fields.filter((f) => f.id.endsWith("_right"));
      const normal = fields.filter(
        (f) => !f.id.endsWith("_left") && !f.id.endsWith("_right")
      );

      left.sort((a, b) => leftOrder.indexOf(a.id) - leftOrder.indexOf(b.id));
      right.sort((a, b) => rightOrder.indexOf(a.id) - rightOrder.indexOf(b.id));

      return [...normal, ...left, ...right];
    }

    // ------------------------------
    // 2-Col Image + CTA
    // ------------------------------
    if (module.key === "image_grid_1x2_cta") {
      const leftOrder = [
        "image1_src",
        "image1_alt",
        "image1_title",
        "image1_link",
        "image1_alias",
        "image1_btn_title",
        "image1_btn_alias",
        "image1_btn_link",
      ];

      const rightOrder = [
        "image2_src",
        "image2_alt",
        "image2_title",
        "image2_link",
        "image2_alias",
        "image2_btn_title",
        "image2_btn_alias",
        "image2_btn_link",
      ];

      const left = fields.filter(
        (f) => f.id.startsWith("image1_") || f.id.startsWith("image1_btn")
      );
      const right = fields.filter(
        (f) => f.id.startsWith("image2_") || f.id.startsWith("image2_btn")
      );
      const normal = fields.filter((f) => !left.includes(f) && !right.includes(f));

      left.sort((a, b) => leftOrder.indexOf(a.id) - leftOrder.indexOf(b.id));
      right.sort((a, b) => rightOrder.indexOf(a.id) - rightOrder.indexOf(b.id));

      return [...normal, ...left, ...right];
    }

    return fields;
  }

  const orderedFields = getOrderedFields();

  // ------------------------------------------------------
  // RENDER SETTINGS PANEL
  // ------------------------------------------------------
  return (
    <aside className="w-80 border-l bg-white p-4 overflow-auto">
      <h2 className="text-sm font-semibold mb-4">Settings: {def.label}</h2>

      {orderedFields.map((field) => {
        const val = values[field.id] ?? "";

        return (
          <div key={field.id} className="mb-4">
            <label className="block text-xs font-semibold mb-1">{field.label}</label>

            {/* FIELD TYPE HANDLING */}
            {field.type === "text" && (
              <input
                className="w-full border rounded px-2 py-1 text-sm"
                value={val}
                onChange={(e) => onChangeField(field.id, e.target.value)}
              />
            )}

            {field.type === "textarea" && (
              <textarea
                className="w-full border rounded px-2 py-1 text-sm"
                rows={4}
                value={val}
                onChange={(e) => onChangeField(field.id, e.target.value)}
              />
            )}

            {field.type === "code" && (
              <textarea
                className="w-full border rounded font-mono px-2 py-1 text-xs"
                rows={6}
                value={val}
                onChange={(e) => onChangeField(field.id, e.target.value)}
              />
            )}

            {field.type === "note" && (
              <div className="text-[11px] text-slate-500 italic">{field.label}</div>
            )}

            {/* IMAGE PREVIEW */}
            {renderImagePreview(field.id, val)}
          </div>
        );
      })}
    </aside>
  );
}
