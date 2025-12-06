// src/components/Canvas.tsx
import type { FC, DragEvent } from "react";
import { PlacedModule } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;

  onAddTopLevel: (key: string, index?: number) => void;

  // country is any here to avoid fighting unions between files
  onAddNested: (key: string, parentId: string, country: any) => void;

  onReorderTopLevel: (id: string, newIndex: number) => void;

  onReorderNested: (
    id: string,
    parentId: string,
    country: any,
    targetIndex: number
  ) => void;
}

const COUNTRY_ORDER = ["US", "CA", "AU", "Default"];

export const Canvas: FC<CanvasProps> = ({
  modules,
  selectedId,
  onSelect,
  onRemove,
  onAddTopLevel,
  onAddNested,
  onReorderTopLevel,
  onReorderNested,
}) => {
  const allow = (e: DragEvent) => e.preventDefault();

  const handleTopDrop = (e: DragEvent, index: number) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type === "library-module" && data.key) {
      onAddTopLevel(data.key, index);
      return;
    }

    if (data.type === "top-module" && data.id) {
      onReorderTopLevel(data.id, index);
    }
  };

  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">
          Builder Canvas
        </h2>

        {/* Empty state */}
        {modules.filter((m) => !m.parentId).length === 0 && (
          <div
            className="border border-dashed border-slate-300 rounded-lg bg-white/60 p-8 text-center text-sm text-slate-500"
            onDragOver={allow}
            onDrop={(e) => handleTopDrop(e, 0)}
          >
            Drag modules here from the left to start building.
          </div>
        )}

        {modules.filter((m) => !m.parentId).length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Top dropzone */}
            <div
              className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
              onDragOver={allow}
              onDrop={(e) => handleTopDrop(e, 0)}
            >
              Drop here to insert at top
            </div>

            {modules
              .filter((m) => !m.parentId)
              .map((mod, idx) => {
                const def = MODULES_BY_KEY[mod.key];

                // ==============================
                // SPECIAL: AMPSCRIPT SWITCHER
                // ==============================
                if (mod.key === "ampscript_country") {
                  return (
                    <div key={mod.id}>
                      {/* Wrapper card */}
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
                            ? "border-blue-500"
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

                        {/* Country buckets */}
                        <div className="grid grid-cols-1 gap-3">
                          {COUNTRY_ORDER.map((country) => {
                            const children = modules.filter(
                              (m) =>
                                m.parentId === mod.id && m.country === country
                            );

                            const dropNested = (
                              e: DragEvent<HTMLDivElement>,
                              targetIndex: number
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
                                data.key
                              ) {
                                onAddNested(data.key, mod.id, country);
                                return;
                              }

                              // Existing nested module → move / reorder
                              if (data.type === "nested-module" && data.id) {
                                onReorderNested(
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
                                className="border border-slate-300 rounded-lg bg-slate-50 p-3"
                                onDragOver={allow}
                                onDrop={(e) =>
                                  dropNested(e, children.length || 0)
                                }
                              >
                                <div className="text-xs font-semibold text-slate-700 mb-2">
                                  {country} Content
                                </div>

                                {/* Top bucket dropzone */}
                                <div
                                  className="h-5 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mb-1"
                                  onDragOver={allow}
                                  onDrop={(e) => dropNested(e, 0)}
                                >
                                  Drop here to insert at top of {country}
                                </div>

                                <div className="flex flex-col gap-2">
                                  {children.map((child, cIdx) => {
                                    const cdef = MODULES_BY_KEY[child.key];
                                    return (
                                      <div key={child.id}>
                                        {/* Child card */}
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
                                          className={`p-2 bg-white rounded border text-xs flex items-center justify-between cursor-move ${
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
                                          <button
                                            className="ml-2 text-[10px] px-1.5 py-0.5 border border-rose-300 bg-rose-50 text-rose-700 rounded"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onRemove(child.id);
                                            }}
                                          >
                                            ✕
                                          </button>
                                        </div>

                                        {/* Dropzone below each child */}
                                        <div
                                          className="h-4 border-2 border-dashed border-transparent rounded hover:border-blue-300 hover:bg-blue-50 text-[9px] text-slate-400 flex items-center justify-center mt-1"
                                          onDragOver={allow}
                                          onDrop={(e) =>
                                            dropNested(e, cIdx + 1)
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

                      {/* Dropzone after the switcher */}
                      <div
                        className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center mt-1"
                        onDragOver={allow}
                        onDrop={(e) => handleTopDrop(e, idx + 1)}
                      >
                        Drop here to insert below
                      </div>
                    </div>
                  );
                }

                // ==============================
                // NORMAL MODULE
                // ==============================
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

                    {/* Dropzone after each top-level module */}
                    <div
                      className="h-6 border-2 border-dashed border-transparent rounded hover:border-blue-400 hover:bg-blue-50 text-[10px] text-slate-400 flex items-center justify-center"
                      onDragOver={allow}
                      onDrop={(e) => handleTopDrop(e, idx + 1)}
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