import { FC, useState } from "react";
import { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY, resolveSfmcImageUrl } from "../data/moduleDefinitions";
import PreviewModal from "./PreviewModal";

interface InspectorProps {
  module: PlacedModule | null;
  bgColor: string;
  onBgChange: (value: string) => void;
  onChangeField: (fieldId: string, value: string) => void;
}

const IMAGE_FIELD_IDS = new Set([
  "image",
  "image_left",
  "image_right",
  "image1_src",
  "image2_src",
]);

const ALIAS_FIELDS = new Set([
  "link_alias",
  "alias_left",
  "alias_right",
  "image1_alias",
  "image2_alias",
  "image1_btn_alias",
  "image2_btn_alias",
  "alias",
]);

const Inspector: FC<InspectorProps> = ({
  module,
  bgColor,
  onBgChange,
  onChangeField,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const def = module ? MODULES_BY_KEY[module.key] : null;

  const openPreview = (value: string) => {
    const full = resolveSfmcImageUrl(value);
    setPreviewUrl(full);
  };

  return (
    <aside className="w-[420px] bg-white border-l border-slate-200 p-6 h-screen overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Content Block Settings
      </h2>

      {/* Background Color */}
      <div className="mb-4">
        <label className="text-xs font-semibold">Table Background (#HEX)</label>
        <input
          type="text"
          value={bgColor}
          onChange={(e) => onBgChange(e.target.value)}
          className="w-full border rounded px-2 py-1 text-xs mt-1"
        />
      </div>

      {!module || !def ? (
        <div className="text-xs text-slate-500">
          Select a module to edit its settings.
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="font-semibold text-slate-700">{def.label}</h3>

          {def.fields.map((field) => {
            const value = module.values[field.id] ?? "";

            const isImage = IMAGE_FIELD_IDS.has(field.id);
            const isAlias = ALIAS_FIELDS.has(field.id);

            return (
              <div key={field.id}>
                <label className="block text-xs font-semibold">
                  {field.label}
                  {isAlias && (
                    <span className="ml-1 text-[10px] text-blue-600">
                      (auto)
                    </span>
                  )}
                </label>

                {/* TEXT INPUT */}
                {field.type === "text" && (
                  <input
                    type="text"
                    value={value}
                    readOnly={isAlias}
                    onChange={(e) =>
                      !isAlias && onChangeField(field.id, e.target.value)
                    }
                    className={`w-full px-2 py-1 border rounded text-xs ${
                      isAlias
                        ? "bg-slate-100 border-slate-200 text-slate-500"
                        : "border-slate-300"
                    }`}
                  />
                )}

                {/* TEXTAREA */}
                {field.type === "textarea" && (
                  <textarea
                    value={value}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs min-h-[120px]"
                  />
                )}

                {/* CODE BLOCK */}
                {field.type === "code" && (
                  <textarea
                    value={value}
                    onChange={(e) => onChangeField(field.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs min-h-[200px] font-mono"
                  />
                )}

                {/* IMAGE THUMBNAIL PREVIEW */}
                {isImage && value && (
                  <div className="mt-2">
                    <img
                      src={resolveSfmcImageUrl(value)}
                      onClick={() => openPreview(value)}
                      className="w-20 h-20 object-cover border rounded cursor-pointer hover:opacity-80"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {previewUrl && (
        <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </aside>
  );
};

export default Inspector;