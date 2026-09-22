"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { FabricImage, type FabricObject } from "fabric";
import { Toolbar } from "./toolbar";
import { FormatToolbar } from "./format-toolbar";
import { CanvasEditor, type CanvasEditorHandle } from "./canvas-editor";
import { Sidebar } from "./sidebar/sidebar";
import { PreviewModal } from "./preview-modal";
import { BrandKitModal } from "./sidebar/ai-panel/brand-kit-modal";
import { DEFAULT_BRAND_KITS } from "./sidebar/ai-panel/types-and-helpers";
import type { BrandKit } from "@/lib/types";
import type { ColorPalette } from "@/lib/color-converter";
import type { CertificateTemplate, PaperSize } from "@/lib/types";
import type { ModalId } from "./sidebar/_shared/types";
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
import { type CustomFont, loadFont, loadAllCustomFonts } from "@/lib/builder/font-loader";

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
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [bgSelected, setBgSelected] = useState(false);

  // ── Brand Kit State ────────────────────────────────────
  const [brandKits, setBrandKits] = useState<BrandKit[]>(() => {
    if (typeof window === "undefined") return DEFAULT_BRAND_KITS;
    try {
      const hiddenDefaults = JSON.parse(localStorage.getItem("hidden_default_kits") || "[]");
      return DEFAULT_BRAND_KITS.filter((k) => !hiddenDefaults.includes(k.id));
    } catch {
      return DEFAULT_BRAND_KITS;
    }
  });
  const [brandKitsLoading, setBrandKitsLoading] = useState(true);
  const [useBrandKit, setUseBrandKit] = useState(false);
  const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>("default-1");

  const [editingBrandKit, setEditingBrandKit] = useState<BrandKit | null>(null);

  // ── Upgraded Color Palette UI State ────────────────────
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("custom_color_palettes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch brand kits from API on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchKits() {
      setBrandKitsLoading(true);
      try {
        const hiddenDefaults =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("hidden_default_kits") || "[]")
            : [];
        const visibleDefaults = DEFAULT_BRAND_KITS.filter((k) => !hiddenDefaults.includes(k.id));

        const res = await fetch("/api/brand-kits");
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setBrandKits([...visibleDefaults, ...json.data] as BrandKit[]);
        }
      } catch (err) {
        console.error("Failed to fetch brand kits:", err);
      } finally {
        if (!cancelled) setBrandKitsLoading(false);
      }
    }
    fetchKits();
    return () => { cancelled = true; };
  }, []);

  const handleAddCustomKitClick = () => {
    const newKit: BrandKit = {
      id: "new-kit-" + Date.now(),
      user_id: "",
      name: "New Brand Kit",
      colors: ["#3B82F6", "#1D4ED8", "#1E40AF", "#172554"],
      typography: { title: "Inter", subtitle: "Inter", body: "Inter" },
      logos: [],
      graphics: [],
      photos: [],
      elements: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingBrandKit(newKit);
  };

  const handleRenameKit = async (kitId: string, newName: string) => {
    if (kitId.startsWith("default-")) {
      try {
        const kitObj = brandKits.find((k) => k.id === kitId);
        if (kitObj) {
          const res = await fetch("/api/brand-kits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newName,
              colors: kitObj.colors,
              typography: kitObj.typography,
            }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            const savedKit = data.data as BrandKit;
            setBrandKits((prev) => [...prev.filter((k) => k.id !== kitId), savedKit]);
            setActiveBrandKitId(savedKit.id);
            setUseBrandKit(true);
            const hiddenDefaults = JSON.parse(localStorage.getItem("hidden_default_kits") || "[]");
            localStorage.setItem("hidden_default_kits", JSON.stringify([...hiddenDefaults, kitId]));
          } else {
            alert(data.error || "Failed to customize default brand kit");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Failed to customize default brand kit");
      }
      return;
    }

    try {
      const res = await fetch(`/api/brand-kits/${kitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (data.success) {
        setBrandKits((prev) =>
          prev.map((k) => (k.id === kitId ? { ...k, name: newName } : k))
        );
      } else {
        alert(data.error || "Failed to rename brand kit");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to rename brand kit");
    }
  };

  const handleRemoveKit = async (kitId: string) => {
    const kit = brandKits.find((k) => k.id === kitId);
    if (!kit) return;
    if (!confirm(`Are you sure you want to remove "${kit.name}"?`)) return;

    if (kitId.startsWith("default-")) {
      setBrandKits((prev) => prev.filter((k) => k.id !== kitId));
      if (activeBrandKitId === kitId) setActiveBrandKitId(null);
      const hiddenDefaults = JSON.parse(localStorage.getItem("hidden_default_kits") || "[]");
      localStorage.setItem("hidden_default_kits", JSON.stringify([...hiddenDefaults, kitId]));
      return;
    }

    try {
      const res = await fetch(`/api/brand-kits/${kitId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBrandKits((prev) => prev.filter((k) => k.id !== kitId));
        if (activeBrandKitId === kitId) setActiveBrandKitId(null);
      } else {
        alert(data.error || "Failed to delete brand kit");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete brand kit");
    }
  };

  const handleSaveBrandKitModal = async () => {
    if (!editingBrandKit) return;
    if (!editingBrandKit.name.trim()) {
      alert("Brand kit name is required");
      return;
    }

    const isNew = editingBrandKit.id.startsWith("new-kit-");
    const isDefault = editingBrandKit.id.startsWith("default-");

    if (isDefault) {
      try {
        const res = await fetch("/api/brand-kits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingBrandKit.name.trim(),
            colors: editingBrandKit.colors,
            typography: editingBrandKit.typography,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const savedKit = data.data as BrandKit;
          setBrandKits((prev) => [...prev.filter((k) => k.id !== editingBrandKit.id), savedKit]);
          setActiveBrandKitId(savedKit.id);
          setUseBrandKit(true);
          const hiddenDefaults = JSON.parse(localStorage.getItem("hidden_default_kits") || "[]");
          localStorage.setItem("hidden_default_kits", JSON.stringify([...hiddenDefaults, editingBrandKit.id]));
        } else {
          alert(data.error || "Failed to customize default brand kit");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to customize default brand kit");
      }
      setEditingBrandKit(null);
      return;
    }

    if (isNew) {
      try {
        const res = await fetch("/api/brand-kits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingBrandKit.name.trim(),
            colors: editingBrandKit.colors,
            typography: editingBrandKit.typography,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const savedKit = data.data as BrandKit;
          setBrandKits((prev) => [...prev, savedKit]);
          setActiveBrandKitId(savedKit.id);
          setUseBrandKit(true);
        } else {
          alert(data.error || "Failed to create brand kit");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to create brand kit");
      }
    } else {
      try {
        const res = await fetch(`/api/brand-kits/${editingBrandKit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingBrandKit.name.trim(),
            colors: editingBrandKit.colors,
            typography: editingBrandKit.typography,
            logos: editingBrandKit.logos,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const savedKit = data.data as BrandKit;
          setBrandKits((prev) =>
            prev.map((k) => (k.id === savedKit.id ? savedKit : k))
          );
        } else {
          alert(data.error || "Failed to update brand kit");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to update brand kit");
      }
    }

    setEditingBrandKit(null);
  };

  const handleAddCustomPalette = (newPalette: ColorPalette) => {
    const updated = [newPalette, ...customPalettes];
    setCustomPalettes(updated);
    localStorage.setItem("custom_color_palettes", JSON.stringify(updated));
    if (editingBrandKit) {
      setEditingBrandKit({ ...editingBrandKit, colors: newPalette.colors });
    }
  };

  const handleDeleteCustomPalette = (paletteId: string) => {
    const updated = customPalettes.filter((p) => p.id !== paletteId);
    setCustomPalettes(updated);
    localStorage.setItem("custom_color_palettes", JSON.stringify(updated));
  };
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

  /* ── Custom Fonts State & Loading ──────────────────── */
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  // Load custom fonts from localStorage and loaded template on mount
  useEffect(() => {
    let localFonts: CustomFont[] = [];
    try {
      const saved = localStorage.getItem("localCustomFonts");
      if (saved) {
        localFonts = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load local custom fonts:", e);
    }

    const templateFonts = (initialTemplate?.canvas_json?.customFonts as CustomFont[]) || [];

    // Merge fonts avoiding name duplicates
    const merged = [...localFonts];
    templateFonts.forEach((tf) => {
      if (!merged.some((lf) => lf.name.toLowerCase() === tf.name.toLowerCase())) {
        merged.push(tf);
      }
    });

    setCustomFonts(merged);

    if (merged.length > 0) {
      loadAllCustomFonts(merged).then(() => {
        const fc = canvasRef.current?.getCanvas();
        if (fc) {
          fc.requestRenderAll();
        }
      });
    }
  }, [initialTemplate]);

  const handleAddCustomFont = useCallback((font: CustomFont) => {
    setCustomFonts((prev) => {
      const filtered = prev.filter((f) => f.name.toLowerCase() !== font.name.toLowerCase());
      const next = [...filtered, font];
      try {
        localStorage.setItem("localCustomFonts", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save local custom fonts:", e);
      }
      return next;
    });

    loadFont(font).then(() => {
      const fc = canvasRef.current?.getCanvas();
      if (fc) {
        fc.requestRenderAll();
      }
    });
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
      canvasJson.customFonts = customFonts;
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

  const handleLoadTemplate = useCallback(async (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }): Promise<void> => {
    if (!canvasRef.current) return;

    const nextWidth =
      typeof payload.width === "number" && payload.width > 0 ? payload.width : undefined;
    const nextHeight =
      typeof payload.height === "number" && payload.height > 0 ? payload.height : undefined;

    const requestedSize = payload.paperSize;
    const validRequestedSize =
      typeof requestedSize === "string" && requestedSize in PAPER_DIMENSIONS
        ? (requestedSize as PaperSize)
        : undefined;

    const targetPaperSize =
      validRequestedSize ?? (nextWidth && nextHeight ? ("CUSTOM" as PaperSize) : paperSize);

    const sizeChanged =
      !!nextWidth &&
      !!nextHeight &&
      (nextWidth !== dims.width || nextHeight !== dims.height);
    const paperChanged = targetPaperSize !== paperSize;

    if (targetPaperSize === "CUSTOM" && nextWidth && nextHeight) {
      setCustomWidth(nextWidth);
      setCustomHeight(nextHeight);
    }

    const loadNow = async () => {
      await canvasRef.current?.loadPreset(normalizePresetCanvasJson(payload.canvasJson));
      setDirty(true);
    };

    if (paperChanged || sizeChanged) {
      if (paperChanged) setPaperSize(targetPaperSize);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            void loadNow().then(resolve);
          });
        });
      });
      return;
    }

    await loadNow();
  }, [paperSize, dims.width, dims.height]);

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
      canvasJson.customFonts = customFonts;
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
          activeModal={activeModal}
          onOpenModal={setActiveModal}
          onCloseModal={() => setActiveModal(null)}
          paperSize={paperSize}
          onPaperSizeChange={handlePaperSizeChange}
          brandKits={brandKits}
          brandKitsLoading={brandKitsLoading}
          useBrandKit={useBrandKit}
          onToggleUseBrandKit={setUseBrandKit}
          activeBrandKitId={activeBrandKitId}
          onBrandKitSelect={setActiveBrandKitId}
          customPalettes={customPalettes}
          editingBrandKit={editingBrandKit}
          onUpdateEditingBrandKit={setEditingBrandKit}
          onEditKit={(kit) => setEditingBrandKit(kit)}
          onAddCustomKit={handleAddCustomKitClick}
          onRenameKit={handleRenameKit}
          onRemoveKit={handleRemoveKit}
          onUpdateBrandKitInList={(updated) => {
            setBrandKits((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
          }}
        />

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
            customFonts={customFonts}
            onAddCustomFont={handleAddCustomFont}
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

      {/* Brand Kit Modal (opened for editing/creating custom kits) */}
      <BrandKitModal
        isOpen={editingBrandKit !== null}
        onClose={() => {
          setEditingBrandKit(null);
        }}
        brandKits={brandKits}
        brandKitsLoading={brandKitsLoading}
        useBrandKit={useBrandKit}
        onToggleUseBrandKit={setUseBrandKit}
        activeBrandKitId={activeBrandKitId}
        onBrandKitSelect={setActiveBrandKitId}
        editingBrandKit={editingBrandKit}
        onUpdateEditingBrandKit={setEditingBrandKit}
        onEditKit={(kit) => setEditingBrandKit(kit)}
        onAddCustomKit={handleAddCustomKitClick}
        onRenameKit={handleRenameKit}
        onRemoveKit={handleRemoveKit}
        customPalettes={customPalettes}
        onAddCustomPalette={handleAddCustomPalette}
        onDeleteCustomPalette={handleDeleteCustomPalette}
        onSave={handleSaveBrandKitModal}
      />

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
