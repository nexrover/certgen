"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Toolbar } from "./toolbar";
import { FormatToolbar } from "./format-toolbar";
import { CanvasEditor, type CanvasEditorHandle } from "./canvas-editor";
import { Sidebar } from "./sidebar/sidebar";
import { PreviewModal } from "./preview-modal";
import type { CertificateTemplate, PaperSize } from "@/lib/types";
import { PAPER_DIMENSIONS } from "@/lib/types";
import { useRouter } from "next/navigation";

interface CertificateBuilderProps {
  initialTemplate?: CertificateTemplate;
}

export function CertificateBuilder({ initialTemplate }: CertificateBuilderProps) {
  const router = useRouter();
  const canvasRef = useRef<CanvasEditorHandle>(null);
  const [templateId, setTemplateId] = useState(initialTemplate?.id ?? null);
  const [templateName, setTemplateName] = useState(initialTemplate?.name ?? "Untitled Template");
  const [paperSize, setPaperSize] = useState<PaperSize>(initialTemplate?.paper_size ?? "A4_LANDSCAPE");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const dims = PAPER_DIMENSIONS[paperSize];

  const handlePaperSizeChange = useCallback((size: PaperSize) => {
    setPaperSize(size);
    setDirty(true);
  }, []);

  const handleCanvasModified = useCallback(() => setDirty(true), []);

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

  const handleSelectionChange = useCallback((selected: boolean) => {
    setCanvasReady(true);
    setHasSelection(selected);
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
      const body = {
        name: templateName,
        width: dims.width,
        height: dims.height,
        paperSize,
        canvasJson,
      };

      const url = templateId ? `/api/templates/${templateId}` : "/api/templates";
      const method = templateId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (data.success && data.data?.id) {
        setTemplateId(data.data.id);
        setDirty(false);
        if (!templateId) router.replace(`/builder/${data.data.id}`);
      }
    } finally {
      setSaving(false);
    }
  }, [templateName, dims, paperSize, templateId, router]);

  const handleExportPdf = useCallback(async () => {
    if (!canvasRef.current || !templateId) {
      if (!templateId) alert("Please save the template first before exporting PDF.");
      return;
    }
    window.open(`/api/templates/${templateId}/pdf`, "_blank");
  }, [templateId]);

  const getCanvas = useCallback(() => canvasRef.current?.getCanvas() ?? null, []);

  return (
    <div className="flex h-screen flex-col">
      <Toolbar
        templateName={templateName}
        onNameChange={(n) => { setTemplateName(n); setDirty(true); }}
        paperSize={paperSize}
        onPaperSizeChange={handlePaperSizeChange}
        onPreview={() => setShowPreview(true)}
        onSave={handleSave}
        onDownloadPdf={handleExportPdf}
        saving={saving}
        dirty={dirty}
      />

      {/* Format toolbar — visible only when an element is selected */}
      {hasSelection && (
        <FormatToolbar
          canvas={getCanvas()}
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar canvas={getCanvas()} onLoadTemplate={handleLoadTemplate} />
        <CanvasEditor
          ref={canvasRef}
          width={dims.width}
          height={dims.height}
          onSelectionChange={handleSelectionChange}
          onCanvasModified={handleCanvasModified}
        />
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
