import { useState } from "react";
import { MODULES_BY_KEY } from "../data/moduleDefinitions";
import type { PlacedModule } from "../types/Module";

let idCounter = 1;
const nextId = () => `mod_${idCounter++}`;

// SFMC IMAGE ROOT
const SFMC_BASE_IMAGE_URL =
  "http://image.marketing.rodanandfields.com/lib/fe9113737767047572/m/1/";

function resolveSfmcImageUrl(url: string): string {
  if (!url) return "";

  const trimmed = url.trim();

  // Already a full URL? leave it
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Otherwise treat as filename and prepend SFMC image root
  return SFMC_BASE_IMAGE_URL + trimmed.replace(/^\/*/, "");
}

export function useEmailBuilder() {
  const [modules, setModules] = useState<PlacedModule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");

  /* -----------------------------------------------------------
     ADD TOP-LEVEL MODULE
  ----------------------------------------------------------- */
  function addModule(defKey: string, insertIndex?: number | null) {
    const def = MODULES_BY_KEY[defKey];
    if (!def) return;

    const values: Record<string, string> = {};
    def.fields.forEach((f) => (values[f.id] = ""));

    // top-level: no parentId, no country
    const newMod: PlacedModule = {
      id: nextId(),
      key: defKey,
      values,
    };

    setModules((prev) => {
      const top = prev.filter((m) => !m.parentId);
      const nested = prev.filter((m) => m.parentId);

      if (insertIndex === undefined || insertIndex === null) {
        top.push(newMod);
      } else {
        const idx = Math.max(0, Math.min(insertIndex, top.length));
        top.splice(idx, 0, newMod);
      }

      return [...top, ...nested];
    });

    setSelectedId(newMod.id);
  }

  /* -----------------------------------------------------------
     ADD NESTED MODULE (for a country bucket)
  ----------------------------------------------------------- */
  function addNestedModule(
    defKey: string,
    parentId: string,
    country: "US" | "CA" | "AU" | "Default"
  ) {
    const def = MODULES_BY_KEY[defKey];
    if (!def) return;

    const values: Record<string, string> = {};
    def.fields.forEach((f) => (values[f.id] = ""));

    const newMod: PlacedModule = {
      id: nextId(),
      key: defKey,
      values,
      parentId,
      country,
    };

    setModules((prev) => [...prev, newMod]);
    setSelectedId(newMod.id);
  }

  /* -----------------------------------------------------------
     MOVE / REORDER TOP-LEVEL MODULES
  ----------------------------------------------------------- */
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

  /* -----------------------------------------------------------
     MOVE / REORDER NESTED MODULES (Option A behavior)
     - Allows moving within same country bucket
     - Allows moving between US/CA/AU/Default
  ----------------------------------------------------------- */
  function moveNestedModule(
    id: string,
    targetParentId: string,
    targetCountry: "US" | "CA" | "AU" | "Default",
    targetIndex: number
  ) {
    setModules((prev) => {
      const top: PlacedModule[] = [];
      const allNestedCandidate: PlacedModule[] = [];

      // Remove the moving module from wherever it is
      let movingOriginal: PlacedModule | null = null;
      for (const m of prev) {
        if (m.id === id) {
          movingOriginal = m;
          continue;
        }
        if (!m.parentId) top.push(m);
        else allNestedCandidate.push(m);
      }

      if (!movingOriginal) return prev;

      // Nested modules that are NOT in the target bucket
      const nestedOthers = allNestedCandidate.filter(
        (m) =>
          !(
            m.parentId === targetParentId &&
            m.country === targetCountry
          )
      );

      // Current siblings in the target bucket
      const siblings = allNestedCandidate.filter(
        (m) =>
          m.parentId === targetParentId && m.country === targetCountry
      );

      const moving: PlacedModule = {
        ...movingOriginal,
        parentId: targetParentId,
        country: targetCountry,
      };

      const clamped = Math.max(0, Math.min(targetIndex, siblings.length));
      const newSiblings = [...siblings];
      newSiblings.splice(clamped, 0, moving);

      // New flat array:
      //   - all top-level
      //   - all nested from other buckets
      //   - then siblings for this bucket in correct order
      return [...top, ...nestedOthers, ...newSiblings];
    });
  }

  /* -----------------------------------------------------------
     DELETE A MODULE + CHILDREN
  ----------------------------------------------------------- */
  function removeModule(id: string) {
    setModules((prev) =>
      prev.filter((m) => m.id !== id && m.parentId !== id)
    );

    if (selectedId === id) setSelectedId(null);
  }

  /* -----------------------------------------------------------
     UPDATE FIELD VALUES (alias + SFMC img)
  ----------------------------------------------------------- */
  function updateModuleValue(id: string, field: string, value: string) {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        const updated: PlacedModule = {
          ...m,
          values: {
            ...m.values,
            [field]: value,
          },
        };

        // 1) AUTO-ALIAS FROM *_title
        if (field.endsWith("_title")) {
          const base = field.replace("_title", "");

          const possibleAliases = [
            `${base}_link_alias`,
            `${base}_alias`,
            `${base}_btn_alias`,
          ];

          let aliasField: string | null = null;

          for (const key of possibleAliases) {
            if (updated.values[key] !== undefined) {
              aliasField = key;
              break;
            }
          }

          if (aliasField) {
            const oldAlias = m.values[aliasField];

            const newAlias =
              value
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, "") + "_alias";

            // Only auto-update if user hasn't customized it
            if (!oldAlias || oldAlias.endsWith("_alias")) {
              updated.values[aliasField] = newAlias;
            }
          }
        }

        // 2) AUTO-PREPEND SFMC IMAGE ROOT
        const imageFields = new Set([
          "image",
          "image_left",
          "image_right",
          "image1_src",
          "image2_src",
        ]);

        if (imageFields.has(field)) {
          updated.values[field] = resolveSfmcImageUrl(value);
        }

        return updated;
      })
    );
  }

  /* -----------------------------------------------------------
     EXPORT HTML
  ----------------------------------------------------------- */
  function buildExportHtml() {
    function renderNested(parentId: string, country: string) {
      return modules
        .filter(
          (m) => m.parentId === parentId && m.country === country
        )
        .map((m) => MODULES_BY_KEY[m.key].renderHtml(m.values))
        .join("\n");
    }

    const html = modules
      .filter((m) => !m.parentId)
      .map((m) => {
        if (m.key !== "ampscript_country") {
          return MODULES_BY_KEY[m.key].renderHtml(m.values);
        }

        return `
%%[ IF @Country == "US" THEN ]%%
${renderNested(m.id, "US")}
%%[ ELSEIF @Country == "CA" THEN ]%%
${renderNested(m.id, "CA")}
%%[ ELSEIF @Country == "AU" THEN ]%%
${renderNested(m.id, "AU")}
%%[ ELSE ]%%
${renderNested(m.id, "Default")}
%%[ ENDIF ]%%
`;
      })
      .join("\n");

    setExportHtml(
      `<table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};">
${html}
</table>`
    );

    setExportOpen(true);
  }

  return {
    modules,
    selectedId,
    bgColor,
    exportOpen,
    exportHtml,

    setBgColor,
    setSelectedId,
    setExportOpen,

    addModule,
    addNestedModule,
    moveModuleTopLevel,
    moveNestedModule,
    removeModule,
    updateModuleValue,
    buildExportHtml,
  };
}