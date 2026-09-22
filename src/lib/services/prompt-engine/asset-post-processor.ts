import type { InjectedAsset } from "./types";
import { ASSET_PLACEHOLDER_PREFIX, assetPlaceholderName } from "./asset-injector";

/* ──────────────────────────────────────────────────────────
 * Asset Post-Processor
 *
 * After the AI generates canvas JSON with named Rect placeholders,
 * this module scans the object tree and replaces each placeholder
 * with an actual Fabric.js Image object that references the real
 * asset URL.
 *
 * The AI creates:  { type: "Rect", name: "__ASSET_LOGO_0__", ... }
 * This replaces it: { type: "image", src: "https://...", name: "__ASSET_LOGO_0__", crossOrigin: "anonymous", ... }
 * ────────────────────────────────────────────────────────── */

/**
 * Scans canvasJson.objects for named asset placeholders and replaces
 * them with Fabric.js Image objects using the corresponding asset URLs.
 *
 * Returns the count of replacements made.
 */
export function injectAssetsIntoCanvas(
  canvasJson: Record<string, unknown>,
  assets: InjectedAsset[]
): number {
  if (!canvasJson || !Array.isArray(canvasJson.objects) || assets.length === 0) {
    return 0;
  }

  // Build a lookup map: placeholder name → asset URL
  const urlMap = new Map<string, string>();
  const logos = assets.filter((a) => a.kind === "logo");
  const elements = assets.filter((a) => a.kind === "element");
  const images = assets.filter((a) => a.kind === "image");

  logos.forEach((a, i) => {
    urlMap.set(assetPlaceholderName("logo", i), a.url);
  });
  elements.forEach((a, i) => {
    urlMap.set(assetPlaceholderName("element", i), a.url);
  });
  images.forEach((a, i) => {
    urlMap.set(assetPlaceholderName("image", i), a.url);
  });

  let replacements = 0;

  canvasJson.objects = (canvasJson.objects as Record<string, unknown>[]).map((obj) => {
    const name = typeof obj.name === "string" ? obj.name : "";

    // Check if this object is a named asset placeholder
    if (name.startsWith(ASSET_PLACEHOLDER_PREFIX) && urlMap.has(name)) {
      const src = urlMap.get(name)!;

      // Determine original dimensions from the placeholder Rect
      const origW = typeof obj.width === "number" ? obj.width : 200;
      const origH = typeof obj.height === "number" ? obj.height : 150;

      // Determine asset kind from the placeholder name
      const isLogo = name.includes("LOGO");
      const isImage = name.includes("IMAGE");

      // Build a Fabric.js Image object
      const imageObj: Record<string, unknown> = {
        type: "image",
        src,
        crossOrigin: "anonymous",
        name,
        left: obj.left ?? 0,
        top: obj.top ?? 0,
        originX: obj.originX ?? "left",
        originY: obj.originY ?? "top",
        width: origW,
        height: origH,
        selectable: obj.selectable ?? true,
        opacity: obj.opacity ?? 1,
      };

      // Preserve angle if set
      if (typeof obj.angle === "number" && obj.angle !== 0) {
        imageObj.angle = obj.angle;
      }

      // For logos, keep smaller; for images, scale to fill the placeholder area
      if (isLogo) {
        // Logos: use as-is, the AI already sized the placeholder appropriately
        imageObj.scaleX = 1;
        imageObj.scaleY = 1;
      } else if (isImage) {
        // Images: scale to fill the placeholder bounding box
        imageObj.scaleX = 1;
        imageObj.scaleY = 1;
      } else {
        // Elements: decorative, keep as-is
        imageObj.scaleX = 1;
        imageObj.scaleY = 1;
      }

      replacements++;
      return imageObj;
    }

    return obj;
  });

  if (replacements > 0) {
    console.log(`[Asset Post-Processor] Replaced ${replacements} placeholder(s) with Image objects`);
  }

  return replacements;
}
