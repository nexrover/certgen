"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { StaticCanvas } from "fabric";
import { createPortal } from "react-dom";
import type { CustomTemplate } from "@/lib/custom-templates-store";
import { PRESET_TEMPLATES } from "@/lib/builder/preset-templates";

interface TemplatesPanelProps {
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  customTemplates?: CustomTemplate[];
  onDeleteCustomTemplate?: (id: string) => void;
  category?: string;
}

const YOUTUBE_DEMOS = [
  { id: "yt-gaming-ultimate", label: "Ultimate Gaming", src: "https://placehold.co/1280x720/000000/22c55e?text=Gaming+Ultimate" },
  { id: "yt-gaming", label: "Gaming Thumbnail", src: "https://placehold.co/1280x720/dc2626/ffffff?text=Gaming+Thumbnail" },
  { id: "yt-tutorial", label: "Tutorial Thumbnail", src: "https://placehold.co/1280x720/2563eb/ffffff?text=Tutorial+Thumbnail" },
  { id: "yt-vlog", label: "Vlog Thumbnail", src: "https://placehold.co/1280x720/7c3aed/ffffff?text=Vlog+Thumbnail" },
  { id: "yt-review", label: "Review Thumbnail", src: "https://placehold.co/1280x720/059669/ffffff?text=Product+Review" },
  { id: "yt-podcast", label: "Podcast Thumbnail", src: "https://placehold.co/1280x720/d97706/ffffff?text=Podcast+Episode" },
  { id: "yt-music", label: "Music Thumbnail", src: "https://placehold.co/1280x720/db2777/ffffff?text=Music+Video" },
];

type Orientation = "landscape" | "portrait";
type Category = "Course" | "Completion" | "Achievement" | "Training" | "Recognition" | "Participation" | "Webinar" | "Appreciation" | "Employee of the Month";
type Style = "Classic" | "Modern" | "Minimal" | "Bold";
type ColorTheme = "Navy" | "Dark" | "Green" | "Red" | "Warm" | "Cool" | "Neutral";

interface TemplatePreview {
  id: string;
  label: string;
  categories: Category[];
  style: Style;
  colorTheme: ColorTheme;
  orientation: Orientation;
  thumbnailSrc: string;
}

