import type { FC, DragEvent } from "react";
import { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY, resolveSfmcImageUrl } from "../data/moduleDefinitions";

// All allowed countries for the switcher
const COUNTRY_ORDER = ["US", "CA", "AU", "Default"] as const;
type Country = (typeof COUNTRY_ORDER)[number];

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;

  onRemove: (id: string) => void;

  onAddTopLevel: (defKey: string, insertIndex?: number | null) => void;
  onAddNested: (defKey: string, parentId: string, country: Country) => void;

  onReorderTopLevel: (id: string, newIndex: number) => void;
  onMoveNested: (
    id: string,
    parentId: string,
    country: Country,
    newIndex: number
  ) => void;
}

const Canvas: FC<CanvasProps> = ({
  modules,
  selectedId,
  onSelect,
  onRemove,
  onAddTopLevel,
  onAddNested,
  onReorderTopLevel,
  onMoveNested,
}) => {
  const topModules = modules.filter((m) => !m.parentId);

  // Get nested content by parent + country
  function getChildren(parentId: string, country: Country) {
    return modules.filter(
      (m) => m.parentId === parentId && m.country === country
    );
  }

  // Thin wrapper for drag allow
  const allow = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  /* --------------------------------------------------------------
     HELPER: Extract first previewable image from a module
  -------------------------------------------------------------- */
  function getPreviewImage(mod: PlacedModule): string | null {
    const v = mod.values;

    // Check all known image-ish field types
    const candidates = [
      v.image,
      v.image_left,
      v.image_right,
      v.image1_src,
      v.image2_src,
    ].filter(Boolean);

    if (candidates.length === 0) return null;

    // Resolve SFMC URL rules
    return resolveSfmcImageUrl(candidates[0]!);
  }

  /* --------------------------------------------------------------
     TOP-LEVEL DROP
  -------------------------------------------------------------- */
  function handleTopLevelDrop(
    e: DragEvent<HTMLDivElement>,
    targetIndex: number | null
  ) {
    e.preventDefault();
    e.stopPropagation();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    // From sidebar → insert new module
    if (data.type === "library-module" && data.moduleKey) {
      onAddTopLevel(data.moduleKey, targetIndex ?? undefined);
      return;
    }

    // Existing top module → reorder
    if (data.type === "top-module" && data.id) {
      const newIndex =
        targetIndex === null ? topModules.length - 1 : targetIndex;
      onReorderTopLevel(data.id, newIndex);
    }
  }

  /* --------------------------------------------------------------
     MAIN RENDER
  -------------------------------------------------------------- */
  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Builder Canvas
        </h2>

        {/* INITIAL EMPTY STATE */}
        {topModules.length === 0 && (
          <div
            className="border border-dashed border-slate-300 rounded-lg bg-white/60 p-8 text-center text-sm text-slate-500"
            onDragOver={allow}
            onDrop={(e) => handleTopLevelDrop(e, 0)}
          >
            Drag modules here to start
          </div>
        )}

        {/* MODULE LIST */}
        {topModules.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* TOP DROP-ZONE */}
            <div
              className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
              onDragOver={allow}
              onDrop={(e) => handleTopLevelDrop(e, 0)}
            >
              Drop here to insert at top
            </div>

            {/* MODULE LOOP */}
            {topModules.map((mod, topIndex) => {
              const def = MODULES_BY_KEY[mod.key];
              const preview = getPreviewImage(mod);

              /* ----------------------------------------------------
                 SPECIAL CASE: AMPSCRIPT COUNTRY SWITCHER
              ---------------------------------------------------- */
              if (mod.key === "ampscript_country") {
                return (
                  <div key={mod.id}>
                    <CountrySwitcherCard
                      mod={mod}
                      preview={preview}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      onRemove={onRemove}
                      onAddNested={onAddNested}
                      onMoveNested={onMoveNested}
                      getChildren={getChildren}
                      allow={allow}
                      handleTopLevelDrop={handleTopLevelDrop}
                      topIndex={topIndex}
                    />
                  </div>
                );
              }

              /* ----------------------------------------------------
                 NORMAL MODULE CARD
              ---------------------------------------------------- */
              return (
                <div key={mod.id}>
                  <div
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ type: "top-module", id: mod.id })
                      )
                    }
                    className={`border rounded-lg bg-white p-3 cursor-move flex items-center gap-3 ${
                      selectedId === mod.id
                        ? "border-blue-500 shadow-md"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                    onClick={() => onSelect(mod.id)}
                  >
                    {/* THUMBNAIL */}
                    {preview && (
                      <img
                        src={preview}
                        className="w-14 h-14 object-cover rounded border"
                      />
                    )}

                    {/* LABEL + DELETE */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {def.label}
                        </span>

                        <button
                          className="px-2 py-1 text-xs border border-rose-300 bg-rose-50 text-rose-700 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(mod.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Drag to reorder, click to edit.
                      </div>
                    </div>
                  </div>

                  {/* BELOW-DROPZONE */}
                  <div
                    className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-1"
                    onDragOver={allow}
                    onDrop={(e) => handleTopLevelDrop(e, topIndex + 1)}
                  >
                    Drop here to insert below
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Canvas;

/* =========================================================================
   COUNTRY SWITCHER COMPONENT
   Extracted to keep Canvas clean
=========================================================================== */

const CountrySwitcherCard = ({
  mod,
  preview,
  selectedId,
  onSelect,
  onRemove,
  onAddNested,
  onMoveNested,
  getChildren,
  allow,
  handleTopLevelDrop,
  topIndex,
}: any) => {
  return (
    <div key={mod.id}>
      <div
        draggable
        onDragStart={(e) =>
          e.dataTransfer.setData(
            "application/json",
            JSON.stringify({ type: "top-module", id: mod.id })
          )
        }
        className={`border rounded-lg bg-white p-4 cursor-move shadow-sm ${
          selectedId === mod.id
            ? "border-blue-500 shadow"
            : "border-slate-300 hover:border-blue-400"
        }`}
        onClick={() => onSelect(mod.id)}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {preview && (
              <img
                src={preview}
                className="w-10 h-10 object-cover rounded border"
              />
            )}
            <span className="text-xs font-semibold text-slate-700">
              AMPscript Country Switcher
            </span>
          </div>

          <button
            className="px-2 py-1 text-xs border border-rose-300 bg-rose-50 text-rose-700 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(mod.id);
            }}
          >
            ✕
          </button>
        </div>

        {/* COUNTRY BUCKETS */}
        <div className="grid grid-cols-1 gap-4">
          {COUNTRY_ORDER.map((country) => {
            const children = getChildren(mod.id, country);

            const handleCountryDrop = (
              e: DragEvent<HTMLDivElement>,
              index: number
            ) => {
              e.preventDefault();
              e.stopPropagation();

              const raw = e.dataTransfer.getData("application/json");
              if (!raw) return;

              let data;
              try {
                data = JSON.parse(raw);
              } catch {
                return;
              }

              // From sidebar
              if (data.type === "library-module") {
                onAddNested(data.moduleKey, mod.id, country);
                return;
              }

              // Move existing child
              if (data.type === "nested-module" && data.id) {
                onMoveNested(data.id, mod.id, country, index);
              }
            };

            return (
              <div
                key={country}
                className="border border-slate-300 rounded-lg bg-slate-50 p-3"
                onDragOver={allow}
                onDrop={(e) => handleCountryDrop(e, children.length)}
              >
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  {country} Content
                </div>

                {/* TOP DROPZONE */}
                <div
                  className="h-5 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mb-2"
                  onDragOver={allow}
                  onDrop={(e) => handleCountryDrop(e, 0)}
                >
                  Drop here to insert at top of {country}
                </div>

                {/* CHILDREN */}
                <div className="flex flex-col gap-2">
                  {children.map((child: PlacedModule, cIdx: number) => {
                    const def = MODULES_BY_KEY[child.key];
                    const childPreview = getPreviewImage(child);

                    return (
                      <div key={child.id}>
                        <div
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData(
                              "application/json",
                              JSON.stringify({
                                type: "nested-module",
                                id: child.id,
                              })
                            )
                          }
                          className={`p-2 bg-white rounded border text-xs flex justify-between items-center cursor-move ${
                            selectedId === child.id
                              ? "border-blue-500 shadow-sm"
                              : "border-slate-300 hover:border-blue-400"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(child.id);
                          }}
                        >
                          {/* CHILD THUMBNAIL */}
                          {childPreview && (
                            <img
                              src={childPreview}
                              className="w-10 h-10 object-cover rounded border mr-2"
                            />
                          )}

                          <span>{def.label}</span>

                          {/* DELETE BUTTON */}
                          <button
                            className="ml-auto px-1.5 py-0.5 text-[10px] border border-rose-300 bg-rose-50 text-rose-700 rounded"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(child.id);
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* DROPZONE BELOW CHILD */}
                        <div
                          className="h-4 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[9px] text-slate-400 flex items-center justify-center mt-1"
                          onDragOver={allow}
                          onDrop={(e) =>
                            handleCountryDrop(e, cIdx + 1)
                          }
                        >
                          Drop here to insert below
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 text-center text-[11px] text-blue-600 opacity-80">
                  Drag blocks from the left into {country}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DROPZONE AFTER THIS WHOLE SWITCHER */}
      <div
        className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-2"
        onDragOver={allow}
        onDrop={(e) => handleTopLevelDrop(e, topIndex + 1)}
      >
        Drop here to insert below
      </div>
    </div>
  );
};