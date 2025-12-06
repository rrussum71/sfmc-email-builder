import type { FC, DragEvent } from "react";
import type { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

type Country = "US" | "CA" | "AU" | "Default";

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;

  onAddTopLevel: (defKey: string, insertIndex?: number | null) => void;
  onAddNested: (defKey: string, parentId: string, country: Country) => void;

  onReorderTopLevel: (id: string, newIndex: number) => void;

  // NEW: move/reorder nested items within/between country buckets
  onMoveNested: (
    id: string,
    parentId: string,
    country: Country,
    newIndex: number
  ) => void;
}

const COUNTRY_ORDER: Country[] = ["US", "CA", "AU", "Default"];

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

  function getChildren(parentId: string, country: Country) {
    return modules.filter(
      (m) => m.parentId === parentId && m.country === country
    );
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

    // From sidebar → new top-level module
    if (data.type === "library-module" && data.moduleKey) {
      onAddTopLevel(data.moduleKey, targetIndex ?? undefined);
      return;
    }

    // Reorder existing top-level
    if (data.type === "top-module" && data.id) {
      const newIndex =
        targetIndex === null ? topModules.length - 1 : targetIndex;
      onReorderTopLevel(data.id, newIndex);
    }
  }

  function allow(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Builder Canvas
        </h2>

        {/* EMPTY STATE */}
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
            {/* TOP DROPZONE */}
            <div
              className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
              onDragOver={allow}
              onDrop={(e) => handleTopLevelDrop(e, 0)}
            >
              Drop here to insert at top
            </div>

            {topModules.map((mod, idx) => {
              const def = MODULES_BY_KEY[mod.key];

              // =================================================
              // SPECIAL: AMPSCRIPT COUNTRY SWITCHER
              // =================================================
              if (mod.key === "ampscript_country") {
                return (
                  <div key={mod.id}>
                    {/* Main wrapper card (draggable as top-level) */}
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
                      <div className="flex justify-between mb-3 items-center">
                        <span className="text-xs font-semibold text-slate-700">
                          AMPscript Country Switcher
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

                      {/* Country Buckets */}
                      <div className="grid grid-cols-1 gap-3">
                        {COUNTRY_ORDER.map((country) => {
                          const children = getChildren(
                            mod.id,
                            country as Country
                          );

                          const handleCountryDrop = (
                            e: DragEvent<HTMLDivElement>,
                            targetIndex: number | null
                          ) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const raw =
                              e.dataTransfer.getData("application/json");
                            if (!raw) return;

                            let data: any;
                            try {
                              data = JSON.parse(raw);
                            } catch {
                              return;
                            }

                            // From sidebar → new nested module
                            if (
                              data.type === "library-module" &&
                              data.moduleKey
                            ) {
                              onAddNested(
                                data.moduleKey,
                                mod.id,
                                country as Country
                              );
                              return;
                            }

                            // Existing nested module → move/reorder
                            if (data.type === "nested-module" && data.id) {
                              const index =
                                targetIndex === null
                                  ? children.length
                                  : targetIndex;
                              onMoveNested(
                                data.id,
                                mod.id,
                                country as Country,
                                index
                              );
                            }
                          };

                          return (
                            <div
                              key={country}
                              className="border border-slate-300 rounded-lg bg-slate-50 p-3"
                              onDragOver={allow}
                              onDrop={(e) =>
                                handleCountryDrop(e, children.length)
                              }
                            >
                              <div className="text-xs font-semibold text-slate-700 mb-2">
                                {country} Content
                              </div>

                              {/* Top dropzone inside bucket */}
                              <div
                                className="h-5 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mb-1"
                                onDragOver={allow}
                                onDrop={(e) => handleCountryDrop(e, 0)}
                              >
                                Drop here to insert at top of {country}
                              </div>

                              <div className="flex flex-col gap-2">
  {children.map((child, cIdx) => {
    const cdef = MODULES_BY_KEY[child.key];

    return (
      <div key={child.id}>
        {/* CHILD MODULE CARD */}
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
          <span>{cdef.label}</span>

          {/* DELETE BUTTON */}
          <button
            className="ml-2 px-1 py-[2px] text-[10px] border border-rose-300 bg-rose-50 text-rose-700 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(child.id);
            }}
          >
            ✕
          </button>
        </div>

        {/* DROPZONE BELOW EACH CHILD */}
        <div
          className="h-4 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[9px] text-slate-400 flex items-center justify-center mt-1"
          onDragOver={allow}
          onDrop={(e) => handleCountryDrop(e, cIdx + 1)}
        >
          Drop here to insert below
        </div>
      </div>
    );
  })}
</div>

                              {/* Hint */}
                              <div className="mt-2 text-center text-[11px] text-blue-600 opacity-80">
                                Drag blocks from the left into {country}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DROPZONE AFTER SWITCHER CARD */}
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

              // =================================================
              // NORMAL TOP-LEVEL MODULE
              // =================================================
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
                    className={`border rounded-lg bg-white p-3 cursor-move ${
                      selectedId === mod.id
                        ? "border-blue-500 shadow"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                    onClick={() => onSelect(mod.id)}
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

                  {/* DROPZONE AFTER */}
                  <div
                    className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
                    onDragOver={allow}
                    onDrop={(e) => handleTopLevelDrop(e, idx + 1)}
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