const ALL_CATEGORIES: Category[] = ["Course", "Completion", "Achievement", "Training", "Recognition", "Participation", "Webinar", "Appreciation", "Employee of the Month"];
const ALL_STYLES: Style[] = ["Classic", "Modern", "Minimal", "Bold"];
const ALL_COLORS: ColorTheme[] = ["Navy", "Dark", "Green", "Red", "Warm", "Cool", "Neutral"];

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createTemplateThumbnailSrc({
  label,
  style,
  colorTheme,
  orientation,
}: Pick<TemplatePreview, "label" | "style" | "colorTheme" | "orientation">): string {
  const width = orientation === "portrait" ? 200 : 300;
  const height = orientation === "portrait" ? 260 : 170;
  const palette: Record<ColorTheme, { bg: string; fg: string; accent: string; muted: string }> = {
    Navy: { bg: "#f8fafc", fg: "#1e3a5f", accent: "#c9a84c", muted: "#94a3b8" },
    Dark: { bg: "#0f172a", fg: "#f8fafc", accent: "#f59e0b", muted: "#94a3b8" },
    Green: { bg: "#f0fdf4", fg: "#065f46", accent: "#10b981", muted: "#94a3b8" },
    Red: { bg: "#fff1f2", fg: "#9f1239", accent: "#ef4444", muted: "#94a3b8" },
    Warm: { bg: "#fffbeb", fg: "#92400e", accent: "#f59e0b", muted: "#a8a29e" },
    Cool: { bg: "#eff6ff", fg: "#1e3a8a", accent: "#0ea5e9", muted: "#94a3b8" },
    Neutral: { bg: "#f8fafc", fg: "#374151", accent: "#9ca3af", muted: "#9ca3af" },
  };
  const colors = palette[colorTheme];
  const borderRadius = 12;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="a" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${colors.bg}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${borderRadius}" fill="url(#a)" />
  <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="${borderRadius - 4}" fill="none" stroke="${colors.accent}" stroke-width="2" />
  <text x="16" y="24" fill="${colors.accent}" font-size="11" font-weight="700" letter-spacing="1.1">CERTIFICATE TEMPLATE</text>
  <text x="16" y="48" fill="${colors.fg}" font-size="17" font-weight="800">${escapeSvgText(label.toUpperCase())}</text>
  <text x="16" y="67" fill="${colors.muted}" font-size="10">[recipient.name]</text>
  <line x1="16" x2="${width - 16}" y1="80" y2="80" stroke="${colors.muted}" stroke-width="1" opacity="0.55" />
  <line x1="16" x2="${width - 90}" y1="95" y2="95" stroke="${colors.muted}" stroke-width="1" opacity="0.45" />
  <line x1="16" x2="${width - 110}" y1="108" y2="108" stroke="${colors.muted}" stroke-width="1" opacity="0.45" />
  <rect x="16" y="${height - 34}" width="82" height="18" rx="9" fill="${colors.accent}" fill-opacity="0.15" />
  <text x="57" y="${height - 22}" fill="${colors.fg}" font-size="9" text-anchor="middle">${escapeSvgText(style)}</text>
  <rect x="${width - 102}" y="${height - 34}" width="86" height="18" rx="9" fill="${colors.fg}" fill-opacity="0.08" />
  <text x="${width - 59}" y="${height - 22}" fill="${colors.fg}" font-size="9" text-anchor="middle">${escapeSvgText(orientation.toUpperCase())}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function normalizePresetCanvasJson(input: Record<string, unknown>): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(input)) as Record<string, unknown>;
  const objects = Array.isArray(clone.objects) ? (clone.objects as Record<string, unknown>[]) : [];

  for (const obj of objects) {
    const type = typeof obj.type === "string" ? obj.type.toLowerCase() : "";
    obj.originX = "left";
    obj.originY = "top";
    if (type === "textbox" || type === "text") {
      const cs = obj.charSpacing;
      if (typeof cs === "number" && cs > 80) {
        obj.charSpacing = 80;
      }
    }
  }

  return clone;
}

async function renderPresetThumbnail(id: string, orientation: Orientation): Promise<string | null> {
  const preset = PRESET_TEMPLATES[id];
  if (!preset || typeof window === "undefined") return null;

  const targetHeight = orientation === "portrait" ? 220 : 144;
  const targetWidth = Math.max(1, Math.round((preset.width / preset.height) * targetHeight));
  const scale = targetWidth / preset.width;

  const canvasEl = document.createElement("canvas");
  const staticCanvas = new StaticCanvas(canvasEl, {
    width: targetWidth,
    height: targetHeight,
    renderOnAddRemove: false,
  });

  try {
    await staticCanvas.loadFromJSON(normalizePresetCanvasJson(preset.canvasJson));
    staticCanvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
    staticCanvas.renderAll();
    return staticCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
  } catch {
    return null;
  } finally {
    staticCanvas.dispose();
  }
}

function getTemplateDimensions(id: string, orientation: Orientation): { width: number; height: number } {
  const preset = PRESET_TEMPLATES[id];
  if (preset && preset.width > 0 && preset.height > 0) {
    return { width: preset.width, height: preset.height };
  }
  return orientation === "portrait"
    ? { width: 595, height: 842 }
    : { width: 842, height: 595 };
}

