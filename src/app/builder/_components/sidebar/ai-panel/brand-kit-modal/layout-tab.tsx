"use client";

import { useState } from "react";
import { LuCheck, LuPencil, LuLayoutGrid } from "react-icons/lu";
import type { BrandKit, BrandKitLayout } from "@/lib/types";
import { DEFAULT_LAYOUTS, POSITION_OPTIONS } from "./layouts-data";

interface LayoutTabProps {
  editingBrandKit: BrandKit | null;
  onChange: (updated: BrandKit) => void;
}

/* ── Tiny visual canvas that illustrates a layout ───────── */
function LayoutPreview({ layout }: { layout: BrandKitLayout }) {
  // Map position strings to rough visual coordinates for the mini-preview
  const posMap: Record<string, { x: number; y: number }> = {
    "top-left": { x: 8, y: 6 },
    "top-center": { x: 38, y: 6 },
    "top-center-large": { x: 25, y: 4 },
    "top-center-spanning": { x: 20, y: 4 },
    "top-center-above-heading": { x: 38, y: 2 },
    "top-center-below-heading": { x: 30, y: 18 },
    "top-right": { x: 68, y: 6 },
    "top-left-large": { x: 4, y: 4 },
    "top-left-below-heading": { x: 4, y: 18 },
    "top-banner-center": { x: 30, y: 4 },
    "top-banner-left": { x: 4, y: 4 },
    "top-banner-right": { x: 72, y: 4 },
    "center-left": { x: 8, y: 36 },
    center: { x: 30, y: 36 },
    "center-right": { x: 62, y: 36 },
    "center-upper": { x: 30, y: 26 },
    "center-full-width": { x: 10, y: 30 },
    "upper-center": { x: 30, y: 24 },
    "middle-center": { x: 30, y: 38 },
    "left-top": { x: 4, y: 6 },
    "left-center": { x: 4, y: 36 },
    "left-bottom": { x: 4, y: 62 },
    "left-center-heading": { x: 4, y: 32 },
    "left-below-heading": { x: 4, y: 44 },
    "right-top": { x: 62, y: 6 },
    "right-center": { x: 62, y: 36 },
    "right-bottom": { x: 62, y: 62 },
    "right-half-diagonal": { x: 55, y: 20 },
    "right-large": { x: 52, y: 12 },
    "right-column-full-height": { x: 62, y: 10 },
    "below-banner-center": { x: 30, y: 18 },
    "bottom-left": { x: 8, y: 62 },
    "bottom-center": { x: 38, y: 62 },
    "bottom-center-above-heading": { x: 30, y: 54 },
    "bottom-right": { x: 68, y: 62 },
    "bottom-center-inside-frame": { x: 38, y: 62 },
    "center-bottom-inside-frame": { x: 38, y: 62 },
    "center-top-inside-frame": { x: 38, y: 8 },
    "center-below-subtitle": { x: 30, y: 46 },
    "full-background": { x: 0, y: 0 },
    "card-top-center": { x: 28, y: 18 },
    "card-center": { x: 28, y: 36 },
    "card-top-left": { x: 18, y: 18 },
    "card-bottom-center": { x: 28, y: 56 },
    "grid-cells": { x: 10, y: 30 },
    "top-half": { x: 10, y: 10 },
  };

  const getPos = (key: string) => posMap[key] ?? { x: 40, y: 40 };

  const h = getPos(layout.headingPosition);
  const s = getPos(layout.subtitlePosition);
  const l = getPos(layout.logoPosition);
  const img = getPos(layout.imagePosition);
  const ic = getPos(layout.iconPosition);

  return (
    <svg viewBox="0 0 90 78" className="w-full h-full" aria-hidden>
      {/* Canvas background */}
      <rect x="0" y="0" width="90" height="78" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />

      {/* Image area */}
      {layout.imagePosition === "full-background" ? (
        <rect x="2" y="2" width="86" height="74" rx="2" fill="#dbeafe" opacity="0.4" />
      ) : layout.imagePosition === "right-column-full-height" ? (
        <rect x={img.x} y={img.y} width="24" height="58" rx="2" fill="#dbeafe" opacity="0.6" />
      ) : layout.imagePosition === "right-large" ? (
        <rect x={img.x} y={img.y} width="34" height="50" rx="2" fill="#dbeafe" opacity="0.6" />
      ) : layout.imagePosition === "top-half" ? (
        <rect x={img.x} y={img.y} width="70" height="28" rx="2" fill="#dbeafe" opacity="0.6" />
      ) : layout.imagePosition === "grid-cells" ? (
        <>
          <rect x="8" y="30" width="22" height="18" rx="1.5" fill="#dbeafe" opacity="0.6" />
          <rect x="34" y="30" width="22" height="18" rx="1.5" fill="#dbeafe" opacity="0.6" />
          <rect x="60" y="30" width="22" height="18" rx="1.5" fill="#dbeafe" opacity="0.6" />
        </>
      ) : (
        <rect x={img.x} y={img.y} width="28" height="18" rx="2" fill="#dbeafe" opacity="0.6" />
      )}

      {/* Heading */}
      <rect x={h.x} y={h.y} width={layout.headingPosition.includes("large") ? 40 : 26} height="4" rx="1" fill="#6366f1" />

      {/* Subtitle */}
      <rect x={s.x} y={s.y} width={20} height="2.5" rx="0.8" fill="#a5b4fc" />

      {/* Logo */}
      <rect x={l.x} y={l.y} width="8" height="8" rx="2" fill="#f59e0b" opacity="0.7" />

      {/* Icon dots */}
      <circle cx={ic.x + 2} cy={ic.y + 3} r="2.5" fill="#10b981" opacity="0.6" />
      <circle cx={ic.x + 9} cy={ic.y + 3} r="2.5" fill="#10b981" opacity="0.6" />
    </svg>
  );
}

