import { ModuleDefinition } from "../types/Module";

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  /* ============================================================
     FULL WIDTH IMAGE
  ============================================================ */
  {
    key: "image_full_width",
    label: "Full Width Image",
    fields: [
      { id: "image", label: "Image URL", type: "text" },
      { id: "image_title", label: "Image Title", type: "text" },

      // ❌ Removed: image_alias (NO LONGER VALID)
      // Only link alias is allowed

      { id: "link", label: "Link URL", type: "text" },
      { id: "link_alias", label: "Link Alias", type: "text" }, // auto-created from image_title
      { id: "alt", label: "Alt Text", type: "text" },
    ],
    renderHtml: (v) => `
<!-- START ${v.image_title || ""} Image Full Width -->
<tr>
  <td style="padding:0;text-align:center;">
    <a href="${v.link || ""}" title="${v.image_title || ""}" alias="${v.link_alias || ""}" target="_blank" style="text-decoration:none;">
      <img src="${v.image || ""}" alt="${v.alt || ""}" width="640" style="width:100%;height:auto;display:block;">
    </a>
  </td>
</tr>
<!-- END ${v.image_title || ""} Image Full Width -->
`,
  },

  /* ============================================================
     BODY COPY
  ============================================================ */
  {
    key: "body_copy",
    label: "Body Copy",
    fields: [{ id: "text", label: "Body Copy", type: "textarea" }],
    renderHtml: (v) => `
<!-- START Body Copy -->
<tr>
  <td style="padding:15px 40px;text-align:center;">
    <p style="font-size:18px;color:#000;margin:0;font-family:Arial;line-height:28px;text-align:center;">
      ${v.text || ""}
    </p>
  </td>
</tr>
<!-- END Body Copy -->
`,
  },

  /* ============================================================
     DISCLAIMER COPY
  ============================================================ */
  {
    key: "disclaimer_copy",
    label: "Disclaimer Copy",
    fields: [{ id: "text", label: "Disclaimer Copy", type: "textarea" }],
    renderHtml: (v) => `
<!-- START Disclaimer Copy -->
<tr>
  <td style="padding:25px 40px;text-align:center;">
    <p style="font-size:12px;color:#000;margin:0;font-family:Arial;line-height:18px;text-align:center;">
      ${v.text || ""}
    </p>
  </td>
</tr>
<!-- END Disclaimer Copy -->
`,
  },

  /* ============================================================
     2 COL IMAGE
  ============================================================ */
  {
    key: "image_grid_1x2",
    label: "2-Col-Img",
    fields: [
      { id: "image_left", label: "Left Image URL", type: "text" },
      { id: "title_left", label: "Left Image Title", type: "text" },
      { id: "link_left", label: "Left Link URL", type: "text" },
      { id: "link_left_alias", label: "Left Link Alias", type: "text" },
      { id: "alt_left", label: "Left Alt Text", type: "text" },

      { id: "image_right", label: "Right Image URL", type: "text" },
      { id: "title_right", label: "Right Image Title", type: "text" },
      { id: "link_right", label: "Right Link URL", type: "text" },
      { id: "link_right_alias", label: "Right Link Alias", type: "text" },
      { id: "alt_right", label: "Right Alt Text", type: "text" },
    ],
    renderHtml: (v) => `
<!-- START 2-Col-Img -->
<tr>
  <td style="padding:0;text-align:center;">
    <table role="presentation" width="100%">
      <tr><td align="center" style="font-size:0;">

        <!-- LEFT -->
        <div style="display:inline-block;max-width:50%;min-width:280px;width:100%;">
          <table width="100%" style="max-width:280px;">
            <tr>
              <td style="padding-top:24px;text-align:center;">
                <a href="${v.link_left || ""}" alias="${v.link_left_alias || ""}" title="${v.title_left || ""}">
                  <img src="${v.image_left || ""}" alt="${v.alt_left || ""}" width="285" style="display:block;width:100%;max-width:285px;">
                </a>
              </td>
            </tr>
          </table>
        </div>

        <!-- RIGHT -->
        <div style="display:inline-block;max-width:50%;min-width:280px;width:100%;">
          <table width="100%" style="max-width:280px;">
            <tr>
              <td style="padding-top:24px;text-align:center;">
                <a href="${v.link_right || ""}" alias="${v.link_right_alias || ""}" title="${v.title_right || ""}">
                  <img src="${v.image_right || ""}" alt="${v.alt_right || ""}" width="285" style="display:block;width:100%;max-width:285px;">
                </a>
              </td>
            </tr>
          </table>
        </div>

      </td></tr>
    </table>
  </td>
</tr>
<!-- END 2-Col-Img -->
`,
  },

  /* ============================================================
     2 COL IMAGE + CTA
  ============================================================ */
  {
    key: "image_grid_1x2_cta",
    label: "2-Col-Img-CTA",
    fields: [
      // LEFT
      { id: "image1_src", label: "Left Image URL", type: "text" },
      { id: "image1_title", label: "Left Image Title", type: "text" },
      { id: "image1_link", label: "Left Image Link URL", type: "text" },
      { id: "image1_link_alias", label: "Left Image Link Alias", type: "text" },
      { id: "image1_alt", label: "Left Alt Text", type: "text" },
      { id: "image1_btn_title", label: "Left Button Title", type: "text" },
      { id: "image1_btn_alias", label: "Left Button Alias", type: "text" },
      { id: "image1_btn_link", label: "Left Button URL", type: "text" },

      // RIGHT
      { id: "image2_src", label: "Right Image URL", type: "text" },
      { id: "image2_title", label: "Right Image Title", type: "text" },
      { id: "image2_link", label: "Right Image Link URL", type: "text" },
      { id: "image2_link_alias", label: "Right Image Link Alias", type: "text" },
      { id: "image2_alt", label: "Right Alt Text", type: "text" },
      { id: "image2_btn_title", label: "Right Button Title", type: "text" },
      { id: "image2_btn_alias", label: "Right Button Alias", type: "text" },
      { id: "image2_btn_link", label: "Right Button URL", type: "text" },
    ],
    renderHtml: (v) => `
<!-- START 1x2 Image Grid + CTA -->
<tr>
  <td style="padding:0;text-align:center;font-size:0;">
    <table role="presentation" width="100%">
      <tr><td>

        <!-- LEFT -->
        <div style="display:inline-block;max-width:50%;min-width:280px;width:100%;">
          <table width="100%" style="max-width:300px;">
            <tr><td style="padding-top:24px;text-align:center;">
              <a href="${v.image1_link || ""}" alias="${v.image1_link_alias || ""}" title="${v.image1_title || ""}">
                <img src="${v.image1_src || ""}" alt="${v.image1_alt || ""}" width="285" style="display:block;width:100%;max-width:285px;">
              </a>
            </td></tr>

            <tr><td style="text-align:center;padding:10px;">
              <a href="${v.image1_btn_link || ""}" alias="${v.image1_btn_alias || ""}" style="font-family:Arial;font-size:18px;background:#F5F4F2;border:3px solid #000;padding:14px 25px;text-decoration:none;color:#000;">
                ${v.image1_btn_title || ""}
              </a>
            </td></tr>
          </table>
        </div>

        <!-- RIGHT -->
        <div style="display:inline-block;max-width:50%;min-width:280px;width:100%;">
          <table width="100%" style="max-width:300px;">
            <tr><td style="padding-top:24px;text-align:center;">
              <a href="${v.image2_link || ""}" alias="${v.image2_link_alias || ""}" title="${v.image2_title || ""}">
                <img src="${v.image2_src || ""}" alt="${v.image2_alt || ""}" width="285" style="display:block;width:100%;max-width:285px;">
              </a>
            </td></tr>

            <tr><td style="text-align:center;padding:10px;">
              <a href="${v.image2_btn_link || ""}" alias="${v.image2_btn_alias || ""}" style="font-family:Arial;font-size:18px;background:#F5F4F2;border:3px solid #000;padding:14px 25px;text-decoration:none;color:#000;">
                ${v.image2_btn_title || ""}
              </a>
            </td></tr>
          </table>
        </div>

      </td></tr>
    </table>
  </td>
</tr>
<!-- END 1x2 Image Grid + CTA -->
`,
  },

  /* ============================================================
     CTA BUTTON
  ============================================================ */
  {
    key: "cta_button",
    label: "White Button",
    fields: [
      { id: "title", label: "Button Title", type: "text" },
      { id: "url", label: "Button URL", type: "text" },
      { id: "alias", label: "Button Alias", type: "text" },
    ],
    renderHtml: (v) => `
<!-- START Button -->
<tr>
  <td style="text-align:center;padding:20px;">
    <a href="${v.url || ""}" alias="${v.alias || ""}" style="font-family:Arial;font-size:18px;background:#fff;border:3px solid;padding:14px 25px;text-decoration:none;color:#000;display:inline-block;">
      ${v.title || ""}
    </a>
  </td>
</tr>
<!-- END Button -->
`,
  },

  /* ============================================================
     RAW AMPSCRIPT BLOCK
  ============================================================ */
  {
    key: "ampscript_block",
    label: "AMPscript Block",
    fields: [{ id: "code", label: "AMPscript / Dynamic Block", type: "code" }],
    renderHtml: (v) => `${v.code || ""}`,
  },

  /* ============================================================
     AMPSCRIPT COUNTRY SWITCHER WRAPPER
  ============================================================ */
  {
    key: "ampscript_country",
    label: "AMPscript Country Switcher",
    fields: [
      {
        id: "note",
        label: "This block wraps US/CA/AU/Default content.",
        type: "note",
      },
    ],
    renderHtml: () => `
%%[ /* SWITCHER CONTENT FILLED IN EXPORT */ ]%%
`,
  },
];

export const MODULES_BY_KEY = Object.fromEntries(
  MODULE_DEFINITIONS.map((m) => [m.key, m])
);