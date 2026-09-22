import { Canvas, Textbox, Rect, Circle, Triangle, Line, FabricImage, Path, Group, loadSVGFromURL, type FabricObject } from "fabric";
import type { BrandKitLayout } from "@/lib/types";

export type FabricObjectMetadata = {
  __isBackground?: boolean;
  name?: string;
};

/** Re-apply custom layer metadata that Fabric loadFromJSON does not preserve. */
export function applyImportedObjectMetadata(
  canvas: Canvas,
  json: Record<string, unknown>
): void {
  const jsonObjects = json.objects as Record<string, unknown>[] | undefined;
  if (!jsonObjects) return;

  const canvasObjects = canvas.getObjects();
  jsonObjects.forEach((jsonObj, index) => {
    const fabricObj = canvasObjects[index];
    if (!fabricObj) return;

    const metadata = jsonObj as FabricObjectMetadata & Record<string, unknown>;
    const extended = fabricObj as FabricObject & FabricObjectMetadata;

    if (metadata.name) extended.name = metadata.name;
    if (metadata.__isBackground) {
      extended.__isBackground = true;
      fabricObj.set({
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasControls: false,
        hasBorders: false,
      });
    }
  });
}

/** Scale background image layers to fill the canvas after import. */
export function fitBackgroundLayersToCanvas(canvas: Canvas): void {
  const canvasWidth = canvas.width ?? 0;
  const canvasHeight = canvas.height ?? 0;

  for (const obj of canvas.getObjects()) {
    const isBackground = (obj as FabricObject & FabricObjectMetadata).__isBackground;
    if (!isBackground) continue;

    const objWidth = obj.width ?? canvasWidth;
    const objHeight = obj.height ?? canvasHeight;
    if (objWidth <= 0 || objHeight <= 0) continue;

    obj.set({
      left: 0,
      top: 0,
      originX: "left",
      originY: "top",
      scaleX: canvasWidth / objWidth,
      scaleY: canvasHeight / objHeight,
    });
    obj.setCoords();
  }
}

export function addTextbox(canvas: Canvas, text: string, opts: Partial<{ fontSize: number; fontWeight: string; fill: string; fontFamily: string; left: number; top: number }> = {}) {
  const tb = new Textbox(text, {
    left: opts.left ?? canvas.width! / 2 - 100,
    top: opts.top ?? canvas.height! / 2 - 20,
    fontSize: opts.fontSize ?? 24,
    fontWeight: opts.fontWeight ?? "normal",
    fill: opts.fill ?? "#000000",
    fontFamily: opts.fontFamily ?? "Georgia",
    width: 300,
    textAlign: "center",
    editable: true,
  });
  canvas.add(tb);
  canvas.setActiveObject(tb);
  canvas.requestRenderAll();
}

export interface ComboItemOpts {
  text: string;
  fontSize: number;
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
}

/**
 * Creates multiple Textbox objects from combo items, stacks them vertically,
 * wraps them in a Fabric Group, and adds the group to the canvas.
 * The group moves, scales, rotates, and deletes as a single unit.
 * Double-click enters the group to edit individual text items.
 */
export function addTextComboGroup(canvas: Canvas, items: ComboItemOpts[]) {
  const groupWidth = 300;
  let currentTop = 0;

  const textObjects: Textbox[] = items.map((item) => {
    const tb = new Textbox(item.text, {
      left: 0,
      top: currentTop,
      width: groupWidth,
      fontSize: item.fontSize,
      fontWeight: item.fontWeight as string,
      fontFamily: item.fontFamily ?? "Georgia",
      fontStyle: (item.fontStyle as "normal" | "italic" | "oblique") ?? "normal",
      fill: item.fill ?? "#000000",
      textAlign: (item.textAlign ?? "center") as "left" | "center" | "right" | "justify",
      editable: true,
    });
    currentTop += item.fontSize + 16;
    return tb;
  });

  const group = new Group(textObjects, {
    left: canvas.width! / 2 - groupWidth / 2,
    top: canvas.height! / 2 - currentTop / 2,
    interactive: true,
    subTargetCheck: true,
  });

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
}

export function addRect(canvas: Canvas, filled: boolean) {
  const r = new Rect({
    left: canvas.width! / 2 - 50,
    top: canvas.height! / 2 - 40,
    width: 100,
    height: 80,
    fill: filled ? "#4f46e5" : "#c7d2fe",
    rx: 4,
    ry: 4,
  });
  canvas.add(r);
  canvas.setActiveObject(r);
  canvas.requestRenderAll();
}

export function addCircle(canvas: Canvas, filled: boolean) {
  const c = new Circle({
    left: canvas.width! / 2 - 30,
    top: canvas.height! / 2 - 30,
    radius: 30,
    fill: filled ? "#4f46e5" : "#c7d2fe",
  });
  canvas.add(c);
  canvas.setActiveObject(c);
  canvas.requestRenderAll();
}