/* ── Element field definitions ────────────────────────────── */
const ELEMENT_FIELDS: { key: keyof Pick<BrandKitLayout, "headingPosition" | "subtitlePosition" | "logoPosition" | "imagePosition" | "iconPosition">; label: string; color: string }[] = [
  { key: "headingPosition", label: "Heading", color: "#6366f1" },
  { key: "subtitlePosition", label: "Subtitle", color: "#a5b4fc" },
  { key: "logoPosition", label: "Logo", color: "#f59e0b" },
  { key: "imagePosition", label: "Image / Graphic", color: "#3b82f6" },
  { key: "iconPosition", label: "Icons / Footer", color: "#10b981" },
];

/* ── Main component ──────────────────────────────────────── */
export function LayoutTab({ editingBrandKit, onChange }: LayoutTabProps) {
  const [customizing, setCustomizing] = useState(false);

  if (!editingBrandKit) return null;

  const activeLayout = editingBrandKit.layout;
  const activeId = activeLayout?.id ?? null;

  const selectLayout = (layout: BrandKitLayout) => {
    setCustomizing(false);
    onChange({ ...editingBrandKit, layout: { ...layout } });
  };

  const startCustom = () => {
    setCustomizing(true);
    onChange({
      ...editingBrandKit,
      layout: {
        id: "layout-custom",
        name: "Custom Layout",
        description: "Your own custom element positioning.",
        headingPosition: activeLayout?.headingPosition ?? "top-center",
        subtitlePosition: activeLayout?.subtitlePosition ?? "center",
        logoPosition: activeLayout?.logoPosition ?? "top-left",
        imagePosition: activeLayout?.imagePosition ?? "center",
        iconPosition: activeLayout?.iconPosition ?? "bottom-center",
        isCustom: true,
      },
    });
  };

  const updateCustomField = (field: string, value: string) => {
    if (!activeLayout) return;
    onChange({
      ...editingBrandKit,
      layout: { ...activeLayout, [field]: value, isCustom: true, id: "layout-custom", name: "Custom Layout" },
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Section title */}
      <div className="border-b pb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <LuLayoutGrid className="w-5 h-5 text-indigo-600" />
          Layout System
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Choose a layout to guide the AI on where to position headings, subtitles, images, logos, and icons.
        </p>
      </div>

      {/* ── Default layouts grid ────────────────────────── */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
          Default Layouts
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {DEFAULT_LAYOUTS.map((layout) => {
            const isSelected = activeId === layout.id;
            return (
              <button
                key={layout.id}
                onClick={() => selectLayout(layout)}
                className={`group relative flex flex-col rounded-xl border-2 p-2.5 transition-all duration-200 text-left hover:shadow-md ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/60 shadow-md ring-2 ring-indigo-200"
                    : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                {/* Selected badge */}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm z-10">
                    <LuCheck className="w-3 h-3 text-white" />
                  </span>
                )}

                {/* Mini preview */}
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-white border border-gray-100 mb-2">
                  <LayoutPreview layout={layout} />
                </div>

                {/* Label */}
                <span className={`text-[11px] font-semibold leading-tight ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                  {layout.name}
                </span>
                <span className="text-[9px] text-gray-400 leading-snug mt-0.5 line-clamp-2">
                  {layout.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Custom layout section ───────────────────────── */}
      <div className="border-t pt-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <LuPencil className="w-3.5 h-3.5" />
          Custom Layout
        </h4>

        {!customizing && activeId !== "layout-custom" ? (
          <button
            onClick={startCustom}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-200"
          >
            <LuPencil className="w-4 h-4" />
            Create Custom Layout
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/20">
            {/* Live preview of the custom layout */}
            {activeLayout && (
              <div className="w-full max-w-[200px] mx-auto aspect-[4/3] rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
                <LayoutPreview layout={activeLayout} />
              </div>
            )}

            {/* Position dropdowns */}
            <div className="grid grid-cols-1 gap-3">
              {ELEMENT_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-36 shrink-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: field.color }}
                    />
                    <label className="text-xs font-semibold text-gray-600">
                      {field.label}
                    </label>
                  </div>
                  <select
                    value={activeLayout?.[field.key] ?? "center"}
                    onChange={(e) => updateCustomField(field.key, e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-colors"
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Reset to preset */}
            <button
              onClick={() => {
                setCustomizing(false);
                onChange({ ...editingBrandKit, layout: undefined });
              }}
              className="text-[11px] text-gray-400 hover:text-red-500 transition-colors underline"
            >
              Clear custom layout
            </button>
          </div>
        )}
      </div>

      {/* ── Legend ───────────────────────────────────────── */}
      <div className="border-t pt-4">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Color Legend</p>
        <div className="flex flex-wrap gap-3">
          {ELEMENT_FIELDS.map((f) => (
            <span key={f.key} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
