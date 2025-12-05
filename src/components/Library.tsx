import { FC } from "react";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

interface LibraryProps {
  onAdd: (moduleKey: string) => void;
}

const Library: FC<LibraryProps> = ({ onAdd }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-auto">
      <h2 className="text-sm font-semibold text-slate-700 mb-2">
        Content Blocks
      </h2>

      <div className="flex flex-col gap-2">
        {MODULE_DEFINITIONS.map((mod) => (
          <div
            key={mod.key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({
                  type: "library-module",
                  moduleKey: mod.key,
                  nested: false 
                })
              );
            }}
            onClick={() => onAdd(mod.key)}
            className="border border-slate-200 rounded-md px-3 py-2 text-xs cursor-move hover:bg-slate-50"
          >
            {mod.label}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Library;