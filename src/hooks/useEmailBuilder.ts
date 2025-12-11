// src/hooks/useEmailBuilder.ts
import { useState } from "react";
import type { PlacedModule, Country } from "../types/Module";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

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

  const [exportOpen, setExportOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const defByKey = Object.fromEntries(
    MODULE_DEFINITIONS.map((m) => [m.key, m])
  );

  function makeEmptyValues(key: string) {
    const def = defByKey[key];
    const vals: Record<string, string> = {};
    if (def) def.fields.forEach((f) => (vals[f.id] = ""));
    return vals;
  }

  // -------------------------------------------
  // Add Top-Level (TABLE WRAPPER ONLY)
  // -------------------------------------------
  function addTopLevelModule(key: string, index?: number) {
    if (key !== "table_wrapper") {
      console.warn("Only table_wrapper allowed as top-level");
      return;
    }

    const mod: PlacedModule = {
      id: nextId(),
      key,
      parentId: undefined,
      country: undefined,
      values: makeEmptyValues(key),
    };

    setModules((prev) => {
      const top = prev.filter(
        (m) => !m.parentId && m.key === "table_wrapper"
      );
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
  // Add Nested
  // -------------------------------------------
  function addNestedModule(
    key: string,
    parentId: string,
    country: Country | null
  ) {
    if (key === "table_wrapper") return;

    const mod: PlacedModule = {
      id: nextId(),
      key,
      parentId,
      country: country ?? undefined,
      values: makeEmptyValues(key),
    };

    setModules((prev) => [...prev, mod]);
    setSelectedId(mod.id);
  }

  // -------------------------------------------
  // Move top-level wrappers
  // -------------------------------------------
  function moveTopLevelModule(id: string, index: number) {
    setModules((prev) => {
      const top = prev.filter(
        (m) => !m.parentId && m.key === "table_wrapper"
      );
      const nested = prev.filter((m) => m.parentId);

      const curIndex = top.findIndex((m) => m.id === id);
      if (curIndex === -1) return prev;

      const [item] = top.splice(curIndex, 1);
      const safe = Math.max(0, Math.min(index, top.length));
      top.splice(safe, 0, item);

      return [...top, ...nested];
    });
  }

  // -------------------------------------------
  // Move Nested
  // -------------------------------------------
  function moveNestedModule(
    id: string,
    parentId: string,
    country: Country | null,
    index: number
  ) {
    setModules((prev) => {
      const next = [...prev];
      const curIndex = next.findIndex((m) => m.id === id);
      if (curIndex === -1) return prev;

      const [item] = next.splice(curIndex, 1);
      if (item.key === "table_wrapper") return prev;

      item.parentId = parentId;
      item.country = country ?? undefined;

      const siblings = next.filter(
        (m) =>
          m.parentId === parentId &&
          (m.country ?? undefined) === (country ?? undefined)
      );

      const ids = siblings.map((s) => s.id);
      const insertBeforeId =
        index >= ids.length ? null : ids[index];

      const insertAt = insertBeforeId
        ? next.findIndex((m) => m.id === insertBeforeId)
        : next.length;

      next.splice(insertAt, 0, item);
      return next;
    });
  }

  // -------------------------------------------
  // Remove module + children
  // -------------------------------------------
  function removeModule(id: string) {
    setModules((prev) => {
      const removeIds = new Set([id]);

      let changed = true;
      while (changed) {
        changed = false;
        for (const m of prev) {
          if (m.parentId && removeIds.has(m.parentId)) {
            if (!removeIds.has(m.id)) {
              removeIds.add(m.id);
              changed = true;
            }
          }
        }
      }

      setSelectedId((cur) => (cur && removeIds.has(cur) ? null : cur));
      return prev.filter((m) => !removeIds.has(m.id));
    });
  }

  // -------------------------------------------
  // Update values + auto alias
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
            const old = m.values[aliasField];
            if (!old || old.endsWith("_alias")) {
              updated.values[aliasField] = newAlias;
            }
          });
        }

        return updated;
      })
    );
  }

  // -------------------------------------------
  // EXPORT HTML
  // -------------------------------------------
  function buildExportHtml() {
    const lines: string[] = [];

    const wrappers = modules.filter(
      (m) => !m.parentId && m.key === "table_wrapper"
    );

    wrappers.forEach((wrapper) => {
      const bg = wrapper.values["bg"] || "#FFFFFF";

      // ⭐ UPDATED MSO-SAFE TABLE TAG
      lines.push(
        `<table role="presentation" 
                width="100%" 
                border="0" 
                cellpadding="0" 
                cellspacing="0" 
                style="border-collapse:collapse;border:none;background:${bg};">`
      );

      const children = modules.filter((m) => m.parentId === wrapper.id);

      children.forEach((mod) => {
        const def = defByKey[mod.key];
        if (!def) return;

        if (mod.key === "ampscript_country") {
          let first = true;

          COUNTRY_ORDER.forEach((country) => {
            let kids: PlacedModule[];

            if (country === "Default") {
              kids = modules.filter(
                (m) =>
                  m.parentId === mod.id &&
                  m.country === "US"
              );
            } else {
              kids = modules.filter(
                (m) =>
                  m.parentId === mod.id &&
                  m.country === country
              );
            }

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
    });

    setExportHtml(lines.join("\n\n"));
    setExportOpen(true);
    setPreviewOpen(false);
  }

  return {
    modules,
    selectedId,
    exportOpen,
    exportHtml,
    previewOpen,

    setSelectedId,
    setExportOpen,
    setPreviewOpen,

    addTopLevelModule,
    addNestedModule,
    moveTopLevelModule,
    moveNestedModule,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  };
}
