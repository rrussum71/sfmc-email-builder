import { useState } from "react";
import { PlacedModule } from "../types/Module";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

type Country = "US" | "CA" | "AU" | "Default";

const COUNTRY_ORDER: Country[] = ["US", "CA", "AU", "Default"];
let idCounter = 1;
const nextId = () => `mod_${idCounter++}`;

// -------------------------------------------
// ALIAS MAP (module → title fields → alias fields)
// -------------------------------------------
const ALIAS_MAP: Record<string, Record<string, string[]>> = {
  image_full_width: {
    image_title: ["link_alias"],
  },
  image_grid_1x2: {
    title_left: ["alias_left"],
    title_right: ["alias_right"],
  },
  image_grid_1x2_cta: {
    image1_title: ["image1_alias"],
    image2_title: ["image2_alias"],
    image1_btn_title: ["image1_btn_alias"],
    image2_btn_title: ["image2_btn_alias"],
  },
  cta_button: {
    title: ["alias"],
  },
};

// Build alias safely
function buildAliasFromTitle(value: string): string {
  const base =
    value
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/['"]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || "link";

  return `${base}_alias`;
}

export function useEmailBuilder() {
  const [modules, setModules] = useState<PlacedModule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");

  // ============================
  // EXPORT + PREVIEW STATES
  // ============================
  const [exportOpen, setExportOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");

  // ⭐ NEW: Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  const defByKey = Object.fromEntries(
    MODULE_DEFINITIONS.map((m) => [m.key, m])
  );

  function makeEmptyValues(key: string) {
    const def = defByKey[key];
    const vals: Record<string, string> = {};
    def.fields.forEach((f) => (vals[f.id] = ""));
    return vals;
  }

  // -------------------------------------------
  // Add Top-Level
  // -------------------------------------------
  function addTopLevelModule(key: string, index?: number) {
    const mod: PlacedModule = {
      id: nextId(),
      key,
      parentId: undefined,
      country: undefined,
      values: makeEmptyValues(key),
    };

    setModules((prev) => {
      const top = prev.filter((m) => !m.parentId);
      const nested = prev.filter((m) => m.parentId);

      const i =
        typeof index === "number"
          ? Math.min(Math.max(index, 0), top.length)
          : top.length;

      top.splice(i, 0, mod);
      return [...top, ...nested];
    });

    setSelectedId(mod.id);
  }

  // -------------------------------------------
  // Add Nested (Country switcher)
  // -------------------------------------------
  function addNestedModule(key: string, parentId: string, country: Country) {
    const mod: PlacedModule = {
      id: nextId(),
      key,
      parentId,
      country,
      values: makeEmptyValues(key),
    };

    setModules((prev) => [...prev, mod]);
    setSelectedId(mod.id);
  }

  // -------------------------------------------
  // Move Top-Level
  // -------------------------------------------
  function moveTopLevelModule(id: string, index: number) {
    setModules((prev) => {
      const top = prev.filter((m) => !m.parentId);
      const nested = prev.filter((m) => m.parentId);

      const curIdx = top.findIndex((m) => m.id === id);
      if (curIdx === -1) return prev;

      const [item] = top.splice(curIdx, 1);
      const safeIndex = Math.max(0, Math.min(index, top.length));
      top.splice(safeIndex, 0, item);

      return [...top, ...nested];
    });
  }

  // -------------------------------------------
  // Move Nested
  // -------------------------------------------
  function moveNestedModule(
    id: string,
    parentId: string,
    country: Country,
    index: number
  ) {
    setModules((prev) => {
      const next = [...prev];
      const curIdx = next.findIndex((m) => m.id === id);
      if (curIdx === -1) return prev;

      const [item] = next.splice(curIdx, 1);
      item.parentId = parentId;
      item.country = country;

      const siblings = next.filter(
        (m) => m.parentId === parentId && m.country === country
      );
      const siblingIds = siblings.map((s) => s.id);

      const insertBeforeId =
        index >= siblingIds.length ? null : siblingIds[index];

      const insertIndex = insertBeforeId
        ? next.findIndex((m) => m.id === insertBeforeId)
        : next.length;

      next.splice(insertIndex, 0, item);
      return next;
    });
  }

  // -------------------------------------------
  // Remove module + nested children
  // -------------------------------------------
  function removeModule(id: string) {
    setModules((prev) =>
      prev.filter((m) => m.id !== id && m.parentId !== id)
    );
    setSelectedId((curr) => (curr === id ? null : curr));
  }

  // -------------------------------------------
  // Update fields + auto-alias
  // -------------------------------------------
  function updateModuleValue(id: string, field: string, value: string) {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        const updated = {
          ...m,
          values: { ...m.values, [field]: value },
        };

        const map = ALIAS_MAP[m.key];
        if (map && map[field]) {
          const newAlias = buildAliasFromTitle(value);

          map[field].forEach((aliasField) => {
            const oldAlias = m.values[aliasField];
            if (!oldAlias || oldAlias.endsWith("_alias")) {
              updated.values[aliasField] = newAlias;
            }
          });
        }

        return updated;
      })
    );
  }

  // -------------------------------------------
  // Build Export HTML
  // -------------------------------------------
  function buildExportHtml() {
    const lines: string[] = [];

    lines.push(
      `<table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};">`
    );

    const top = modules.filter((m) => !m.parentId);

    top.forEach((mod) => {
      const def = defByKey[mod.key];
      if (!def) return;

      if (mod.key === "ampscript_country") {
        let first = true;

        COUNTRY_ORDER.forEach((country) => {
          const kids = modules.filter(
            (m) => m.parentId === mod.id && m.country === country
          );

          if (!kids.length) return;

          if (country === "Default") {
            lines.push(`%%[ ELSE ]%%`);
          } else if (first) {
            lines.push(`%%[ IF @Country == "${country}" THEN ]%%`);
            first = false;
          } else {
            lines.push(`%%[ ELSEIF @Country == "${country}" THEN ]%%`);
          }

          kids.forEach((child) => {
            const childDef = defByKey[child.key];
            if (childDef) lines.push(childDef.renderHtml(child.values));
          });
        });

        if (!first) lines.push(`%%[ ENDIF ]%%`);
        return;
      }

      lines.push(def.renderHtml(mod.values));
    });

    lines.push(`</table>`);

    setExportHtml(lines.join("\n"));
    setExportOpen(true);
  }

  // -------------------------------------------
  // RETURN API
  // -------------------------------------------
  return {
    modules,
    selectedId,
    bgColor,
    exportOpen,
    exportHtml,
    previewOpen,       // ⭐ NEW
    setSelectedId,
    setBgColor,
    setExportOpen,
    setPreviewOpen,    // ⭐ NEW
    addTopLevelModule,
    addNestedModule,
    moveTopLevelModule,
    moveNestedModule,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  };
}
