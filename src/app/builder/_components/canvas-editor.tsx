"use client";

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from "react";
import { Canvas, type FabricObject } from "fabric";
import { FloatingContextMenu } from "./floating-context-menu";
import { SmartGuideManager } from "./smart-guides";

/* ── Public handle for parent components ──────────────── */

export interface CanvasEditorHandle {
  getCanvas: () => Canvas | null;
  setCanvasSize: (width: number, height: number) => void;
  toJSON: () => Record<string, unknown>;
  toDataURL: (opts?: { multiplier?: number; format?: string }) => string;
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

interface SelectionBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

/* ── Module-level clipboard ───────────────────────────── */

const MAX_HISTORY = 50;
let clipboard: FabricObject | null = null;

/* ── Component ────────────────────────────────────────── */

export const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  function CanvasEditor({ width, height, onSelectionChange, onCanvasModified }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const suppressHistoryRef = useRef(false);
    const [scale, setScale] = useState(1);
    const scaleRef = useRef(1);
    scaleRef.current = scale;
    const guidesRef = useRef<SmartGuideManager | null>(null);

    /* Selection-bounds state for the floating context menu */
    const [selectionBounds, setSelectionBounds] = useState<SelectionBounds | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    /* ── History helpers ──────────────────────────────── */

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

    /* ── Selection bounds tracker ─────────────────────── */

    const updateSelectionBounds = useCallback(() => {
      const fc = fabricRef.current;
      if (!fc) { setSelectionBounds(null); return; }
      const obj = fc.getActiveObject();
      if (!obj) { setSelectionBounds(null); setIsLocked(false); return; }
      const rect = obj.getBoundingRect();
      const s = scaleRef.current;
      setSelectionBounds({
        left: rect.left * s,
        top: rect.top * s,
        width: rect.width * s,
        height: rect.height * s,
      });
      setIsLocked(!!(obj.lockMovementX && obj.lockMovementY));
    }, []);

    /* ── Canvas initialisation ────────────────────────── */

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

      // Smart guide manager — SVG overlay for snap guides & distance indicators
      if (canvasWrapperRef.current) {
        guidesRef.current = new SmartGuideManager(canvasWrapperRef.current, width, height);
      }

      fc.on("object:modified", () => { saveHistory(); onCanvasModified?.(); });
      fc.on("object:added", () => { saveHistory(); onCanvasModified?.(); });
      fc.on("object:removed", () => { saveHistory(); onCanvasModified?.(); });
      fc.on("selection:created", () => onSelectionChange?.(true));
      fc.on("selection:updated", () => onSelectionChange?.(true));
      fc.on("selection:cleared", () => onSelectionChange?.(false));

      /* ── Boundary constraint ──────────────────────────── */
      //
      // Jitter-proof strategy:
      //  1. Snapshot bounding-rect geometry ONCE at drag start
      //  2. Compute valid left/top range from cached values (no Fabric API per frame)
      //  3. Math.round() to avoid sub-pixel oscillation
      //  4. Direct property write (obj.left = v) — avoids Fabric's set() side-effects
      //  5. setCoords() only when clamped position ACTUALLY changed

      let _bc: {
        dL: number; dT: number;   // offset: obj.left/top → bounding-rect left/top
        bW: number; bH: number;   // bounding-rect dimensions
        pL: number; pT: number;   // previous clamped left/top (to skip redundant setCoords)
      } | null = null;

      fc.on("mouse:down", () => { _bc = null; });

      fc.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj) return;

        const cW = fc.width!;
        const cH = fc.height!;

        // ── First frame: snapshot geometry ──
        if (!_bc) {
          const br = obj.getBoundingRect();
          const l = obj.left ?? 0;
          const t = obj.top ?? 0;
          _bc = {
            dL: l - br.left,
            dT: t - br.top,
            bW: br.width,
            bH: br.height,
            pL: l,
            pT: t,
          };
        }

        // ── Smart guides: snap to alignment ──
        if (guidesRef.current) {
          const snap = guidesRef.current.calculate(obj, fc);
          obj.left = (obj.left ?? 0) + snap.dx;
          obj.top = (obj.top ?? 0) + snap.dy;
        }

        const { dL, dT, bW, bH } = _bc;

        // ── Valid range ──
        const minL = dL;
        const maxL = cW - bW + dL;
        const minT = dT;
        const maxT = cH - bH + dT;

        // ── Clamp + round to whole pixels ──
        const clL = Math.round(Math.max(minL, Math.min(obj.left ?? 0, maxL)));
        const clT = Math.round(Math.max(minT, Math.min(obj.top ?? 0, maxT)));

        // ── Apply: direct property write, setCoords only when value changed ──
        obj.left = clL;
        obj.top = clT;