export function addTriangle(canvas: Canvas, filled: boolean) {
  const t = new Triangle({
    left: canvas.width! / 2 - 30,
    top: canvas.height! / 2 - 30,
    width: 60,
    height: 60,
    fill: filled ? "#4f46e5" : "#c7d2fe",
  });
  canvas.add(t);
  canvas.setActiveObject(t);
  canvas.requestRenderAll();
}

export function addLine(canvas: Canvas, horizontal: boolean) {
  const half = canvas.width! / 2;
  const vmid = canvas.height! / 2;
  const coords: [number, number, number, number] = horizontal
    ? [half - 80, vmid, half + 80, vmid]
    : [half, vmid - 60, half, vmid + 60];
  const l = new Line(coords, { stroke: "#000000", strokeWidth: 2, strokeUniform: true });
  canvas.add(l);
  canvas.setActiveObject(l);
  canvas.requestRenderAll();
}

export function addSvgPath(canvas: Canvas, pathData: string, opts: { fill?: string; scale?: number } = {}) {
  const p = new Path(pathData, {
    left: canvas.width! / 2 - 30,
    top: canvas.height! / 2 - 30,
    fill: opts.fill ?? "#d97706",
    scaleX: opts.scale ?? 0.5,
    scaleY: opts.scale ?? 0.5,
  });
  canvas.add(p);
  canvas.setActiveObject(p);
  canvas.requestRenderAll();
}

export async function addSvgFromUrl(canvas: Canvas, url: string) {
  try {
    const { objects, options } = await loadSVGFromURL(url);
    const validObjects = objects.filter((obj): obj is FabricObject => obj !== null);
    if (validObjects.length === 0) return;

    const group = new Group(validObjects, {
      ...options,
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: "center",
      originY: "center",
    });
    
    // Scale to a reasonable size (e.g., 100px max dimension)
    const maxDim = 100;
    const scale = maxDim / Math.max(group.width!, group.height!);
    group.set({
      scaleX: scale,
      scaleY: scale,
    });

    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  } catch (error) {
    console.error("Error loading SVG from URL:", error);
  }
}

export async function addImageFromUrl(canvas: Canvas, url: string) {
  const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  const maxDim = Math.min(canvas.width!, canvas.height!) * 0.3;
  if (img.width! > maxDim || img.height! > maxDim) {
    const s = maxDim / Math.max(img.width!, img.height!);
    img.scaleX = s;
    img.scaleY = s;
  }
  img.set({ left: canvas.width! / 2 - (img.width! * (img.scaleX ?? 1)) / 2, top: canvas.height! / 2 - (img.height! * (img.scaleY ?? 1)) / 2 });
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
}

/**
 * Programmatically builds Fabric objects from a preset JSON structure
 * and adds them to the canvas. This avoids loadFromJSON which doesn't
 * reliably position objects from manually crafted JSON in Fabric.js v7.
 */
export function loadPresetOntoCanvas(
  canvas: Canvas,
  json: Record<string, unknown>
) {
  // Defensive reset to avoid stale pan/zoom transforms from prior states.
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.clear();

  if (json.background && typeof json.background === "string") {
    canvas.backgroundColor = json.background;
  }

  const objects = json.objects as Record<string, unknown>[] | undefined;
  if (!objects) { canvas.renderAll(); return; }

  console.group("[Builder] Loading preset onto canvas");
  console.log("canvasSize", { width: canvas.width, height: canvas.height });
  console.log("viewportTransform", canvas.viewportTransform);
  console.log("background", json.background);
  console.log("objectCount", objects.length);

  let outOfBoundsCount = 0;
  for (const obj of objects) {
    const fabricObj = createFabricObject(obj);
    if (fabricObj) {
      canvas.add(fabricObj);
      const b = fabricObj.getBoundingRect();
      const outside =
        b.left < -1 ||
        b.top < -1 ||
        b.left + b.width > (canvas.width ?? 0) + 1 ||
        b.top + b.height > (canvas.height ?? 0) + 1;

      if (outside) outOfBoundsCount++;
      console.log("[Builder] object", {
        type: fabricObj.type,
        left: fabricObj.left,
        top: fabricObj.top,
        width: fabricObj.width,
        height: fabricObj.height,
        scaleX: fabricObj.scaleX,
        scaleY: fabricObj.scaleY,
        bbox: b,
        outside,
      });
    }
  }

  // Auto-fit preset content if any object overflows the canvas.
  fitObjectsIntoCanvas(canvas, 12);

  canvas.renderAll();
  console.log("[Builder] Render complete", {
    outOfBoundsCount,
    finalObjectCount: canvas.getObjects().length,
    finalViewportTransform: canvas.viewportTransform,
  });
  if (outOfBoundsCount > 0) {
    console.warn("[Builder] Some objects are out of bounds", {
      outOfBoundsCount,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });
  } else {
    console.info("[Builder] All objects within canvas bounds", {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });
  }
  console.groupEnd();
}

