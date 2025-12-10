// src/components/Canvas.tsx

import type { FC, DragEvent } from "react";
import type { PlacedModule, Country } from "../types/Module";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";

interface CanvasProps {
  modules: PlacedModule[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;

  onAddTopLevel: (key: string, index?: number) => void;
  onAddNested: (key: string, parentId: string, country: Country) => void;

  onReorderTopLevel: (id: string, index: number) => void;
  onReorderNested: (
    id: string,
    parentId: string,
    country: Country,
    index: number
  ) => void;
}

const COUNTRIES: Country[] = ["US", "CA", "AU", "Default"];

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
  const allow = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // -----------------------
  // TOP-LEVEL DROP
  // -----------------------
  const handleTopDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    allow(e);

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.type === "library-module") {
      onAddTopLevel(data.key, index);
      return;
    }

    if (data.type === "top-module") {
      onReorderTopLevel(data.id, index);
      return;
    }
  };

  // -----------------------
  // NESTED DROP
  // -----------------------
  const handleNestedDrop = (
    e: DragEvent<HTMLDivElement>,
    parentId: string,
    country: Country,
    index: number
  ) => {
    allow(e);

    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;

    const data = JSON.parse(raw);

    if (data.type === "library-module") {
      onAddNested(data.key, parentId, country);
      return;
    }

    if (data.type === "nested-module") {
      onReorderNested(data.id, parentId, country, index);
      return;
    }
  };

  // -----------------------
  // RENDER BUCKET
  // -----------------------
  const renderBucket = (parentId: string, country: Country) => {
    const children = modules.filter(
      (m) => m.parentId === parentId && m.country === country
    );

    return (
      <div className="border border-slate-300 rounded p-2">
        <div className="text-xs font-semibold mb-1">{country}</div>

        {/* Drop at bucket top */}
        <div
          className="h-6 border border-dashed border-slate-300 text-[10px] flex items-center justify-center mb-1"
          onDragOver={allow}
          onDrop={(e) => handleNestedDrop(e, parentId, country, 0)}
        >
          Drop here to insert at top
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
                      parentId: child.parentId!,
                      country: child.country!,
                    })
                  );
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(child.id);
                }}
                className={`border rounded bg-white px-2 py-1 text-xs cursor-pointer ${
                  selectedId === child.id
                    ? "border-blue-500"
                    : "border-slate-300 hover:border-blue-400"
                }`}
              >
                {def?.label ?? child.key}

                <button
                  className="float-right text-red-500 text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(child.id);
                  }}
                >
                  Remove
                </button>
              </div>

              {/* Drop zone below */}
              <div
                className="h-5 border border-dashed border-slate-300 text-[10px] flex items-center justify-center"
                onDragOver={allow}
                onDrop={(e) =>
                  handleNestedDrop(e, parentId, country, idx + 1)
                }
              >
                Drop here to insert below
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // -----------------------
  // TOP-LEVEL MODULES
  // -----------------------
  const topLevel = modules.filter((m) => !m.parentId);

  return (
    <main className="flex-1 bg-slate-100 p-4 overflow-auto">
      <div className="max-w-3xl mx-auto pb-20">

        {/* Top drop zone */}
        <div
          className="h-10 border border-dashed border-slate-400 text-xs flex items-center justify-center mb-3"
          onDragOver={allow}
          onDrop={(e) => handleTopDrop(e, 0)}
        >
          Drop here to insert at top
        </div>

        {topLevel.map((mod, idx) => {
          const def = MODULES_BY_KEY[mod.key];
          const isACS = mod.key === "ampscript_country";

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
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(mod.id);
                }}
                className={`border rounded bg-white p-4 cursor-pointer ${
                  selectedId === mod.id
                    ? "border-blue-500"
                    : "border-slate-300 hover:border-blue-400"
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-xs">
                    {isACS ? "AMPscript Country Switcher" : def?.label}
                  </span>
                  <button
                    className="text-red-500 text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(mod.id);
                    }}
                  >
                    Remove
                  </button>
                </div>

                {isACS && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {COUNTRIES.map((c) => (
                      <div key={c}>{renderBucket(mod.id, c)}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop under module */}
              <div
                className="h-8 border border-dashed border-slate-400 text-xs flex items-center justify-center mb-4"
                onDragOver={allow}
                onDrop={(e) => handleTopDrop(e, idx + 1)}
              >
                Drop here to insert below
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
