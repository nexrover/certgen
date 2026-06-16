"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  LuSparkles, LuCompass, LuRefreshCw, LuLayoutTemplate, LuPaintbrush, 
  LuMessageSquareCode, LuClock, LuPen, LuTrash2, 
  LuPlus, LuX, LuUpload, LuPalette, LuType, LuShapes, LuImagePlus, 
  LuSticker, LuImage, LuChevronDown, LuBot, LuChevronUp
} from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";

interface AIPanelProps {
  onLoadTemplate: (payload: {
    canvasJson: Record<string, unknown>;
    paperSize?: string;
    width?: number;
    height?: number;
  }) => void;
  category?: string;
}

type Orientation = "landscape" | "portrait" | "square";
type StyleTheme = "classic" | "modern" | "minimal" | "bold";

const MAX_FREE_GENERATIONS = 5;
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
const STORAGE_KEY = "ai_gen_usage";

interface UsageData {
  count: number;
  blockedUntil: number | null; // timestamp
}

function loadUsage(): UsageData {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return { count: 0, blockedUntil: null };
    const data = JSON.parse(raw) as UsageData;
    if (data.blockedUntil && Date.now() >= data.blockedUntil) {
      const reset: UsageData = { count: 0, blockedUntil: null };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }
    return data;
  } catch {
    return { count: 0, blockedUntil: null };
  }
}

