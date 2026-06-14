"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Canvas } from "fabric";
import { LuMinus, LuPlus, LuBold, LuItalic, LuUnderline, LuAlignLeft, LuAlignCenter, LuAlignRight, LuUndo2, LuRedo2, LuImage, LuRuler, LuGrid3X3, LuCheck, LuX } from "react-icons/lu";
import { ImageEditToolbar } from "./image-edit-toolbar";
import { type CustomFont, extractFontsFromZip, parseGoogleFontUrl } from "@/lib/builder/font-loader";

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
  showRuler?: boolean;
  onShowRulerChange?: (v: boolean) => void;
  showGrid?: boolean;
  onShowGridChange?: (v: boolean) => void;
  customFonts?: CustomFont[];
  onAddCustomFont?: (font: CustomFont) => void;
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
  showRuler = false,
  onShowRulerChange,
  showGrid = false,
  onShowGridChange,
  customFonts = [],
  onAddCustomFont,
}: FormatToolbarProps) {
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#000000");
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("center");
  const [isText, setIsText] = useState(false);
  const [isLine, setIsLine] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);

  /* ── Custom Font Dropdown and Modals State ── */
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [fontSearchQuery, setFontSearchQuery] = useState("");
  const [googleFontModalOpen, setGoogleFontModalOpen] = useState(false);
  const [googleFontInput, setGoogleFontInput] = useState("");
  const [googleFontError, setGoogleFontError] = useState("");
  const [fontLoading, setFontLoading] = useState(false);

  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener to close custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setIsFontDropdownOpen(false);
      }
    }
    if (isFontDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFontDropdownOpen]);

  const allFonts = Array.from(new Set([
    ...FONT_FAMILIES,
    ...customFonts.map(f => f.name)
  ])).sort((a, b) => a.localeCompare(b));

  const filteredFonts = allFonts.filter((f) =>
    f.toLowerCase().includes(fontSearchQuery.toLowerCase())
  );

  const handleFontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAddCustomFont) return;

    setFontLoading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "zip") {
        const fonts = await extractFontsFromZip(file);
        fonts.forEach((f) => onAddCustomFont(f));
        if (fonts.length > 0) {
          handleFontFamilyChange(fonts[0].name);
        }
        alert(`Successfully imported ${fonts.length} font(s) from zip!`);
      } else if (["ttf", "otf", "woff", "woff2"].includes(ext || "")) {
        const reader = new FileReader();
        let mimeType = "font/ttf";
        if (ext === "otf") mimeType = "font/otf";
        else if (ext === "woff") mimeType = "font/woff";
        else if (ext === "woff2") mimeType = "font/woff2";

        reader.onload = () => {
          const fontName = file.name.replace(/\.[^/.]+$/, "");
          onAddCustomFont({
            name: fontName,
            url: reader.result as string,
            type: "upload"
          });
          handleFontFamilyChange(fontName);
          alert(`Successfully imported font "${fontName}"!`);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Invalid file format. Please upload a .zip file containing fonts, or raw .ttf, .otf, .woff, .woff2 files.");
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to import font from file.");
    } finally {
      setFontLoading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleGoogleFontSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleFontError("");

    if (!googleFontInput.trim()) {
      setGoogleFontError("Please enter a Google font name or link.");
      return;
    }

    const parsed = parseGoogleFontUrl(googleFontInput);
    if (!parsed) {
      setGoogleFontError("Invalid Google font name or URL format.");
      return;
    }

    if (onAddCustomFont) {
      onAddCustomFont({
        name: parsed.name,
        url: parsed.url,
        type: "google"
      });
      handleFontFamilyChange(parsed.name);
      setGoogleFontModalOpen(false);
      setGoogleFontInput("");
    }
  };

  /* ── Sync state from the currently-selected Fabric object ── */

  const syncFromSelection = useCallback(() => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) {
      setIsText(false);
      setIsLine(false);
      setIsImage(false);
      return;
    }

    const textLike = "fontSize" in obj;
    const lineLike = obj.type === "line";
    const imageLike = obj.type === "image";
    setIsText(textLike);
    setIsLine(lineLike);
    setIsImage(imageLike);

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

  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const handler = () => syncFromSelection();
    canvas.on("selection:created", handler);
    canvas.on("selection:updated", handler);
    canvas.on("selection:cleared", handler);
    canvas.on("object:modified", handler);
    return () => {
      canvas.off("selection:created", handler);
      canvas.off("selection:updated", handler);
      canvas.off("selection:cleared", handler);
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
    apply({ fontSize: next });
  }



  function handleStrokeWidthStep(delta: number) {
    const next = Math.max(1, Math.min(50, strokeWidth + delta));
    setStrokeWidth(next);
    apply({ strokeWidth: next });
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

  /* ── If an image is selected, show the dedicated image toolbar ── */
  if (isImage && !bgSelected) {
    return <ImageEditToolbar canvas={canvas} onUndo={onUndo} onRedo={onRedo} />;
  }

  return (
    <div
      className="flex h-11 items-center gap-1 border-b border-gray-200 bg-white px-3"
    >
      {bgSelected ? (
        <>
          {/* ─ Scale & Grid ─ always-first on left */}
          <ScaleGridControls
            showRuler={showRuler}
            onShowRulerChange={onShowRulerChange}
            showGrid={showGrid}
            onShowGridChange={onShowGridChange}
          />
          <div className="mx-2 h-5 w-px bg-gray-200" />

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
          {/* ─ Scale & Grid ─ always-first on left */}
          <ScaleGridControls
            showRuler={showRuler}
            onShowRulerChange={onShowRulerChange}
            showGrid={showGrid}
            onShowGridChange={onShowGridChange}
          />
          <div className="mx-2 h-5 w-px bg-gray-200" />

          {/* ─ Font Family ─ */}
          {isText && (
            <div className="relative" ref={fontDropdownRef}>
              <button
                type="button"
                id="format-font-family-btn"
                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                className="flex h-7 w-36 cursor-pointer items-center justify-between rounded border border-gray-300 px-2 text-xs text-gray-700 transition-colors hover:border-gray-400 focus:border-indigo-500 focus:outline-none bg-white text-left font-medium"
                style={{ fontFamily }}
              >
                <span className="truncate">{fontFamily}</span>
                <svg
                  className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 shrink-0 ml-1 ${isFontDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isFontDropdownOpen && (
                <div
                  className="absolute left-0 mt-1 z-[9999] w-64 rounded-xl border border-gray-100 bg-white p-1.5 shadow-2xl flex flex-col max-h-[340px]"
                  style={{ animation: "dropdown-fade 0.15s ease-out" }}
                >
                  {/* Search Bar */}
                  <div className="px-2 py-1.5 border-b border-gray-100 mb-1 flex items-center gap-1.5 shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search fonts..."
                      value={fontSearchQuery}
                      onChange={(e) => setFontSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Options list */}
                  <div className="flex-1 overflow-y-auto max-h-[200px] pr-0.5">
                    {filteredFonts.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          handleFontFamilyChange(f);
                          setIsFontDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left transition-all hover:bg-indigo-50/50 ${
                          fontFamily === f ? "bg-indigo-50 font-semibold text-indigo-700" : "text-gray-700 hover:text-gray-900"
                        }`}
                        style={{ fontFamily: f }}
                      >
                        <span className="truncate">{f}</span>
                        {fontFamily === f && <LuCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                    {filteredFonts.length === 0 && (
                      <div className="px-3 py-6 text-xs text-gray-400 text-center font-medium">No fonts found</div>
                    )}
                  </div>

                  {/* Dropdown Buttons Footer */}
                  <div className="border-t border-gray-100 bg-gray-50/80 rounded-b-lg p-1 mt-1 flex flex-col gap-0.5 shrink-0">
                    {/* Font upload button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsFontDropdownOpen(false);
                        fontFileInputRef.current?.click();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-gray-200/60 shadow-sm shadow-transparent hover:shadow-gray-100/50 transition-all text-left"
                    >
                      <svg className="h-4 w-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Font Upload
                    </button>

                    {/* Google Font button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsFontDropdownOpen(false);
                        setGoogleFontModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-gray-200/60 shadow-sm shadow-transparent hover:shadow-gray-100/50 transition-all text-left"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 0 1 8 4l-3 3.5a5 5 0 0 0-5-1.5c-2.5.5-4 3-3.5 5.5s3 4 5.5 3.5c1.5-.3 2.5-1.3 3-2.5h-3.5v-3H22v8h-3l-.5-2a7.5 7.5 0 0 1-6.5 2 8 8 0 0 1 0-16z"/>
                      </svg>
                      Google Font
                    </button>
                  </div>
                </div>
              )}
            </div>
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

      {/* Hidden file input for font uploading */}
      <input
        ref={fontFileInputRef}
        type="file"
        accept=".zip, .ttf, .otf, .woff, .woff2"
        onChange={handleFontFileChange}
        className="hidden"
      />

      {/* Google Font Import Modal */}
      {googleFontModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 8 4l-3 3.5a5 5 0 0 0-5-1.5c-2.5.5-4 3-3.5 5.5s3 4 5.5 3.5c1.5-.3 2.5-1.3 3-2.5h-3.5v-3H22v8h-3l-.5-2a7.5 7.5 0 0 1-6.5 2 8 8 0 0 1 0-16z"/>
                </svg>
                Import Google Font
              </h3>
              <button
                type="button"
                onClick={() => {
                  setGoogleFontModalOpen(false);
                  setGoogleFontInput("");
                  setGoogleFontError("");
                }}
                className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGoogleFontSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-600">
                  Google Font Link or Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Montserrat or specification URL"
                  value={googleFontInput}
                  onChange={(e) => {
                    setGoogleFontInput(e.target.value);
                    if (googleFontError) setGoogleFontError("");
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none transition-all placeholder:text-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  autoFocus
                />
                {googleFontError && (
                  <span className="text-[10px] font-medium text-red-500 pl-1 mt-0.5">
                    {googleFontError}
                  </span>
                )}
              </div>

              <div className="text-[10px] leading-relaxed text-gray-500 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                Type the font name (e.g. <b>Lobster</b> or <b>Dancing Script</b>), or paste a Google Fonts URL. The font will load dynamically and appear in the dropdown list.
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setGoogleFontModalOpen(false);
                    setGoogleFontInput("");
                    setGoogleFontError("");
                  }}
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-gray-200 hover:bg-gray-800 transition-all"
                >
                  Import Font
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {fontLoading && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 bg-white px-6 py-5 rounded-2xl shadow-2xl border border-gray-100">
            <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-semibold text-gray-800">Processing Font File...</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Scale & Grid toggle controls ──────────────────────── */
function ScaleGridControls({
  showRuler,
  onShowRulerChange,
  showGrid,
  onShowGridChange,
}: {
  showRuler?: boolean;
  onShowRulerChange?: (v: boolean) => void;
  showGrid?: boolean;
  onShowGridChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* ─ Scale / Ruler ─ */}
      <label
        className="flex cursor-pointer items-center gap-1.5 select-none group"
        title="Toggle ruler"
      >
        <LuRuler className={`w-3.5 h-3.5 transition-colors ${showRuler ? "text-indigo-600" : "text-gray-500"}`} />
        <span className={`text-xs font-medium transition-colors ${showRuler ? "text-indigo-700" : "text-gray-600"}`}>
          Scale
        </span>
        {/* custom checkbox — right of title */}
        <span
          onClick={() => onShowRulerChange?.(!showRuler)}
          className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-150 ${
            showRuler
              ? "bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200"
              : "border-gray-300 bg-white group-hover:border-indigo-400"
          }`}
        >
          {showRuler && <LuCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
        </span>
      </label>

      {/* ─ Grid ─ */}
      <label
        className="flex cursor-pointer items-center gap-1.5 select-none group"
        title="Toggle grid"
      >
        <LuGrid3X3 className={`w-3.5 h-3.5 transition-colors ${showGrid ? "text-indigo-600" : "text-gray-500"}`} />
        <span className={`text-xs font-medium transition-colors ${showGrid ? "text-indigo-700" : "text-gray-600"}`}>
          Grid
        </span>
        {/* custom checkbox — right of title */}
        <span
          onClick={() => onShowGridChange?.(!showGrid)}
          className={`flex h-4 w-4 items-center justify-center rounded border transition-all duration-150 ${
            showGrid
              ? "bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-200"
              : "border-gray-300 bg-white group-hover:border-indigo-400"
          }`}
        >
          {showGrid && <LuCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
        </span>
      </label>
    </div>
  );
}
