// src/components/Sidebar.tsx
import type { FC } from "react";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

interface SidebarProps {
  onAdd: (key: string) => void; // used ONLY for table_wrapper now
}

const TABLE_KEY = "table_wrapper";

const Sidebar: FC<SidebarProps> = ({ onAdd }) => {
  const layoutModules = MODULE_DEFINITIONS.filter(
    (m) => m.key === TABLE_KEY
  );
  const contentModules = MODULE_DEFINITIONS.filter(
    (m) => m.key !== TABLE_KEY
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
      {/* LAYOUT SECTION */}
      <h2 className="text-sm font-semibold text-slate-700 mb-2">
        Layout
      </h2>
      <div className="space-y-2 mb-4">
        {layoutModules.map((mod) => (
          <div
            key={mod.key}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "library-module", key: mod.key })
              )
            }
            onClick={() => onAdd(mod.key)} // Table wrapper can be click-added
            className="p-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-xs"
          >
            {mod.label}
          </div>
        ))}
      </div>

      {/* CONTENT BLOCKS SECTION */}
      <h2 className="text-sm font-semibold text-slate-700 mb-2">
        Content Blocks
      </h2>
      <div className="space-y-2">
        {contentModules.map((mod) => (
          <div
            key={mod.key}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ type: "library-module", key: mod.key })
              )
            }
            // No click handler: these must be dragged into a table wrapper
            className="p-2 border rounded cursor-pointer bg-slate-50 hover:bg-slate-100 text-xs"
            title="Drag into a Table Wrapper on the canvas"
          >
            {mod.label}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
