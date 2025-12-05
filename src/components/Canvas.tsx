import type { FC, DragEvent } from "react";
import { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onAddTopLevel: (defKey: string, insertIndex?: number | null) => void;
  onAddNested: (defKey: string, parentId: string, country: string) => void;
  onReorderTopLevel: (id: string, newIndex: number) => void;
}

const COUNTRY_ORDER = ["US", "CA", "AU", "Default"] as const;

const Canvas: FC<CanvasProps> = ({
  modules,
  selectedId,
  onSelect,
  onRemove,
  onAddTopLevel,
  onAddNested,
  onReorderTopLevel,
}) => {
  const topModules = modules.filter((m) => !m.parentId);

  function allow(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

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

    // Add brand-new module
    if (data.type === "library-module") {
      onAddTopLevel(data.moduleKey, targetIndex ?? undefined);
      return;
    }

    // Reorder existing module
    if (data.type === "top-module" && data.id) {
      const newIndex =
        targetIndex === null ? topModules.length - 1 : targetIndex;

      onReorderTopLevel(data.id, newIndex);
    }
  }

  // Helper: nested children (US/CA/AU/Default)
  function getNested(parentId: string, country: string) {
    return modules.filter(
      (m) => m.parentId === parentId && m.country === country
    );
  }

  // ============================================================
  // RENDER CANVAS
  // ============================================================

  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Builder Canvas
        </h2>

        {topModules.length === 0 && (
          <div
            className="border border-dashed border-slate-300 rounded-lg bg-white/60 p-8 text-center text-sm text-slate-500"
            onDragOver={allow}
            onDrop={(e) => handleTopLevelDrop(e, 0)}
          >
            Drag modules here to start
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Dropzone BEFORE the first module */}
          {topModules.length > 0 && (
            <div
              className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
              onDragOver={allow}
              onDrop={(e) => handleTopLevelDrop(e, 0)}
            >
              Drop here to insert at top
            </div>
          )}

          {topModules.map((mod, idx) => {
            const def = MODULES_BY_KEY[mod.key];

            // ============================================================
            // SPECIAL CASE: AMPSCRIPT COUNTRY SWITCHER
            // ============================================================
            if (mod.key === "ampscript_country") {
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
                    className={`border rounded-lg bg-white p-4 cursor-move ${
                      selectedId === mod.id
                        ? "border-blue-500 shadow-md"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                    onClick={() => onSelect(mod.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-sm">
                        AMPscript Country Switcher
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

                    <div className="mt-3 grid grid-cols-1 gap-4">
                      {COUNTRY_ORDER.map((country) => {
                        const children = getNested(mod.id, country);

                        return (
                          <div
                            key={country}
                            className="border border-slate-200 rounded-lg bg-slate-50 p-3"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const raw = e.dataTransfer.getData(
                                "application/json"
                              );
                              if (!raw) return;
                              let data: any;
                              try {
                                data = JSON.parse(raw);
                              } catch {
                                return;
                              }

                              if (
                                data.type === "library-module" &&
                                data.moduleKey
                              ) {
                                onAddNested(data.moduleKey, mod.id, country);
                              }
                            }}
                          >
                            <div className="text-xs font-semibold mb-2">
                              {country} Content
                            </div>

                            {/* Render nested children */}
                            <div className="flex flex-col gap-2">
                              {children.map((child) => {
                                const cdef = MODULES_BY_KEY[child.key];

                                return (
                                  <div
                                    key={child.id}
                                    className={`p-2 bg-white border rounded text-xs cursor-pointer ${
                                      selectedId === child.id
                                        ? "border-blue-500"
                                        : "border-slate-300 hover:border-blue-400"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelect(child.id);
                                    }}
                                  >
                                    {cdef.label}
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-2 text-[11px] text-blue-600 opacity-80">
                              Drag blocks here for {country}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reorder zone AFTER */}
                  <div
                    className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-1"
                    onDragOver={allow}
                    onDrop={(e) => handleTopLevelDrop(e, idx + 1)}
                  >
                    Drop here to insert below
                  </div>
                </div>
              );
            }

            // ============================================================
            // NORMAL MODULE
            // ============================================================
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
                  onClick={() => onSelect(mod.id)}
                  className={`border rounded-lg bg-white p-3 cursor-move ${
                    selectedId === mod.id
                      ? "border-blue-500 shadow-md"
                      : "border-slate-300 hover:border-blue-400"
                  }`}
                >
                  <div className="flex justify-between mb-1">
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

                  <div className="text-xs text-slate-500">
                    Drag to reorder, click to edit.
                  </div>
                </div>

                {/* Reorder zone AFTER */}
                <div
                  className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-1"
                  onDragOver={allow}
                  onDrop={(e) => handleTopLevelDrop(e, idx + 1)}
                >
                  Drop here to insert below
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Canvas;