const TEMPLATES: TemplatePreview[] = [
  {
    id: "course-completion",
    label: "Course Completion",
    categories: ["Course", "Completion"],
    style: "Classic",
    colorTheme: "Navy",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Course Completion", style: "Classic", colorTheme: "Navy", orientation: "landscape" }),
  },
  {
    id: "achievement-award",
    label: "Achievement Award",
    categories: ["Achievement", "Recognition"],
    style: "Bold",
    colorTheme: "Dark",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Achievement Award", style: "Bold", colorTheme: "Dark", orientation: "landscape" }),
  },
  {
    id: "professional-cert",
    label: "Professional Certificate",
    categories: ["Completion", "Recognition"],
    style: "Modern",
    colorTheme: "Green",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Professional Certificate", style: "Modern", colorTheme: "Green", orientation: "landscape" }),
  },
  {
    id: "communication-skills",
    label: "Communication Skills",
    categories: ["Course", "Training"],
    style: "Modern",
    colorTheme: "Red",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Communication Skills", style: "Modern", colorTheme: "Red", orientation: "landscape" }),
  },
  {
    id: "digital-marketing",
    label: "Digital Marketing",
    categories: ["Course", "Completion"],
    style: "Modern",
    colorTheme: "Warm",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Digital Marketing", style: "Modern", colorTheme: "Warm", orientation: "landscape" }),
  },
  {
    id: "financial-accounting",
    label: "Financial Accounting",
    categories: ["Course", "Completion"],
    style: "Minimal",
    colorTheme: "Neutral",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Financial Accounting", style: "Minimal", colorTheme: "Neutral", orientation: "landscape" }),
  },
  {
    id: "seo-strategies",
    label: "SEO Strategies",
    categories: ["Course", "Training"],
    style: "Bold",
    colorTheme: "Cool",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "SEO Strategies", style: "Bold", colorTheme: "Cool", orientation: "landscape" }),
  },
  {
    id: "training-course",
    label: "Training Course",
    categories: ["Training", "Course"],
    style: "Bold",
    colorTheme: "Red",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Training Course", style: "Bold", colorTheme: "Red", orientation: "landscape" }),
  },
  {
    id: "webinar-participation",
    label: "Webinar Participation",
    categories: ["Webinar", "Participation"],
    style: "Modern",
    colorTheme: "Cool",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Webinar Participation", style: "Modern", colorTheme: "Cool", orientation: "landscape" }),
  },
  {
    id: "appreciation",
    label: "Appreciation",
    categories: ["Appreciation", "Recognition"],
    style: "Classic",
    colorTheme: "Warm",
    orientation: "landscape",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Appreciation", style: "Classic", colorTheme: "Warm", orientation: "landscape" }),
  },
  // --- Portrait templates ---
  {
    id: "course-completion-portrait",
    label: "Course Completion",
    categories: ["Course", "Completion"],
    style: "Classic",
    colorTheme: "Navy",
    orientation: "portrait",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Course Completion", style: "Classic", colorTheme: "Navy", orientation: "portrait" }),
  },
  {
    id: "creative-writing",
    label: "Creative Writing",
    categories: ["Course", "Training"],
    style: "Bold",
    colorTheme: "Warm",
    orientation: "portrait",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Creative Writing", style: "Bold", colorTheme: "Warm", orientation: "portrait" }),
  },
  {
    id: "design-academy",
    label: "Design Academy",
    categories: ["Course", "Completion"],
    style: "Modern",
    colorTheme: "Cool",
    orientation: "portrait",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Design Academy", style: "Modern", colorTheme: "Cool", orientation: "portrait" }),
  },
  {
    id: "employee-month",
    label: "Employee of the Month",
    categories: ["Employee of the Month", "Recognition", "Appreciation"],
    style: "Classic",
    colorTheme: "Warm",
    orientation: "portrait",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Employee of the Month", style: "Classic", colorTheme: "Warm", orientation: "portrait" }),
  },
  {
    id: "completion-portrait",
    label: "Completion Certificate",
    categories: ["Completion"],
    style: "Minimal",
    colorTheme: "Neutral",
    orientation: "portrait",
    thumbnailSrc: createTemplateThumbnailSrc({ label: "Completion Certificate", style: "Minimal", colorTheme: "Neutral", orientation: "portrait" }),
  },
];

type FilterType = "category" | "style" | "color";