function fitObjectsIntoCanvas(canvas: Canvas, margin = 12) {
  const objs = canvas.getObjects();
  if (objs.length === 0) return;

  const bounds = getObjectsBounds(canvas);
  if (!bounds) return;

  const canvasWidth = canvas.width ?? 0;
  const canvasHeight = canvas.height ?? 0;
  const availableW = Math.max(canvasWidth - margin * 2, 1);
  const availableH = Math.max(canvasHeight - margin * 2, 1);
  const contentW = Math.max(bounds.maxX - bounds.minX, 1);
  const contentH = Math.max(bounds.maxY - bounds.minY, 1);

  const needsFit =
    bounds.minX < margin ||
    bounds.minY < margin ||
    bounds.maxX > canvasWidth - margin ||
    bounds.maxY > canvasHeight - margin;

  if (!needsFit) return;

  const scale = Math.min(availableW / contentW, availableH / contentH, 1);

  for (const obj of objs) {
    const left = obj.left ?? 0;
    const top = obj.top ?? 0;
    obj.set({
      left: (left - bounds.minX) * scale + margin,
      top: (top - bounds.minY) * scale + margin,
      scaleX: (obj.scaleX ?? 1) * scale,
      scaleY: (obj.scaleY ?? 1) * scale,
    });
    obj.setCoords();
  }

  console.info("[Builder] Applied auto-fit to preset content", {
    scale,
    fromBounds: bounds,
    canvasWidth,
    canvasHeight,
    margin,
  });
}

function getObjectsBounds(canvas: Canvas) {
  const objs = canvas.getObjects();
  if (objs.length === 0) return null;

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const obj of objs) {
    const b = obj.getBoundingRect();
    minX = Math.min(minX, b.left);
    minY = Math.min(minY, b.top);
    maxX = Math.max(maxX, b.left + b.width);
    maxY = Math.max(maxY, b.top + b.height);
  }

  return { minX, minY, maxX, maxY };
}