function saveUsage(data: UsageData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "0m";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Mock Data for Brand Kits
const MOCK_BRAND_KITS = [
  { id: '1', name: 'Tech Startup', colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#172554'], font: 'Inter' },
  { id: '2', name: 'Elegant Studio', colors: ['#D97706', '#92400E', '#78350F', '#451A03'], font: 'Playfair Display' },
];

export function AIPanel({ onLoadTemplate, category = "certificate" }: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // New states for Step 1 Specs
  const [activeBrandKit, setActiveBrandKit] = useState('1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('Color Palette');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const [aiModel, setAiModel] = useState('Auto');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false);

  // Usage tracking
  const [usage, setUsage] = useState<UsageData>({ count: 0, blockedUntil: null });
  const [timeLeft, setTimeLeft] = useState("");

  const remaining = MAX_FREE_GENERATIONS - usage.count;
  const isBlocked = usage.blockedUntil !== null && Date.now() < usage.blockedUntil;

  useEffect(() => {
    setUsage(loadUsage());
  }, []);

  useEffect(() => {
    if (!isBlocked || !usage.blockedUntil) return;
    const tick = () => {
      const left = (usage.blockedUntil ?? 0) - Date.now();
      if (left <= 0) {
        const reset: UsageData = { count: 0, blockedUntil: null };
        saveUsage(reset);
        setUsage(reset);
        setTimeLeft("");
      } else {
        setTimeLeft(formatTimeLeft(left));
      }
    };
    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [isBlocked, usage.blockedUntil]);

  const recordGeneration = useCallback(() => {
    const newCount = usage.count + 1;
    const newUsage: UsageData = {
      count: newCount,
      blockedUntil: newCount >= MAX_FREE_GENERATIONS ? Date.now() + COOLDOWN_MS : null,
    };
    saveUsage(newUsage);
    setUsage(newUsage);
  }, [usage.count]);

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
        body: JSON.stringify({ prompt, category, orientation, style: "modern" }),
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

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full relative p-1 bg-white">
      {/* Scrollable Container for Panel Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 space-y-6">
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
                {currentStep === 1 && "Selecting cohesive color palette..."}
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
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <LuPalette className="w-3.5 h-3.5 text-gray-400" />
                Brand Kit Presets
              </label>
              <div className="grid grid-cols-2 gap-3">
                {MOCK_BRAND_KITS.map((kit) => (
                  <div 
                    key={kit.id} 
                    onClick={() => setActiveBrandKit(kit.id)}
                    className={`group relative flex flex-col p-2 rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                      activeBrandKit === kit.id 
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Top Row: Checkbox & Menu */}
                    <div className="flex justify-between items-start w-full mb-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        activeBrandKit === kit.id ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'
                      }`}>
                        {activeBrandKit === kit.id && <LuSparkles className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <button 
                        onClick={(e) => handleMenuToggle(e, kit.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <BsThreeDotsVertical className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Context Menu Popup */}
                      {activeMenuId === kit.id && (
                        <div className="absolute top-8 right-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-1">
                          <button className="w-full text-left px-3 py-2 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                            <LuPen className="w-3 h-3" /> Rename
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-2 text-[11px] text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <LuPaintbrush className="w-3 h-3" /> Edit
                          </button>
                          <button className="w-full text-left px-3 py-2 text-[11px] text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <LuTrash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Center: Color Strip Preview */}
                    <div className="flex w-full h-8 rounded-lg overflow-hidden mb-2 border border-gray-100">
                      {kit.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    
                    {/* Bottom: Title with font */}
                    <div className="text-center w-full">
                      <p className="text-[11px] font-medium text-gray-700 truncate" style={{ fontFamily: kit.font }}>{kit.name}</p>
                    </div>
                  </div>
                ))}

                {/* Add Custom Brand Kit Card */}
                <div 
                  onClick={() => setIsModalOpen(true)}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-400 transition-all duration-200 cursor-pointer min-h-[100px]"
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
                {/* Top area: Textarea + Thumbnails */}
                <div className="p-3 pb-0">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A minimalist tech conference certificate with a dark theme and glowing neon accents..."
                    disabled={isBlocked}
                    className="w-full h-32 text-xs outline-none resize-none placeholder:text-gray-300 bg-transparent custom-scrollbar"
                  />
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
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <LuLayoutTemplate className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Canvas Size</span>
                      <span className="text-xs font-semibold text-gray-700 capitalize">
                        {orientation === "landscape" && "A4 (Landscape)"}
                        {orientation === "portrait" && "Letter (Portrait)"}
                        {orientation === "square" && "Social Post (Square)"}
                      </span>
                    </div>
                  </div>
                  {isDimensionDropdownOpen ? <LuChevronUp className="w-4 h-4 text-gray-400" /> : <LuChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                
                {isDimensionDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-bottom-2">
                    {(["landscape", "portrait", "square"] as const).map((o) => (
                      <button
                        key={o}
                        onClick={() => { setOrientation(o); setIsDimensionDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50/50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className={`border border-gray-300 rounded transition-all duration-300 ${
                          o === "landscape" ? "w-6 h-4" : o === "portrait" ? "w-4 h-6" : "w-5 h-5"
                        } ${orientation === o ? "bg-indigo-600 border-indigo-600" : "bg-gray-100"}`} />
                        <span className={`text-xs font-medium capitalize flex-1 ${orientation === o ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {o === "landscape" && "A4 (Landscape)"}
                          {o === "portrait" && "Letter (Portrait)"}
                          {o === "square" && "Social Post (Square)"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {o === "landscape" && "297x210 mm"}
                          {o === "portrait" && "8.5x11 in"}
                          {o === "square" && "1080x1080 px"}
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
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-transparent pt-8 z-10 pointer-events-none">
        <button
          onClick={handleGenerate}
          disabled={generating || isBlocked}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider pointer-events-auto ${
            !prompt.trim() ? "opacity-70 grayscale-[20%]" : "opacity-100"
          } ${isBlocked ? "opacity-50 pointer-events-none" : ""}`}
        >
          <LuSparkles className="w-4 h-4" />
          Generate with AI
        </button>
      </div>

      {/* Brand Kit Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[80vh] min-h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Brand Kit Configuration</h2>
                <p className="text-sm text-gray-500 mt-1">Customize your AI generation presets</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
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
                {modalTab === 'Color Palette' && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Color Palettes</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {MOCK_BRAND_KITS.map((kit) => (
                        <div key={kit.id} className="p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors">
                          <p className="text-base font-medium text-gray-700 mb-3">{kit.name} Colors</p>
                          <div className="flex gap-3">
                            {kit.colors.map((c, i) => (
                              <div key={i} className="w-16 h-16 rounded-xl shadow-inner border border-black/5" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* Add new palette card */}
                      <div className="p-5 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer min-h-[140px]">
                        <LuPlus className="w-8 h-8 mb-2" />
                        <span className="text-sm font-semibold">Add New Palette</span>
                      </div>
                    </div>
                  </div>
                )}

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
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Typography Hierarchy</h3>
                    <div className="space-y-8 max-w-2xl">
                      {['Title', 'Subtitle', 'Regular Text'].map((level) => (
                        <div key={level} className="flex flex-col gap-3">
                          <label className="text-sm font-bold text-gray-500 uppercase">{level} Font</label>
                          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-indigo-300 transition-colors cursor-pointer">
                            <span className="text-base font-medium text-gray-800">Select Font Family...</span>
                            <LuChevronDown className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
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
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-base font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
