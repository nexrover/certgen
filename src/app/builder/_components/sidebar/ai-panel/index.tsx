"use client";

import { useState, useEffect, useCallback } from "react";
import { LuSparkles, LuRefreshCw, LuZap, LuX } from "react-icons/lu";
import type { BrandKit, BrandKitLayout, PaperSize } from "@/lib/types";
import { generateBrandKitSuggestionPrompt } from "@/lib/services/prompt-orchestrator";
import type { ColorPalette } from "@/lib/color-converter";
import type { PromptGeneratorSelections, ModalId } from "../_shared/types";
import {
  MAX_FREE_GENERATIONS,
  COOLDOWN_MS,
  detectCategoryFromPaperSize,
  loadUsage,
  saveUsage,
  formatTimeLeft,
  type UsageData,
} from "./types-and-helpers";
import { PromptSection } from "./prompt-section";
import { PromptGeneratorModal } from "../prompt-generator-modal";
import { ALL_PAPER_OPTIONS } from "../../toolbar";

interface AIPanelProps {
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  category?: string;
  onOpenModal?: (id: ModalId) => void;
  
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  brandKits: BrandKit[];
  brandKitsLoading: boolean;
  useBrandKit: boolean;
  onToggleUseBrandKit: (val: boolean) => void;
  activeBrandKitId: string | null;
  onBrandKitSelect: (id: string | null) => void;
  customPalettes: ColorPalette[];
}

