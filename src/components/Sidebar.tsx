// src/components/Sidebar.tsx
import type { FC } from "react";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

interface SidebarProps {
  onAdd: (key: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ onAdd }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">
        Content Blocks
      </h2>

      <div className="space-y-2">
        {MODULE_DEFINITIONS.map((mod) => (
          <div
            key={mod.key}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "library-module", key: mod.key })
              )
            }
            onClick={() => onAdd(mod.key)}
            className="p-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-xs"
          >
            {mod.label}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;