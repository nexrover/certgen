"use client";

import { useState, useEffect, useCallback } from "react";
import { LuSparkles, LuRefreshCw, LuZap, LuX } from "react-icons/lu";
import type { BrandKit, PaperSize } from "@/lib/types";
import { generateBrandKitSuggestionPrompt } from "@/lib/services/prompt-orchestrator";
import type { ColorPalette } from "@/lib/color-converter";
import {
  MAX_FREE_GENERATIONS,
  COOLDOWN_MS,
  DEFAULT_BRAND_KITS,
  detectCategoryFromPaperSize,
  loadUsage,
  saveUsage,
  formatTimeLeft,
  type UsageData,
} from "./types-and-helpers";
import { PromptSection } from "./prompt-section";
import { BrandKitSection } from "./brand-kit-section";
import { BrandKitModal } from "./brand-kit-modal";

interface AIPanelProps {
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  category?: string;
}

export function AIPanel({ onLoadTemplate, category = "certificate" }: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4_LANDSCAPE");
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit states
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

  const [aiModel, setAiModel] = useState("Auto");

  // Usage tracking
  const [usage, setUsage] = useState<UsageData>({ count: 0, windowStart: null });
  const [timeLeft, setTimeLeft] = useState("");

  const remaining = Math.max(0, MAX_FREE_GENERATIONS - usage.count);
  const isBlocked = remaining === 0 && usage.windowStart !== null;

  // Derived: the currently selected brand kit object (null = Condition B)
  const activeBrandKit =
    useBrandKit && activeBrandKitId
      ? brandKits.find((k) => k.id === activeBrandKitId) ?? null
      : null;

  // ── Fetch brand kits from API on mount ─────────────────
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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUsage(loadUsage());
  }, []);

  useEffect(() => {
    if (!usage.windowStart) return;
    const tick = () => {
      const expiresAt = usage.windowStart! + COOLDOWN_MS;
      const left = expiresAt - Date.now();
      if (left <= 0) {
        const reset: UsageData = { count: 0, windowStart: null };
        saveUsage(reset);
        setUsage(reset);
        setTimeLeft("");
      } else {
        setTimeLeft(formatTimeLeft(left));
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [usage.windowStart]);

  // ── Auto-paste prompt when brand kit is selected ───────
  const handleBrandKitSelect = useCallback(
    (kitId: string | null) => {
      setActiveBrandKitId(kitId);

      if (kitId) {
        const kit = brandKits.find((k) => k.id === kitId);
        if (kit) {
          const detectedCat = detectCategoryFromPaperSize(paperSize, category);
          const suggestion = generateBrandKitSuggestionPrompt(kit, detectedCat);
          setPrompt(suggestion);
        }
      }
    },
    [brandKits, category, paperSize]
  );

  const recordGeneration = useCallback(() => {
    setUsage((prev) => {
      const newCount = prev.count + 1;
      const newUsage: UsageData = {
        count: newCount,
        windowStart: prev.windowStart || Date.now(),
      };
      saveUsage(newUsage);
      return newUsage;
    });
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isBlocked) return;
    setGenerating(true);
    setError(null);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch("/api/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          category: detectCategoryFromPaperSize(paperSize, category),
          paperSize,
          style: "modern",
          // Condition A: pass full brand kit if selected
          ...(activeBrandKit ? { brandKit: activeBrandKit } : {}),
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success) {
        recordGeneration();
        onLoadTemplate({
          canvasJson: data.canvasJson,
          paperSize: data.paperSize,
          width: data.width,
          height: data.height,
        });
      } else {
        setError(data.error || "Failed to generate template. Please try again.");
      }
    } catch (err) {
      clearInterval(interval);
      setError("An unexpected network error occurred. Please try again.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const openEditModal = (kit: BrandKit) => {
    setEditingBrandKit(kit);
    setIsModalOpen(true);
  };

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
    openEditModal(newKit);
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
      if (activeBrandKitId === kitId) {
        setActiveBrandKitId(null);
      }
      const hiddenDefaults = JSON.parse(localStorage.getItem("hidden_default_kits") || "[]");
      localStorage.setItem("hidden_default_kits", JSON.stringify([...hiddenDefaults, kitId]));
      return;
    }

    try {
      const res = await fetch(`/api/brand-kits/${kitId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBrandKits((prev) => prev.filter((k) => k.id !== kitId));
        if (activeBrandKitId === kitId) {
          setActiveBrandKitId(null);
        }
      } else {
        alert(data.error || "Failed to delete brand kit");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete brand kit");
    }
  };

  const handleSaveModal = async () => {
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
            layout: editingBrandKit.layout,
            customLayouts: editingBrandKit.custom_layouts,
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
      setIsModalOpen(false);
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
            layout: editingBrandKit.layout,
            customLayouts: editingBrandKit.custom_layouts,
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
            layout: editingBrandKit.layout,
            customLayouts: editingBrandKit.custom_layouts,
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

    setIsModalOpen(false);
    setEditingBrandKit(null);
  };

  const handleAddCustomPalette = (newPalette: ColorPalette) => {
    const updated = [newPalette, ...customPalettes];
    setCustomPalettes(updated);
    localStorage.setItem("custom_color_palettes", JSON.stringify(updated));

    if (editingBrandKit) {
      setEditingBrandKit({
        ...editingBrandKit,
        colors: newPalette.colors,
      });
    }
  };

  const handleDeleteCustomPalette = (paletteId: string) => {
    const updated = customPalettes.filter((p) => p.id !== paletteId);
    setCustomPalettes(updated);
    localStorage.setItem("custom_color_palettes", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* Scrollable Container for Panel Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-4 pb-24 space-y-6">
        {/* Header Info */}
        <div className="flex flex-col border-b border-gray-100 pb-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <LuSparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            AI Design Assistant
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Describe your dream template &amp; let AI build it</p>
        </div>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/20 text-center space-y-4 shadow-sm backdrop-blur-sm">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-14 w-14 animate-ping rounded-full bg-indigo-100 opacity-60"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg animate-spin duration-3000">
                <LuRefreshCw className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1.5 w-full">
              <h4 className="text-xs font-bold text-gray-700">Designing Template</h4>
              <p className="text-[11px] text-indigo-600 font-medium h-4">
                {currentStep === 0 && "Analyzing prompt requirements..."}
                {currentStep === 1 &&
                  (activeBrandKit
                    ? "Applying brand kit constraints..."
                    : "Selecting cohesive color palette...")}
                {currentStep === 2 && "Arranging elements & coordinates..."}
                {currentStep === 3 && "Polishing typography hierarchy..."}
                {currentStep === 4 && "Finalizing canvas template JSON..."}
              </p>
            </div>
            <div className="w-full bg-gray-200/60 rounded-full h-1.5 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-655 p-0.5">
                  <LuX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* SECTION A: Brand Kit UI */}
            <BrandKitSection
              brandKits={brandKits}
              brandKitsLoading={brandKitsLoading}
              useBrandKit={useBrandKit}
              onToggleUseBrandKit={(nextVal) => {
                setUseBrandKit(nextVal);
                if (nextVal) {
                  if (!activeBrandKitId && brandKits.length > 0) {
                    handleBrandKitSelect(brandKits[0].id);
                  } else if (activeBrandKitId) {
                    handleBrandKitSelect(activeBrandKitId);
                  }
                }
              }}
              activeBrandKitId={activeBrandKitId}
              onBrandKitSelect={handleBrandKitSelect}
              onEditKit={openEditModal}
              onRenameKit={handleRenameKit}
              onRemoveKit={handleRemoveKit}
              onAddCustomKit={handleAddCustomKitClick}
            />

            {/* SECTION B: Upgraded Prompt Box UI */}
            <PromptSection
              prompt={prompt}
              onChangePrompt={setPrompt}
              category={category}
              paperSize={paperSize}
              onPaperSizeChange={(size) => {
                setPaperSize(size);
                // Auto-paste brand kit prompt matching the new category if active
                if (useBrandKit && activeBrandKitId) {
                  const kit = brandKits.find((k) => k.id === activeBrandKitId);
                  if (kit) {
                    const detectedCat = detectCategoryFromPaperSize(size, category);
                    const suggestion = generateBrandKitSuggestionPrompt(kit, detectedCat);
                    setPrompt(suggestion);
                  }
                }
              }}
              isBlocked={isBlocked}
              timeLeft={timeLeft}
              remaining={remaining}
              maxFreeGenerations={MAX_FREE_GENERATIONS}
              activeBrandKit={activeBrandKit}
              onRemoveBrandKitConstraint={() => handleBrandKitSelect(null)}
              aiModel={aiModel}
              onChangeAiModel={setAiModel}
            />
          </>
        )}
      </div>

      {/* Execution Button (Fixed to Bottom inside Panel) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8 z-10 pointer-events-none">
        {/* Brand Kit Active Badge */}
        {activeBrandKit && !generating && (
          <div className="flex items-center justify-center mb-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
              <LuZap className="w-3 h-3" />
              Brand Kit Mode
            </div>
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating || isBlocked}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider pointer-events-auto ${
            activeBrandKit
              ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600"
              : "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600"
          } ${!prompt.trim() ? "opacity-70 grayscale-[20%]" : "opacity-100"} ${
            isBlocked ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <LuSparkles className="w-4 h-4" />
          {activeBrandKit ? "Generate with Brand Kit" : "Generate with AI"}
        </button>
      </div>

      {/* Brand Kit Configuration Modal */}
      <BrandKitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBrandKit(null);
        }}
        editingBrandKit={editingBrandKit}
        onUpdateEditingBrandKit={setEditingBrandKit}
        customPalettes={customPalettes}
        onAddCustomPalette={handleAddCustomPalette}
        onDeleteCustomPalette={handleDeleteCustomPalette}
        onSave={handleSaveModal}
      />
    </div>
  );
}
