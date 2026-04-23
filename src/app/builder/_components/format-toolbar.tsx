"use client";

import { useState, useEffect, useCallback } from "react";
import type { Canvas } from "fabric";
import { LuMinus, LuPlus, LuBold, LuItalic, LuUnderline, LuAlignLeft, LuAlignCenter, LuAlignRight, LuUndo2, LuRedo2, LuTrash2, LuImage } from "react-icons/lu";
import { MdOutlineColorLens } from "react-icons/md";

/* ── Font catalogue (Google + system-safe) ────────────── */

const FONT_FAMILIES = [
  "Arial",
  "Cinzel",
  "Courier New",
  "Dancing Script",
  "Georgia",
  "Great Vibes",
  "Helvetica",
  "Inter",
  "Lato",
  "Libre Baskerville",
  "Marcellus",
  "Merriweather",
  "Montserrat",
  "Open Sans",
  "Oswald",
  "Playfair Display",
  "Poppins",
  "PT Serif",
  "Raleway",
  "Roboto",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
];

const FONT_WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "normal", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "bold", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

/* ── Types ────────────────────────────────────────────── */

interface FormatToolbarProps {
  canvas: Canvas | null;
  onUndo: () => void;
  onRedo: () => void;
  bgSelected?: boolean;
  bgColor?: string;
  onBgColorChange?: (color: string) => void;
  onBgImageUpload?: () => void;
  onBgImageRemove?: () => void;
}

/* ── Component ────────────────────────────────────────── */

