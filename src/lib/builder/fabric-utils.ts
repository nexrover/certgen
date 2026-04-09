import { Canvas, Textbox, Rect, Circle, Triangle, Line, FabricImage, Path, type FabricObject } from "fabric";

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

export function addRect(canvas: Canvas, filled: boolean) {
  const r = new Rect({
    left: canvas.width! / 2 - 50,
    top: canvas.height! / 2 - 40,
    width: 100,
    height: 80,
    fill: filled ? "#4f46e5" : "transparent",
    stroke: "#4f46e5",
    strokeWidth: 2,
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
    fill: filled ? "#4f46e5" : "transparent",
    stroke: "#4f46e5",
    strokeWidth: 2,
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
    fill: filled ? "#4f46e5" : "transparent",
    stroke: "#4f46e5",
    strokeWidth: 2,
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
  const l = new Line(coords, { stroke: "#000000", strokeWidth: 2 });
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
    default:
      return null;
  }
}
