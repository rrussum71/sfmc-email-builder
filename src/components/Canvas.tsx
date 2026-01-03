// src/components/Canvas.tsx

import type { FC, DragEvent } from "react";
import type { PlacedModule, Country } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;

  // TOP-LEVEL: ONLY table_wrapper
  onAddTopLevel: (key: string, index?: number) => void;

  // NESTED: children of table wrapper OR ACS bucket
  onAddNested: (key: string, parentId: string, country: Country | null) => void;

  onReorderTopLevel: (id: string, index: number) => void;
  onReorderNested: (
    id: string,
    parentId: string,
    country: Country | null,
    index: number
  ) => void;
}

const COUNTRIES: Country[] = ["US", "CA", "AU", "Default"];

export const Canvas: FC<CanvasProps> = ({
  modules,
  selectedId,
  onSelect,
  onRemove,
  onDuplicate,
  onAddTopLevel,
  onAddNested,
  onReorderTopLevel,
  onReorderNested,
}) => {

  const allow = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const stop = (e: any) => e.stopPropagation();

  // -----------------------
  // TOP-LEVEL DROP (TABLE WRAPPER ONLY)
  // -----------------------
  const handleTopDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    allow(e);

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.type === "library-module") {
      if (data.key !== "table_wrapper") return;
      onAddTopLevel("table_wrapper", index);
      return;
    }

    if (data.type === "top-module") {
      if (data.key !== "table_wrapper") return;
      onReorderTopLevel(data.id, index);
      return;
    }
  };

  // -----------------------
  // WRAPPER DROP (inside TABLE WRAPPER)
  // country = null always (non-ACS content)
  // -----------------------
  const handleWrapperDrop = (
    e: DragEvent<HTMLDivElement>,
    wrapperId: string,
    index: number
  ) => {
    allow(e);

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw) as {
      type: string;
      id?: string;
      key?: string;
      parentId?: string;
      country?: Country | null;
    };

    if (data.type === "library-module") {
      if (!data.key || data.key === "table_wrapper") return; // no tables inside tables
      onAddNested(data.key, wrapperId, null);
      return;
    }

    if (data.type === "nested-module") {
      if (!data.id) return;
      onReorderNested(data.id, wrapperId, null, index);
      return;
    }
  };

  // -----------------------
  // ACS BUCKET DROP (inside ACS)
  // -----------------------
  const handleAcsDrop = (
    e: DragEvent<HTMLDivElement>,
    acsId: string,
    country: Country,
    index: number
  ) => {
    allow(e);

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw) as {
      type: string;
      id?: string;
      key?: string;
      parentId?: string;
      country?: Country | null;
    };

    if (data.type === "library-module") {
      // 🚫 Prevent ACS from being dropped into another ACS
      if (data.key === "ampscript_country") return;
      if (!data.key || data.key === "table_wrapper") return;
      onAddNested(data.key, acsId, country);
      return;
    }

    if (data.type === "nested-module") {
      // 🚫 Prevent moving ACS into another ACS
      if (data.key === "ampscript_country") return;
      if (!data.id) return;
      onReorderNested(data.id, acsId, country, index);
      return;
    }
  };

  // -----------------------
  // RENDER ACS BUCKET (inside ACS module)
  // -----------------------
  const renderAcsBucket = (acsId: string, country: Country) => {
    const children = modules.filter(
      (m) => m.parentId === acsId && m.country === country
    );

    return (
      <div className="border border-slate-300 rounded p-2" key={country}>
        <div className="text-xs font-semibold mb-1">{country}</div>

        {/* Drop at bucket top */}
        <div
          className="h-6 border border-dashed border-slate-300 text-[10px] flex items-center justify-center mb-1"
          onDragOver={allow}
          onDrop={(e) => handleAcsDrop(e, acsId, country, 0)}
        >
          Drop here
        </div>

        {children.map((child, idx) => {
          const def = MODULES_BY_KEY[child.key];

          return (
            <div key={child.id}>
              <div
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "nested-module",
                      id: child.id,
                      key: child.key,
                      parentId: child.parentId!,
                      country: child.country ?? null,
                    })
                  );
                }}
                onClick={(e) => {
                  stop(e);
                  onSelect(child.id);
                }}
                className={`border rounded bg-white px-2 py-1 text-xs cursor-pointer ${
                  selectedId === child.id
                    ? "border-blue-500"
                    : "border-slate-300 hover:border-blue-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{def?.label ?? child.key}</span>
                  <div className="flex gap-2">
                    <button
                      className="text-slate-500 text-[10px]"
                      onClick={(e) => {
                        stop(e);
                        onDuplicate(child.id);
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      className="text-red-500 text-[10px]"
                      onClick={(e) => {
                        stop(e);
                        onRemove(child.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Drop zone below */}
              <div
                className="h-5 border border-dashed border-slate-300 text-[10px] flex items-center justify-center"
                onDragOver={allow}
                onDrop={(e) => handleAcsDrop(e, acsId, country, idx + 1)}
              >
                Drop below
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // -----------------------
  // RENDER ACS MODULE (special layout)
  // -----------------------
  const renderAcsModule = (acs: PlacedModule, wrapperId: string, idx: number) => {
    return (
      <div key={acs.id}>
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData(
              "application/json",
              JSON.stringify({
                type: "nested-module",
                id: acs.id,
                key: acs.key,
                parentId: wrapperId,
                country: null,
              })
            );
          }}
          onClick={(e) => {
            stop(e);
            onSelect(acs.id);
          }}
          className={`border rounded bg-slate-50 p-3 cursor-pointer ${
            selectedId === acs.id
              ? "border-blue-500"
              : "border-slate-300 hover:border-blue-400"
          }`}
        >
          <div className="flex justify-between mb-2 items-center">
            <span className="font-semibold text-xs">AMPscript Country Switcher</span>

            <div className="flex gap-2">
              <button
                className="text-slate-500 text-[10px]"
                onClick={(e) => {
                  stop(e);
                  onDuplicate(acs.id);
                }}
              >
                Duplicate
              </button>
              <button
                className="text-red-500 text-[10px]"
                onClick={(e) => {
                  stop(e);
                  onRemove(acs.id);
                }}
              >
                Remove
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COUNTRIES.map((c) => renderAcsBucket(acs.id, c))}
          </div>
        </div>

        {/* Drop below ACS block */}
        <div
          className="h-5 border border-dashed border-slate-300 text-[10px] flex items-center justify-center mt-1"
          onDragOver={allow}
          onDrop={(e) => handleWrapperDrop(e, wrapperId, idx + 1)}
        >
          Drop below
        </div>
      </div>
    );
  };

  // -----------------------
  // RENDER CONTENT INSIDE TABLE WRAPPER
  // -----------------------
  const renderWrapperBucket = (wrapperId: string) => {
    // Only wrapper-level children (country is undefined/null)
    const children = modules.filter(
      (m) => m.parentId === wrapperId && (m.country === undefined || m.country === null)
    );

    return (
      <div className="space-y-2">
        {/* Drop at wrapper top */}
        <div
          className="h-6 border border-dashed border-slate-300 text-[10px] flex items-center justify-center mb-1"
          onDragOver={allow}
          onDrop={(e) => handleWrapperDrop(e, wrapperId, 0)}
        >
          Drop here
        </div>

        {children.length === 0 && (
          <div className="text-[11px] text-slate-400 italic mb-1">
            Drag content blocks from the sidebar into this table.
          </div>
        )}

        {children.map((child, idx) => {
          // ✅ IMPORTANT: keep ACS as special renderer
          if (child.key === "ampscript_country") {
            return renderAcsModule(child, wrapperId, idx);
          }

          // Special-case: image_grid_1x3 preview renderer
          if (child.key === "image_grid_1x3") {
            return (
              <div key={child.id}>
                <div
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify({
                        type: "nested-module",
                        id: child.id,
                        key: child.key,
                        parentId: wrapperId,
                        country: null,
                      })
                    );
                  }}
                  onClick={(e) => {
                    stop(e);
                    onSelect(child.id);
                  }}
                  className={`border rounded bg-white px-2 py-2 text-xs cursor-pointer ${
                    selectedId === child.id
                      ? "border-blue-500"
                      : "border-slate-300 hover:border-blue-400"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span>3-Column Image Grid</span>
                    <div className="flex gap-2">
                      <button
                        className="text-slate-500 text-[10px]"
                        onClick={(e) => {
                          stop(e);
                          onDuplicate(child.id);
                        }}
                      >
                        Duplicate
                      </button>
                      <button
                        className="text-red-500 text-[10px]"
                        onClick={(e) => {
                          stop(e);
                          onRemove(child.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-2 bg-slate-50">
                    <div className="flex gap-2">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="flex-1 flex flex-col items-center">
                          <div className="w-full aspect-[4/3] bg-slate-200 rounded mb-1 flex items-center justify-center">
                            <div className="w-8 h-6 bg-slate-300 rounded" />
                          </div>
                          <span className="text-[11px] text-slate-500">Image {n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Drop zone below */}
                <div
                  className="h-5 border border-dashed border-slate-300 text-[10px] flex items-center justify-center"
                  onDragOver={allow}
                  onDrop={(e) => handleWrapperDrop(e, wrapperId, idx + 1)}
                >
                  Drop below
                </div>
              </div>
            );
          }

          const def = MODULES_BY_KEY[child.key];

          return (
            <div key={child.id}>
              <div
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({
                      type: "nested-module",
                      id: child.id,
                      key: child.key,
                      parentId: wrapperId,
                      country: null,
                    })
                  );
                }}
                onClick={(e) => {
                  stop(e);
                  onSelect(child.id);
                }}
                className={`border rounded bg-white px-2 py-2 text-xs cursor-pointer ${
                  selectedId === child.id
                    ? "border-blue-500"
                    : "border-slate-300 hover:border-blue-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{def?.label ?? child.key}</span>

                  <div className="flex gap-2">
                    <button
                      className="text-slate-500 text-[10px]"
                      onClick={(e) => {
                        stop(e);
                        onDuplicate(child.id);
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      className="text-red-500 text-[10px]"
                      onClick={(e) => {
                        stop(e);
                        onRemove(child.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Drop zone below */}
              <div
                className="h-5 border border-dashed border-slate-300 text-[10px] flex items-center justify-center"
                onDragOver={allow}
                onDrop={(e) => handleWrapperDrop(e, wrapperId, idx + 1)}
              >
                Drop below
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // -----------------------
  // TOP-LEVEL MODULES (TABLE WRAPPERS ONLY)
  // -----------------------
  const topLevel = modules.filter(
    (m) => !m.parentId && m.key === "table_wrapper"
  );

  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto pb-20">
        <h2 className="text-xs font-semibold text-slate-700 mb-2">
          Email Canvas (Tables are required)
        </h2>

        {/* Top-level drop zone */}
        <div
          className="h-10 border border-dashed border-slate-400 text-xs flex items-center justify-center mb-3"
          onDragOver={allow}
          onDrop={(e) => handleTopDrop(e, 0)}
        >
          Drop a Table Wrapper here to start
        </div>

        {topLevel.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-10 border border-dashed border-slate-300 rounded bg-white">
            Drag <strong>Table Module</strong> to canvas.<br/>
            All content modules must live inside a Table Module.
          </div>
        ) : (
          <div className="space-y-3">
            {topLevel.map((mod, idx) => {
              const def = MODULES_BY_KEY[mod.key];

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
                          key: mod.key,
                        })
                      )
                    }
                    onClick={() => onSelect(mod.id)}
                    className={`border rounded bg-white p-4 cursor-pointer ${
                      selectedId === mod.id
                        ? "border-blue-500"
                        : "border-slate-300 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex justify-between mb-2 items-center">
                      <span className="font-semibold text-xs">
                        {def?.label ?? "Table Wrapper"}
                      </span>

                      <div className="flex gap-2">
                        <button
                          className="text-slate-500 text-[10px]"
                          onClick={(e) => {
                            stop(e);
                            onDuplicate(mod.id);
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          className="text-red-500 text-[10px]"
                          onClick={(e) => {
                            stop(e);
                            onRemove(mod.id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Content bucket inside wrapper */}
                    {renderWrapperBucket(mod.id)}
                  </div>

                  {/* Drop under table wrapper */}
                  <div
                    className="h-8 border border-dashed border-slate-400 text-xs flex items-center justify-center mb-4"
                    onDragOver={allow}
                    onDrop={(e) => handleTopDrop(e, idx + 1)}
                  >
                    Drop another Table Wrapper here to insert below
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