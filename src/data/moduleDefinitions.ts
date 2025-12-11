// src/data/moduleDefinitions.ts
import { ModuleDefinition } from "../types/Module";

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
// MODULE DEFINITIONS  (ordered for business)
// 0. Table Wrapper (NEW, required as top-level container)
// 1. Full Width Image
// 2. Body Copy
// 3. 2-Col Image
// 4. 2-Col Image + CTA
// 5. CTA Button
// 6. Disclaimer Copy
// 7. AMPscript Block
// 8. AMPscript Country Switcher
// ---------------------------------------------------------------------------
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  /* ============================================================
     0) TABLE WRAPPER (TOP-LEVEL ONLY)
     - Required container for all other modules.
     - Each wrapper exports its own <table> with background color.
  ============================================================ */
  {
    key: "table_wrapper",
    label: "Table Wrapper (Section)",
    fields: [
      {
        id: "bg",
        label: "Table Background Color (#HEX)",
        type: "text",
      },
    ],
    // NOTE: Table wrapper HTML is composed in useEmailBuilder.buildExportHtml,
    // because it must wrap its child modules. This is just a placeholder.
    renderHtml: () =>
      "<!-- Table Wrapper: HTML is assembled with child modules at export time. -->",
  },

  /* ============================================================
     1) FULL WIDTH IMAGE
  ============================================================ */
  {
    key: "image_full_width",
    label: "Full Width Image",
    fields: [
      { id: "image", label: "Image Filename or Full URL", type: "text" },
      { id: "image_title", label: "Image Title", type: "text" },

      // Business: alias is linked to Title (image_title -> link_alias)
      { id: "link", label: "Link URL", type: "text" },
      { id: "link_alias", label: "Link Alias", type: "text" },

      { id: "alt", label: "Alt Text", type: "text" },
    ],
    renderHtml: (v) => `
<!-- START ${v.image_title || ""} Image Full Width -->
<tr>
  <td style="padding:0;text-align:center;">
    <a href="${v.link || ""}" title="${v.image_title || ""}" alias="${
      v.link_alias || ""
    }" target="_blank" style="text-decoration:none;">
      <img src="${resolveSfmcImageUrl(v.image)}" alt="${v.alt || ""}" width="640" style="width:100%;height:auto;display:block;">
    </a>
  </td>
</tr>
<!-- END ${v.image_title || ""} Image Full Width -->
`,
  },

  /* ============================================================
     2) BODY COPY
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
     3) 2 COL IMAGE
  ============================================================ */
  {
  key: "image_grid_1x2",
  label: "2-Col Image",
  fields: [
    { id: "image_left", label: "Left Image Filename or URL", type: "text" },
    { id: "title_left", label: "Left Image Title", type: "text" },
    { id: "alias_left", label: "Left Link Alias", type: "text" },
    { id: "link_left", label: "Left Link URL", type: "text" },
    { id: "alt_left", label: "Left Alt Text", type: "text" },

    { id: "image_right", label: "Right Image Filename or URL", type: "text" },
    { id: "title_right", label: "Right Image Title", type: "text" },
    { id: "alias_right", label: "Right Link Alias", type: "text" },
    { id: "link_right", label: "Right Link URL", type: "text" },
    { id: "alt_right", label: "Right Alt Text", type: "text" },
  ],
  renderHtml: (v) => `
<!-- START 1x2 Image Column -->
<tr>
  <td align="center" valign="top" style="font-size:0; padding: 0px; border-collapse: collapse;text-align:center">
  <!--[if (gte mso 9)|(IE)]>
<table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
<tr>
<td align="center" valign="top" width="600">
<![endif]-->
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
    <tr>
      <td align="center" valign="top" style="font-size:0; padding-bottom: 0px;">
        <!--[if (gte mso 9)|(IE)]>
<table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
<tr>
<td align="left" valign="top" width="280">
<![endif]-->
        <div style="display:inline-block; max-width:50%; min-width:280px; vertical-align:top; width:100%;" class="mobile-wrapper">
          <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:280px;" class="max-width">
            <tr>
              <td align="center" valign="top" style="font-family: Arial; padding-top:0px;">
                <a href="${v.link_left || ""}" alias="${v.alias_left || ""}" title="${v.title_left || ""}">
                  <img src="${resolveSfmcImageUrl(v.image_left)}"
                       alt="${v.alt_left || ""}" width="280" height="auto" border="0" style="display: block; border: 0px; font-family: Arial; font-size: 18px;" class="img-max"/>
                </a>
              </td>
            </tr>
          </table>
        </div>
        <!--[if (gte mso 9)|(IE)]>
</td>
<td width="20" style="font-size: 1px;">&nbsp;</td>
<td align="right" valign="top" width="280">
<![endif]-->
        <div style="display:inline-block; max-width:50%; min-width:280px; vertical-align:top; width:100%;" class="mobile-wrapper">
          <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:280px; float: right;" class="max-width">
            <tr>
              <td align="center" valign="top" style="font-family: Arial; padding-top:0px;">
                <a href="${v.link_right || ""}" alias="${v.alias_right || ""}" title="${v.title_right || ""}">
                  <img src="${resolveSfmcImageUrl(v.image_right)}"
                       alt="${v.alt_right || ""}" width="280" height="auto" border="0" style="display: block; border: 0px; font-family: Arial; font-size: 18px;" class="img-max"/>
                </a>
              </td>
          </table>
        </div>
        <!--[if (gte mso 9)|(IE)]>
</td>
</tr>
</table>
<![endif]-->
      </td>
    </tr>
  </table>
  <!--[if (gte mso 9)|(IE)]>
</td>
</tr>
</table>
<![endif]-->
</td>
</tr>
  <!-- END 1x2 Image Column -->
`,
},

  /* ============================================================
     4) 2 COL IMAGE + CTA
  ============================================================ */
  {
  key: "image_grid_1x2_cta",
  label: "2-Col Image + CTA",
  fields: [
    { id: "image1_src", label: "Left Image Filename or URL", type: "text" },
    { id: "image1_title", label: "Left Image Title", type: "text" },
    { id: "image1_alias", label: "Left Link Alias", type: "text" },
    { id: "image1_link", label: "Left Link URL", type: "text" },
    { id: "image1_alt", label: "Left Alt Text", type: "text" },

    { id: "image1_btn_title", label: "Left Button Title", type: "text" },
    { id: "image1_btn_alias", label: "Left Button Alias", type: "text" },
    { id: "image1_btn_link", label: "Left Button URL", type: "text" },

    { id: "image2_src", label: "Right Image Filename or URL", type: "text" },
    { id: "image2_title", label: "Right Image Title", type: "text" },
    { id: "image2_alias", label: "Right Link Alias", type: "text" },
    { id: "image2_link", label: "Right Link URL", type: "text" },
    { id: "image2_alt", label: "Right Alt Text", type: "text" },

    { id: "image2_btn_title", label: "Right Button Title", type: "text" },
    { id: "image2_btn_alias", label: "Right Button Alias", type: "text" },
    { id: "image2_btn_link", label: "Right Button URL", type: "text" },
  ],

  renderHtml: (v) => `
<!-- START 1 of 2 Image  with Buttons Grid -->
<tr>
  <td align="center" valign="top" style="font-size:0; padding: 0px; border-collapse: collapse;text-align:center">
    <!--[if (gte mso 9)|(IE)]>
<table align="center" border="0" cellspacing="0" cellpadding="0" width="640" style="width="100%">
<tr>
<td align="center" valign="top" width="640">
<![endif]-->
    <table  role="presentation" width="100%"style="">
      <tr>
        <td align="center" valign="top" style="font-size:0;">
          <!--[if (gte mso 9)|(IE)]>
<table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
<tr>
<td align="left" valign="top" width="280">
<![endif]-->
          <div style="display:inline-block; max-width:50%; min-width:280px; vertical-align:top; width:100%;" class="mobile-wrapper">
            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;" class="max-width">
              <tr>
                <td align="center" valign="top" style="font-family: Arial; padding-top:24px;">
                  <a href="${v.image1_link || ""}" alias="${v.image1_alias || ""}" title="${v.image1_title || ""}">
            <img src="${resolveSfmcImageUrl(v.image1_src)}"
                 alt="${v.image1_alt || ""}"
                 width="300"
                 style="display:block;">
          </a>
                </td>
              </tr>
              <tr>
                <td>
                  <!-- END body text -->
                  <div style="text-align:center;padding: 10px 0;">
                    <center>
                      <table role="presentation" width="100%" >
                        <tr>
                          <td style="padding:10px;text-align:center;">
                            <p style="color:#499796;margin:0;font-family:Arial;">
                              <a href="${v.image1_btn_link || ""}" alias="${v.image1_btn_alias || ""}"
               style="font-family:Arial; font-size:18px; background:#FFFFFF;
                      border:3px solid #000; padding:14px 25px;
                      color:#000; text-decoration:none; display:inline-block;"><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]-->
                                <span style="mso-text-raise:10pt;font-weight:normal;color:#000000;">${v.image1_btn_title || ""}</span><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%">&nbsp;</i><![endif]--></a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </center>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <!--[if (gte mso 9)|(IE)]>
</td>
<td width="20" style="font-size: 1px;">&nbsp;</td>
<td align="right" valign="top" width="280">
<![endif]-->
             <!-- END 1 of 2 Image Grid -->
          
             <!-- START 2 of 2 Image Grid -->
          <div style="display:inline-block; max-width:50%; min-width:280px; vertical-align:top; width:100%;" class="mobile-wrapper">
            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px; float: right;" class="max-width">
              <tr>
                <td align="center" valign="top" style="font-family: Arial; padding-top: 24px;">
                  <a href="${v.image2_link || ""}" alias="${v.image2_alias || ""}" title="${v.image2_title || ""}">
            <img src="${resolveSfmcImageUrl(v.image2_src)}"
                 alt="${v.image2_alt || ""}"
                 width="300"
                 style="display:block;">
          </a>
                </td>
              </tr>
              <tr>
                <td>
                  <div style="text-align:center;padding: 10px 0;">
                    <center>
                      <table role="presentation" width="100%">
                        <tr>
                          <td style="padding:10px;text-align:center;">
                            <p style="color:#499796;margin:0;font-family:Arial;">
                              <a href="${v.image2_btn_link || ""}" alias="${v.image2_btn_alias || ""}"
               style="font-family:Arial; font-size:18px; background:#FFFFFF;
                      border:3px solid #000; padding:14px 25px;
                      color:#000; text-decoration:none; display:inline-block;">
                                <!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]-->
                                <span style="mso-text-raise:10pt;font-weight:normal;color:#000000;">${v.image2_btn_title || ""}</span><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%">&nbsp;</i><![endif]--></a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </center>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <!--[if (gte mso 9)|(IE)]>
</td>
</tr>
</table>
<![endif]-->
        </td>
      </tr>
    </table>
    <!--[if (gte mso 9)|(IE)]>
</td>
</tr>
</table>
<![endif]-->
  </td>
</tr>
<!-- END 1x2 Image  with Buttons  Grid -->
`,
},



  /* ============================================================
     5) CTA BUTTON
  ============================================================ */
  {
    key: "cta_button",
    label: "CTA Button",
    fields: [
      { id: "title", label: "Button Title", type: "text" },
      { id: "url", label: "Button URL", type: "text" },
      { id: "alias", label: "Button Alias", type: "text" },
    ],
    renderHtml: (v) => `
<!-- START Button -->
<tr>
  <td style="text-align:center;padding:20px;">
    <a href="${v.url || ""}" alias="${
      v.alias || ""
    }" style="font-family:Arial;font-size:18px;background:#fff;border:3px solid;padding:14px 25px;text-decoration:none;color:#000;display:inline-block;">
      ${v.title || ""}
    </a>
  </td>
</tr>
<!-- END Button -->
`,
  },

  /* ============================================================
     6) DISCLAIMER COPY
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
     7) RAW AMPSCRIPT BLOCK
  ============================================================ */
  {
    key: "ampscript_block",
    label: "AMPscript Block",
    fields: [
      { id: "code", label: "AMPscript / Dynamic Block", type: "code" },
    ],
    renderHtml: (v) => `
<!-- START AMPscript Block -->
${v.code || ""}
<!-- END AMPscript Block -->
`,
  },

  /* ============================================================
     8) AMPSCRIPT COUNTRY SWITCHER WRAPPER
  ============================================================ */
  {
    key: "ampscript_country",
    label: "AMPscript Country Switcher",
    fields: [
      {
        id: "note",
        label: "Drag content blocks into each country bucket.",
        type: "note",
      },
    ],
    renderHtml: () => `
<!-- AMPscript Country Switcher (content is injected externally during export) -->
`,
  },
];

// Map for quick lookup
export const MODULES_BY_KEY = Object.fromEntries(
  MODULE_DEFINITIONS.map((m) => [m.key, m])
);
