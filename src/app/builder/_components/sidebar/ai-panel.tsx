"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  LuSparkles, LuCompass, LuRefreshCw, LuLayoutTemplate, LuPaintbrush, 
  LuMessageSquareCode, LuClock, LuPen, LuTrash2, 
  LuPlus, LuX, LuUpload, LuPalette, LuType, LuShapes, LuImagePlus, 
  LuSticker, LuImage, LuChevronDown, LuBot, LuChevronUp, LuZap,
  LuSearch, LuCheck
} from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { BrandKit, PaperSize } from "@/lib/types";
import { ALL_PAPER_OPTIONS } from "../toolbar";
import { generateBrandKitSuggestionPrompt } from "@/lib/services/prompt-orchestrator";
import { 
  DEFAULT_PALETTES,
  hexToRgb,
  rgbToHex,
  rgbToOklch,
  oklchToRgb,
  hexToOklch,
  oklchToHex,
  parseHex,
  parseRgb,
  parseOklch,
  ColorPalette
} from "@/lib/color-converter";

function detectCategoryFromPaperSize(paperSize: PaperSize, defaultCategory: string): string {
  switch (paperSize) {
    case "A4_LANDSCAPE":
      return "certificate";
    case "YOUTUBE_THUMBNAIL":
      return "youtube";
    case "A4":
      return "email";
    case "SQUARE_500":
      return "ecommerce";
    case "SQUARE_1024":
      return "real-estate";
    case "SQUARE_1200":
      return "social-media";
    case "RESUME":
      return "resume";
    case "CHRISTMAS_CARD":
      return "christmas-card";
    case "RECEIPT":
      return "receipt";
    case "INVOICE":
      return "invoice";
    default:
      return defaultCategory;
  }
}

interface AIPanelProps {
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  category?: string;
}

type StyleTheme = "classic" | "modern" | "minimal" | "bold";

const MAX_FREE_GENERATIONS = 5;
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
const STORAGE_KEY = "ai_gen_usage";

