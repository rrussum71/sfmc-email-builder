import { FC, useState } from "react";
import { PlacedModule } from "../types/Module";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

interface Props {
  parent: PlacedModule;
  modules: PlacedModule[];
  addNestedModule: (defKey: string, parentId: string, country: string) => void;
  setSelectedId: (id: string | null) => void;
}

/* ------------------------------------------------------------
   A clean, modern UI for the AMPscript Country Switcher
------------------------------------------------------------ */
const CountrySwitcher: FC<Props> = ({
  parent,
  modules,
  addNestedModule,
  setSelectedId,
}) => {
  const [active, setActive] = useState<"US" | "CA" | "AU" | "Default">("US");

  const countries: ("US" | "CA" | "AU" | "Default")[] = [
    "US",
    "CA",
    "AU",
    "Default",
  ];

  const childModules = modules.filter((m) => m.parentId === parent.id);

  function handleDrop(e: React.DragEvent<HTMLDivElement>, country: string) {
    e.preventDefault();
    const defKey = e.dataTransfer.getData("module-type");
    if (!defKey) return;

    addNestedModule(defKey, parent.id, country);
  }

  return (
    <div className="border border-slate-300 rounded-md bg-white mt-2 p-3">
      <div className="font-semibold text-sm mb-2">AMPscript Country Switcher</div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {countries.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-3 py-1 text-xs rounded border 
              ${
                active === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-100 border-slate-300"
              }
            `}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Dropzone for the active tab */}
      <div
        className="min-h-[80px] border border-dashed border-slate-400 rounded-md p-3 bg-slate-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, active)}
      >
        <div className="text-xs text-slate-500 mb-2">
          Drop modules here for: <strong>{active}</strong>
        </div>

        {childModules
          .filter((m) => m.country === active)
          .map((m) => {
            const def = MODULE_DEFINITIONS.find((d) => d.key === m.key);
            return (
              <div
                key={m.id}
                className="p-2 bg-white border rounded mb-2 cursor-pointer hover:bg-slate-100"
                onClick={() => setSelectedId(m.id)}
              >
                <div className="text-xs font-semibold">{def?.label}</div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CountrySwitcher;