import type { FC, DragEvent } from "react";
import { PlacedModule, Country } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;

  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;

  onAddTopLevel: (defKey: string, insertIndex?: number) => void;
  onReorderTopLevel: (id: string, newIndex: number) => void;

  onAddNested: (defKey: string, parentId: string, country: Country) => void;
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
  onReorderTopLevel,
  onAddNested,
  onMoveNested,
}) => {
  const topModules = modules.filter((m) => !m.parentId);

  function getChildren(parentId: string, country: Country) {
    return modules.filter(
      (m) => m.parentId === parentId && m.country === country
    );
  }

  const allow = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  function handleTopLevelDrop(e: DragEvent<HTMLDivElement>, targetIndex: number) {
    e.preventDefault();

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    // From sidebar
    if (data.type === "library-module") {
      onAddTopLevel(data.moduleKey, targetIndex);
      return;
    }

    // From top-level reorder
    if (data.type === "top-module" && data.id) {
      onReorderTopLevel(data.id, targetIndex);
    }
  }

  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Builder Canvas
        </h2>

        {/* EMPTY CANVAS */}
        {topModules.length === 0 && (
          <div
            onDragOver={allow}
            onDrop={(e) => handleTopLevelDrop(e, 0)}
            className="border border-dashed border-slate-300 rounded-lg bg-white/60 p-8 text-center text-sm text-slate-500"
          >
            Drag modules here to start
          </div>
        )}

        {/* MODULE LIST */}
        {topModules.length > 0 && (
          <div className="flex flex-col gap-3">

            {/* TOP DROP ZONE */}
            <div
              onDragOver={allow}
              onDrop={(e) => handleTopLevelDrop(e, 0)}
              className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
            >
              Drop here to insert at top
            </div>

            {topModules.map((mod, idx) => {
              const def = MODULES_BY_KEY[mod.key];

              // ============================================================
              // COUNTRY SWITCHER BLOCK
              // ============================================================
              if (mod.key === "ampscript_country") {
                return (
                  <div key={mod.id}>
                    {/* Switcher card (top-level draggable) */}
                    <div
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({ type: "top-module", id: mod.id })
                        )
                      }
                      className={`border rounded-lg bg-white p-4 cursor-move shadow-sm ${
                        mod.id === selectedId
                          ? "border-blue-500 shadow"
                          : "border-slate-300 hover:border-blue-400"
                      }`}
                      onClick={() => onSelect(mod.id)}
                    >
                      <div className="flex justify-between mb-3 items-center">
                        <span className="text-xs font-semibold text-slate-700">
                          AMPscript Country Switcher
                        </span>

                        {/* delete entire switcher */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(mod.id);
                          }}
                          className="px-2 py-1 text-xs bg-rose-50 border border-rose-300 text-rose-700 rounded"
                        >
                          ✕
                        </button>
                      </div>

                      {/* COUNTRY BUCKETS */}
                      <div className="grid grid-cols-1 gap-3">
                        {COUNTRY_ORDER.map((country) => {
                          const kids = getChildren(mod.id, country);

                          const handleDrop = (
                            e: DragEvent<HTMLDivElement>,
                            targetIndex: number
                          ) => {
                            e.preventDefault();

                            const raw = e.dataTransfer.getData("application/json");
                            if (!raw) return;

                            let data: any;
                            try {
                              data = JSON.parse(raw);
                            } catch {
                              return;
                            }

                            // from sidebar
                            if (
                              data.type === "library-module" &&
                              data.moduleKey
                            ) {
                              onAddNested(
                                data.moduleKey,
                                mod.id,
                                country
                              );
                              return;
                            }

                            // nested reorder
                            if (data.type === "nested-module") {
                              onMoveNested(
                                data.id,
                                mod.id,
                                country,
                                targetIndex
                              );
                            }
                          };

                          return (
                            <div
                              key={country}
                              onDragOver={allow}
                              onDrop={(e) => handleDrop(e, kids.length)}
                              className="border border-slate-300 rounded-lg bg-slate-50 p-3"
                            >
                              <div className="text-xs font-semibold text-slate-700 mb-2">
                                {country} Content
                              </div>

                              {/* TOP DROPZONE */}
                              <div
                                onDragOver={allow}
                                onDrop={(e) => handleDrop(e, 0)}
                                className="h-5 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mb-2"
                              >
                                Drop here to insert at top
                              </div>

                              {/* CHILDREN */}
                              <div className="flex flex-col gap-2">
                                {kids.map((child, cIdx) => {
                                  const cdef = MODULES_BY_KEY[child.key];

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
                                          child.id === selectedId
                                            ? "border-blue-500 shadow-sm"
                                            : "border-slate-300 hover:border-blue-400"
                                        }`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelect(child.id);
                                        }}
                                      >
                                        <span>{cdef.label}</span>

                                        {/* DELETE CHILD */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(child.id);
                                          }}
                                          className="text-rose-600 text-xs px-2 py-0.5 border border-rose-300 bg-rose-50 rounded"
                                        >
                                          ✕
                                        </button>
                                      </div>

                                      {/* DROPZONE BELOW CHILD */}
                                      <div
                                        onDragOver={allow}
                                        onDrop={(e) =>
                                          handleDrop(e, cIdx + 1)
                                        }
                                        className="h-4 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[9px] text-slate-400 flex items-center justify-center mt-1"
                                      >
                                        Drop here to insert below
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DROP ZONE BELOW SWITCHER */}
                    <div
                      onDragOver={allow}
                      onDrop={(e) => handleTopLevelDrop(e, idx + 1)}
                      className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-1"
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
                    className={`border rounded-lg bg-white p-3 cursor-move ${
                      mod.id === selectedId
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(mod.id);
                        }}
                        className="px-2 py-1 text-xs border bg-rose-50 border-rose-300 text-rose-600 rounded"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="text-xs text-slate-500">
                      Drag to reorder, click to edit.
                    </div>
                  </div>

                  {/* DROPZONE BELOW NORMAL MODULE */}
                  <div
                    onDragOver={allow}
                    onDrop={(e) => handleTopLevelDrop(e, idx + 1)}
                    className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-1"
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