        if (clL !== _bc.pL || clT !== _bc.pT) {
          obj.setCoords();
          _bc.pL = clL;
          _bc.pT = clT;
        }

        // ── Red border when AT any edge (2px tolerance) ──
        const E = 2;
        const touching =
          clL <= minL + E || clL >= maxL - E ||
          clT <= minT + E || clT >= maxT - E;

        canvasWrapperRef.current?.classList.toggle("boundary-hit", touching);
      });

      fc.on("mouse:up", () => {
        _bc = null;
        guidesRef.current?.clear();
        canvasWrapperRef.current?.classList.remove("boundary-hit");
      });

      saveHistory();
      setScale(calcFitScale());

      return () => { guidesRef.current?.destroy(); guidesRef.current = null; fc.dispose(); fabricRef.current = null; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Bounds-tracking listeners ────────────────────── */

    useEffect(() => {
      const fc = fabricRef.current;
      if (!fc) return;

      const update = () => updateSelectionBounds();
      const clear = () => { setSelectionBounds(null); setIsLocked(false); };

      fc.on("selection:created", update);
      fc.on("selection:updated", update);
      fc.on("selection:cleared", clear);
      fc.on("object:moving", update);
      fc.on("object:scaling", update);
      fc.on("object:rotating", update);
      fc.on("object:modified", update);

      return () => {
        fc.off("selection:created", update);
        fc.off("selection:updated", update);
        fc.off("selection:cleared", clear);
        fc.off("object:moving", update);
        fc.off("object:scaling", update);
        fc.off("object:rotating", update);
        fc.off("object:modified", update);
      };
    }, [updateSelectionBounds]);

    /* Recalculate when zoom changes */
    useEffect(() => { updateSelectionBounds(); }, [scale, updateSelectionBounds]);

    /* ── Canvas resize ────────────────────────────────── */

    useEffect(() => {
      const fc = fabricRef.current;
      if (!fc) return;
      fc.setDimensions({ width, height });
      fc.renderAll();
      guidesRef.current?.resize(width, height);
      setScale(calcFitScale());
      saveHistory();
    }, [width, height, saveHistory, calcFitScale]);

    /* ── Object action helpers ────────────────────────── */

    function handleCopy() {
      const obj = fabricRef.current?.getActiveObject();
      if (!obj) return;
      obj.clone().then((cloned: FabricObject) => {
        clipboard = cloned;
        setHasCopied(true);
      });
    }

    function handlePaste() {
      const fc = fabricRef.current;
      if (!clipboard || !fc) return;
      clipboard.clone().then((cloned: FabricObject) => {
        cloned.set({
          left: (cloned.left ?? 0) + 20,
          top: (cloned.top ?? 0) + 20,
          evented: true,
        });
        fc.add(cloned);
        fc.setActiveObject(cloned);
        fc.requestRenderAll();
      });
    }

    function handleDuplicate() {
      const fc = fabricRef.current;
      const obj = fc?.getActiveObject();
      if (!obj || !fc) return;
      obj.clone().then((cloned: FabricObject) => {
        cloned.set({ left: (obj.left ?? 0) + 20, top: (obj.top ?? 0) + 20 });
        fc.add(cloned);
        fc.setActiveObject(cloned);
        fc.requestRenderAll();
      });
    }

    function handleDelete() {
      const fc = fabricRef.current;
      if (!fc) return;
      const active = fc.getActiveObject();
      if (active) { fc.remove(active); fc.discardActiveObject(); fc.requestRenderAll(); }
    }

    function handleBringToFront() {
      const fc = fabricRef.current;
      const obj = fc?.getActiveObject();
      if (!obj || !fc) return;
      const objects = fc.getObjects();
      const idx = objects.indexOf(obj);
      if (idx < objects.length - 1) {
        fc.moveObjectTo(obj, objects.length - 1);
        fc.requestRenderAll();
        fc.fire("object:modified", { target: obj });
      }
    }

    function handleBringForward() {
      const fc = fabricRef.current;
      const obj = fc?.getActiveObject();
      if (!obj || !fc) return;
      const objects = fc.getObjects();
      const idx = objects.indexOf(obj);
      if (idx < objects.length - 1) {
        fc.moveObjectTo(obj, idx + 1);
        fc.requestRenderAll();
        fc.fire("object:modified", { target: obj });
      }
    }

    function handleSendBackward() {
      const fc = fabricRef.current;
      const obj = fc?.getActiveObject();
      if (!obj || !fc) return;
      const objects = fc.getObjects();
      const idx = objects.indexOf(obj);
      if (idx > 0) {
        fc.moveObjectTo(obj, idx - 1);
        fc.requestRenderAll();
        fc.fire("object:modified", { target: obj });
      }
    }

    function handleSendToBack() {
      const fc = fabricRef.current;
      const obj = fc?.getActiveObject();
      if (!obj || !fc) return;
      const objects = fc.getObjects();
      const idx = objects.indexOf(obj);
      if (idx > 0) {
        fc.moveObjectTo(obj, 0);
        fc.requestRenderAll();
        fc.fire("object:modified", { target: obj });
      }
    }

    function handleLock() {
      const fc = fabricRef.current;
      const obj = fc?.getActiveObject();
      if (!obj || !fc) return;
      const locked = !!(obj.lockMovementX && obj.lockMovementY);
      obj.set({
        lockMovementX: !locked,
        lockMovementY: !locked,
        lockScalingX: !locked,
        lockScalingY: !locked,
        lockRotation: !locked,
        hasControls: locked,
      });
      setIsLocked(!locked);
      fc.requestRenderAll();
      fc.fire("object:modified", { target: obj });
    }

    /* ── Undo / Redo ──────────────────────────────────── */

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

    /* ── Keyboard shortcuts ───────────────────────────── */

    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        const fc = fabricRef.current;
        if (!fc) return;
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

        const ctrl = e.metaKey || e.ctrlKey;
        const obj = fc.getActiveObject();

        // Delete / Backspace
        if ((e.key === "Delete" || e.key === "Backspace") && obj) {
          e.preventDefault();
          handleDelete();
        }
        // Undo   Ctrl+Z
        if (e.key === "z" && ctrl && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        // Redo   Ctrl+Shift+Z  /  Ctrl+Y
        if ((e.key === "z" && ctrl && e.shiftKey) || (e.key === "y" && ctrl)) {
          e.preventDefault();
          handleRedo();
        }
        // Copy   Ctrl+C
        if (e.key === "c" && ctrl && !e.shiftKey && obj) {
          e.preventDefault();
          handleCopy();
        }
        // Paste  Ctrl+V
        if (e.key === "v" && ctrl && clipboard) {
          e.preventDefault();
          handlePaste();
        }
        // Duplicate  Ctrl+D
        if (e.key === "d" && ctrl && obj) {
          e.preventDefault();
          handleDuplicate();
        }
        // Bring to Front   ]
        if (e.key === "]" && !ctrl && obj) {
          e.preventDefault();
          handleBringToFront();
        }
        // Bring Forward    Ctrl+]
        if (e.key === "]" && ctrl && obj) {
          e.preventDefault();
          handleBringForward();
        }
        // Send Backward    Ctrl+[
        if (e.key === "[" && ctrl && obj) {
          e.preventDefault();
          handleSendBackward();
        }
        // Send to Back     [
        if (e.key === "[" && !ctrl && obj) {
          e.preventDefault();
          handleSendToBack();
        }
        // Lock / Unlock    Ctrl+L
        if (e.key === "l" && ctrl && obj) {
          e.preventDefault();
          handleLock();
        }
      }
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    /* ── Imperative handle ────────────────────────────── */

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
      toDataURL: (opts) => {
        if (!fabricRef.current) return "";
        return fabricRef.current.toDataURL({ multiplier: opts?.multiplier ?? 0.15, format: opts?.format ?? "png" });
      },
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
      deleteSelected: handleDelete,
    }));

    /* ── Render ────────────────────────────────────────── */

    return (
      <div ref={containerRef} className="relative flex flex-1 items-center justify-center overflow-y-scroll overflow-x-auto bg-gray-100">
        <div
          style={{
            width: width * scale,
            height: height * scale,
            flexShrink: 0,
            position: "relative",
          }}
        >
          <div
            ref={canvasWrapperRef}
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "relative",
            }}
            className="shadow-xl"
          >
            <canvas ref={canvasElRef} />
            {/* Boundary-hit overlay — rendered once, toggled via CSS class on parent */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "2.5px solid #ef4444",
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 0.12s ease",
                zIndex: 9999,
              }}
              className="boundary-overlay"
            />
          </div>

          {/* Floating context menu — positioned within the scaled wrapper */}
          {selectionBounds && fabricRef.current && (
            <FloatingContextMenu
              bounds={selectionBounds}
              isLocked={isLocked}
              hasCopied={hasCopied}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onBringToFront={handleBringToFront}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
              onSendToBack={handleSendToBack}
              onLock={handleLock}
            />
          )}
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 shadow">
          <button onClick={() => setScale(calcFitScale())} className="hover:text-gray-900">Fit</button>
          <span>{Math.round(scale * 100)}%</span>
        </div>

        {/* Boundary warning styles — toggled via direct DOM classList */}
        <style>{`
          .boundary-hit > .boundary-overlay {
            opacity: 1 !important;
          }
        `}</style>
      </div>
    );
  }
);
