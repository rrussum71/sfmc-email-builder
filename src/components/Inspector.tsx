// src/components/Inspector.tsx
import type { PlacedModule } from "../types/Module";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

interface InspectorProps {
  module: PlacedModule | null;
  onChangeField: (fieldId: string, value: string) => void;
}

export default function Inspector({ module, onChangeField }: InspectorProps) {
  // No module selected → show placeholder text
  if (!module) {
    return (
      <aside className="w-80 border-l bg-white p-4 overflow-auto">
        <p className="text-gray-500 text-sm italic">
          Select a module to edit.
        </p>
      </aside>
    );
  }

  const def = MODULE_DEFINITIONS.find((d) => d.key === module.key);

  return (
    <aside className="w-80 border-l bg-white p-4 overflow-auto">

      {/* Module heading */}
      <h2 className="text-lg font-semibold mb-4">
        {def?.label ?? "Module"}
      </h2>

      {/* Field list */}
      {def?.fields.map((field) => {
        const value = module.values[field.id] || "";

        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              {field.label}
            </label>

            {field.type === "textarea" ? (
              <textarea
                className="w-full border rounded p-2"
                rows={4}
                value={value}
                onChange={(e) => onChangeField(field.id, e.target.value)}
              />
            ) : field.type === "code" ? (
              <textarea
                className="w-full border rounded p-2 font-mono text-xs"
                rows={8}
                value={value}
                onChange={(e) => onChangeField(field.id, e.target.value)}
              />
            ) : field.type === "note" ? (
              <div className="text-xs italic text-gray-600">
                {field.label}
              </div>
            ) : (
              <input
                type="text"
                className="w-full border rounded p-2"
                value={value}
                onChange={(e) => onChangeField(field.id, e.target.value)}
              />
            )}
          </div>
        );
      })}

    </aside>
  );
}