export function AIPanel({
  onLoadTemplate,
  category = "certificate",
  onOpenModal,
  paperSize,
  onPaperSizeChange,
  brandKits,
  brandKitsLoading,
  useBrandKit,
  onToggleUseBrandKit,
  activeBrandKitId,
  onBrandKitSelect,
  customPalettes,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Prompt Generator State ─────────────────────────────
  const [promptGeneratorSelections, setPromptGeneratorSelections] = useState<PromptGeneratorSelections>({
    brandKit: null,
    layout: null,
    elements: [],
    images: [],
    canvasSize: paperSize,
    templateSkillSet: category,
  });

  const [aiModel, setAiModel] = useState("Gemini 1.5 Flash");

  // Usage tracking
  const [usage, setUsage] = useState<UsageData>({ count: 0, windowStart: null });
  const [timeLeft, setTimeLeft] = useState("");

  const remaining = Math.max(0, MAX_FREE_GENERATIONS - usage.count);
  const isBlocked = remaining === 0 && usage.windowStart !== null;

  const activeBrandKit =
    useBrandKit && activeBrandKitId
      ? brandKits.find((k) => k.id === activeBrandKitId) ?? null
      : null;

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

  const handleBrandKitSelectLocal = useCallback(
    (kitId: string | null) => {
      onBrandKitSelect(kitId);
      if (kitId) {
        const kit = brandKits.find((k) => k.id === kitId);
        if (kit) {
          const detectedCat = detectCategoryFromPaperSize(paperSize, category);
          const suggestion = generateBrandKitSuggestionPrompt(kit, detectedCat);
          setPrompt(suggestion);
        }
      }
    },
    [brandKits, category, paperSize, onBrandKitSelect]
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

  // Track layout and assets from prompt generator for API calls
  const [activeLayout, setActiveLayout] = useState<BrandKitLayout | null>(null);
  const [activeAssets, setActiveAssets] = useState<{ kind: string; url: string; label: string }[]>([]);

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
          ...(activeBrandKit ? { brandKit: activeBrandKit } : {}),
          ...(activeLayout ? { layout: activeLayout } : {}),
          ...(activeAssets.length > 0 ? { assets: activeAssets } : {}),
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

  // ── Prompt Generator Handlers ──────────────────────────
  const handleOpenPromptGenerator = () => {
    // Initialize selections with current state
    setPromptGeneratorSelections((prev) => ({
      ...prev,
      brandKit: activeBrandKit,
      canvasSize: paperSize,
      templateSkillSet: category,
    }));
    setIsPromptGeneratorOpen(true);
  };

  const [isPromptGeneratorOpen, setIsPromptGeneratorOpen] = useState(false);

  const handlePromptGeneratorProcess = (notePrompt: string) => {
    // Compose the final prompt from selections
    const parts: string[] = [];

    if (promptGeneratorSelections.brandKit) {
      parts.push(`Brand kit: ${promptGeneratorSelections.brandKit.name} with colors ${promptGeneratorSelections.brandKit.colors.join(", ")}`);
    }
    if (promptGeneratorSelections.layout) {
      parts.push(`Layout: ${promptGeneratorSelections.layout.title ?? promptGeneratorSelections.layout.name}`);
    }
    if (promptGeneratorSelections.elements.length > 0) {
      parts.push(`Elements: ${promptGeneratorSelections.elements.map((e) => e.label).join(", ")}`);
    }
    if (promptGeneratorSelections.images.length > 0) {
      parts.push(`Images: ${promptGeneratorSelections.images.map((i) => i.name).join(", ")}`);
    }
    if (notePrompt.trim()) {
      parts.push(`Additional notes: ${notePrompt.trim()}`);
    }

    if (parts.length > 0) {
      setPrompt(parts.join(". ") + ".");
    }

    // Apply canvas size
    if (promptGeneratorSelections.canvasSize !== paperSize) {
      onPaperSizeChange(promptGeneratorSelections.canvasSize);
    }

    // Apply brand kit
    if (promptGeneratorSelections.brandKit) {
      onToggleUseBrandKit(true);
      onBrandKitSelect(promptGeneratorSelections.brandKit.id);
    }

    // Store layout and assets for the compilation pipeline
    setActiveLayout(promptGeneratorSelections.layout ?? null);
    const compiledAssets: { kind: string; url: string; label: string }[] = [
      ...promptGeneratorSelections.elements.map((e) => ({ kind: "element" as const, url: e.url, label: e.label })),
      ...promptGeneratorSelections.images.map((i) => ({ kind: "image" as const, url: i.url, label: i.name })),
    ];
    setActiveAssets(compiledAssets);
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

            {/* Upgraded Prompt Box UI */}
            <PromptSection
              prompt={prompt}
              onChangePrompt={setPrompt}
              category={category}
              isBlocked={isBlocked}
              timeLeft={timeLeft}
              remaining={remaining}
              maxFreeGenerations={MAX_FREE_GENERATIONS}
              activeBrandKit={activeBrandKit}
              onRemoveBrandKitConstraint={() => handleBrandKitSelectLocal(null)}
              aiModel={aiModel}
              onChangeAiModel={setAiModel}
              activeSelections={promptGeneratorSelections}
              onOpenPromptGenerator={handleOpenPromptGenerator}
              onRemoveMedia={(kind, index) => {
                if (kind === "image") {
                  const updated = promptGeneratorSelections.images.filter((_, i) => i !== index);
                  setPromptGeneratorSelections((prev) => ({ ...prev, images: updated }));
                }
              }}
            />
          </>
        )}
      </div>

      {/* Execution Button (Fixed to Bottom inside Panel) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-8 z-10 pointer-events-none">
        {activeBrandKit && !generating && (
          <div className="flex items-center justify-center mb-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
              <LuZap className="w-3.5 h-3.5" />
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

      {/* Prompt Generator Workspace Modal */}
      <PromptGeneratorModal
        isOpen={isPromptGeneratorOpen}
        onClose={() => setIsPromptGeneratorOpen(false)}
        selections={promptGeneratorSelections}
        onUpdateSelections={(updates) =>
          setPromptGeneratorSelections((prev) => ({ ...prev, ...updates }))
        }
        brandKits={brandKits}
        customLayouts={activeBrandKit?.custom_layouts ?? []}
        onProcess={handlePromptGeneratorProcess}
      />
    </div>
  );
}
