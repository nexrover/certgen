"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type Canvas, FabricImage, Rect, Shadow, Path, filters } from "fabric";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  LuCrop,
  LuFlipHorizontal2,
  LuFlipVertical2,
  LuSunDim,
  LuMove,
  LuSquare,
  LuUndo2,
  LuRedo2,
  LuMaximize,
  LuWand,
} from "react-icons/lu";
import { MdBlurOn } from "react-icons/md";

/* ── Types ────────────────────────────────────────────── */

interface ImageEditToolbarProps {
  canvas: Canvas | null;
  onUndo: () => void;
  onRedo: () => void;
}

type ShadowPreset = "none" | "glow" | "drop" | "outline" | "backdrop";

interface ShadowState {
  preset: ShadowPreset;
  blur: number;
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
}

const DEFAULT_SHADOW: ShadowState = {
  preset: "none",
  blur: 10,
  offsetX: 4,
  offsetY: 4,
  color: "#000000",
  opacity: 50,
};

type BorderRadiusPreset =
  | "all"
  | "tl-br"
  | "tr-bl"
  | "top"
  | "bottom"
  | "tr"
  | "tl"
  | "br"
  | "bl";

const BORDER_RADIUS_PRESETS: { value: BorderRadiusPreset; label: string }[] = [
  { value: "all", label: "All corners rounded" },
  { value: "tl-br", label: "Top-left & Bottom-right" },
  { value: "tr-bl", label: "Top-right & Bottom-left" },
  { value: "top", label: "Top corners" },
  { value: "bottom", label: "Bottom corners" },
  { value: "tr", label: "Top-right" },
  { value: "tl", label: "Top-left" },
  { value: "br", label: "Bottom-right" },
  { value: "bl", label: "Bottom-left" },
];

function getRoundedRectPath(w: number, h: number, r: number, preset: BorderRadiusPreset): string {
  if (r === 0) {
    return `M ${-w / 2} ${-h / 2} h ${w} v ${h} h ${-w} Z`;
  }

  const corners: Record<BorderRadiusPreset, [boolean, boolean, boolean, boolean]> = {
    all: [true, true, true, true],
    "tl-br": [true, false, true, false],
    "tr-bl": [false, true, false, true],
    top: [true, true, false, false],
    bottom: [false, false, true, true],
    tr: [false, true, false, false],
    tl: [true, false, false, false],
    br: [false, false, true, false],
    bl: [false, false, false, true],
  };

  const [tl, tr, br, bl] = corners[preset];
  const rtl = tl ? r : 0;
  const rtr = tr ? r : 0;
  const rbr = br ? r : 0;
  const rbl = bl ? r : 0;

  return `
    M ${-w / 2 + rtl} ${-h / 2}
    h ${w - rtl - rtr}
    ${rtr ? `a ${rtr} ${rtr} 0 0 1 ${rtr} ${rtr}` : ""}
    v ${h - rtr - rbr}
    ${rbr ? `a ${rbr} ${rbr} 0 0 1 ${-rbr} ${rbr}` : ""}
    h ${-(w - rbr - rbl)}
    ${rbl ? `a ${rbl} ${rbl} 0 0 1 ${-rbl} ${-rbl}` : ""}
    v ${-(h - rbl - rtl)}
    ${rtl ? `a ${rtl} ${rtl} 0 0 1 ${rtl} ${-rtl}` : ""}
    Z
  `.replace(/\s+/g, " ").trim();
}

type FilterPreset = "none" | "grayscale" | "sepia" | "vintage" | "brownie" | "polaroid" | "technicolor" | "kodachrome" | "blackwhite" | "invert";

const FILTER_PRESETS: { value: FilterPreset; label: string }[] = [
  { value: "none", label: "Normal" },
  { value: "grayscale", label: "Grayscale" },
  { value: "sepia", label: "Sepia" },
  { value: "vintage", label: "Vintage" },
  { value: "brownie", label: "Brownie" },
  { value: "polaroid", label: "Polaroid" },
  { value: "technicolor", label: "Technicolor" },
  { value: "kodachrome", label: "Kodachrome" },
  { value: "blackwhite", label: "B & W" },
  { value: "invert", label: "Invert" },
];

