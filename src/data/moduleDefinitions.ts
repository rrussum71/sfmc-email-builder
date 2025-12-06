// ---------------------------------------------------------------------------
// GLOBAL SFMC IMAGE RESOLVER (shared by all modules)
// ---------------------------------------------------------------------------

export const SFMC_BASE_IMAGE_URL =
  "http://image.marketing.rodanandfields.com/lib/fe9113737767047572/m/1/";

export function resolveSfmcImageUrl(url: string): string {
  if (!url) return "";

  const trimmed = url.trim();

  // Already a full remote URL? Leave untouched.
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Otherwise: prepend SFMC CDN base
  return SFMC_BASE_IMAGE_URL + trimmed.replace(/^\/*/, "");
}

// ---------------------------------------------------------------------------
// MODULE DEFINITIONS
// ---------------------------------------------------------------------------

import { ModuleDefinition } from "../types/Module";

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: "image_full_width",
    label: "Full Width Image",
    fields: [
      { id: "image", label: "Image", type: "text" },
      { id: "image_title", label: "Image Title", type: "text" },
      { id: "link", label: "Link URL", type: "text" },
      { id: "link_alias", label: "Link Alias", type: "text" },
      { id: "alt", label: "Alt Text", type: "text" },
    ],
    renderHtml: (v) => `
<tr>
  <td align="center">
    <a href="${v.link}" alias="${v.link_alias}" title="${v.image_title}">
      <img src="${resolveSfmcImageUrl(v.image)}" alt="${v.alt}" width="640" />
    </a>
  </td>
</tr>
`,
  },

  {
    key: "image_grid_1x2",
    label: "2-Col Image",
    fields: [
      { id: "image_left", label: "Left Image", type: "text" },
      { id: "title_left", label: "Left Title", type: "text" },
      { id: "alias_left", label: "Left Alias", type: "text" },
      { id: "link_left", label: "Left URL", type: "text" },
      { id: "alt_left", label: "Left Alt", type: "text" },

      { id: "image_right", label: "Right Image", type: "text" },
      { id: "title_right", label: "Right Title", type: "text" },
      { id: "alias_right", label: "Right Alias", type: "text" },
      { id: "link_right", label: "Right URL", type: "text" },
      { id: "alt_right", label: "Right Alt", type: "text" },
    ],
    renderHtml: (v) => `
<tr>
  <td align="center">
    <table width="100%">
      <tr>
        <td>
          <a href="${v.link_left}" alias="${v.alias_left}">
            <img src="${resolveSfmcImageUrl(v.image_left)}" alt="${v.alt_left}" width="285" />
          </a>
        </td>
        <td>
          <a href="${v.link_right}" alias="${v.alias_right}">
            <img src="${resolveSfmcImageUrl(v.image_right)}" alt="${v.alt_right}" width="285" />
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>
`,
  },

  {
    key: "image_grid_1x2_cta",
    label: "2-Col Image + CTA",
    fields: [
      { id: "image1_src", label: "Left Image", type: "text" },
      { id: "image1_title", label: "Left Title", type: "text" },
      { id: "image1_alias", label: "Left Alias", type: "text" },
      { id: "image1_link", label: "Left URL", type: "text" },
      { id: "image1_alt", label: "Left Alt", type: "text" },

      { id: "image1_btn_title", label: "Left Button Title", type: "text" },
      { id: "image1_btn_alias", label: "Left Button Alias", type: "text" },
      { id: "image1_btn_link", label: "Left Button URL", type: "text" },

      { id: "image2_src", label: "Right Image", type: "text" },
      { id: "image2_title", label: "Right Title", type: "text" },
      { id: "image2_alias", label: "Right Alias", type: "text" },
      { id: "image2_link", label: "Right URL", type: "text" },
      { id: "image2_alt", label: "Right Alt", type: "text" },

      { id: "image2_btn_title", label: "Right Button Title", type: "text" },
      { id: "image2_btn_alias", label: "Right Button Alias", type: "text" },
      { id: "image2_btn_link", label: "Right Button URL", type: "text" },
    ],
    renderHtml: () => "<!-- CTA GRID -->",
  },

  {
    key: "cta_button",
    label: "White Button",
    fields: [
      { id: "title", label: "Title", type: "text" },
      { id: "url", label: "URL", type: "text" },
      { id: "alias", label: "Alias", type: "text" },
    ],
    renderHtml: (v) => `
<tr><td align="center">
<a href="${v.url}" alias="${v.alias}"
style="background:#fff;border:3px solid;padding:12px 18px;display:inline-block">
${v.title}
</a>
</td></tr>`,
  },

  {
    key: "ampscript_block",
    label: "AMPscript Block",
    fields: [{ id: "code", label: "AMPscript", type: "code" }],
    renderHtml: (v) => v.code,
  },

  {
    key: "ampscript_country",
    label: "AMPscript Country Switcher",
    fields: [
      {
        id: "note",
        label: "Drag modules into US, CA, AU, Default buckets.",
        type: "note",
      },
    ],
    renderHtml: () => "",
  },
];

export const MODULES_BY_KEY = Object.fromEntries(
  MODULE_DEFINITIONS.map((m) => [m.key, m])
);