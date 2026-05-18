"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Canvas, FabricObject } from "fabric";

interface LayersPanelProps {
  canvas: Canvas | null;
  onBgSelected?: (selected: boolean) => void;
}

interface LayerItem {
  index: number;
  name: string;
  type: string;
  visible: boolean;
  selectable: boolean;
}

/* ── Component ─────────────────────────────────────────── */

export function LayersPanel({ canvas, onBgSelected }: LayersPanelProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [bgActive, setBgActive] = useState(false);

  /* Drag state */
  const dragSrcIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  /* ── Refresh ─────────────────────────────────────────── */

  const refreshLayers = useCallback(() => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    setLayers(
      objects
        .map((obj, i) => ({
          index: i,
          name: getObjectName(obj, i),
          type: obj.type || "object",
          visible: obj.visible !== false,
          selectable: obj.selectable !== false,
        }))
        .reverse()
    );

    // Track selection
    const active = canvas.getActiveObject();
    if (active) {
      const idx = objects.indexOf(active);
      setActiveIdx(idx >= 0 ? idx : null);
    } else {
      setActiveIdx(null);
    }
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const handler = () => refreshLayers();
    handler();
    canvas.on("object:added", handler);
    canvas.on("object:removed", handler);
    canvas.on("object:modified", handler);
    canvas.on("selection:created", handler);
    canvas.on("selection:updated", handler);
    canvas.on("selection:cleared", () => {
      refreshLayers();
      setBgActive(false);
      onBgSelected?.(false);
    });
    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:removed", handler);
      canvas.off("object:modified", handler);
      canvas.off("selection:created", handler);
      canvas.off("selection:updated", handler);
      canvas.off("selection:cleared", handler);
    };
  }, [canvas, refreshLayers, onBgSelected]);

  /* ── Actions ─────────────────────────────────────────── */

  function selectObject(layer: LayerItem) {
    if (!canvas) return;
    const obj = canvas.getObjects()[layer.index];
    if (!obj || !obj.selectable) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    setBgActive(false);
    onBgSelected?.(false);
  }

  function toggleVisibility(layer: LayerItem) {
    if (!canvas) return;
    const obj = canvas.getObjects()[layer.index];
    if (!obj) return;
    obj.visible = !obj.visible;
    canvas.requestRenderAll();
    refreshLayers();
  }

  function selectBackground() {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    setBgActive(true);
    onBgSelected?.(true);
  }

  /* ── Drag & Drop ─────────────────────────────────────── */

  function handleDragStart(displayIdx: number) {
    dragSrcIdx.current = displayIdx;
  }

  function handleDragOver(e: React.DragEvent, displayIdx: number) {
    e.preventDefault();
    if (dragSrcIdx.current === null) return;
    setDragOverIdx(displayIdx);
  }

  function handleDragLeave() {
    setDragOverIdx(null);
  }

  function handleDrop(e: React.DragEvent, targetDisplayIdx: number) {
    e.preventDefault();
    setDragOverIdx(null);
    if (!canvas || dragSrcIdx.current === null) return;

    const srcDisplayIdx = dragSrcIdx.current;
    if (srcDisplayIdx === targetDisplayIdx) return;

    const srcLayer = layers[srcDisplayIdx];
    const targetLayer = layers[targetDisplayIdx];
    if (!srcLayer || !targetLayer) return;

    const obj = canvas.getObjects()[srcLayer.index];
    if (!obj) return;

    canvas.moveObjectTo(obj, targetLayer.index);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
    dragSrcIdx.current = null;
    refreshLayers();
  }

  function handleDragEnd() {
    dragSrcIdx.current = null;
    setDragOverIdx(null);
  }

  /* ── Render ──────────────────────────────────────────── */

  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div className="flex flex-col h-full">
      {layers.length === 0 && (
        <p className="text-xs text-gray-400 mb-4">No objects on canvas</p>
      )}

      {/* Draggable layer list */}
      <div className="flex-1 space-y-0.5 overflow-y-auto mb-2">
        {layers.map((layer, displayIdx) => {
          const isActive = layer.index === activeIdx;
          const isDragOver = dragOverIdx === displayIdx;

          return (
            <div
              key={`${layer.index}-${layer.name}`}
              draggable
              onDragStart={() => handleDragStart(displayIdx)}
              onDragOver={(e) => handleDragOver(e, displayIdx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, displayIdx)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-2 rounded-lg border p-2 text-[13px] transition-all cursor-grab active:cursor-grabbing select-none ${
                isActive
                  ? "border-indigo-400 bg-indigo-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm"
              } ${isDragOver ? "ring-2 ring-indigo-400 bg-indigo-50/50" : ""}`}
              onClick={() => selectObject(layer)}
            >
              {/* Drag handle */}
              <span
                className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors cursor-grab"
                title="Drag to reorder"
              >
                <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                  <circle cx="2.5" cy="2" r="1.3" />
                  <circle cx="7.5" cy="2" r="1.3" />
                  <circle cx="2.5" cy="6" r="1.3" />
                  <circle cx="7.5" cy="6" r="1.3" />
                  <circle cx="2.5" cy="10" r="1.3" />
                  <circle cx="7.5" cy="10" r="1.3" />
                  <circle cx="2.5" cy="14" r="1.3" />
                  <circle cx="7.5" cy="14" r="1.3" />
                </svg>
              </span>

              {/* Name */}
              <span
                className={`flex-1 truncate ${
                  isActive ? "text-indigo-700 font-medium" : "text-gray-700"
                } ${!layer.visible ? "line-through opacity-50" : ""}`}
              >
                {layer.name}
              </span>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(layer);
                }}
                className={`flex-shrink-0 p-0.5 rounded transition-colors ${
                  layer.visible
                    ? "text-gray-300 hover:text-gray-600"
                    : "text-red-400 hover:text-red-600"
                }`}
                title={layer.visible ? "Hide" : "Show"}
              >
                {layer.visible ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Fixed Background Layer ────────────────────── */}
      <div className="mt-auto border-t border-gray-100 pt-2">
        <button
          onClick={selectBackground}
          className={`flex w-full items-center gap-2 rounded-lg border p-2 text-[13px] transition-all select-none ${
            bgActive
              ? "border-indigo-400 bg-indigo-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-sm"
          }`}
        >
          {/* Grid icon */}
          <span className={`flex-shrink-0 ${bgActive ? "text-indigo-500" : "text-gray-400"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </span>
          <span className={`flex-1 text-left truncate font-medium ${bgActive ? "text-indigo-700" : "text-gray-500"}`}>
            Background
          </span>
        </button>
      </div>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────── */

function getObjectName(obj: FabricObject, index: number): string {
  if ((obj as any).name) {
    return (obj as any).name;
  }
  if ("text" in obj && typeof obj.text === "string") {
    const t = obj.text.trim();
    return t.length > 0 ? t.substring(0, 40) : `Text ${index + 1}`;
  }
  const typeLabel: Record<string, string> = {
    rect: "Rectangle",
    circle: "Circle",
    triangle: "Triangle",
    path: "Shape",
    line: "Line",
    image: "Image",
    group: "Group",
  };
  return typeLabel[obj.type || ""] ?? `${obj.type || "Object"} ${index + 1}`;
}
