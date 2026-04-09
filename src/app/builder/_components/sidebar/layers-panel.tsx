"use client";

import { useState, useEffect, useCallback } from "react";
import type { Canvas, FabricObject } from "fabric";

interface LayersPanelProps {
  canvas: Canvas | null;
}

interface LayerItem {
  index: number;
  name: string;
  type: string;
  visible: boolean;
  selectable: boolean;
}

export function LayersPanel({ canvas }: LayersPanelProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);

  const refreshLayers = useCallback(() => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    setLayers(
      objects.map((obj, i) => ({
        index: i,
        name: getObjectName(obj, i),
        type: obj.type || "object",
        visible: obj.visible !== false,
        selectable: obj.selectable !== false,
      })).reverse()
    );
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const handler = () => refreshLayers();
    handler();
    canvas.on("object:added", handler);
    canvas.on("object:removed", handler);
    canvas.on("object:modified", handler);
    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:removed", handler);
      canvas.off("object:modified", handler);
    };
  }, [canvas, refreshLayers]);

  function toggleVisibility(layer: LayerItem) {
    if (!canvas) return;
    const obj = canvas.getObjects()[layer.index];
    if (!obj) return;
    obj.visible = !obj.visible;
    canvas.requestRenderAll();
    refreshLayers();
  }

  function toggleLock(layer: LayerItem) {
    if (!canvas) return;
    const obj = canvas.getObjects()[layer.index];
    if (!obj) return;
    obj.selectable = !obj.selectable;
    obj.evented = obj.selectable;
    canvas.requestRenderAll();
    refreshLayers();
  }

  function selectObject(layer: LayerItem) {
    if (!canvas) return;
    const obj = canvas.getObjects()[layer.index];
    if (!obj || !obj.selectable) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }

  function moveLayer(fromDisplayIndex: number, direction: "up" | "down") {
    if (!canvas) return;
    const objectsLen = canvas.getObjects().length;
    const objectIndex = objectsLen - 1 - fromDisplayIndex;
    const obj = canvas.getObjects()[objectIndex];
    if (!obj) return;
    if (direction === "up" && objectIndex < objectsLen - 1) {
      canvas.moveObjectTo(obj, objectIndex + 1);
    } else if (direction === "down" && objectIndex > 0) {
      canvas.moveObjectTo(obj, objectIndex - 1);
    }
    canvas.requestRenderAll();
    refreshLayers();
  }

  if (!canvas) return <p className="text-xs text-gray-400">Loading canvas…</p>;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Layers ({layers.length})</h3>
      {layers.length === 0 && <p className="text-xs text-gray-400">No objects on canvas</p>}
      <div className="space-y-1">
        {layers.map((layer, displayIdx) => (
          <div
            key={`${layer.index}-${layer.name}`}
            className="flex items-center gap-1 rounded border border-gray-100 px-2 py-1.5 text-xs hover:bg-gray-50"
          >
            <button onClick={() => selectObject(layer)} className="flex-1 truncate text-left text-gray-700">
              <span className="mr-1 text-gray-400">{layer.type}</span>
              {layer.name}
            </button>
            <button onClick={() => moveLayer(displayIdx, "up")} className="px-0.5 text-gray-400 hover:text-gray-700" title="Move up">↑</button>
            <button onClick={() => moveLayer(displayIdx, "down")} className="px-0.5 text-gray-400 hover:text-gray-700" title="Move down">↓</button>
            <button onClick={() => toggleVisibility(layer)} className={`px-0.5 ${layer.visible ? "text-gray-500" : "text-red-400"}`} title="Toggle visibility">
              {layer.visible ? "👁" : "👁‍🗨"}
            </button>
            <button onClick={() => toggleLock(layer)} className={`px-0.5 ${layer.selectable ? "text-gray-500" : "text-amber-500"}`} title="Toggle lock">
              {layer.selectable ? "🔓" : "🔒"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function getObjectName(obj: FabricObject, index: number): string {
  if ("text" in obj && typeof obj.text === "string") {
    return obj.text.substring(0, 30) || `Text ${index + 1}`;
  }
  return `${obj.type || "Object"} ${index + 1}`;
}
