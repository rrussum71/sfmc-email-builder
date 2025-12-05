import { FC } from "react";
import { ModuleDefinition } from "../types/Module";

interface SidebarProps {
  moduleDefinitions: ModuleDefinition[];
  onAdd: (key: string) => void;
}

const Sidebar: FC<SidebarProps> = ({ moduleDefinitions, onAdd }) => {
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-700">
          Content Blocks
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Click to add modules to your email.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {moduleDefinitions.map((mod) => (
          <button
            key={mod.key}
            type="button"
            onClick={() => onAdd(mod.key)}
            className="w-full text-left px-3 py-2 rounded-md border border-slate-200 bg-white text-sm hover:bg-slate-100 transition"
          >
            {mod.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;