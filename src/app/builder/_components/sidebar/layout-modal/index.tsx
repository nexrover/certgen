"use client";

import { useState } from "react";
import {
  LuX,
  LuCheck,
  LuPencil,
  LuLayoutGrid,
  LuPlus,
  LuTrash2,
  LuCopy,
  LuArrowLeft,
  LuSave,
} from "react-icons/lu";
import type { BrandKit, BrandKitLayout } from "@/lib/types";
import { DEFAULT_LAYOUTS, POSITION_OPTIONS } from "../ai-panel/brand-kit-modal/layouts-data";
import { buildLayoutSkeleton } from "@/lib/builder/fabric-utils";
import type { Canvas } from "fabric";

interface LayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBrandKit: BrandKit | null;
  onChange: (updated: BrandKit) => void;
  canvas?: Canvas | null;
}

/* ── Tiny visual canvas that illustrates a layout ───────── */
function LayoutPreview({ layout }: { layout: BrandKitLayout }) {
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
      <rect x="0" y="0" width="90" height="78" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />

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

      <rect x={h.x} y={h.y} width={layout.headingPosition.includes("large") ? 40 : 26} height="4" rx="1" fill="#6366f1" />
      <rect x={s.x} y={s.y} width={20} height="2.5" rx="0.8" fill="#a5b4fc" />
      <rect x={l.x} y={l.y} width="8" height="8" rx="2" fill="#f59e0b" opacity="0.7" />
      <circle cx={ic.x + 2} cy={ic.y + 3} r="2.5" fill="#10b981" opacity="0.6" />
      <circle cx={ic.x + 9} cy={ic.y + 3} r="2.5" fill="#10b981" opacity="0.6" />
    </svg>
  );
}

/* ── Element field definitions ────────────────────────────── */
const ELEMENT_FIELDS: {
  key: keyof Pick<BrandKitLayout, "headingPosition" | "subtitlePosition" | "logoPosition" | "imagePosition" | "iconPosition">;
  label: string;
  color: string;
}[] = [
  { key: "headingPosition", label: "Heading", color: "#6366f1" },
  { key: "subtitlePosition", label: "Subtitle", color: "#a5b4fc" },
  { key: "logoPosition", label: "Logo", color: "#f59e0b" },
  { key: "imagePosition", label: "Image / Graphic", color: "#3b82f6" },
  { key: "iconPosition", label: "Icons / Footer", color: "#10b981" },
];

type LayoutTabView = "my-layouts" | "default-layouts";
type EditorMode = "closed" | "creating" | "editing";