const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: "default-1",
    user_id: "default",
    name: "Tech Startup",
    colors: ["#3B82F6", "#1D4ED8", "#1E40AF", "#172554"],
    typography: { title: "Inter", subtitle: "Inter", body: "Inter" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    user_id: "default",
    name: "Elegant Studio",
    colors: ["#D97706", "#92400E", "#78350F", "#451A03"],
    typography: { title: "Playfair Display", subtitle: "Playfair Display", body: "Playfair Display" },
    logos: [],
    graphics: [],
    photos: [],
    elements: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface UsageData {
  count: number;
  windowStart: number | null; // epoch timestamp
}

function loadUsage(): UsageData {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { count: 0, windowStart: null };
    const data = JSON.parse(raw) as UsageData;
    if (data.windowStart && Date.now() >= data.windowStart + COOLDOWN_MS) {
      const reset: UsageData = { count: 0, windowStart: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }
    return data;
  } catch {
    return { count: 0, windowStart: null };
  }
}

function saveUsage(data: UsageData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function AIPanel({ onLoadTemplate, category = "certificate" }: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [paperSize, setPaperSize] = useState<PaperSize>("A4_LANDSCAPE");
  const aiPanelOptions = ALL_PAPER_OPTIONS.filter(o => o.value !== "CUSTOM");
  const selectedOption = aiPanelOptions.find((o) => o.value === paperSize) || aiPanelOptions[0];
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Brand Kit State ────────────────────────────────────
  const [brandKits, setBrandKits] = useState<BrandKit[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_BRAND_KITS;
    try {
      const hiddenDefaults = JSON.parse(localStorage.getItem("hidden_default_kits") || "[]");
      return DEFAULT_BRAND_KITS.filter(k => !hiddenDefaults.includes(k.id));
    } catch {
      return DEFAULT_BRAND_KITS;
    }
  });
  const [brandKitsLoading, setBrandKitsLoading] = useState(true);
  const [useBrandKit, setUseBrandKit] = useState(false);
  const [activeBrandKitId, setActiveBrandKitId] = useState<string | null>("default-1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('Color Palette');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Edit & Rename states
  const [editingBrandKit, setEditingBrandKit] = useState<BrandKit | null>(null);
  const [renamingKitId, setRenamingKitId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");

  // ── Upgraded Color Palette UI State ────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("custom_color_palettes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isColorPopupOpen, setIsColorPopupOpen] = useState(false);
  const [popupPaletteName, setPopupPaletteName] = useState("");
  const [popupColors, setPopupColors] = useState<string[]>([]);
  const [selectedPopupColorIndex, setSelectedPopupColorIndex] = useState(0);

  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState("");
  const [oklchInput, setOklchInput] = useState("");

  const syncColorInputs = (colorHex: string) => {
    setHexInput(colorHex);
    const rgb = hexToRgb(colorHex);
    if (rgb) {
      setRgbInput(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
      const oklch = rgbToOklch(rgb);
      setOklchInput(`oklch(${oklch.l} ${oklch.c} ${oklch.h})`);
    } else {
      setRgbInput("");
      setOklchInput("");
    }
  };

  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    const parsed = parseHex(val);
    if (parsed) {
      const updatedColors = [...popupColors];
      updatedColors[selectedPopupColorIndex] = parsed;
      setPopupColors(updatedColors);
      
      const rgb = hexToRgb(parsed);
      if (rgb) {
        setRgbInput(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        const oklch = rgbToOklch(rgb);
        setOklchInput(`oklch(${oklch.l} ${oklch.c} ${oklch.h})`);
      }
    }
  };

  const handleRgbInputChange = (val: string) => {
    setRgbInput(val);
    const parsedRgb = parseRgb(val);
    if (parsedRgb) {
      const hex = rgbToHex(parsedRgb);
      const updatedColors = [...popupColors];
      updatedColors[selectedPopupColorIndex] = hex;
      setPopupColors(updatedColors);
      
      setHexInput(hex);
      const oklch = rgbToOklch(parsedRgb);
      setOklchInput(`oklch(${oklch.l} ${oklch.c} ${oklch.h})`);
    }
  };

  const handleOklchInputChange = (val: string) => {
    setOklchInput(val);
    const parsedOklch = parseOklch(val);
    if (parsedOklch) {
      const rgb = oklchToRgb(parsedOklch);
      const hex = rgbToHex(rgb);
      const updatedColors = [...popupColors];
      updatedColors[selectedPopupColorIndex] = hex;
      setPopupColors(updatedColors);
      
      setHexInput(hex);
      setRgbInput(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    }
  };

  const handleNativeColorChange = (hex: string) => {
    const updatedColors = [...popupColors];
    updatedColors[selectedPopupColorIndex] = hex.toUpperCase();
    setPopupColors(updatedColors);
    syncColorInputs(hex.toUpperCase());
  };

  const handleSaveCustomPalette = () => {
    if (!popupPaletteName.trim()) {
      alert("Palette name is required");
      return;
    }
    const newPalette: ColorPalette = {
      id: "custom-palette-" + Date.now(),
      name: popupPaletteName.trim(),
      colors: popupColors,
    };
    const updated = [newPalette, ...customPalettes];
    setCustomPalettes(updated);
    localStorage.setItem("custom_color_palettes", JSON.stringify(updated));

    if (editingBrandKit) {
      setEditingBrandKit({
        ...editingBrandKit,
        colors: newPalette.colors,
      });
    }
    setIsColorPopupOpen(false);
  };

  const handleDeleteCustomPalette = (e: React.MouseEvent, paletteId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this custom color palette?")) return;
    const updated = customPalettes.filter(p => p.id !== paletteId);
    setCustomPalettes(updated);
    localStorage.setItem("custom_color_palettes", JSON.stringify(updated));
  };
  
  const [aiModel, setAiModel] = useState('Auto');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false);

  // Usage tracking
  const [usage, setUsage] = useState<UsageData>({ count: 0, windowStart: null });
  const [timeLeft, setTimeLeft] = useState("");

  const remaining = Math.max(0, MAX_FREE_GENERATIONS - usage.count);
  const isBlocked = remaining === 0 && usage.windowStart !== null;

  // Derived: the currently selected brand kit object (null = Condition B)
  const activeBrandKit = useBrandKit && activeBrandKitId
    ? brandKits.find((k) => k.id === activeBrandKitId) ?? null
    : null;

  // ── Fetch brand kits from API on mount ─────────────────
  useEffect(() => {
    let cancelled = false;
    async function fetchKits() {
      setBrandKitsLoading(true);
      try {
        const hiddenDefaults = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem("hidden_default_kits") || "[]")
          : [];
        const visibleDefaults = DEFAULT_BRAND_KITS.filter(k => !hiddenDefaults.includes(k.id));

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
    setUsage(prev => {
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
    setModalTab('Color Palette');
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

  const handleRenameStart = (kit: BrandKit) => {
    setRenamingKitId(kit.id);
    setRenamingName(kit.name);
    setActiveMenuId(null);
  };

  const handleRenameSave = async (kitId: string) => {
    if (!renamingName.trim()) {
      setRenamingKitId(null);
      return;
    }

    if (kitId.startsWith("default-")) {
      try {
        const kitObj = brandKits.find(k => k.id === kitId);
        if (kitObj) {
          const res = await fetch("/api/brand-kits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: renamingName.trim(),
              colors: kitObj.colors,
              typography: kitObj.typography,
            }),
          });
          const data = await res.json();
          if (data.success && data.data) {
            const savedKit = data.data as BrandKit;
            setBrandKits(prev => [...prev.filter(k => k.id !== kitId), savedKit]);
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
      setRenamingKitId(null);
      return;
    }

    try {
      const res = await fetch(`/api/brand-kits/${kitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renamingName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setBrandKits(prev =>
          prev.map(k => (k.id === kitId ? { ...k, name: renamingName.trim() } : k))
        );
      } else {
        alert(data.error || "Failed to rename brand kit");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to rename brand kit");
    } finally {
      setRenamingKitId(null);
    }
  };

  const handleRemoveKit = async (kitId: string) => {
    setActiveMenuId(null);
    const kit = brandKits.find(k => k.id === kitId);
    if (!kit) return;
    if (!confirm(`Are you sure you want to remove "${kit.name}"?`)) return;

    if (kitId.startsWith("default-")) {
      setBrandKits(prev => prev.filter(k => k.id !== kitId));
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
        setBrandKits(prev => prev.filter(k => k.id !== kitId));
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
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const savedKit = data.data as BrandKit;
          setBrandKits(prev => [...prev.filter(k => k.id !== editingBrandKit.id), savedKit]);
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
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const savedKit = data.data as BrandKit;
          setBrandKits(prev => [...prev, savedKit]);
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
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          const savedKit = data.data as BrandKit;
          setBrandKits(prev =>
            prev.map(k => (k.id === savedKit.id ? savedKit : k))
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

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
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
                {currentStep === 1 && (activeBrandKit ? "Applying brand kit constraints..." : "Selecting cohesive color palette...")}
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
            {/* SECTION A: Brand Kit UI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuPalette className="w-3.5 h-3.5 text-gray-400" />
                  Brand Kit Presets
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-gray-400">
                    {useBrandKit ? "Active" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !useBrandKit;
                      setUseBrandKit(nextVal);
                      if (nextVal) {
                        if (!activeBrandKitId && brandKits.length > 0) {
                          handleBrandKitSelect(brandKits[0].id);
                        } else if (activeBrandKitId) {
                          handleBrandKitSelect(activeBrandKitId);
                        }
                      }
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                      useBrandKit ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        useBrandKit ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Loading skeleton */}
                {brandKitsLoading && brandKits.length <= 2 && (
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl border border-gray-200 bg-gray-50/50 min-h-[100px] animate-pulse">
                    <div className="w-full h-8 bg-gray-200 rounded-lg mb-2" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                  </div>
                )}

                {/* Brand kit cards */}
                {brandKits.map((kit) => {
                  const isActive = useBrandKit && activeBrandKitId === kit.id;
                  const isDefault = kit.id.startsWith("default-");
                  return (
                    <div 
                      key={kit.id} 
                      onClick={() => {
                        if (!useBrandKit) {
                          setUseBrandKit(true);
                        }
                        handleBrandKitSelect(kit.id);
                      }}
                      className={`group relative flex flex-col p-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      } ${!useBrandKit ? 'opacity-60 hover:opacity-100 grayscale-[20%]' : ''} ${activeMenuId === kit.id ? 'z-50' : 'z-10'}`}
                    >
                      {/* Top Row: Checkbox & Menu */}
                      <div className="flex justify-between items-start w-full mb-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isActive ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                        }`}>
                          {isActive && <LuSparkles className="w-2.5 h-2.5 text-white" />}
                        </div>
                        
                        <button 
                          onClick={(e) => handleMenuToggle(e, kit.id)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors relative z-[51]"
                        >
                          {activeMenuId === kit.id ? (
                            <LuX className="w-3.5 h-3.5 text-gray-600" />
                          ) : (
                            <BsThreeDotsVertical className="w-3.5 h-3.5" />
                          )}
                        </button>
                        
                        {/* Context Menu Popup */}
                        {activeMenuId === kit.id && (
                          <div className="absolute top-8 right-1 w-28 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in zoom-in-95 origin-top-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRenameStart(kit); }}
                              className="w-full text-left px-3 py-2.5 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <LuPen className="w-3 h-3" /> Rename
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(kit); setActiveMenuId(null); }}
                              className="w-full text-left px-3 py-2.5 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <LuPaintbrush className="w-3 h-3" /> Edit
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveKit(kit.id); }}
                              className="w-full text-left px-3 py-2.5 text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <LuTrash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Center: Color Strip Preview */}
                      <div className="flex w-full h-8 rounded-lg overflow-hidden mb-2 border border-gray-100">
                        {(kit.colors.length > 0 ? kit.colors : ['#cccccc']).map((c, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      
                      {/* Bottom: Title with font or renaming input */}
                      <div className="text-center w-full px-1" onClick={(e) => { if (renamingKitId === kit.id) e.stopPropagation(); }}>
                        {renamingKitId === kit.id ? (
                          <input
                            type="text"
                            value={renamingName}
                            onChange={(e) => setRenamingName(e.target.value)}
                            onBlur={() => handleRenameSave(kit.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSave(kit.id);
                              if (e.key === 'Escape') setRenamingKitId(null);
                            }}
                            autoFocus
                            className="w-full text-[11px] font-medium text-gray-700 bg-gray-50 border border-indigo-500 rounded px-1 text-center outline-none"
                          />
                        ) : (
                          <p className="text-[11px] font-medium text-gray-700 truncate" style={{ fontFamily: kit.typography?.title ?? 'inherit' }}>{kit.name}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add Custom Brand Kit Card */}
                <div 
                  onClick={handleAddCustomKitClick}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-all duration-200 cursor-pointer min-h-[100px] ${
                    !useBrandKit ? 'opacity-60 hover:opacity-100' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-2">
                    <LuPlus className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Custom Kit</p>
                </div>
              </div>
            </div>

            {/* SECTION B: Upgraded Prompt Box UI */}
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <LuMessageSquareCode className="w-3.5 h-3.5 text-gray-400" />
                  Describe Your Template
                </label>
                <div className={`flex items-center gap-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isBlocked ? "bg-red-100 text-red-600" : remaining <= 2 ? "bg-amber-100 text-amber-700" : "bg-indigo-50 text-indigo-600"
                }`}>
                  {isBlocked && <span>Resets in: {timeLeft} | </span>}
                  {isBlocked ? "0" : remaining}/{MAX_FREE_GENERATIONS}
                </div>
              </div>

              {/* Main Prompt Box Container */}
              <div className={`relative flex flex-col rounded-2xl border bg-white shadow-sm transition-all ${
                prompt.trim() ? "border-indigo-300 ring-4 ring-indigo-50" : "border-gray-200"
              }`}>
                {/* Brand Kit Active Indicator (inside prompt box top) */}
                {activeBrandKit && (
                  <div className="flex items-center gap-2 px-3 pt-2.5 pb-0">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
                      <LuZap className="w-3 h-3 text-indigo-600" />
                      <span className="text-[10px] font-bold text-indigo-700 truncate max-w-[120px]">{activeBrandKit.name}</span>
                      <div className="flex items-center gap-0.5 ml-1">
                        {activeBrandKit.colors.slice(0, 4).map((c, i) => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBrandKitSelect(null)}
                      className="p-0.5 rounded text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove brand kit constraint"
                    >
                      <LuX className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Top area: Textarea + Thumbnails */}
                <div className="p-3 pb-0 relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={activeBrandKit 
                      ? `Describe your ${category} template using ${activeBrandKit.name} brand...`
                      : "e.g., A minimalist tech conference certificate with a dark theme and glowing neon accents..."
                    }
                    disabled={isBlocked}
                    className="w-full h-32 text-xs outline-none resize-none placeholder:text-gray-300 bg-transparent custom-scrollbar relative z-10"
                  />
                  {isBlocked && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] rounded-t-2xl">
                      <LuClock className="w-6 h-6 text-red-500 mb-2 animate-pulse" />
                      <span className="text-xs font-bold text-gray-800">Quota Exceeded</span>
                      <span className="text-[10px] text-gray-500 mt-1">Unlock in: <span className="font-mono font-bold text-red-600">{timeLeft}</span></span>
                    </div>
                  )}
                </div>

                {/* Bottom Inner Utility Row */}
                <div className="flex items-center justify-between p-2 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl">
                  {/* AI Model Selector */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50 shadow-sm"
                    >
                      <LuBot className="w-3 h-3 text-indigo-500" />
                      {aiModel}
                      <LuChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {isModelDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                        {['Auto', 'Creative', 'Precise'].map((model) => (
                          <button 
                            key={model}
                            onClick={() => { setAiModel(model); setIsModelDropdownOpen(false); }}
                            className="w-full text-left px-3 py-2 text-[11px] text-gray-600 hover:bg-gray-50"
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Utilities */}
                  <div className="flex items-center gap-1">
                    <button 
                      className="group relative p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
                      title="Upload Reference Image"
                    >
                      <LuImagePlus className="w-4 h-4" />
                      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50">Upload Image</span>
                    </button>
                    {prompt && (
                      <button 
                        onClick={() => setPrompt("")}
                        className="group relative p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                      >
                        <LuX className="w-4 h-4" />
                        <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50">Clear</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dimension Component (Outside Prompt Box) */}
              <div className="relative mt-2">
                <button 
                  onClick={() => setIsDimensionDropdownOpen(!isDimensionDropdownOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400">
                      {selectedOption.icon}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Canvas Size</span>
                      <span className="text-xs font-semibold text-gray-700 capitalize flex items-center gap-1.5 truncate">
                        {selectedOption.label} 
                      </span>
                    </div>
                  </div>
                  {isDimensionDropdownOpen ? <LuChevronUp className="w-4 h-4 text-gray-400" /> : <LuChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                
                {isDimensionDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full max-h-[300px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] animate-in slide-in-from-bottom-2 custom-scrollbar py-2">
                    {aiPanelOptions.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => { 
                          setPaperSize(o.value); 
                          setIsDimensionDropdownOpen(false); 
                          // Auto-paste brand kit prompt matching the new category if active
                          if (useBrandKit && activeBrandKitId) {
                            const kit = brandKits.find((k) => k.id === activeBrandKitId);
                            if (kit) {
                              const detectedCat = detectCategoryFromPaperSize(o.value, category);
                              const suggestion = generateBrandKitSuggestionPrompt(kit, detectedCat);
                              setPrompt(suggestion);
                            }
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${paperSize === o.value ? "bg-indigo-50/50" : ""}`}
                      >
                        <span className={`flex items-center justify-center w-5 ${paperSize === o.value ? "text-indigo-600" : "text-gray-400"}`}>
                          {o.icon}
                        </span>
                        <span className={`text-xs flex-1 ${paperSize === o.value ? 'font-semibold text-indigo-700' : 'font-medium text-gray-600'}`}>
                          {o.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {o.displayDims}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
          } ${
            !prompt.trim() ? "opacity-70 grayscale-[20%]" : "opacity-100"
          } ${isBlocked ? "opacity-50 pointer-events-none" : ""}`}
        >
          <LuSparkles className="w-4 h-4" />
          {activeBrandKit ? "Generate with Brand Kit" : "Generate with AI"}
        </button>
      </div>

      {/* Brand Kit Configuration Modal */}
      {/* Brand Kit Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[80vh] min-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={editingBrandKit?.name ?? ""}
                  onChange={(e) => {
                    if (editingBrandKit) {
                      setEditingBrandKit({ ...editingBrandKit, name: e.target.value });
                    }
                  }}
                  placeholder="Brand Kit Name"
                  className="text-xl font-bold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 rounded transition-colors bg-transparent w-full max-w-md"
                />
                <p className="text-xs text-gray-500 mt-1">Customize your brand colors, fonts, and assets</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingBrandKit(null); }} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <LuX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body: Two-panel architecture */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel: Navigation Tabs */}
              <div className="w-64 border-r border-gray-100 bg-gray-50 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {[
                  { name: 'Color Palette', icon: LuPalette },
                  { name: 'Logo', icon: LuImage },
                  { name: 'Typography', icon: LuType },
                  { name: 'Graphics', icon: LuShapes },
                  { name: 'Photos', icon: LuImagePlus },
                  { name: 'Elements', icon: LuSticker },
                ].map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setModalTab(tab.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      modalTab === tab.name 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-200/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Right Panel: Dynamic Details View */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
                {modalTab === 'Color Palette' && (() => {
                  const query = searchQuery.toLowerCase().trim();
                  
                  const filteredDefault = DEFAULT_PALETTES.filter(p => {
                    if (!query) return true;
                    return p.name.toLowerCase().includes(query) || p.colors.some(c => c.toLowerCase().includes(query));
                  });

                  const filteredCustom = customPalettes.filter(p => {
                    if (!query) return true;
                    return p.name.toLowerCase().includes(query) || p.colors.some(c => c.toLowerCase().includes(query));
                  });

                  const renderPaletteCard = (palette: ColorPalette, isCustom: boolean) => {
                    const isSelected = editingBrandKit && 
                      editingBrandKit.colors.length === palette.colors.length &&
                      editingBrandKit.colors.every((c, idx) => c.toLowerCase() === palette.colors[idx].toLowerCase());

                    return (
                      <div
                        key={palette.id}
                        onClick={() => {
                          if (editingBrandKit) {
                            setEditingBrandKit({
                              ...editingBrandKit,
                              colors: palette.colors,
                            });
                          }
                        }}
                        className={`group relative flex flex-col p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/20 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        {/* Selection & Delete icons */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors pointer-events-auto ${
                            isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                          }`}>
                            {isSelected && <LuCheck className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomPalette(e, palette.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 pointer-events-auto"
                              title="Delete Custom Palette"
                            >
                              <LuTrash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Color Blocks */}
                        <div className="flex w-full h-8 rounded-lg overflow-hidden mt-6 mb-2.5 border border-gray-100 shadow-inner">
                          {palette.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="flex-1 h-full hover:scale-110 transition-transform duration-150"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>

                        {/* Title */}
                        <p className="text-[11px] font-semibold text-gray-700 text-center truncate px-1">
                          {palette.name}
                        </p>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                      {/* Search Header Row */}
                      <div className="flex justify-between items-center border-b pb-3 gap-4">
                        <h3 className="text-lg font-bold text-gray-800">Color Palette</h3>
                        <div className="relative flex-1 max-w-xs">
                          <input
                            type="text"
                            placeholder="Search palettes or colors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pl-8 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-600"
                          />
                          <LuSearch className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <LuX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 2-Column Grid Layout */}
                      <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-6 custom-scrollbar">
                        {/* My color palette */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider mb-3">
                            My color palette
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Create Palette Plus Card */}
                            <div
                              onClick={() => {
                                setPopupPaletteName("My Custom Palette");
                                setPopupColors(["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1"]);
                                setSelectedPopupColorIndex(0);
                                syncColorInputs("#3B82F6");
                                setIsColorPopupOpen(true);
                              }}
                              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-indigo-50/20 hover:border-indigo-400 transition-all duration-200 cursor-pointer min-h-[105px]"
                            >
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-2">
                                <LuPlus className="w-4 h-4 text-gray-500" />
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Add title
                              </p>
                            </div>

                            {/* Custom Palettes */}
                            {filteredCustom.map(palette => renderPaletteCard(palette, true))}
                          </div>
                          {query && filteredCustom.length === 0 && (
                            <p className="text-[11px] text-gray-450 mt-2 italic pl-1">
                              No custom palettes match "{searchQuery}"
                            </p>
                          )}
                        </div>

                        {/* Default Section */}
                        <div className="border-t border-gray-150 pt-5">
                          <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider mb-3">
                            Default
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {filteredDefault.map(palette => renderPaletteCard(palette, false))}
                          </div>
                          {filteredDefault.length === 0 && (
                            <p className="text-xs text-gray-400 py-4 text-center italic">
                              No default palettes match "{searchQuery}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {modalTab === 'Logo' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand Logos</h3>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-full max-w-lg p-12 rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/40 transition-colors">
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-5">
                          <LuUpload className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h4 className="text-base font-bold text-gray-700 mb-2">Drag & Drop your logos here</h4>
                        <p className="text-sm text-gray-500 mb-6">Supports SVG, PNG, JPG (Max 5MB)</p>
                        <button className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                          Browse Files
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'Typography' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Typography Hierarchy</h3>
                    <div className="space-y-6 max-w-2xl">
                      {[
                        { label: "Title Font (Headings)", key: "title" },
                        { label: "Subtitle Font", key: "subtitle" },
                        { label: "Body Font (Paragraphs)", key: "body" }
                      ].map((item) => {
                        const fontVal = editingBrandKit?.typography?.[item.key as keyof typeof editingBrandKit.typography] || "Inter";
                        return (
                          <div key={item.key} className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">{item.label}</label>
                            <select
                              value={fontVal}
                              onChange={(e) => {
                                if (editingBrandKit) {
                                  setEditingBrandKit({
                                    ...editingBrandKit,
                                    typography: {
                                      ...editingBrandKit.typography,
                                      [item.key]: e.target.value
                                    }
                                  });
                                }
                              }}
                              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                              {["Inter", "Playfair Display", "Roboto", "Lora", "Montserrat", "Oswald", "Poppins", "Merriweather", "Outfit", "Dancing Script", "Cinzel"].map((font) => (
                                <option key={font} value={font}>{font}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {modalTab === 'Graphics' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand Graphics</h3>
                    <div className="grid grid-cols-4 gap-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 border border-gray-200 shadow-sm flex items-center justify-center group overflow-hidden relative cursor-pointer">
                          <LuShapes className="w-10 h-10 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">Select</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(modalTab === 'Photos' || modalTab === 'Elements') && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Brand {modalTab}</h3>
                    <div className="grid grid-cols-3 gap-6">
                      {/* Upload Card */}
                      <div className="aspect-video rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
                        <LuUpload className="w-8 h-8 mb-3" />
                        <span className="text-sm font-semibold">Upload New</span>
                      </div>
                      {/* Mock Assets */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="aspect-video rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                          {modalTab === 'Photos' ? <LuImagePlus className="w-10 h-10 text-gray-300" /> : <LuSticker className="w-10 h-10 text-gray-300" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button onClick={() => { setIsModalOpen(false); setEditingBrandKit(null); }} className="px-6 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveModal} className="px-6 py-3 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Color Chooser Popup */}
      {isColorPopupOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <LuPalette className="w-4 h-4 text-indigo-600" />
                Create Custom Palette
              </h3>
              <button
                type="button"
                onClick={() => setIsColorPopupOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-655 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Palette Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Palette Name
                </label>
                <input
                  type="text"
                  value={popupPaletteName}
                  onChange={(e) => setPopupPaletteName(e.target.value)}
                  placeholder="e.g. Electric Teal"
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-gray-700"
                />
              </div>

              {/* Swatch Strip Builder */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Palette Colors ({popupColors.length}/10)</span>
                  <span className="text-[9px] text-gray-450 font-normal normal-case">
                    Click swatch to edit
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 items-center p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
                  {popupColors.map((color, idx) => {
                    const isEditing = idx === selectedPopupColorIndex;
                    return (
                      <div key={idx} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPopupColorIndex(idx);
                            syncColorInputs(color);
                          }}
                          className={`w-9 h-9 rounded-lg border-2 shadow-sm transition-all ${
                            isEditing
                              ? "border-indigo-600 ring-2 ring-indigo-600/20 scale-105"
                              : "border-white hover:scale-105 hover:border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        {popupColors.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newColors = popupColors.filter((_, i) => i !== idx);
                              setPopupColors(newColors);
                              const newIdx = selectedPopupColorIndex >= newColors.length
                                ? Math.max(0, newColors.length - 1)
                                : selectedPopupColorIndex;
                              setSelectedPopupColorIndex(newIdx);
                              syncColorInputs(newColors[newIdx]);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-650"
                            title="Delete color"
                          >
                            <LuX className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Color Swatch Button */}
                  {popupColors.length < 10 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newColor = "#6366F1";
                        const updated = [...popupColors, newColor];
                        setPopupColors(updated);
                        setSelectedPopupColorIndex(updated.length - 1);
                        syncColorInputs(newColor);
                      }}
                      className="w-9 h-9 rounded-lg border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/30 flex items-center justify-center transition-all group"
                      title="Add color swatch"
                    >
                      <LuPlus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Color Details Editor Panel (for active swatch) */}
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  {/* Styled native color picker */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0 cursor-pointer">
                    <input
                      type="color"
                      value={popupColors[selectedPopupColorIndex]}
                      onChange={(e) => handleNativeColorChange(e.target.value)}
                      className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer border-none p-0 bg-transparent"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700">
                      Color #{selectedPopupColorIndex + 1}
                    </p>
                    <p className="text-[10px] text-gray-450 truncate uppercase font-mono">
                      {popupColors[selectedPopupColorIndex]}
                    </p>
                  </div>
                </div>

                {/* Color Code Fields */}
                <div className="space-y-2.5 pt-1.5 border-t border-gray-200/60 font-medium">
                  {/* HEX Input */}
                  <div className="grid grid-cols-4 items-center gap-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase font-mono">
                      HEX
                    </label>
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => handleHexInputChange(e.target.value)}
                      placeholder="#3B82F6"
                      className="col-span-3 text-[11px] font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all uppercase"
                    />
                  </div>

                  {/* RGB Input */}
                  <div className="grid grid-cols-4 items-center gap-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase font-mono">
                      RGB
                    </label>
                    <input
                      type="text"
                      value={rgbInput}
                      onChange={(e) => handleRgbInputChange(e.target.value)}
                      placeholder="rgb(59, 130, 246)"
                      className="col-span-3 text-[11px] font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* OKLCH Input */}
                  <div className="grid grid-cols-4 items-center gap-2">
                    <label className="text-[9px] font-bold text-gray-400 uppercase font-mono">
                      OKLCH
                    </label>
                    <input
                      type="text"
                      value={oklchInput}
                      onChange={(e) => handleOklchInputChange(e.target.value)}
                      placeholder="oklch(0.62 0.19 261)"
                      className="col-span-3 text-[11px] font-mono bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsColorPopupOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomPalette}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Palette
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
