"use client";

import { useState } from "react";
import { LuSparkles, LuCompass, LuRefreshCw, LuLayoutTemplate, LuPaintbrush, LuMessageSquareCode } from "react-icons/lu";

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

const SUGGESTIONS: Record<string, string[]> = {
  certificate: [
    "Corporate Award with navy blue background and gold border details",
    "Minimalist Achievement Certificate for a coding bootcamp graduate",
    "Modern Employee of the Month Certificate with clean typography",
  ],
  youtube: [
    "Vibrant Gaming Thumbnail for an ultimate challenge with neon green glow",
    "Senior Developer in 4 Months tutorial thumbnail with a dark tech theme",
    "Calm Sunrise Music Mix thumbnail with elegant italic typography",
  ],
  ecommerce: [
    "Flash Sale Social Media Post with vibrant pink gradient and Shop Now button",
    "Modern Product Review Card with star ratings and light gray background",
    "Super Sale Square Banner with gold text on black circle",
  ],
  default: [
    "Modern layout with clean fonts and professional spacing",
    "Elegant design with thin borders and minimal text alignment",
    "Creative layout with asymmetric shapes and bold colors",
  ],
};

export function AIPanel({ onLoadTemplate, category = "certificate" }: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [style, setStyle] = useState<StyleTheme>("modern");
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const suggestions = SUGGESTIONS[category] || SUGGESTIONS.default;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setCurrentStep(0);

    const steps = [
      "Analyzing prompt requirements...",
      "Selecting cohesive color palette...",
      "Arranging elements & coordinates...",
      "Polishing typography hierarchy...",
      "Finalizing canvas template JSON..."
    ];

    // Simulate progress updates
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch("/api/templates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          category,
          orientation,
          style,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success) {
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

  return (
    <div className="flex flex-col space-y-5 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col border-b border-gray-100 pb-3">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <LuSparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          AI Design Assistant
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">Describe your dream template & let AI build it</p>
      </div>

      {generating ? (
        /* AI Generation Loading State */
        <div className="flex flex-col items-center justify-center py-12 px-5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/10 text-center space-y-4 shadow-sm">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-14 w-14 animate-ping rounded-full bg-indigo-100 opacity-60"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md animate-spin duration-3000">
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
          {/* Progress bar */}
          <div className="w-full bg-gray-200/60 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        /* Form inputs */
        <div className="space-y-5">
          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <LuMessageSquareCode className="w-3.5 h-3.5 text-gray-400" />
              Describe your Template
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., An elegant modern certificate for web development course completion, navy blue colors with golden border ribbons, bold centered name..."
                className="w-full h-28 rounded-xl border border-gray-200 p-3 text-xs focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-gray-400 resize-none shadow-sm leading-relaxed"
              />
              {prompt && (
                <button 
                  onClick={() => setPrompt("")}
                  className="absolute right-2.5 bottom-2.5 text-[9px] font-medium text-gray-400 hover:text-red-500 transition-colors uppercase tracking-tight"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Orientation Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <LuLayoutTemplate className="w-3.5 h-3.5 text-gray-400" /> Layout Orientation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["landscape", "portrait", "square"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border text-xs font-semibold capitalize transition-all duration-200 cursor-pointer ${
                    orientation === o
                      ? "border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm ring-1 ring-indigo-600"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className={`mb-1.5 border border-gray-300 rounded transition-all duration-300 ${
                    o === "landscape" ? "w-6 h-4" : o === "portrait" ? "w-4 h-6" : "w-5 h-5"
                  } ${orientation === o ? "bg-indigo-600/10 border-indigo-600" : "bg-gray-50"}`} />
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* Style Preset Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <LuPaintbrush className="w-3.5 h-3.5 text-gray-400" /> Design Theme Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["classic", "modern", "minimal", "bold"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-semibold capitalize transition-all duration-200 cursor-pointer text-center ${
                    style === s
                      ? "border-indigo-600 bg-indigo-50/40 text-indigo-700 shadow-sm ring-1 ring-indigo-600"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <LuCompass className="w-3.5 h-3.5 text-gray-400" /> Quick Ideas
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar mt-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(suggestion)}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-white border border-gray-150 hover:bg-indigo-50/20 hover:border-indigo-100 hover:shadow-sm text-gray-600 hover:text-indigo-700 transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex flex-col space-y-1 shadow-sm animate-in fade-in duration-200">
              <span className="font-bold">Generation Failed</span>
              <p className="text-[10px] text-red-650 leading-normal">{error}</p>
            </div>
          )}

          {/* Generate Action Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-md hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer uppercase tracking-wider"
          >
            <LuSparkles className="w-4 h-4 animate-spin duration-3000" />
            Generate with AI
          </button>
        </div>
      )}
    </div>
  );
}
