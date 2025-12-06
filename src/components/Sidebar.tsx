import type { FC } from "react";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

interface SidebarProps {
  onAdd: (key: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ onAdd }) => {
  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">
        Module Library
      </h2>

      <div className="space-y-3">
        {MODULE_DEFINITIONS.map((def) => (
          <div
            key={def.key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "library-module", moduleKey: def.key })
              );
            }}
            onClick={() => onAdd(def.key)}
            className="px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500"
          >
            <span className="text-sm font-medium">{def.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;