export function TemplatesPanel({ onLoadTemplate, customTemplates = [], onDeleteCustomTemplate, category = "certificate" }: TemplatesPanelProps) {
  const isYoutube = category === "youtube";
  const isNonCertificate = category !== "certificate";
  const [loading, setLoading] = useState<string | null>(null);
  const [presetThumbnails, setPresetThumbnails] = useState<Record<string, string>>({});
  const customScrollRef = useRef<HTMLDivElement>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const scrollCustomRight = useCallback(() => {
    customScrollRef.current?.scrollBy({ left: 120, behavior: "smooth" });
  }, []);

  const scrollCustomLeft = useCallback(() => {
    customScrollRef.current?.scrollBy({ left: -120, behavior: "smooth" });
  }, []);

  const scrollFilterRight = useCallback(() => {
    filterScrollRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  }, []);

  const scrollFilterLeft = useCallback(() => {
    filterScrollRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  }, []);
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<Style[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorTheme[]>([]);
  const [openFilter, setOpenFilter] = useState<FilterType | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydratePresetThumbnails() {
      const results = await Promise.all(
        TEMPLATES.map(async (template) => {
          const src = await renderPresetThumbnail(template.id, template.orientation);
          return src ? ([template.id, src] as const) : null;
        }),
      );
      if (cancelled) return;
      setPresetThumbnails(Object.fromEntries(results.filter((entry): entry is readonly [string, string] => entry !== null)));
    }

    void hydratePresetThumbnails();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = TEMPLATES.filter((t) => {
    if (t.orientation !== orientation) return false;
    if (selectedCategories.length > 0 && !t.categories.some((c) => selectedCategories.includes(c))) return false;
    if (selectedStyles.length > 0 && !selectedStyles.includes(t.style)) return false;
    if (selectedColors.length > 0 && !selectedColors.includes(t.colorTheme)) return false;
    return true;
  });

  const hasFilters = selectedCategories.length > 0 || selectedStyles.length > 0 || selectedColors.length > 0;

  async function handleLoad(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/templates/presets/${id}`);
      const data = await res.json();
      if (data.canvasJson) {
        onLoadTemplate({
          canvasJson: data.canvasJson,
          paperSize: data.paperSize,
          width: data.width,
          height: data.height,
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null);
    }
  }

  function handleBlank() {
    onLoadTemplate({
      canvasJson: { version: "7.0.0", objects: [], background: "#ffffff" },
    });
  }

  return (
    <div className="-mx-3 -mt-3 flex flex-col">
      {/* Orientation tabs - Restore default look */}
      {!isYoutube && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setOrientation("landscape")}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${orientation === "landscape"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Landscape
          </button>
          <button
            onClick={() => setOrientation("portrait")}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${orientation === "portrait"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Portrait
          </button>
        </div>
      )}

      {/* Filter chips - Restore default style with new functionality */}
      <div className="group relative border-b border-gray-100 bg-white">
        <button
          onClick={scrollFilterLeft}
          className="absolute left-0 top-0 bottom-0 z-20 flex w-8 items-center justify-center bg-gradient-to-r from-white via-white/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </div>
        </button>
        <div ref={filterScrollRef} className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2.5" style={{ scrollbarWidth: "none" }}>
          <FilterChip label="Category" active={selectedCategories.length > 0} isOpen={openFilter === "category"} onToggle={() => setOpenFilter(openFilter === "category" ? null : "category")} onClose={() => setOpenFilter(null)} options={ALL_CATEGORIES} selected={selectedCategories} onSelect={(v) => setSelectedCategories(selectedCategories.includes(v) ? selectedCategories.filter((x) => x !== v) : [...selectedCategories, v])} onClear={() => setSelectedCategories([])} />
          <FilterChip label="Style" active={selectedStyles.length > 0} isOpen={openFilter === "style"} onToggle={() => setOpenFilter(openFilter === "style" ? null : "style")} onClose={() => setOpenFilter(null)} options={ALL_STYLES} selected={selectedStyles} onSelect={(v) => setSelectedStyles(selectedStyles.includes(v as Style) ? selectedStyles.filter((x) => x !== v) : [...selectedStyles, v as Style])} onClear={() => setSelectedStyles([])} align="center" />
          <FilterChip label="Color" active={selectedColors.length > 0} isOpen={openFilter === "color"} onToggle={() => setOpenFilter(openFilter === "color" ? null : "color")} onClose={() => setOpenFilter(null)} options={ALL_COLORS} selected={selectedColors} onSelect={(v) => setSelectedColors(selectedColors.includes(v as ColorTheme) ? selectedColors.filter((x) => x !== v) : [...selectedColors, v as ColorTheme])} onClear={() => setSelectedColors([])} align="right" />
          {hasFilters && (
            <button onClick={() => { setSelectedCategories([]); setSelectedStyles([]); setSelectedColors([]); }} className="shrink-0 flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-100 transition-all">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12" /></svg>
              Clear
            </button>
          )}
        </div>
        <button onClick={scrollFilterRight} className="absolute right-0 top-0 bottom-0 z-20 flex w-10 items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </button>
      </div>

      {/* Recently Used - Integrated into default layout */}
      {customTemplates.length > 0 && (
        <div className="px-3 py-4 border-b border-gray-100 bg-white">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-700">Recently Used</span>
            <div className="flex gap-1">
              <button onClick={scrollCustomLeft} className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={scrollCustomRight} className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
          <div ref={customScrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1" style={{ scrollbarWidth: "none" }}>
            {customTemplates.map((ct) => (
              <div key={ct.id} className="group relative shrink-0 w-[120px]">
                <button
                  onClick={() => onLoadTemplate({ canvasJson: ct.canvasJson, paperSize: ct.paperSize, width: ct.width, height: ct.height })}
                  className="block w-full overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-md"
                  style={{ aspectRatio: `${ct.width} / ${ct.height}` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ct.thumbnail} alt="Custom template" className="h-full w-full object-contain" draggable={false} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteCustomTemplate?.(ct.id); }}
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 group-hover:flex z-10"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Results - Default look */}
      <div className="px-3 py-2">
        <span className="text-[11px] font-semibold text-gray-700">All Results</span>
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-6">
        {/* Blank template */}
        <button
          onClick={handleBlank}
          className="group flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-blue-300 hover:bg-blue-50"
          style={{ aspectRatio: isYoutube ? "16 / 9" : orientation === "portrait" ? "595 / 842" : "842 / 595" }}
        >
          <svg className="h-6 w-6 text-gray-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Demo cards / Presets */}
        {(isYoutube ? YOUTUBE_DEMOS : filtered).map((demo) => {
          const dims = isYoutube ? { width: 1280, height: 720 } : getTemplateDimensions(demo.id, (demo as any).orientation || orientation);
          const thumb = isYoutube ? (demo as any).src : (presetThumbnails[demo.id] ?? (demo as any).thumbnailSrc);
          
          return (
            <button
              key={demo.id}
              onClick={() => handleLoad(demo.id)}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-md disabled:opacity-50"
              style={{ aspectRatio: `${dims.width} / ${dims.height}` }}
              title={demo.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb} alt={demo.label} className="h-full w-full object-cover" draggable={false} />
              {loading === demo.id ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <span className="text-[9px] font-semibold text-white drop-shadow-sm">{demo.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && !isYoutube && (
        <div className="px-3 pb-8 text-center text-xs text-gray-400">No templates match your filters.</div>
      )}
    </div>
  );
}

function FilterChip<T extends string>({
  label, active, isOpen, onToggle, onClose, options, selected, onSelect, onClear, align = "left",
}: {
  label: string; active: boolean; isOpen: boolean; onToggle: () => void; onClose: () => void;
  options: T[]; selected: T[]; onSelect: (v: T) => void; onClear: () => void;
  align?: "left" | "right" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handler(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium transition-all ${active
          ? "border-blue-400 bg-blue-50 text-blue-600"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        {label}
        {active && <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white shadow-sm">{selected.length}</span>}
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-2xl ring-1 ring-black/[0.05]"
          style={{
            top: `${coords.top + 6}px`,
            left: align === "right"
              ? `${coords.left + coords.width - 192}px`
              : align === "center"
                ? `${coords.left + coords.width / 2 - 96}px`
                : `${coords.left}px`,
            animation: "dropdown-fade 0.15s ease-out",
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
            <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">{label}</span>
            <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto py-1.5 no-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className="group flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-gray-700 hover:bg-blue-50/50 transition-colors"
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${selected.includes(opt) ? "border-blue-500 bg-blue-500 shadow-sm" : "border-gray-300 group-hover:border-blue-300"
                  }`}>
                  {selected.includes(opt) && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5}><path d="M20 6 9 17l-5-5" /></svg>
                  )}
                </div>
                <span className={selected.includes(opt) ? "font-medium text-blue-700" : ""}>{opt}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end border-t border-gray-100 px-3 py-2 bg-gray-50/50 rounded-b-xl">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-tight"
            >
              Clear Selection
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
