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
    const data = JSON.parse(raw);

    if (data.type === "library-module") {
      onAddTopLevel(data.key, index);
      return;
    }

    if (data.type === "top-module") {
      onReorderTopLevel(data.id, index);
    }
  };

  const getChildren = (parentId: string, country: string) =>
    modules.filter((m) => m.parentId === parentId && m.country === country);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {modules
        .filter((m) => !m.parentId)
        .map((mod, idx) => {
          const def = MODULES_BY_KEY[mod.key];

          // -------------------------------------------------------------------
          // COUNTRY SWITCHER WRAPPER
          // -------------------------------------------------------------------
          if (mod.key === "ampscript_country") {
            return (
              <div key={mod.id}>
                <div
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({
                        type: "top-module",
                        id: mod.id,
                      })
                    )
                  }
                  className={`border rounded bg-white p-4 shadow cursor-move ${
                    selectedId === mod.id
                      ? "border-blue-500"
                      : "border-slate-300"
                  }`}
                  onClick={() => onSelect(mod.id)}
                >
                  {/* Header */}
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-xs">
                      AMPscript Country Switcher
                    </span>
                    <button
                      className="text-xs border px-2 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(mod.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* COUNTRY BUCKETS */}
                  <div className="grid gap-3">
                    {COUNTRY_ORDER.map((country) => {
                      const children = getChildren(mod.id, country);

                      const drop = (e: DragEvent, targetIndex: number) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const raw = e.dataTransfer.getData("application/json");
                        if (!raw) return;
                        const data = JSON.parse(raw);

                        if (data.type === "library-module") {
                          onAddNested(data.key, mod.id, country);
                          return;
                        }

                        if (data.type === "nested-module") {
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
                          className="border rounded p-3 bg-slate-50"
                          onDragOver={allow}
                          onDrop={(e) => drop(e, children.length)}
                        >
                          <div className="mb-2 text-xs font-semibold">
                            {country} Content
                          </div>

                          {/* Top Insert */}
                          <div
                            className="h-5 border-2 border-dashed rounded text-[10px] text-slate-500 flex items-center justify-center mb-1 hover:bg-blue-50"
                            onDragOver={allow}
                            onDrop={(e) => drop(e, 0)}
                          >
                            Drop to insert at top
                          </div>

                          {/* Children */}
                          {children.map((child, index) => {
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
                                  className={`p-2 border rounded bg-white text-xs cursor-move ${
                                    selectedId === child.id
                                      ? "border-blue-500"
                                      : "border-slate-300"
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(child.id);
                                  }}
                                >
                                  {cdef.label}
                                </div>

                                <div
                                  className="h-4 border-2 border-dashed rounded text-[9px] text-slate-400 flex items-center justify-center mt-1 hover:bg-blue-50"
                                  onDragOver={allow}
                                  onDrop={(e) => drop(e, index + 1)}
                                >
                                  Drop below
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DROP BELOW SWITCHER */}
                <div
                  className="h-6 border-2 border-dashed rounded mt-1 text-[10px] text-slate-400 flex items-center justify-center hover:bg-blue-50"
                  onDragOver={allow}
                  onDrop={(e) => handleTopDrop(e, idx + 1)}
                >
                  Drop here to insert below
                </div>
              </div>
            );
          }

          // -------------------------------------------------------------------
          // NORMAL MODULE
          // -------------------------------------------------------------------
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
                className={`border rounded p-3 bg-white shadow cursor-move ${
                  selectedId === mod.id ? "border-blue-500" : "border-slate-300"
                }`}
                onClick={() => onSelect(mod.id)}
              >
                <div className="flex justify-between">
                  <span className="text-xs font-semibold">{def.label}</span>
                  <button
                    className="text-xs border px-2 py-1 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(mod.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div
                className="h-6 border-2 border-dashed rounded mt-1 text-[10px] text-slate-400 flex items-center justify-center hover:bg-blue-50"
                onDragOver={allow}
                onDrop={(e) => handleTopDrop(e, idx + 1)}
              >
                Drop below
              </div>
            </div>
          );
        })}
    </div>
  );
};