const getFilterCSS = (preset: FilterPreset): string => {
  switch (preset) {
    case "none": return "none";
    case "grayscale": return "grayscale(100%)";
    case "sepia": return "sepia(100%)";
    case "vintage": return "sepia(50%) contrast(120%) saturate(120%)";
    case "brownie": return "sepia(80%) contrast(120%) hue-rotate(-20deg)";
    case "polaroid": return "contrast(120%) saturate(120%) sepia(30%)";
    case "technicolor": return "contrast(120%) saturate(150%)";
    case "kodachrome": return "contrast(120%) saturate(120%) sepia(20%)";
    case "blackwhite": return "grayscale(100%) contrast(150%)";
    case "invert": return "invert(100%)";
  }
};

/* ── Component ────────────────────────────────────────── */

export function ImageEditToolbar({ canvas, onUndo, onRedo }: ImageEditToolbarProps) {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Image properties
  const [borderRadius, setBorderRadius] = useState(0);
  const [borderRadiusPreset, setBorderRadiusPreset] = useState<BorderRadiusPreset>("all");
  const [opacity, setOpacity] = useState(100);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [shadow, setShadow] = useState<ShadowState>({ ...DEFAULT_SHADOW });
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  // Crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("none");
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  /* ── Sync state from selected object ─────────────────── */

  const syncFromSelection = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = obj as any;
    setBorderRadius(img.rx || img.ry || 0);
    setBorderRadiusPreset(img.brPreset || "all");
    setOpacity(Math.round((img.opacity ?? 1) * 100));
    setPosX(Math.round(img.left ?? 0));
    setPosY(Math.round(img.top ?? 0));
    setFlipX(!!img.flipX);
    setFlipY(!!img.flipY);
    setActiveFilter(img.filterPreset || "none");

    // Extract image src for filter previews
    const el = img.getElement?.() || img._element;
    if (el) {
      if (el instanceof HTMLImageElement) setSelectedImageSrc(el.src);
      else if (el instanceof HTMLCanvasElement) setSelectedImageSrc(el.toDataURL("image/png"));
      else setSelectedImageSrc(null);
    } else {
      setSelectedImageSrc(null);
    }

    // Parse shadow
    if (img.shadow) {
      const sh = img.shadow;
      // Reverse-engineer or read custom properties
      setShadow({
        preset: img.shPreset || "drop",
        blur: sh.blur ?? 10,
        offsetX: sh.offsetX ?? 4,
        offsetY: sh.offsetY ?? 4,
        color: img.shColor || "#000000",
        opacity: img.shOpacity ?? 50,
      });
    } else {
      setShadow({ ...DEFAULT_SHADOW });
    }
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const handler = () => syncFromSelection();
    canvas.on("selection:created", handler);
    canvas.on("selection:updated", handler);
    canvas.on("object:modified", handler);
    return () => {
      canvas.off("selection:created", handler);
      canvas.off("selection:updated", handler);
      canvas.off("object:modified", handler);
    };
  }, [canvas, syncFromSelection]);

  useEffect(() => { syncFromSelection(); }, [syncFromSelection]);

  /* ── Apply helper ────────────────────────────────────── */

  const apply = useCallback((props: Record<string, unknown>) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.set(props);
    obj.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
  }, [canvas]);

  /* ── Panel toggle ────────────────────────────────────── */

  const togglePanel = useCallback((panel: string) => {
    if (activePanel === panel) {
      setActivePanel(null);
      setPanelPos(null);
      return;
    }
    const btn = btnRefs.current[panel];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPanelPos({ left: rect.left, top: rect.bottom + 6 });
    }
    setActivePanel(panel);
  }, [activePanel]);

  /* Close panel on outside click */
  useEffect(() => {
    if (!activePanel) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const clickedBtn = Object.values(btnRefs.current).some(
          (b) => b && b.contains(e.target as Node)
        );
        if (!clickedBtn) {
          setActivePanel(null);
          setPanelPos(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activePanel]);

  /* ── Handlers ────────────────────────────────────────── */

  const handleFlipH = () => {
    const next = !flipX;
    setFlipX(next);
    apply({ flipX: next });
  };

  const handleFlipV = () => {
    const next = !flipY;
    setFlipY(next);
    apply({ flipY: next });
  };

  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    apply({ opacity: val / 100 });
  };

  const handleBorderRadiusChange = (val: number, preset?: BorderRadiusPreset) => {
    const newVal = val;
    const newPreset = preset || borderRadiusPreset;
    setBorderRadius(newVal);
    setBorderRadiusPreset(newPreset);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = canvas?.getActiveObject() as any;
    if (!obj) return;
    
    if (newVal === 0) {
      apply({ clipPath: undefined, rx: 0, ry: 0, brPreset: newPreset });
    } else {
      const w = obj.width || 100;
      const h = obj.height || 100;
      const r = Math.min(newVal, Math.min(w, h) / 2);
      
      const pathStr = getRoundedRectPath(w, h, r, newPreset);
      const clipPath = new Path(pathStr, {
        originX: "center",
        originY: "center",
      });
      
      apply({ clipPath, rx: r, ry: r, brPreset: newPreset });
    }
  };

  const handlePositionChange = (axis: "x" | "y", val: number) => {
    if (axis === "x") {
      setPosX(val);
      apply({ left: val });
    } else {
      setPosY(val);
      apply({ top: val });
    }
  };

  const handleAlign = (alignment: string) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const cW = canvas.width!;
    const cH = canvas.height!;
    const br = obj.getBoundingRect();

    const dL = (obj.left ?? 0) - br.left;
    const dT = (obj.top ?? 0) - br.top;

    switch (alignment) {
      case "left": apply({ left: dL }); break;
      case "right": apply({ left: cW - br.width + dL }); break;
      case "top": apply({ top: dT }); break;
      case "bottom": apply({ top: cH - br.height + dT }); break;
      case "centerH": apply({ left: (cW - br.width) / 2 + dL }); break;
      case "centerV": apply({ top: (cH - br.height) / 2 + dT }); break;
    }
    syncFromSelection();
  };

  const handleScale = (mode: string) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== "image") return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = obj as any;
    const w = img.width || 100;
    const h = img.height || 100;
    const cW = canvas.width!;
    const cH = canvas.height!;

    let sX = img.scaleX || 1;
    let sY = img.scaleY || 1;
    let left = img.left || 0;
    let top = img.top || 0;

    switch (mode) {
      case "original":
        sX = 1;
        sY = 1;
        break;
      case "fit": {
        const scaleFit = Math.max(cW / w, cH / h);
        sX = scaleFit;
        sY = scaleFit;
        left = (cW - w * sX) / 2;
        top = (cH - h * sY) / 2;
        break;
      }
      case "contain": {
        const scaleContain = Math.min(cW / w, cH / h);
        sX = scaleContain;
        sY = scaleContain;
        left = (cW - w * sX) / 2;
        top = (cH - h * sY) / 2;
        break;
      }
      case "stretch":
        sX = cW / w;
        sY = cH / h;
        left = 0;
        top = 0;
        break;
    }

    apply({ scaleX: sX, scaleY: sY, left, top });
    setActivePanel(null); // Close the dropdown
  };

  const handleFilterChange = (preset: FilterPreset) => {
    setActiveFilter(preset);
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== "image") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = obj as any;
    
    // Clear existing filters
    img.filters = [];
    
    if (preset !== "none") {
      switch (preset) {
        case "grayscale": img.filters.push(new filters.Grayscale()); break;
        case "sepia": img.filters.push(new filters.Sepia()); break;
        case "vintage": img.filters.push(new filters.Vintage()); break;
        case "brownie": img.filters.push(new filters.Brownie()); break;
        case "polaroid": img.filters.push(new filters.Polaroid()); break;
        case "technicolor": img.filters.push(new filters.Technicolor()); break;
        case "kodachrome": img.filters.push(new filters.Kodachrome()); break;
        case "blackwhite": img.filters.push(new filters.BlackWhite()); break;
        case "invert": img.filters.push(new filters.Invert()); break;
      }
    }
    
    img.applyFilters();
    img.set({ filterPreset: preset });
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: img });
  };

  const handleShadowPresetChange = (preset: ShadowPreset) => {
    const next = { ...shadow, preset };
    setShadow(next);
    applyShadow(next);
  };

  const handleShadowPropChange = (key: keyof Omit<ShadowState, "preset">, val: number | string) => {
    const next = { ...shadow, [key]: val };
    setShadow(next);
    applyShadow(next);
  };

  const applyShadow = (s: ShadowState) => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    if (s.preset === "none") {
      obj.set({ 
        shadow: undefined,
        shPreset: undefined,
        shColor: undefined,
        shOpacity: undefined,
      });
    } else {
      const alpha = s.opacity / 100;
      // Convert hex + alpha to rgba
      const hex = s.color || "#000000";
      const r = parseInt(hex.slice(1, 3), 16) || 0;
      const g = parseInt(hex.slice(3, 5), 16) || 0;
      const b = parseInt(hex.slice(5, 7), 16) || 0;
      const rgba = `rgba(${r},${g},${b},${alpha})`;

      let oX = s.offsetX, oY = s.offsetY, blur = s.blur;
      if (s.preset === "glow") { oX = 0; oY = 0; }
      if (s.preset === "backdrop") { oX = 0; oY = Math.round(blur / 2); }
      if (s.preset === "outline") { oX = 0; oY = 0; }

      const actualBlur = blur;

      obj.set({
        shadow: new Shadow({
          color: rgba,
          blur: actualBlur,
          offsetX: oX,
          offsetY: oY,
        }),
        shPreset: s.preset,
        shColor: s.color,
        shOpacity: s.opacity,
      });
    }
    obj.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
  };

  /* ── Crop handlers ────────────────────────────────────── */

  const handleCropOpen = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type !== "image") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = obj as any;
    // Extract the image source from the FabricImage element
    const el = img.getElement?.() || img._element;
    if (!el) return;
    // Get the source URL from the element
    let src: string;
    if (el instanceof HTMLImageElement) {
      src = el.src;
    } else if (el instanceof HTMLCanvasElement) {
      src = el.toDataURL("image/png");
    } else {
      return;
    }
    setCropImageSrc(src);
    setCrop({ x: 0, y: 0 });
    setCropZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);
  };

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!canvas || !cropImageSrc || !croppedAreaPixels) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    // Create a cropped image via an offscreen canvas
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = cropImageSrc;
    await new Promise<void>((resolve) => { image.onload = () => resolve(); });

    const offCanvas = document.createElement("canvas");
    offCanvas.width = croppedAreaPixels.width;
    offCanvas.height = croppedAreaPixels.height;
    const ctx = offCanvas.getContext("2d")!;
    ctx.drawImage(
      image,
      croppedAreaPixels.x, croppedAreaPixels.y,
      croppedAreaPixels.width, croppedAreaPixels.height,
      0, 0,
      croppedAreaPixels.width, croppedAreaPixels.height
    );

    const croppedDataUrl = offCanvas.toDataURL("image/png");

    // Replace the current image with the cropped version
    const croppedImgEl = new Image();
    croppedImgEl.crossOrigin = "anonymous";
    croppedImgEl.src = croppedDataUrl;
    await new Promise<void>((resolve) => { croppedImgEl.onload = () => resolve(); });

    const prevLeft = obj.left ?? 0;
    const prevTop = obj.top ?? 0;
    const prevScaleX = (obj.scaleX ?? 1);
    const prevScaleY = (obj.scaleY ?? 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevW = (obj as any).width || 100;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevH = (obj as any).height || 100;
    const displayW = prevW * prevScaleX;
    const displayH = prevH * prevScaleY;

    const newFabricImg = new FabricImage(croppedImgEl, {
      left: prevLeft,
      top: prevTop,
      originX: "left",
      originY: "top",
    });

    // Scale the new image to match the displayed size of the original
    const newScaleX = displayW / croppedAreaPixels.width;
    const newScaleY = displayH / croppedAreaPixels.height;
    newFabricImg.set({ scaleX: newScaleX, scaleY: newScaleY });

    canvas.remove(obj);
    canvas.add(newFabricImg);
    canvas.setActiveObject(newFabricImg);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: newFabricImg });

    setShowCropModal(false);
    setCropImageSrc(null);
  }, [canvas, cropImageSrc, croppedAreaPixels]);

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropImageSrc(null);
  };

  /* ── Toolbar button helper ──────────────────────────── */

  const ToolBtn = ({
    id,
    icon,
    label,
    active,
    onClick,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
  }) => (
    <div className="relative group">
      <button
        ref={(el) => { btnRefs.current[id] = el; }}
        id={`img-${id}`}
        onClick={onClick}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 ${
          active
            ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        }`}
      >
        {icon}
      </button>
      {/* Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-9 px-2 py-1 rounded-md bg-gray-800 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
        {label}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-800" />
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────── */

  return (
    <>
      <div className="flex h-11 items-center gap-1 border-b border-gray-200 bg-white px-3" style={{ animation: "toolbar-slide-in 0.2s ease-out" }}>
        {/* Crop */}
        <ToolBtn
          id="crop"
          icon={<LuCrop className="w-4 h-4" />}
          label="Crop"
          active={showCropModal}
          onClick={handleCropOpen}
        />

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Scale */}
        <ToolBtn
          id="scale"
          icon={<LuMaximize className="w-4 h-4" />}
          label="Scale"
          active={activePanel === "scale"}
          onClick={() => togglePanel("scale")}
        />

        {/* Filter */}
        <ToolBtn
          id="filter"
          icon={<LuWand className="w-4 h-4" />}
          label="Filter"
          active={activePanel === "filter"}
          onClick={() => togglePanel("filter")}
        />

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Border Radius */}
        <ToolBtn
          id="radius"
          icon={<LuSquare className="w-4 h-4" />}
          label="Border Radius"
          active={activePanel === "radius"}
          onClick={() => togglePanel("radius")}
        />

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Flip H */}
        <ToolBtn
          id="flipH"
          icon={<LuFlipHorizontal2 className="w-4 h-4" />}
          label="Flip Horizontal"
          active={flipX}
          onClick={handleFlipH}
        />

        {/* Flip V */}
        <ToolBtn
          id="flipV"
          icon={<LuFlipVertical2 className="w-4 h-4" />}
          label="Flip Vertical"
          active={flipY}
          onClick={handleFlipV}
        />

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Opacity */}
        <ToolBtn
          id="opacity"
          icon={<LuSunDim className="w-4 h-4" />}
          label="Transparency"
          active={activePanel === "opacity"}
          onClick={() => togglePanel("opacity")}
        />

        {/* Position */}
        <ToolBtn
          id="position"
          icon={<LuMove className="w-4 h-4" />}
          label="Position"
          active={activePanel === "position"}
          onClick={() => togglePanel("position")}
        />

        {/* Shadow */}
        <ToolBtn
          id="shadow"
          icon={<MdBlurOn className="w-4 h-4" />}
          label="Shadow"
          active={activePanel === "shadow"}
          onClick={() => togglePanel("shadow")}
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Undo / Redo */}
        <button onClick={onUndo} className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Undo">
          <LuUndo2 className="w-4 h-4" />
        </button>
        <button onClick={onRedo} className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" title="Redo">
          <LuRedo2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── Dropdown Panels (portal) ───────────────────── */}
      {activePanel && panelPos && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] rounded-xl bg-white py-3 px-4 shadow-2xl ring-1 ring-black/[0.08]"
          style={{
            left: `${panelPos.left}px`,
            top: `${panelPos.top}px`,
            animation: "dropdown-fade 0.15s ease-out",
            minWidth: 220,
          }}
        >
          {/* Scale Panel */}
          {activePanel === "scale" && (
            <div className="space-y-1 p-1" style={{ minWidth: 160 }}>
              <div className="px-2 py-1 mb-1 text-xs font-semibold text-gray-700 border-b border-gray-100">Scale Options</div>
              {[
                { label: "Original", value: "original" },
                { label: "Fit (Cover)", value: "fit" },
                { label: "Contain", value: "contain" },
                { label: "Stretch", value: "stretch" }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleScale(opt.value)}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Filter Panel */}
          {activePanel === "filter" && (
            <div className="space-y-3 p-1" style={{ minWidth: 280 }}>
              <div className="px-2 py-1 text-xs font-semibold text-gray-700 border-b border-gray-100">Filters</div>
              <div className="grid grid-cols-4 gap-2 px-2 pb-2">
                {FILTER_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => handleFilterChange(p.value)}
                    className={`flex flex-col items-center gap-1.5 overflow-hidden rounded-md transition-all ${
                      activeFilter === p.value
                        ? "ring-2 ring-indigo-600 bg-indigo-50"
                        : "ring-1 ring-gray-200 bg-white hover:ring-gray-400"
                    }`}
                    title={p.label}
                  >
                    <div className="h-10 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {selectedImageSrc ? (
                        <img 
                          src={selectedImageSrc} 
                          alt={p.label} 
                          className="h-full w-full object-cover" 
                          style={{ filter: getFilterCSS(p.value) }} 
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" style={{ filter: getFilterCSS(p.value) }} />
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-gray-600 mb-1 leading-none">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Border Radius Panel */}
          {activePanel === "radius" && (
            <div className="space-y-4" style={{ minWidth: 260 }}>
              <div className="text-xs font-semibold text-gray-700">Border Radius</div>
              
              <div className="grid grid-cols-5 gap-2">
                {BORDER_RADIUS_PRESETS.map((p) => {
                  const r = "10px";
                  let brStyle = {};
                  switch (p.value) {
                    case "all": brStyle = { borderRadius: r }; break;
                    case "tl-br": brStyle = { borderTopLeftRadius: r, borderBottomRightRadius: r }; break;
                    case "tr-bl": brStyle = { borderTopRightRadius: r, borderBottomLeftRadius: r }; break;
                    case "top": brStyle = { borderTopLeftRadius: r, borderTopRightRadius: r }; break;
                    case "bottom": brStyle = { borderBottomLeftRadius: r, borderBottomRightRadius: r }; break;
                    case "tr": brStyle = { borderTopRightRadius: r }; break;
                    case "tl": brStyle = { borderTopLeftRadius: r }; break;
                    case "br": brStyle = { borderBottomRightRadius: r }; break;
                    case "bl": brStyle = { borderBottomLeftRadius: r }; break;
                  }

                  return (
                    <button
                      key={p.value}
                      onClick={() => handleBorderRadiusChange(borderRadius, p.value)}
                      style={brStyle}
                      className={`h-9 w-9 border-[2.5px] transition-all ${
                        borderRadiusPreset === p.value
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                      }`}
                      title={p.label}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-600">Radius size</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={borderRadius}
                    onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
                    className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-right"
                  />
                  <span className="text-[11px] text-gray-500">px</span>
                </div>
              </div>
            </div>
          )}

          {/* Opacity Panel */}
          {activePanel === "opacity" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-700">Transparency</div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-16 rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">{opacity}%</span>
              </div>
            </div>
          )}

          {/* Position Panel */}
          {activePanel === "position" && (
            <div className="space-y-3" style={{ minWidth: 240 }}>
              <div className="text-xs font-semibold text-gray-700">Position</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase">X</label>
                  <input
                    type="number"
                    value={posX}
                    onChange={(e) => handlePositionChange("x", Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 uppercase">Y</label>
                  <input
                    type="number"
                    value={posY}
                    onChange={(e) => handlePositionChange("y", Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-[10px] font-medium text-gray-500 uppercase mt-2">Quick Align</div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "top", label: "Top", icon: "↑" },
                  { key: "centerV", label: "Middle", icon: "⇕" },
                  { key: "bottom", label: "Bottom", icon: "↓" },
                  { key: "left", label: "Left", icon: "←" },
                  { key: "centerH", label: "Center", icon: "⇔" },
                  { key: "right", label: "Right", icon: "→" },
                ].map((a) => (
                  <button
                    key={a.key}
                    onClick={() => handleAlign(a.key)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 text-[11px] text-gray-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span>{a.icon}</span>
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shadow Panel */}
          {activePanel === "shadow" && (
            <div className="space-y-3" style={{ minWidth: 260 }}>
              <div className="text-xs font-semibold text-gray-700">Shadow</div>
              <div className="grid grid-cols-5 gap-2">
                {(["none", "glow", "drop", "outline", "backdrop"] as ShadowPreset[]).map((p) => {
                  let previewStyle = {};
                  switch (p) {
                    case "glow": previewStyle = { boxShadow: "0 0 6px rgba(0,0,0,0.5)" }; break;
                    case "drop": previewStyle = { boxShadow: "3px 3px 6px rgba(0,0,0,0.4)" }; break;
                    case "outline": previewStyle = { boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5)" }; break;
                    case "backdrop": previewStyle = { boxShadow: "0 3px 6px rgba(0,0,0,0.4)" }; break;
                  }

                  return (
                    <div key={p} className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => handleShadowPresetChange(p)}
                        className={`flex h-9 w-9 items-center justify-center rounded-md transition-all ${
                          shadow.preset === p
                            ? "bg-indigo-50 ring-2 ring-indigo-600"
                            : "bg-gray-50 ring-1 ring-gray-200 hover:ring-gray-400"
                        }`}
                        title={p}
                      >
                        {p === "none" ? (
                          <div className="h-4 w-4 rounded-sm border border-dashed border-gray-400" />
                        ) : (
                          <div
                            className="h-4 w-4 rounded-sm bg-white"
                            style={previewStyle}
                          />
                        )}
                      </button>
                      <span className="text-[9px] font-medium capitalize text-gray-500">{p}</span>
                    </div>
                  );
                })}
              </div>

              {shadow.preset !== "none" && (
                <div className="space-y-2.5 pt-1 border-t border-gray-100">
                  {/* Blur / Thickness */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-gray-500">{shadow.preset === "outline" ? "Thickness" : "Blur"}</span>
                      <span className="text-[10px] text-gray-400">{shadow.blur}px</span>
                    </div>
                    <input type="range" min={0} max={shadow.preset === "outline" ? 30 : 60} value={shadow.blur} onChange={(e) => handleShadowPropChange("blur", Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>

                  {/* Offset X */}
                  <div className={shadow.preset !== "drop" ? "pointer-events-none opacity-40" : ""}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-500">Offset X</span>
                      <span className="text-[10px] text-gray-400">{shadow.offsetX}px</span>
                    </div>
                    <input type="range" min={-50} max={50} value={shadow.offsetX} onChange={(e) => handleShadowPropChange("offsetX", Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>

                  {/* Offset Y */}
                  <div className={shadow.preset !== "drop" ? "pointer-events-none opacity-40" : ""}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-500">Offset Y</span>
                      <span className="text-[10px] text-gray-400">{shadow.offsetY}px</span>
                    </div>
                    <input type="range" min={-50} max={50} value={shadow.offsetY} onChange={(e) => handleShadowPropChange("offsetY", Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>

                  {/* Color */}
                  <div>
                    <span className="text-[10px] font-medium text-gray-500">Color</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="relative">
                        <div className="h-7 w-7 rounded border border-gray-300 cursor-pointer" style={{ backgroundColor: shadow.color }} />
                        <input type="color" value={shadow.color} onChange={(e) => handleShadowPropChange("color", e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <span className="text-[10px] text-gray-400 uppercase">{shadow.color}</span>
                    </div>
                  </div>

                  {/* Intensity */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-gray-500">Intensity</span>
                      <span className="text-[10px] text-gray-400">{shadow.opacity}%</span>
                    </div>
                    <input type="range" min={0} max={100} value={shadow.opacity} onChange={(e) => handleShadowPropChange("opacity", Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
      {/* ── Crop Modal (portal) ─────────────────────────── */}
      {showCropModal && cropImageSrc && createPortal(
        <div className="fixed inset-0 z-[10000] flex flex-col bg-black/80 backdrop-blur-sm" style={{ animation: "dropdown-fade 0.2s ease-out" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900/90">
            <h3 className="text-sm font-semibold text-white">Crop Image</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCropCancel}
                className="rounded-lg border border-gray-600 px-4 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Apply Crop
              </button>
            </div>
          </div>

          {/* Cropper area */}
          <div className="relative flex-1">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={cropZoom}
              aspect={undefined}
              onCropChange={setCrop}
              onZoomChange={setCropZoom}
              onCropComplete={handleCropComplete}
              style={{
                containerStyle: { background: "#1a1a2e" },
                cropAreaStyle: { border: "2px solid #818cf8", borderRadius: 4 },
              }}
            />
          </div>

          {/* Zoom slider */}
          <div className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-900/90">
            <span className="text-[10px] text-gray-400">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={cropZoom}
              onChange={(e) => setCropZoom(Number(e.target.value))}
              className="w-48 accent-indigo-500"
            />
            <span className="text-[10px] text-gray-400 w-10">{Math.round(cropZoom * 100)}%</span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
