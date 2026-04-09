"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { Canvas } from "fabric";

export interface CanvasEditorHandle {
  getCanvas: () => Canvas | null;
  setCanvasSize: (width: number, height: number) => void;
  toJSON: () => Record<string, unknown>;
  loadFromJSON: (json: Record<string, unknown>) => Promise<void>;
  loadPreset: (json: Record<string, unknown>) => void;
  undo: () => void;
  redo: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  deleteSelected: () => void;
}

interface CanvasEditorProps {
  width: number;
  height: number;
  onSelectionChange?: (hasSelection: boolean) => void;
  onCanvasModified?: () => void;
}

const MAX_HISTORY = 50;

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  function CanvasEditor({ width, height, onSelectionChange, onCanvasModified }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const suppressHistoryRef = useRef(false);
    const [scale, setScale] = useState(1);

    const saveHistory = useCallback(() => {
      if (suppressHistoryRef.current || !fabricRef.current) return;
      const json = JSON.stringify(fabricRef.current.toJSON());
      const idx = historyIndexRef.current;
      historyRef.current = historyRef.current.slice(0, idx + 1);
      historyRef.current.push(json);
      if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
      historyIndexRef.current = historyRef.current.length - 1;
    }, []);

    const calcFitScale = useCallback(() => {
      if (!containerRef.current) return 1;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const sx = (cw - 60) / width;
      const sy = (ch - 60) / height;
      return Math.min(sx, sy, 1);
    }, [width, height]);

    useEffect(() => {
      if (!canvasElRef.current || fabricRef.current) return;
      const fc = new Canvas(canvasElRef.current, {
        width,
        height,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true,
        selection: true,
      });
      fabricRef.current = fc;

      fc.on("object:modified", () => { saveHistory(); onCanvasModified?.(); });
      fc.on("object:added", () => { saveHistory(); onCanvasModified?.(); });
      fc.on("object:removed", () => { saveHistory(); onCanvasModified?.(); });
      fc.on("selection:created", () => onSelectionChange?.(true));
      fc.on("selection:updated", () => onSelectionChange?.(true));
      fc.on("selection:cleared", () => onSelectionChange?.(false));

      saveHistory();
      setScale(calcFitScale());

      return () => { fc.dispose(); fabricRef.current = null; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const fc = fabricRef.current;
      if (!fc) return;
      fc.setDimensions({ width, height });
      fc.renderAll();
      setScale(calcFitScale());
      saveHistory();
    }, [width, height, saveHistory, calcFitScale]);

    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        const fc = fabricRef.current;
        if (!fc) return;
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

        if ((e.key === "Delete" || e.key === "Backspace") && fc.getActiveObject()) {
          e.preventDefault();
          const active = fc.getActiveObject();
          if (active) { fc.remove(active); fc.discardActiveObject(); fc.requestRenderAll(); }
        }
        if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        if ((e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) || (e.key === "y" && (e.metaKey || e.ctrlKey))) {
          e.preventDefault();
          handleRedo();
        }
      }
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    function handleUndo() {
      const fc = fabricRef.current;
      if (!fc || historyIndexRef.current <= 0) return;
      historyIndexRef.current--;
      suppressHistoryRef.current = true;
      fc.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
        fc.renderAll();
        suppressHistoryRef.current = false;
      });
    }

    function handleRedo() {
      const fc = fabricRef.current;
      if (!fc || historyIndexRef.current >= historyRef.current.length - 1) return;
      historyIndexRef.current++;
      suppressHistoryRef.current = true;
      fc.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
        fc.renderAll();
        suppressHistoryRef.current = false;
      });
    }

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      setCanvasSize: (nextWidth: number, nextHeight: number) => {
        const fc = fabricRef.current;
        if (!fc) return;
        fc.setDimensions({ width: nextWidth, height: nextHeight });
        fc.requestRenderAll();
        setScale(calcFitScale());
      },
      toJSON: () => fabricRef.current ? (fabricRef.current.toJSON() as Record<string, unknown>) : {},
      loadFromJSON: async (json: Record<string, unknown>) => {
        const fc = fabricRef.current;
        if (!fc) return;
        suppressHistoryRef.current = true;
        await fc.loadFromJSON(json);
        fc.renderAll();
        suppressHistoryRef.current = false;
        saveHistory();
        setScale(calcFitScale());
      },
      loadPreset: (json: Record<string, unknown>) => {
        const fc = fabricRef.current;
        if (!fc) return;
        suppressHistoryRef.current = true;
        fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
        fc.loadFromJSON(json).then(() => {
          fc.renderAll();
          suppressHistoryRef.current = false;
          saveHistory();
          setScale(calcFitScale());
        });
      },
      undo: handleUndo,
      redo: handleRedo,
      zoomIn: () => setScale((s) => Math.min(s * 1.2, 3)),
      zoomOut: () => setScale((s) => Math.max(s / 1.2, 0.1)),
      zoomFit: () => setScale(calcFitScale()),
      deleteSelected: () => {
        const fc = fabricRef.current;
        if (!fc) return;
        const active = fc.getActiveObject();
        if (active) { fc.remove(active); fc.discardActiveObject(); fc.requestRenderAll(); }
      },
    }));

    return (
      <div ref={containerRef} className="relative flex flex-1 items-center justify-center overflow-auto bg-gray-100">
        <div
          style={{
            width: width * scale,
            height: height * scale,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="shadow-xl"
          >
            <canvas ref={canvasElRef} />
          </div>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
          <button onClick={() => setScale(calcFitScale())} className="hover:text-gray-900">Fit</button>
          <span>{Math.round(scale * 100)}%</span>
        </div>
      </div>
    );
  }
);
