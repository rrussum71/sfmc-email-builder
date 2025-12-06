import { useState } from "react";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";
import { PlacedModule } from "../types/Module";

let idCounter = 1;
const nextId = () => `mod_${idCounter++}`;

export function useEmailBuilder() {
  const [modules, setModules] = useState<PlacedModule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");

  /* ADD TOP-LEVEL MODULE */
  function addModule(defKey: string, insertIndex?: number | null) {
    const def = MODULES_BY_KEY[defKey];
    if (!def) return;

    const values: Record<string, string> = {};
    def.fields.forEach((f) => (values[f.id] = ""));

    const newMod: PlacedModule = {
      id: nextId(),
      key: defKey,
      values,
      parentId: undefined,
      country: undefined,
    };

    setModules((prev) => {
      const top = prev.filter((m) => !m.parentId);
      const nested = prev.filter((m) => m.parentId);

      const index =
        insertIndex === undefined || insertIndex === null
          ? top.length
          : Math.max(0, Math.min(insertIndex, top.length));

      top.splice(index, 0, newMod);
      return [...top, ...nested];
    });

    setSelectedId(newMod.id);
  }

  /* ADD NESTED MODULE */
  function addNestedModule(defKey: string, parentId: string, country: string) {
    const def = MODULES_BY_KEY[defKey];
    if (!def) return;

    const values: Record<string, string> = {};
    def.fields.forEach((f) => (values[f.id] = ""));

    const newMod: PlacedModule = {
      id: nextId(),
      key: defKey,
      values,
      parentId,
      country: country as "US" | "CA" | "AU" | "Default",
    };

    setModules((prev) => [...prev, newMod]);
    setSelectedId(newMod.id);
  }

  /* REORDER */
  function moveModuleTopLevel(id: string, newIndex: number) {
    setModules((prev) => {
      const top = prev.filter((m) => !m.parentId);
      const nested = prev.filter((m) => m.parentId);

      const oldIndex = top.findIndex((m) => m.id === id);
      if (oldIndex === -1) return prev;

      const clamped = Math.max(0, Math.min(newIndex, top.length - 1));

      const [moving] = top.splice(oldIndex, 1);
      top.splice(clamped, 0, moving);

      return [...top, ...nested];
    });
  }

  /* DELETE */
  function removeModule(id: string) {
    setModules((prev) =>
      prev.filter((m) => m.id !== id && m.parentId !== id)
    );
    if (selectedId === id) setSelectedId(null);
  }

  /* UPDATE FIELDS + AUTO-ALIAS */
  function updateModuleValue(id: string, field: string, value: string) {
  setModules((prev) =>
    prev.map((m) => {
      if (m.id !== id) return m;

      const updated = {
        ...m,
        values: { ...m.values, [field]: value },
      };

      // -------------------------------------------------------
      // BULLETPROOF ALIAS GENERATOR
      // -------------------------------------------------------
      if (field.endsWith("_title")) {
        const base = field.replace("_title", "").trim(); // e.g. "image", "cta", "hero1"

        const values = updated.values;

        // Dynamically detect ANY alias-like fields
        const aliasCandidates = Object.keys(values).filter((key) =>
          key.toLowerCase().includes("alias")
        );

        // If no alias field, nothing to do
        if (aliasCandidates.length > 0) {
          // Choose the most logical alias field based on proximity
          const aliasField =
            aliasCandidates.find((k) =>
              k.startsWith(base)
            ) || aliasCandidates[0];

          const oldAlias = values[aliasField];

          // Build new alias from title value
          const newAlias =
            value
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "_")       // Replace spaces
              .replace(/[^a-z0-9_]/g, "") // Strip symbols
              + "_alias";

          // Only overwrite if user has not manually typed an alias
          if (!oldAlias || oldAlias.endsWith("_alias")) {
            updated.values[aliasField] = newAlias;
          }
        }
      }

      return updated;
    })
  );
}

  /* EXPORT HTML */
  function buildExportHtml() {
    const html = modules
      .filter((m) => !m.parentId)
      .map((m) => MODULES_BY_KEY[m.key].renderHtml(m.values))
      .join("\n");

    setExportHtml(`
<table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};">
${html}
</table>
`);
    setExportOpen(true);
  }

  return {
    modules,
    selectedId,
    bgColor,
    exportOpen,
    exportHtml,
    setSelectedId,
    setBgColor,
    setExportOpen,
    addModule,
    addNestedModule,
    moveModuleTopLevel,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  };
}