export function LayoutModal({ isOpen, onClose, editingBrandKit, onChange, canvas }: LayoutModalProps) {
  const [activeTab, setActiveTab] = useState<LayoutTabView>("my-layouts");
  const [editorMode, setEditorMode] = useState<EditorMode>("closed");
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);

  const [editorTitle, setEditorTitle] = useState("");
  const [editorPositions, setEditorPositions] = useState({
    headingPosition: "top-center",
    subtitlePosition: "center",
    logoPosition: "top-left",
    imagePosition: "center",
    iconPosition: "bottom-center",
  });

  const kit = editingBrandKit || {
    id: "temp-brand-kit",
    user_id: "",
    name: "Temporary Brand Kit",
    colors: [],
    typography: {},
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    custom_layouts: [],
    created_at: "",
    updated_at: "",
  };

  const activeLayout = kit.layout;
  const customLayouts = kit.custom_layouts ?? [];
  const activeId = activeLayout?.id ?? null;

  const selectDefaultLayout = (layout: BrandKitLayout) => {
    setEditorMode("closed");
    setEditingCustomId(null);
    onChange({ ...kit, layout: { ...layout } });
    if (canvas) {
      buildLayoutSkeleton(canvas, layout);
    }
  };

  const selectCustomLayout = (layout: BrandKitLayout) => {
    setEditorMode("closed");
    setEditingCustomId(null);
    onChange({ ...kit, layout: { ...layout } });
    if (canvas) {
      buildLayoutSkeleton(canvas, layout);
    }
  };

  const startCreating = () => {
    setEditorMode("creating");
    setEditingCustomId(null);
    setEditorTitle("");
    setEditorPositions({
      headingPosition: activeLayout?.headingPosition ?? "top-center",
      subtitlePosition: activeLayout?.subtitlePosition ?? "center",
      logoPosition: activeLayout?.logoPosition ?? "top-left",
      imagePosition: activeLayout?.imagePosition ?? "center",
      iconPosition: activeLayout?.iconPosition ?? "bottom-center",
    });
  };

  const startEditing = (layout: BrandKitLayout) => {
    setEditorMode("editing");
    setEditingCustomId(layout.id);
    setEditorTitle(layout.title ?? layout.name);
    setEditorPositions({
      headingPosition: layout.headingPosition,
      subtitlePosition: layout.subtitlePosition,
      logoPosition: layout.logoPosition,
      imagePosition: layout.imagePosition,
      iconPosition: layout.iconPosition,
    });
    onChange({ ...kit, layout: { ...layout } });
  };

  const cancelEditor = () => {
    setEditorMode("closed");
    setEditingCustomId(null);
    setEditorTitle("");
  };

  const saveCustomLayout = () => {
    if (!editorTitle.trim()) return;

    const newLayout: BrandKitLayout = {
      id: editingCustomId ?? `custom-${Date.now()}`,
      name: editorTitle.trim(),
      title: editorTitle.trim(),
      description: "Your custom layout.",
      headingPosition: editorPositions.headingPosition,
      subtitlePosition: editorPositions.subtitlePosition,
      logoPosition: editorPositions.logoPosition,
      imagePosition: editorPositions.imagePosition,
      iconPosition: editorPositions.iconPosition,
      isCustom: true,
    };

    let updatedCustomLayouts: BrandKitLayout[];
    if (editorMode === "editing" && editingCustomId) {
      updatedCustomLayouts = customLayouts.map((l) =>
        l.id === editingCustomId ? newLayout : l
      );
    } else {
      updatedCustomLayouts = [newLayout, ...customLayouts];
    }

    onChange({
      ...kit,
      layout: { ...newLayout },
      custom_layouts: updatedCustomLayouts,
    });

    if (editorMode !== "editing") {
      setActiveTab("my-layouts");
    }

    setEditorMode("closed");
    setEditingCustomId(null);
    setEditorTitle("");
  };

  const deleteCustomLayout = (id: string) => {
    const updatedCustomLayouts = customLayouts.filter((l) => l.id !== id);
    const updates: Partial<BrandKit> = { custom_layouts: updatedCustomLayouts };

    if (activeId === id) {
      updates.layout = undefined;
    }

    if (editingCustomId === id) {
      setEditorMode("closed");
      setEditingCustomId(null);
    }

    onChange({ ...kit, ...updates });
  };

  const duplicateCustomLayout = (layout: BrandKitLayout) => {
    const newLayout: BrandKitLayout = {
      ...layout,
      id: `custom-${Date.now()}`,
      name: `${layout.title ?? layout.name} (Copy)`,
      title: `${layout.title ?? layout.name} (Copy)`,
    };
    onChange({
      ...kit,
      custom_layouts: [newLayout, ...customLayouts],
    });
  };

  const clearActiveLayout = () => {
    setEditorMode("closed");
    setEditingCustomId(null);
    onChange({ ...kit, layout: undefined });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[80vh] min-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <LuLayoutGrid className="w-5 h-5 text-indigo-600" />
              Layout System
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Choose a layout to guide the AI on element positioning
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <LuX className="w-6 h-6" />
          </button>
        </div>

        {/* Horizontal Tab Bar */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => { setActiveTab("my-layouts"); setEditorMode("closed"); }}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "my-layouts" && editorMode === "closed"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Layout (Custom)
          </button>
          <button
            onClick={() => { setActiveTab("default-layouts"); setEditorMode("closed"); }}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "default-layouts" && editorMode === "closed"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Default Layout
          </button>
        </div>

        {/* Active layout indicator */}
        {activeLayout && editorMode === "closed" && (
          <div className="mx-6 mt-4 flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-2.5 border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-700">
                Active: {activeLayout.title ?? activeLayout.name}
              </span>
            </div>
            <button
              onClick={clearActiveLayout}
              className="text-[11px] text-indigo-400 hover:text-red-500 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          {editorMode !== "closed" ? (
            /* Editor View */
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={cancelEditor}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <LuArrowLeft className="w-4 h-4" />
                  </button>
                  <h4 className="text-sm font-bold text-gray-800">
                    {editorMode === "editing" ? "Edit Custom Layout" : "Create Custom Layout"}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEditor}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomLayout}
                    disabled={!editorTitle.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <LuSave className="w-3.5 h-3.5" />
                    {editorMode === "editing" ? "Update" : "Save Layout"}
                  </button>
                </div>
              </div>

              <div className="flex gap-5 flex-1 min-h-[400px]">
                {/* Left column — Preview (60%) */}
                <div className="w-[60%] flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
                  <div className="flex-1 rounded-2xl border-2 border-gray-200 bg-white p-4 flex items-center justify-center shadow-sm">
                    <div className="w-full max-w-[280px] aspect-[4/3]">
                      <LayoutPreview layout={{
                        id: "editor-preview",
                        name: editorTitle || "Custom Layout",
                        description: "",
                        ...editorPositions,
                      }} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {ELEMENT_FIELDS.map((f) => (
                      <span key={f.key} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right column — Customization (40%) */}
                <div className="w-[40%] flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Customize</p>
                  <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Layout Title</label>
                      <input
                        type="text"
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        placeholder="My Custom Layout"
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-colors"
                      />
                    </div>
                    {ELEMENT_FIELDS.map((field) => (
                      <div key={field.key}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: field.color }} />
                          <label className="text-xs font-semibold text-gray-600">{field.label}</label>
                        </div>
                        <select
                          value={editorPositions[field.key]}
                          onChange={(e) =>
                            setEditorPositions((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-colors"
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
                </div>
              </div>
            </div>
          ) : activeTab === "my-layouts" ? (
            /* My Layouts Tab */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                onClick={startCreating}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-300 text-left hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 group"
              >
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors shrink-0">
                  <LuPlus className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors block">
                    Create New Layout
                  </span>
                  <span className="text-xs text-gray-400">
                    Design your own element positioning
                  </span>
                </div>
              </button>

              {customLayouts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <LuLayoutGrid className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">No custom layouts yet</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first layout to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {customLayouts.map((layout) => {
                    const isSelected = activeId === layout.id;
                    return (
                      <div
                        key={layout.id}
                        onClick={() => selectCustomLayout(layout)}
                        className={`group relative flex flex-col rounded-2xl border-2 p-3 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                          isSelected
                            ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 shadow-lg ring-2 ring-indigo-200"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm z-10">
                            <LuCheck className="w-3 h-3 text-white" />
                          </span>
                        )}

                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEditing(layout); }}
                            className="w-6 h-6 rounded-md bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                            title="Edit layout"
                          >
                            <LuPencil className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); duplicateCustomLayout(layout); }}
                            className="w-6 h-6 rounded-md bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            title="Duplicate layout"
                          >
                            <LuCopy className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteCustomLayout(layout.id); }}
                            className="w-6 h-6 rounded-md bg-white/90 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors"
                            title="Delete layout"
                          >
                            <LuTrash2 className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>

                        <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-2.5">
                          <LayoutPreview layout={layout} />
                        </div>
                        <span className={`text-[11px] font-semibold leading-tight ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                          {layout.title ?? layout.name}
                        </span>
                        <span className="text-[9px] text-gray-400 leading-snug mt-0.5 line-clamp-2">
                          {layout.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Default Layouts Tab */
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_LAYOUTS.map((layout) => {
                  const isSelected = activeId === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => selectDefaultLayout(layout)}
                      className={`group relative flex flex-col rounded-2xl border-2 p-3 transition-all duration-200 text-left hover:shadow-lg ${
                        isSelected
                          ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 shadow-lg ring-2 ring-indigo-200"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm z-10">
                          <LuCheck className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-2.5">
                        <LayoutPreview layout={layout} />
                      </div>
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
          )}
        </div>

        {/* Legend */}
        {editorMode === "closed" && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-wrap gap-3">
              {ELEMENT_FIELDS.map((f) => (
                <span key={f.key} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                  {f.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
