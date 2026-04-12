"use client";

import { useState, useEffect, useCallback } from "react";
import type { Canvas } from "fabric";

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
}

/* ── Component ────────────────────────────────────────── */

export function FormatToolbar({ canvas, onUndo, onRedo }: FormatToolbarProps) {
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontSize, setFontSize] = useState(24);
  const [fontSizeInput, setFontSizeInput] = useState("24");
  const [scaling, setScaling] = useState(true);
  const [fontColor, setFontColor] = useState("#000000");
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("center");
  const [isText, setIsText] = useState(false);

  /* ── Sync state from the currently-selected Fabric object ── */

  const syncFromSelection = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;

    const textLike = "fontSize" in obj;
    setIsText(textLike);

    if (textLike) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = obj as any;
      setFontFamily(t.fontFamily || "Georgia");
      const fw = t.fontWeight ?? "normal";
      setFontWeight(String(fw));
      const fs = Math.round(t.fontSize || 24);
      setFontSize(fs);
      setFontSizeInput(String(fs));
      setFontColor(typeof t.fill === "string" ? t.fill : "#000000");
      setIsItalic(t.fontStyle === "italic");
      setIsUnderline(!!t.underline);
      setTextAlign(t.textAlign || "left");
    } else {
      // Non-text objects still have fill
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = obj as any;
      if (typeof o.fill === "string") setFontColor(o.fill);
    }

    setScaling(obj.lockUniScaling !== true);
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

  function commitFontSizeInput() {
    const v = parseInt(fontSizeInput, 10);
    if (!isNaN(v) && v >= 6 && v <= 200) {
      setFontSize(v);
      apply({ fontSize: v });
    } else {
      setFontSizeInput(String(fontSize));
    }
  }

  function handleScalingToggle() {
    const next = !scaling;
    setScaling(next);
    apply({ lockUniScaling: !next });
  }

  function handleColorChange(c: string) {
    setFontColor(c);
    apply({ fill: c });
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
      style={{ animation: "toolbar-slide-in 0.18s ease-out" }}
    >
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

      {/* ─ Font Size ─ */}
      {isText && (
        <div className="flex items-center">
          <button
            id="format-font-size-decrease"
            onClick={() => handleFontSizeStep(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-l border border-gray-300 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
            title="Decrease font size"
          >
            −
          </button>
          <input
            id="format-font-size"
            type="text"
            inputMode="numeric"
            value={fontSizeInput}
            onChange={(e) => setFontSizeInput(e.target.value.replace(/\D/g, ""))}
            onBlur={commitFontSizeInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitFontSizeInput();
            }}
            className="h-7 w-10 border-y border-gray-300 text-center text-xs text-gray-700 focus:outline-none"
          />
          <button
            id="format-font-size-increase"
            onClick={() => handleFontSizeStep(1)}
            className="flex h-7 w-7 items-center justify-center rounded-r border border-gray-300 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200"
            title="Increase font size"
          >
            +
          </button>
        </div>
      )}

      {/* ─ Separator ─ */}
      <div className="mx-1.5 h-5 w-px bg-gray-200" />

      {/* ─ Scaling ─ */}
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

      {/* ─ Separator ─ */}
      <div className="mx-1.5 h-5 w-px bg-gray-200" />

      {/* ─ Color picker ─ */}
      <div className="relative" title="Font color">
        <button
          id="format-font-color"
          className="flex h-7 w-8 items-center justify-center rounded border border-gray-300 text-sm font-bold transition-colors hover:border-gray-400"
        >
          <span style={{ color: fontColor }}>A</span>
        </button>
        <div
          className="absolute bottom-0.5 left-1.5 right-1.5 h-[3px] rounded-sm"
          style={{ backgroundColor: fontColor }}
        />
        <input
          type="color"
          value={fontColor}
          onChange={(e) => handleColorChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          title="Choose font color"
        />
      </div>

      {/* ─ Bold ─ */}
      {isText && (
        <button
          id="format-bold"
          onClick={handleBoldToggle}
          className={`flex h-7 w-7 items-center justify-center rounded text-sm font-bold transition-colors ${
            isBoldActive
              ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
          title="Bold"
        >
          B
        </button>
      )}

      {/* ─ Italic ─ */}
      {isText && (
        <button
          id="format-italic"
          onClick={handleItalicToggle}
          className={`flex h-7 w-7 items-center justify-center rounded text-sm italic transition-colors ${
            isItalic
              ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
          title="Italic"
        >
          I
        </button>
      )}

      {/* ─ Underline ─ */}
      {isText && (
        <button
          id="format-underline"
          onClick={handleUnderlineToggle}
          className={`flex h-7 w-7 items-center justify-center rounded text-sm underline transition-colors ${
            isUnderline
              ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
          title="Underline"
        >
          U
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
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              textAlign === "left"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            title="Align left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </button>
          {/* Center */}
          <button
            id="format-align-center"
            onClick={() => handleTextAlignChange("center")}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              textAlign === "center"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            title="Align center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="10" x2="6" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="18" y1="18" x2="6" y2="18" />
            </svg>
          </button>
          {/* Right */}
          <button
            id="format-align-right"
            onClick={() => handleTextAlignChange("right")}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
              textAlign === "right"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            title="Align right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="21" y1="10" x2="7" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.69 3L3 13" />
        </svg>
      </button>

      {/* ─ Redo ─ */}
      <button
        id="format-redo"
        onClick={onRedo}
        className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title="Redo (Ctrl+Y)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.69 3L21 13" />
        </svg>
      </button>
    </div>
  );
}
