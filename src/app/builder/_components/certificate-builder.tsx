"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { FabricImage, type FabricObject } from "fabric";
import { Toolbar } from "./toolbar";
import { FormatToolbar } from "./format-toolbar";
import { CanvasEditor, type CanvasEditorHandle } from "./canvas-editor";
import { Sidebar } from "./sidebar/sidebar";
import { PreviewModal } from "./preview-modal";
import type { CertificateTemplate, PaperSize } from "@/lib/types";
import { PAPER_DIMENSIONS, CATEGORY_DEFAULT_PAPER_SIZE } from "@/lib/types";
import { useRouter } from "next/navigation";
import { getCategoryBySlug } from "@/lib/template-categories";
import {
  getCustomTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
  newCustomTemplateId,
  type CustomTemplate,
} from "@/lib/custom-templates-store";

interface CertificateBuilderProps {
  initialTemplate?: CertificateTemplate;
  /** Template category slug (e.g. "youtube", "email"). Defaults to "certificate". */
  category?: string;
}

export function CertificateBuilder({ initialTemplate, category = "certificate" }: CertificateBuilderProps) {
  const router = useRouter();
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const [templateId, setTemplateId] = useState(initialTemplate?.id ?? null);
  const [templateName, setTemplateName] = useState(initialTemplate?.name ?? "Untitled Template");
  const defaultPaperSize = CATEGORY_DEFAULT_PAPER_SIZE[category] ?? "A4_LANDSCAPE";
  const [paperSize, setPaperSize] = useState<PaperSize>(initialTemplate?.paper_size ?? defaultPaperSize);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [canvasReady, setCanvasReady] = useState(false);
  const [bgSelected, setBgSelected] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [showRuler, setShowRuler] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  /* ── Custom Templates (auto-save) ──────────────────── */
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const customIdRef = useRef<string>(newCustomTemplateId());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load custom templates from localStorage on mount
  useEffect(() => {
    setCustomTemplates(getCustomTemplates());
  }, []);

  const dims = paperSize === "CUSTOM" ? { width: customWidth, height: customHeight } : PAPER_DIMENSIONS[paperSize];

  const handlePaperSizeChange = useCallback((size: PaperSize) => {
    setPaperSize(size);
    setDirty(true);
  }, []);

  /** Auto-save a thumbnail + canvas JSON to localStorage (debounced 2s) */
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const cr = canvasRef.current;
      if (!cr) return;
      const fc = cr.getCanvas();
      // Only auto-save when there is actual content on the canvas
      if (!fc || fc.getObjects().length === 0) return;

      const thumbnail = cr.toDataURL({ multiplier: 0.15, format: "png" });
      const canvasJson = cr.toJSON();
      const currentDims = PAPER_DIMENSIONS[paperSize];

      const entry: CustomTemplate = {
        id: customIdRef.current,
        thumbnail,
        canvasJson,
        paperSize,
        width: currentDims.width,
        height: currentDims.height,
        updatedAt: new Date().toISOString(),
      };
      saveCustomTemplate(entry);
      setCustomTemplates(getCustomTemplates());
    }, 2000);
  }, [paperSize]);

  const handleCanvasModified = useCallback(() => {
    setDirty(true);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleDeleteCustomTemplate = useCallback((id: string) => {
    deleteCustomTemplate(id);
    setCustomTemplates(getCustomTemplates());
  }, []);

  const handleLoadTemplate = useCallback((payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => {
    if (!canvasRef.current) return;

    const requestedSize = payload.paperSize;
    const validRequestedSize =
      typeof requestedSize === "string" && requestedSize in PAPER_DIMENSIONS
        ? (requestedSize as PaperSize)
        : undefined;

    const loadNow = () => {
      if (
        typeof payload.width === "number" &&
        typeof payload.height === "number" &&
        payload.width > 0 &&
        payload.height > 0
      ) {
        canvasRef.current?.setCanvasSize(payload.width, payload.height);
      }
      canvasRef.current?.loadPreset(normalizePresetCanvasJson(payload.canvasJson));
      setDirty(true);
    };

    if (validRequestedSize && validRequestedSize !== paperSize) {
      setPaperSize(validRequestedSize);
      // Wait for canvas dimensions to update before loading preset objects.
      requestAnimationFrame(() => {
        requestAnimationFrame(loadNow);
      });
      return;
    }

    loadNow();
  }, [paperSize]);

  const handleSelectionChange = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const initialLoaded = useRef(false);
  useEffect(() => {
    if (initialLoaded.current || !initialTemplate?.canvas_json || !canvasRef.current) return;
    const timer = setTimeout(() => {
      if (canvasRef.current && initialTemplate.canvas_json) {
        canvasRef.current.loadFromJSON(initialTemplate.canvas_json);
        initialLoaded.current = true;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [initialTemplate, canvasReady]);

  const handleSave = useCallback(async () => {
    if (!canvasRef.current) return;
    setSaving(true);
    try {
      const canvasJson = canvasRef.current.toJSON();
      const thumbnailDataUrl = canvasRef.current.toDataURL({
        // Keep thumbnail crisp enough for dashboard card previews.
        multiplier: 1,
        format: "png",
      });
      const body = {
        name: templateName,
        width: dims.width,
        height: dims.height,
        paperSize,
        canvasJson,
        backgroundUrl: thumbnailDataUrl,
        category,
      };

      const url = templateId ? `/api/templates/${templateId}` : "/api/templates";
      const method = templateId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (data.success && data.data?.id) {
        setTemplateId(data.data.id);
        setDirty(false);
        // Navigate back to the correct category view on the dashboard
        const catConfig = getCategoryBySlug(category);
        const dashboardView = catConfig?.view ?? "templates";
        router.push(`/dashboard?view=${dashboardView}`);
      } else {
        alert(data.error || "Failed to save template.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving the template.");
    } finally {
      setSaving(false);
    }
  }, [templateName, dims, paperSize, templateId, router, category]);

  const handleExportPdf = useCallback(async () => {
    if (!canvasRef.current || !templateId) {
      if (!templateId) alert("Please save the template first before exporting PDF.");
      return;
    }
    window.open(`/api/templates/${templateId}/pdf?category=${category}`, "_blank");
  }, [templateId, category]);

  const getCanvas = useCallback(() => canvasRef.current?.getCanvas() ?? null, []);

  /* ── Background handlers ────────────────────────────── */

  const handleBgSelected = useCallback((selected: boolean) => {
    setBgSelected(selected);
    const fc = canvasRef.current?.getCanvas();
    if (fc) {
      const c = fc.backgroundColor;
      if (typeof c === "string") setBgColor(c);
    }
  }, []);

  const handleBgColorChange = useCallback((color: string) => {
    setBgColor(color);
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    fc.backgroundColor = color;
    fc.requestRenderAll();
    fc.fire("object:modified", {} as { target: FabricObject });
  }, []);

  const handleBgImageUpload = useCallback(() => {
    bgFileRef.current?.click();
  }, []);

  const handleBgFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      // Remove existing bg image object if any
      const existing = fc.getObjects().find((o: FabricObject) => (o as unknown as { __isBackground?: boolean }).__isBackground);
      if (existing) fc.remove(existing);

      const imgEl = new Image();
      imgEl.onload = () => {
        const fabricImg = new FabricImage(imgEl, { left: 0, top: 0, originX: "left", originY: "top" });
        const sx = fc.width! / imgEl.width;
        const sy = fc.height! / imgEl.height;
        fabricImg.set({ scaleX: sx, scaleY: sy });
        (fabricImg as unknown as FabricObject & { __isBackground: boolean }).__isBackground = true;
        fabricImg.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true, hasControls: false, hasBorders: false });
        fc.insertAt(0, fabricImg);
        fc.requestRenderAll();
        fc.fire("object:modified", { target: fabricImg });
      };
      imgEl.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleBgImageRemove = useCallback(() => {
    const fc = canvasRef.current?.getCanvas();
    if (!fc) return;
    const bgObj = fc.getObjects().find((o: FabricObject) => (o as unknown as { __isBackground?: boolean }).__isBackground);
    if (bgObj) {
      fc.remove(bgObj);
      fc.requestRenderAll();
      fc.fire("object:modified", {} as { target: FabricObject });
    }
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar
        templateName={templateName}
        onNameChange={(n) => { setTemplateName(n); setDirty(true); }}
        paperSize={paperSize}
        onPaperSizeChange={handlePaperSizeChange}
        customWidth={customWidth}
        customHeight={customHeight}
        onCustomDimensionChange={(w, h) => {
          setCustomWidth(w);
          setCustomHeight(h);
          setDirty(true);
        }}
        onPreview={() => setShowPreview(true)}
        onSave={handleSave}
        onDownloadPdf={handleExportPdf}
        saving={saving}
        dirty={dirty}
        category={category}
      />

      {/* Hidden file input for bg image */}
      <input
        ref={bgFileRef}
        type="file"
        accept="image/*"
        onChange={handleBgFileChange}
        className="hidden"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — full height from header to footer */}
        <Sidebar
          canvas={getCanvas()}
          onLoadTemplate={handleLoadTemplate}
          onBgSelected={handleBgSelected}
          customTemplates={customTemplates}
          onDeleteCustomTemplate={handleDeleteCustomTemplate}
          category={category}
        />

        {/* Right column: format toolbar + canvas */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Format toolbar — positioned above canvas only */}
          <FormatToolbar
            canvas={getCanvas()}
            onUndo={() => canvasRef.current?.undo()}
            onRedo={() => canvasRef.current?.redo()}
            bgSelected={bgSelected}
            bgColor={bgColor}
            onBgColorChange={handleBgColorChange}
            onBgImageUpload={handleBgImageUpload}
            onBgImageRemove={handleBgImageRemove}
            showRuler={showRuler}
            onShowRulerChange={setShowRuler}
            showGrid={showGrid}
            onShowGridChange={setShowGrid}
          />

          <CanvasEditor
            ref={canvasRef}
            width={dims.width}
            height={dims.height}
            onSelectionChange={handleSelectionChange}
            onCanvasModified={handleCanvasModified}
            showRuler={showRuler}
            onShowRulerChange={setShowRuler}
            showGrid={showGrid}
            onShowGridChange={setShowGrid}
          />
        </div>
      </div>

      {showPreview && canvasRef.current && (
        <PreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          canvasJson={canvasRef.current.toJSON()}
          width={dims.width}
          height={dims.height}
        />
      )}

      {canvasReady && null}
    </div>
  );
}

function normalizePresetCanvasJson(input: Record<string, unknown>): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(input)) as Record<string, unknown>;
  const objects = Array.isArray(clone.objects) ? clone.objects as Record<string, unknown>[] : [];

  for (const obj of objects) {
    const type = typeof obj.type === "string" ? obj.type.toLowerCase() : "";
    // Fabric v7 defaults many objects to centered origin if not specified.
    // Our preset coordinates are authored in top-left space.
    obj.originX = "left";
    obj.originY = "top";

    if (type === "textbox" || type === "text") {
      const cs = obj.charSpacing;
      if (typeof cs === "number" && cs > 80) {
        obj.charSpacing = 80;
      }
      // Prevent accidental overflow from very small text boxes.
      if (typeof obj.width === "number" && obj.width < 100) {
        obj.width = 100;
      }
    }
  }

  return clone;
}
