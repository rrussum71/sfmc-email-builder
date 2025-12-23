import { useState } from "react";
import type { PlacedModule, Country } from "../types/Module";
import { MODULE_DEFINITIONS } from "../data/moduleDefinitions";

const COUNTRY_ORDER: Country[] = ["US", "CA", "AU", "Default"];

let idCounter = 1;
const nextId = () => `mod_${idCounter++}`;

const ALIAS_MAP: Record<string, Record<string, string[]>> = {
  image_full_width: { image_title: ["link_alias"] },
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
  cta_button: { title: ["alias"] },
};

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

  function addTopLevelModule(key: string, index?: number) {
    if (key !== "table_wrapper") return;

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

  function moveTopLevelModule(id: string, index: number) {
    setModules((prev) => {
      const top = prev.filter((m) => !m.parentId);
      const nested = prev.filter((m) => m.parentId);
      const cur = top.findIndex((m) => m.id === id);
      if (cur === -1) return prev;

      const [item] = top.splice(cur, 1);
      top.splice(index, 0, item);
      return [...top, ...nested];
    });
  }

  function moveNestedModule(
    id: string,
    parentId: string,
    country: Country | null,
    index: number
  ) {
    setModules((prev) => {
      const next = [...prev];
      const cur = next.findIndex((m) => m.id === id);
      if (cur === -1) return prev;

      const [item] = next.splice(cur, 1);
      item.parentId = parentId;
      item.country = country ?? undefined;

      const siblings = next.filter(
        (m) =>
          m.parentId === parentId &&
          (m.country ?? undefined) === (country ?? undefined)
      );

      const insertBefore =
        index >= siblings.length ? null : siblings[index]?.id;

      const insertAt = insertBefore
        ? next.findIndex((m) => m.id === insertBefore)
        : next.length;

      next.splice(insertAt, 0, item);
      return next;
    });
  }

  function removeModule(id: string) {
    setModules((prev) => {
      const removeIds = new Set<string>([id]);

      let changed = true;
      while (changed) {
        changed = false;
        prev.forEach((m) => {
          if (m.parentId && removeIds.has(m.parentId)) {
            if (!removeIds.has(m.id)) {
              removeIds.add(m.id);
              changed = true;
            }
          }
        });
      }

      setSelectedId((cur) => (cur && removeIds.has(cur) ? null : cur));
      return prev.filter((m) => !removeIds.has(m.id));
    });
  }

  function collectWithChildren(all: PlacedModule[], rootId: string) {
    const result: PlacedModule[] = [];
    const queue = [rootId];

    while (queue.length) {
      const id = queue.shift()!;
      const mod = all.find((m) => m.id === id);
      if (!mod) continue;

      result.push(mod);
      all.forEach((m) => m.parentId === id && queue.push(m.id));
    }

    return result;
  }

  function duplicateModule(id: string) {
    setModules((prev) => {
      const originals = collectWithChildren(prev, id);
      if (!originals.length) return prev;

      const idMap = new Map<string, string>();
      originals.forEach((m) => idMap.set(m.id, nextId()));

      const clones: PlacedModule[] = originals.map((m) => ({
        ...m,
        id: idMap.get(m.id)!,
        parentId: m.parentId ? idMap.get(m.parentId) ?? m.parentId : undefined,
        values: { ...m.values },
      }));

      const root = originals[0];

      let insertIndex = -1;

      if (!root.parentId) {
        // top-level (table wrapper)
        insertIndex = prev.findIndex((m) => m.id === root.id);
      } else {
        // nested → after last sibling in same parent + country
        const siblings = prev.filter(
          (m) =>
            m.parentId === root.parentId &&
            (m.country ?? null) === (root.country ?? null)
        );

        const lastSibling = siblings[siblings.length - 1];
        insertIndex = prev.findIndex((m) => m.id === lastSibling.id);
      }

      if (insertIndex === -1) return prev;

      return [
        ...prev.slice(0, insertIndex + 1),
        ...clones,
        ...prev.slice(insertIndex + 1),
      ];
    });
  }

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
          const alias = buildAliasFromTitle(value);
          map[field].forEach((f) => {
            if (!m.values[f] || m.values[f].endsWith("_alias")) {
              updated.values[f] = alias;
            }
          });
        }

        return updated;
      })
    );
  }

  function buildExportHtml() {
    const lines: string[] = [];

    modules
      .filter((m) => !m.parentId && m.key === "table_wrapper")
      .forEach((wrapper) => {
        lines.push(`<table width="100%" cellpadding="0" cellspacing="0">`);

        modules
          .filter((m) => m.parentId === wrapper.id)
          .forEach((mod) => {
            const def = defByKey[mod.key];
            if (!def) return;

            if (mod.key === "ampscript_country") {
              let first = true;

              COUNTRY_ORDER.forEach((c) => {
                const kids = modules.filter(
                  (m) => m.parentId === mod.id && m.country === c
                );
                if (!kids.length) return;

                if (first) {
                  lines.push(`%%[ IF @Country == "${c}" THEN ]%%`);
                  first = false;
                } else {
                  lines.push(`%%[ ELSEIF @Country == "${c}" THEN ]%%`);
                }

                kids.forEach((k) =>
                  lines.push(defByKey[k.key]?.renderHtml(k.values))
                );
              });

              lines.push(`%%[ ENDIF ]%%`);
              return;
            }

            lines.push(def.renderHtml(mod.values));
          });

        lines.push(`</table>`);
      });

    setExportHtml(lines.join("\n"));
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
    duplicateModule,
    updateModuleValue,
    buildExportHtml,
  };
}