function createFabricObject(obj: Record<string, unknown>): FabricObject | null {
  const { type, ...props } = obj;

  switch (type) {
    case "Textbox": {
      const { text, ...rest } = props;
      return new Textbox((text as string) ?? "", rest);
    }
    case "Rect": {
      return new Rect(props);
    }
    case "Circle": {
      return new Circle(props);
    }
    case "Triangle": {
      return new Triangle(props);
    }
    case "Line": {
      const { x1 = 0, y1 = 0, x2 = 100, y2 = 0, ...rest } = props;
      return new Line(
        [x1 as number, y1 as number, x2 as number, y2 as number],
        rest
      );
    }
    case "Path": {
      const { path: pathData, ...rest } = props;
      if (typeof pathData === "string") return new Path(pathData, rest);
      return null;
    }
    case "Image":
    case "image": {
      const { src, ...rest } = props;
      if (typeof window !== "undefined") {
        const imgEl = document.createElement("img");
        imgEl.crossOrigin = "anonymous";
        imgEl.src = (src as string) || "";
        const fabricImg = new FabricImage(imgEl, rest);
        imgEl.onload = () => {
          fabricImg.canvas?.requestRenderAll();
        };
        return fabricImg;
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Definitive percentage-based position map.
 * Each entry maps a position string to { xPct, yPct } where 0 = left/top edge
 * and 1 = right/bottom edge. The element is then placed so its center aligns
 * with this percentage point, clamped to stay within canvas bounds.
 *
 * This replaces the old keyword-matching approach that produced incorrect
 * coordinates for compound position strings.
 */
const POSITION_PCT_MAP: Record<string, { xPct: number; yPct: number }> = {
  // ── Top row ──
  "top-left":                    { xPct: 0.08, yPct: 0.06 },
  "top-center":                  { xPct: 0.50, yPct: 0.06 },
  "top-center-large":            { xPct: 0.50, yPct: 0.06 },
  "top-center-spanning":         { xPct: 0.50, yPct: 0.06 },
  "top-center-above-heading":    { xPct: 0.50, yPct: 0.03 },
  "top-center-below-heading":    { xPct: 0.50, yPct: 0.20 },
  "top-right":                   { xPct: 0.92, yPct: 0.06 },
  "top-left-large":              { xPct: 0.15, yPct: 0.06 },
  "top-left-below-heading":      { xPct: 0.15, yPct: 0.20 },
  "top-half":                    { xPct: 0.50, yPct: 0.20 },

  // ── Top banner ──
  "top-banner-center":           { xPct: 0.50, yPct: 0.05 },
  "top-banner-left":             { xPct: 0.08, yPct: 0.05 },
  "top-banner-right":            { xPct: 0.92, yPct: 0.05 },
  "below-banner-center":         { xPct: 0.50, yPct: 0.18 },

  // ── Center region ──
  "center-left":                 { xPct: 0.15, yPct: 0.50 },
  "center":                      { xPct: 0.50, yPct: 0.50 },
  "center-right":                { xPct: 0.85, yPct: 0.50 },
  "center-upper":                { xPct: 0.50, yPct: 0.38 },
  "center-full-width":           { xPct: 0.50, yPct: 0.45 },
  "upper-center":                { xPct: 0.50, yPct: 0.32 },
  "middle-center":               { xPct: 0.50, yPct: 0.52 },
  "center-below-subtitle":       { xPct: 0.50, yPct: 0.58 },

  // ── Left panel ──
  "left-top":                    { xPct: 0.08, yPct: 0.08 },
  "left-center":                 { xPct: 0.08, yPct: 0.50 },
  "left-bottom":                 { xPct: 0.08, yPct: 0.88 },
  "left-center-heading":         { xPct: 0.08, yPct: 0.42 },
  "left-below-heading":          { xPct: 0.08, yPct: 0.55 },

  // ── Right panel ──
  "right-top":                   { xPct: 0.85, yPct: 0.08 },
  "right-center":                { xPct: 0.85, yPct: 0.50 },
  "right-bottom":                { xPct: 0.85, yPct: 0.88 },
  "right-half-diagonal":         { xPct: 0.70, yPct: 0.30 },
  "right-large":                 { xPct: 0.72, yPct: 0.50 },
  "right-column-full-height":    { xPct: 0.82, yPct: 0.50 },

  // ── Bottom row ──
  "bottom-left":                 { xPct: 0.08, yPct: 0.88 },
  "bottom-center":               { xPct: 0.50, yPct: 0.88 },
  "bottom-center-above-heading": { xPct: 0.50, yPct: 0.78 },
  "bottom-right":                { xPct: 0.92, yPct: 0.88 },
  "bottom-center-inside-frame":  { xPct: 0.50, yPct: 0.85 },
  "center-bottom-inside-frame":  { xPct: 0.50, yPct: 0.85 },
  "center-top-inside-frame":     { xPct: 0.50, yPct: 0.12 },

  // ── Full / special ──
  "full-background":             { xPct: 0.50, yPct: 0.50 },

  // ── Card overlays ──
  "card-top-center":             { xPct: 0.50, yPct: 0.25 },
  "card-center":                 { xPct: 0.50, yPct: 0.50 },
  "card-top-left":               { xPct: 0.30, yPct: 0.25 },
  "card-bottom-center":          { xPct: 0.50, yPct: 0.75 },

  // ── Grid (image-specific, handled specially in skeleton builder) ──
  "grid-cells":                  { xPct: 0.50, yPct: 0.50 },
};

/**
 * Maps a layout position string to canvas coordinates using the percentage-based
 * lookup map. The element's center is placed at the percentage point, then
 * clamped to keep fully inside the canvas with padding.
 */
function positionToCoords(
  position: string,
  canvasWidth: number,
  canvasHeight: number,
  elementWidth: number,
  elementHeight: number
): { left: number; top: number } {
  const pad = Math.round(Math.min(canvasWidth, canvasHeight) * 0.025);
  const minPad = Math.max(pad, 12);

  const entry = POSITION_PCT_MAP[position];

  let x: number;
  let y: number;

  if (entry) {
    // Place element so its center aligns with the percentage point
    x = canvasWidth * entry.xPct - elementWidth / 2;
    y = canvasHeight * entry.yPct - elementHeight / 2;
  } else {
    // Fallback: parse keywords for unknown position strings
    const p = position.toLowerCase();
    x = p.includes("left") ? minPad : p.includes("right") ? canvasWidth - elementWidth - minPad : (canvasWidth - elementWidth) / 2;
    y = p.includes("top") ? minPad : p.includes("bottom") ? canvasHeight - elementHeight - minPad : (canvasHeight - elementHeight) / 2;
  }

  // Clamp to canvas bounds
  const maxX = canvasWidth - elementWidth - minPad;
  const maxY = canvasHeight - elementHeight - minPad;
  x = Math.round(Math.max(minPad, Math.min(x, maxX)));
  y = Math.round(Math.max(minPad, Math.min(y, maxY)));

  return { left: x, top: y };
}

/**
 * Checks if two rectangles overlap.
 */
function rectsOverlap(
  a: { left: number; top: number; w: number; h: number },
  b: { left: number; top: number; w: number; h: number }
): boolean {
  return (
    a.left < b.left + b.w &&
    a.left + a.w > b.left &&
    a.top < b.top + b.h &&
    a.top + a.h > b.top
  );
}

/**
 * Resolves overlap between a new element and all already-placed elements.
 * Tries shifting down first, then right, using the minimum displacement needed.
 */
function resolveOverlapMulti(
  placed: { left: number; top: number; w: number; h: number }[],
  b: { left: number; top: number; w: number; h: number },
  canvasWidth: number,
  canvasHeight: number
): { left: number; top: number } {
  const pad = Math.round(Math.min(canvasWidth, canvasHeight) * 0.025);
  const minPad = Math.max(pad, 12);
  const gap = 8;

  let current = { left: b.left, top: b.top };

  for (let iteration = 0; iteration < 10; iteration++) {
    const currentBox = { ...b, left: current.left, top: current.top };
    const collider = placed.find((p) => rectsOverlap(p, currentBox));
    if (!collider) break;

    // Try shifting below the collider
    const belowTop = collider.top + collider.h + gap;
    if (belowTop + b.h <= canvasHeight - minPad) {
      current = { left: current.left, top: Math.round(belowTop) };
      continue;
    }

    // Try shifting to the right of the collider
    const rightLeft = collider.left + collider.w + gap;
    if (rightLeft + b.w <= canvasWidth - minPad) {
      current = { left: Math.round(rightLeft), top: current.top };
      continue;
    }

    // Try shifting to the left of the collider
    const leftLeft = collider.left - b.w - gap;
    if (leftLeft >= minPad) {
      current = { left: Math.round(leftLeft), top: current.top };
      continue;
    }

    // Last resort: shift below and reset X to padding
    current = {
      left: minPad,
      top: Math.round(Math.min(belowTop, canvasHeight - b.h - minPad)),
    };
    break;
  }

  // Final clamp
  current.left = Math.round(Math.max(minPad, Math.min(current.left, canvasWidth - b.w - minPad)));
  current.top = Math.round(Math.max(minPad, Math.min(current.top, canvasHeight - b.h - minPad)));
  return current;
}

/** Compute actual rendered width of a text string for a given font size */
function estimateTextWidth(text: string, fontSize: number, fontFamily: string): number {
  // Rough heuristic: average character width ≈ 0.55 × fontSize for serif fonts
  const charWidth = fontFamily.toLowerCase().includes("georgia") ? 0.58 : 0.55;
  return text.length * fontSize * charWidth;
}

/**
 * Builds a skeleton layout on the canvas with placeholder elements
 * based on the selected layout positions.
 *
 * Special image positions (grid-cells, full-background, right-column-full-height,
 * right-large, top-half) produce the correct structural representation that
 * matches the sidebar preview thumbnails.
 */
export function buildLayoutSkeleton(canvas: Canvas, layout: BrandKitLayout): void {
  const W = canvas.width ?? 800;
  const H = canvas.height ?? 600;
  const pad = Math.round(Math.min(W, H) * 0.025);
  const minPad = Math.max(pad, 12);

  // Base sizes as percentages of canvas
  const headingFontSize = Math.max(14, Math.round(Math.min(W, H) * 0.045));
  const subtitleFontSize = Math.max(11, Math.round(Math.min(W, H) * 0.028));
  const logoSize = Math.round(Math.min(W, H) * 0.09);
  const iconSize = Math.round(Math.min(W, H) * 0.035);

  // Widths: ensure text fits in one line
  const headingText = "Certificate of Achievement";
  const neededHeadingW = estimateTextWidth(headingText, headingFontSize, "Georgia") + 20;
  const headingW = Math.min(Math.round(W * 0.85), Math.max(Math.round(W * 0.5), neededHeadingW));

  // For "spanning" headings, use full width
  const isSpanning = layout.headingPosition.includes("spanning");
  const effectiveHeadingW = isSpanning ? Math.round(W - minPad * 2) : headingW;

  const subtitleText = "This is to certify that";
  const neededSubtitleW = estimateTextWidth(subtitleText, subtitleFontSize, "Georgia") + 20;
  const subtitleW = Math.min(Math.round(W * 0.7), Math.max(Math.round(W * 0.4), neededSubtitleW));

  // Default image dimensions (may be overridden for special positions)
  const defaultImageW = Math.min(Math.round(W * 0.35), W - 80);
  const defaultImageH = Math.min(Math.round(H * 0.22), H - 80);

  // Clear existing objects (except backgrounds)
  const objects = canvas.getObjects();
  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];
    if (!(obj as FabricObject & { __isBackground?: boolean }).__isBackground) {
      canvas.remove(obj);
    }
  }

  // --- Placed elements tracker for overlap resolution ---
  const placed: { left: number; top: number; w: number; h: number }[] = [];

  // --- Compute positions and resolve overlaps ---
  const headingH = headingFontSize + 12;
  const subtitleH = subtitleFontSize + 12;

  // 1. Heading (placed first, highest priority)
  const headingPos = positionToCoords(layout.headingPosition, W, H, effectiveHeadingW, headingH);
  placed.push({ left: headingPos.left, top: headingPos.top, w: effectiveHeadingW, h: headingH });

  // 2. Logo
  let logoPos = positionToCoords(layout.logoPosition, W, H, logoSize, logoSize);
  logoPos = resolveOverlapMulti(placed, { left: logoPos.left, top: logoPos.top, w: logoSize, h: logoSize }, W, H);
  placed.push({ left: logoPos.left, top: logoPos.top, w: logoSize, h: logoSize });

  // 3. Subtitle
  let subtitlePos = positionToCoords(layout.subtitlePosition, W, H, subtitleW, subtitleH);
  subtitlePos = resolveOverlapMulti(placed, { left: subtitlePos.left, top: subtitlePos.top, w: subtitleW, h: subtitleH }, W, H);
  placed.push({ left: subtitlePos.left, top: subtitlePos.top, w: subtitleW, h: subtitleH });

  // 4. Image — special handling based on position type
  const imgPosition = layout.imagePosition;

  // 5. Icons
  const iconTotalW = iconSize * 2 + Math.max(4, Math.round(iconSize * 0.2));
  let iconPos = positionToCoords(layout.iconPosition, W, H, iconTotalW, iconSize);
  // Icons overlap-resolved after image is placed (below)

  // --- Create objects ---

  // Heading
  const heading = new Textbox(headingText, {
    left: headingPos.left,
    top: headingPos.top,
    fontSize: headingFontSize,
    fontWeight: "bold",
    fill: "#1f2937",
    fontFamily: "Georgia",
    width: effectiveHeadingW,
    textAlign: "center",
    editable: true,
    name: "heading",
  });
  canvas.add(heading);

  // Subtitle
  const subtitle = new Textbox(subtitleText, {
    left: subtitlePos.left,
    top: subtitlePos.top,
    fontSize: subtitleFontSize,
    fontWeight: "normal",
    fill: "#6b7280",
    fontFamily: "Georgia",
    width: subtitleW,
    textAlign: "center",
    editable: true,
    name: "subtitle",
  });
  canvas.add(subtitle);

  // Logo (grouped with its label so they move together)
  const logoLabelFS = Math.max(7, Math.round(logoSize * 0.18));
  const logoGroup = new Group([
    new Circle({
      left: 0,
      top: 0,
      radius: logoSize / 2,
      fill: "#f3f4f6",
      stroke: "#d1d5db",
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      name: "logo",
    }),
    new Textbox("Logo", {
      left: logoSize * 0.2,
      top: logoSize * 0.35,
      fontSize: logoLabelFS,
      fill: "#9ca3af",
      fontFamily: "Arial",
      width: logoSize * 0.6,
      textAlign: "center",
      editable: false,
      selectable: false,
      evented: false,
      name: "logo-label",
    }),
  ], {
    left: logoPos.left,
    top: logoPos.top,
    subTargetCheck: true,
  });
  (logoGroup as FabricObject & { name?: string }).name = "logo-group";
  canvas.add(logoGroup);

  // Image — structural variants based on position type
  const imageLabelFS = Math.max(8, Math.round(Math.min(W, H) * 0.02));

  if (imgPosition === "grid-cells") {
    // --- Grid Mosaic: 3 equal cells in a row (each cell grouped with its label) ---
    const gridGap = Math.round(W * 0.025);
    const cellW = Math.round((W - minPad * 2 - gridGap * 2) / 3);
    const cellH = Math.round(H * 0.28);
    const gridY = Math.round(H * 0.42);

    for (let i = 0; i < 3; i++) {
      const cellX = minPad + i * (cellW + gridGap);
      const cellGroup = new Group([
        new Rect({
          left: 0,
          top: 0,
          width: cellW,
          height: cellH,
          fill: "#f0f9ff",
          stroke: "#bae6fd",
          strokeWidth: 1.5,
          strokeDashArray: [6, 3],
          rx: 6,
          ry: 6,
          name: `image-cell-${i + 1}`,
        }),
        new Textbox(`Image ${i + 1}`, {
          left: cellW / 2 - 22,
          top: cellH / 2 - 6,
          fontSize: Math.max(7, imageLabelFS - 1),
          fill: "#7dd3fc",
          fontFamily: "Arial",
          width: 44,
          textAlign: "center",
          editable: false,
          selectable: false,
          evented: false,
          name: `image-cell-label-${i + 1}`,
        }),
      ], {
        left: cellX,
        top: gridY,
        subTargetCheck: true,
      });
      (cellGroup as FabricObject & { name?: string }).name = `image-cell-group-${i + 1}`;
      canvas.add(cellGroup);
      placed.push({ left: cellX, top: gridY, w: cellW, h: cellH });
    }
  } else if (imgPosition === "full-background") {
    // --- Full background: fills the entire canvas (no label needed) ---
    const bg = new Rect({
      left: 0,
      top: 0,
      width: W,
      height: H,
      fill: "#f0f9ff",
      stroke: "transparent",
      strokeWidth: 0,
      name: "image-background",
      selectable: true,
      evented: true,
    });
    canvas.add(bg);
    canvas.sendObjectToBack(bg);
  } else if (imgPosition === "right-column-full-height") {
    const colW = Math.round(W * 0.30);
    const colH = Math.round(H - minPad * 2);
    const colX = W - colW - minPad;
    const colY = minPad;
    const colGroup = new Group([
      new Rect({ left: 0, top: 0, width: colW, height: colH, fill: "#f0f9ff", stroke: "#bae6fd", strokeWidth: 1.5, strokeDashArray: [8, 4], rx: 8, ry: 8, name: "image" }),
      new Textbox("Image", { left: colW / 2 - 20, top: colH / 2 - 6, fontSize: imageLabelFS, fill: "#7dd3fc", fontFamily: "Arial", width: 40, textAlign: "center", editable: false, selectable: false, evented: false, name: "image-label" }),
    ], { left: colX, top: colY, subTargetCheck: true });
    (colGroup as FabricObject & { name?: string }).name = "image-group";
    canvas.add(colGroup);
    placed.push({ left: colX, top: colY, w: colW, h: colH });
  } else if (imgPosition === "right-large") {
    const panelW = Math.round(W * 0.40);
    const panelH = Math.round(H * 0.65);
    const panelX = W - panelW - minPad;
    const panelY = Math.round((H - panelH) / 2);
    const panelGroup = new Group([
      new Rect({ left: 0, top: 0, width: panelW, height: panelH, fill: "#f0f9ff", stroke: "#bae6fd", strokeWidth: 1.5, strokeDashArray: [8, 4], rx: 8, ry: 8, name: "image" }),
      new Textbox("Image", { left: panelW / 2 - 20, top: panelH / 2 - 6, fontSize: imageLabelFS, fill: "#7dd3fc", fontFamily: "Arial", width: 40, textAlign: "center", editable: false, selectable: false, evented: false, name: "image-label" }),
    ], { left: panelX, top: panelY, subTargetCheck: true });
    (panelGroup as FabricObject & { name?: string }).name = "image-group";
    canvas.add(panelGroup);
    placed.push({ left: panelX, top: panelY, w: panelW, h: panelH });
  } else if (imgPosition === "top-half") {
    const halfW = Math.round(W - minPad * 2);
    const halfH = Math.round(H * 0.38);
    const halfX = minPad;
    const halfY = minPad;
    const halfGroup = new Group([
      new Rect({ left: 0, top: 0, width: halfW, height: halfH, fill: "#f0f9ff", stroke: "#bae6fd", strokeWidth: 1.5, strokeDashArray: [8, 4], rx: 8, ry: 8, name: "image" }),
      new Textbox("Image", { left: halfW / 2 - 20, top: halfH / 2 - 6, fontSize: imageLabelFS, fill: "#7dd3fc", fontFamily: "Arial", width: 40, textAlign: "center", editable: false, selectable: false, evented: false, name: "image-label" }),
    ], { left: halfX, top: halfY, subTargetCheck: true });
    (halfGroup as FabricObject & { name?: string }).name = "image-group";
    canvas.add(halfGroup);
    placed.push({ left: halfX, top: halfY, w: halfW, h: halfH });
  } else if (imgPosition === "center-full-width") {
    const bandW = Math.round(W - minPad * 2);
    const bandH = Math.round(H * 0.30);
    const bandX = minPad;
    const bandY = Math.round((H - bandH) / 2);
    const bandGroup = new Group([
      new Rect({ left: 0, top: 0, width: bandW, height: bandH, fill: "#f0f9ff", stroke: "#bae6fd", strokeWidth: 1.5, strokeDashArray: [8, 4], rx: 8, ry: 8, name: "image" }),
      new Textbox("Image", { left: bandW / 2 - 20, top: bandH / 2 - 6, fontSize: imageLabelFS, fill: "#7dd3fc", fontFamily: "Arial", width: 40, textAlign: "center", editable: false, selectable: false, evented: false, name: "image-label" }),
    ], { left: bandX, top: bandY, subTargetCheck: true });
    (bandGroup as FabricObject & { name?: string }).name = "image-group";
    canvas.add(bandGroup);
    placed.push({ left: bandX, top: bandY, w: bandW, h: bandH });
  } else if (imgPosition === "right-half-diagonal") {
    const diagW = Math.round(W * 0.38);
    const diagH = Math.round(H * 0.50);
    const clampedX = Math.min(Math.round(W * 0.58), W - diagW - minPad);
    const clampedY = Math.min(Math.round(H * 0.22), H - diagH - minPad);
    const diagGroup = new Group([
      new Rect({ left: 0, top: 0, width: diagW, height: diagH, fill: "#f0f9ff", stroke: "#bae6fd", strokeWidth: 1.5, strokeDashArray: [8, 4], rx: 8, ry: 8, name: "image" }),
      new Textbox("Image", { left: diagW / 2 - 20, top: diagH / 2 - 6, fontSize: imageLabelFS, fill: "#7dd3fc", fontFamily: "Arial", width: 40, textAlign: "center", editable: false, selectable: false, evented: false, name: "image-label" }),
    ], { left: clampedX, top: clampedY, subTargetCheck: true });
    (diagGroup as FabricObject & { name?: string }).name = "image-group";
    canvas.add(diagGroup);
    placed.push({ left: clampedX, top: clampedY, w: diagW, h: diagH });
  } else {
    // --- Default: standard rectangle (grouped with label) ---
    let imagePos = positionToCoords(imgPosition, W, H, defaultImageW, defaultImageH);
    imagePos = resolveOverlapMulti(placed, { left: imagePos.left, top: imagePos.top, w: defaultImageW, h: defaultImageH }, W, H);

    const imageGroup = new Group([
      new Rect({
        left: 0,
        top: 0,
        width: defaultImageW,
        height: defaultImageH,
        fill: "#f9fafb",
        stroke: "#d1d5db",
        strokeWidth: 2,
        strokeDashArray: [8, 4],
        rx: 8,
        ry: 8,
        name: "image",
      }),
      new Textbox("Image", {
        left: defaultImageW / 2 - 20,
        top: defaultImageH / 2 - 6,
        fontSize: imageLabelFS,
        fill: "#9ca3af",
        fontFamily: "Arial",
        width: 40,
        textAlign: "center",
        editable: false,
        selectable: false,
        evented: false,
        name: "image-label",
      }),
    ], {
      left: imagePos.left,
      top: imagePos.top,
      subTargetCheck: true,
    });
    (imageGroup as FabricObject & { name?: string }).name = "image-group";
    canvas.add(imageGroup);
    placed.push({ left: imagePos.left, top: imagePos.top, w: defaultImageW, h: defaultImageH });
  }

  // Icons — resolve overlap against all placed elements
  iconPos = resolveOverlapMulti(placed, { left: iconPos.left, top: iconPos.top, w: iconTotalW, h: iconSize }, W, H);

  const iconsGap = Math.max(4, Math.round(iconSize * 0.2));
  const icon1 = new Circle({
    left: iconPos.left,
    top: iconPos.top,
    radius: iconSize / 2,
    fill: "#ecfdf5",
    stroke: "#a7f3d0",
    strokeWidth: 1.5,
    name: "icon-1",
  });
  canvas.add(icon1);
  const icon2 = new Circle({
    left: iconPos.left + iconSize + iconsGap,
    top: iconPos.top,
    radius: iconSize / 2,
    fill: "#ecfdf5",
    stroke: "#a7f3d0",
    strokeWidth: 1.5,
    name: "icon-2",
  });
  canvas.add(icon2);

  // --- Final boundary clamp pass for all objects ---
  for (const obj of canvas.getObjects()) {
    const ext = obj as FabricObject & FabricObjectMetadata;
    if (ext.__isBackground) continue;
    if (ext.name === "image-background") continue;

    const br = obj.getBoundingRect();
    const objW = br.width;
    const objH = br.height;
    const dL = (obj.left ?? 0) - br.left;
    const dT = (obj.top ?? 0) - br.top;

    let needsClamp = false;
    let newLeft = obj.left ?? 0;
    let newTop = obj.top ?? 0;

    if (br.left < 0) { newLeft = dL; needsClamp = true; }
    if (br.top < 0) { newTop = dT; needsClamp = true; }
    if (br.left + objW > W) { newLeft = W - objW + dL; needsClamp = true; }
    if (br.top + objH > H) { newTop = H - objH + dT; needsClamp = true; }

    if (needsClamp) {
      obj.set({ left: Math.round(newLeft), top: Math.round(newTop) });
      obj.setCoords();
    }
  }

  canvas.requestRenderAll();
}