export function FormatToolbar({
  canvas,
  onUndo,
  onRedo,
  bgSelected,
  bgColor = "#ffffff",
  onBgColorChange,
  onBgImageUpload,
  onBgImageRemove,
}: FormatToolbarProps) {
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontSize, setFontSize] = useState(24);
  const [scaling, setScaling] = useState(true);
  const [fontColor, setFontColor] = useState("#000000");
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("center");
  const [isText, setIsText] = useState(false);
  const [isLine, setIsLine] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);

  /* ── Sync state from the currently-selected Fabric object ── */

  const syncFromSelection = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const textLike = "fontSize" in obj;
    const lineLike = obj.type === "line";
    setIsText(textLike);
    setIsLine(lineLike);

    if (textLike) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = obj as any;
      setFontFamily(t.fontFamily || "Georgia");
      const fw = t.fontWeight ?? "normal";
      setFontWeight(String(fw));
      const fs = Math.round(t.fontSize || 24);
      setFontSize(fs);
      setFontColor(typeof t.fill === "string" ? t.fill : "#000000");
      setIsItalic(t.fontStyle === "italic");
      setIsUnderline(!!t.underline);
      setTextAlign(t.textAlign || "left");
    } else if (lineLike) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const l = obj as any;
      setStrokeWidth(l.strokeWidth || 2);
      setFontColor(typeof l.stroke === "string" ? l.stroke : "#000000");
    } else {
      // Non-text objects still have fill
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = obj as any;
      if (typeof o.fill === "string") setFontColor(o.fill);
    }

    setScaling((obj as Record<string, unknown>).lockUniScaling !== true);
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

  /* Initial sync */
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { syncFromSelection(); }, [syncFromSelection]);

  /* ── Apply helper — pushes changes into Fabric + triggers history ── */

  function apply(props: Record<string, unknown>) {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    obj.set(props);
    obj.setCoords();
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
  }

  /* ── Handlers ────────────────────────────────────────── */

  function handleFontFamilyChange(v: string) {
    setFontFamily(v);
    apply({ fontFamily: v });
  }

  function handleFontWeightChange(v: string) {
    setFontWeight(v);
    apply({ fontWeight: v });
  }

  function handleFontSizeStep(delta: number) {
    const next = Math.max(6, Math.min(200, fontSize + delta));
    setFontSize(next);
    setFontSizeInput(String(next));
    apply({ fontSize: next });
  }



  function handleStrokeWidthStep(delta: number) {
    const next = Math.max(1, Math.min(50, strokeWidth + delta));
    setStrokeWidth(next);
    apply({ strokeWidth: next });
  }

  function handleScalingToggle() {
    const next = !scaling;
    setScaling(next);
    apply({ lockUniScaling: !next } as Record<string, unknown>);
  }

  function handleColorChange(c: string) {
    setFontColor(c);
    if (isLine) {
      apply({ stroke: c });
    } else {
      apply({ fill: c });
    }
  }

  function handleBoldToggle() {
    const isBold = fontWeight === "bold" || Number(fontWeight) >= 700;
    const nw = isBold ? "normal" : "bold";
    setFontWeight(nw);
    apply({ fontWeight: nw });
  }

  function handleItalicToggle() {
    const n = !isItalic;
    setIsItalic(n);
    apply({ fontStyle: n ? "italic" : "normal" });
  }

  function handleUnderlineToggle() {
    const n = !isUnderline;
    setIsUnderline(n);
    apply({ underline: n });
  }

  function handleTextAlignChange(a: string) {
    setTextAlign(a);
    apply({ textAlign: a });
  }

  const isBoldActive = fontWeight === "bold" || Number(fontWeight) >= 700;

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div
      className="flex h-11 items-center gap-1 border-b border-gray-200 bg-white px-3"
    >
      {bgSelected ? (
        <>
          {/* Background color swatch */}
          <div className="relative" title="Background color">
            <div
              className="h-7 w-7 rounded border-2 border-gray-200 cursor-pointer transition-all hover:border-indigo-300"
              style={{ backgroundColor: bgColor }}
            />
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange?.(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              title="Choose background color"
            />
          </div>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          {/* Replace Background button */}
          <button
            onClick={onBgImageUpload}
            className="flex h-7 items-center gap-1.5 rounded border border-gray-300 px-2.5 text-xs text-gray-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
            title="Replace background image"
          >
            <LuImage className="w-3.5 h-3.5" />
            Replace Background
          </button>

          {/* Remove Background button */}
          <button
            onClick={onBgImageRemove}
            className="flex h-7 items-center gap-1.5 rounded border border-gray-300 px-2.5 text-xs text-gray-600 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            title="Remove background image"
          >
            <LuTrash2 className="w-3.5 h-3.5" />
            Remove
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Undo */}
          <button
            onClick={onUndo}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Undo (Ctrl+Z)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.69 3L3 13" />
            </svg>
          </button>
          {/* Redo */}
          <button
            onClick={onRedo}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Redo (Ctrl+Y)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.69 3L21 13" />
            </svg>
          </button>
        </>
      ) : (
        <>
          {/* ─ Font Family ─ */}
          {isText && (
            <select
              id="format-font-family"
              value={fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="h-7 w-36 cursor-pointer rounded border border-gray-300 px-2 text-xs text-gray-700 transition-colors hover:border-gray-400 focus:border-indigo-500 focus:outline-none"
              style={{ fontFamily }}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
            </select>
          )}

          {/* ─ Font Weight ─ */}
          {isText && (
            <select
              id="format-font-weight"
              value={fontWeight}
              onChange={(e) => handleFontWeightChange(e.target.value)}
              className="h-7 w-[5.5rem] cursor-pointer rounded border border-gray-300 px-2 text-xs text-gray-700 transition-colors hover:border-gray-400 focus:border-indigo-500 focus:outline-none"
            >
              {FONT_WEIGHTS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          )}

          {/* ─ Separator ─ */}
          {isText && <div className="mx-1.5 h-5 w-px bg-gray-200" />}

          {/* ─ Font Size / Line Thickness ─ */}
          {(isText || isLine) && (
            <div className="flex items-center">
              <button
                onClick={() => isText ? handleFontSizeStep(-1) : handleStrokeWidthStep(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-l border border-gray-300 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
                title={isText ? "Decrease font size" : "Decrease thickness"}
              >
                <LuMinus className="w-3 h-3" />
              </button>
              <div className="h-7 w-12 border-y border-gray-300 flex items-center justify-center text-xs text-gray-700 font-medium">
                {isText ? fontSize : strokeWidth}
              </div>
              <button
                onClick={() => isText ? handleFontSizeStep(1) : handleStrokeWidthStep(1)}
                className="flex h-7 w-7 items-center justify-center rounded-r border border-gray-300 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
                title={isText ? "Increase font size" : "Increase thickness"}
              >
                <LuPlus className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* ─ Separator ─ */}
          <div className="mx-1.5 h-5 w-px bg-gray-200" />

          {/* ─ Scaling ─ */}
          {!isLine && (
            <>
              <label className="flex cursor-pointer items-center gap-1.5 select-none text-xs text-gray-600 transition-colors hover:text-gray-800">
                <input
                  id="format-scaling"
                  type="checkbox"
                  checked={scaling}
                  onChange={handleScalingToggle}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 text-indigo-600 accent-indigo-600"
                />
                Scaling
              </label>
              <div className="mx-1.5 h-5 w-px bg-gray-200" />
            </>
          )}

          {/* ─ Color picker ─ */}
          <div className="relative" title={isLine ? "Line color" : "Color"}>
            <button
              id="format-font-color"
              className="flex h-7 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:border-gray-400 group"
            >
              <MdOutlineColorLens className="w-4 h-4" style={{ color: fontColor }} />
            </button>
            <div
              className="absolute bottom-0.5 left-1.5 right-1.5 h-[2px] rounded-full"
              style={{ backgroundColor: fontColor }}
            />
            <input
              type="color"
              value={fontColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              title={isLine ? "Choose line color" : "Choose color"}
            />
          </div>

          {/* ─ Bold ─ */}
          {isText && (
            <button
              id="format-bold"
              onClick={handleBoldToggle}
              className={`flex h-7 w-7 items-center justify-center rounded text-sm font-bold transition-colors ${isBoldActive
                ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              title="Bold"
            >
              <LuBold className="w-4 h-4" />
            </button>
          )}

          {/* ─ Italic ─ */}
          {isText && (
            <button
              id="format-italic"
              onClick={handleItalicToggle}
              className={`flex h-7 w-7 items-center justify-center rounded text-sm italic transition-colors ${isItalic
                ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              title="Italic"
            >
              <LuItalic className="w-4 h-4" />
            </button>
          )}

          {/* ─ Underline ─ */}
          {isText && (
            <button
              id="format-underline"
              onClick={handleUnderlineToggle}
              className={`flex h-7 w-7 items-center justify-center rounded text-sm underline transition-colors ${isUnderline
                ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              title="Underline"
            >
              <LuUnderline className="w-4 h-4" />
            </button>
          )}

          {/* ─ Separator ─ */}
          {isText && <div className="mx-1.5 h-5 w-px bg-gray-200" />}

          {/* ─ Text alignment ─ */}
          {isText && (
            <div className="flex items-center gap-0.5">
              {/* Left */}
              <button
                id="format-align-left"
                onClick={() => handleTextAlignChange("left")}
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${textAlign === "left"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                title="Align left"
              >
                <LuAlignLeft className="w-4 h-4" />
              </button>
              {/* Center */}
              <button
                id="format-align-center"
                onClick={() => handleTextAlignChange("center")}
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${textAlign === "center"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                title="Align center"
              >
                <LuAlignCenter className="w-4 h-4" />
              </button>
              {/* Right */}
              <button
                id="format-align-right"
                onClick={() => handleTextAlignChange("right")}
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${textAlign === "right"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                title="Align right"
              >
                <LuAlignRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─ Spacer ─ */}
          <div className="flex-1" />

          {/* ─ Undo ─ */}
          <button
            id="format-undo"
            onClick={onUndo}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Undo (Ctrl+Z)"
          >
            <LuUndo2 className="w-4 h-4" />
          </button>

          {/* ─ Redo ─ */}
          <button
            id="format-redo"
            onClick={onRedo}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            title="Redo (Ctrl+Y)"
          >
            <LuRedo2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
