"use client";

import { useState } from "react";
import {
  LuMessageSquareCode,
  LuClock,
  LuZap,
  LuX,
  LuBot,
  LuChevronDown,
  LuChevronUp,
  LuImagePlus,
} from "react-icons/lu";
import type { BrandKit, PaperSize } from "@/lib/types";
import { ALL_PAPER_OPTIONS } from "../../toolbar";

interface PromptSectionProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  category: string;
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  isBlocked: boolean;
  timeLeft: string;
  remaining: number;
  maxFreeGenerations: number;
  activeBrandKit: BrandKit | null;
  onRemoveBrandKitConstraint: () => void;
  aiModel: string;
  onChangeAiModel: (model: string) => void;
}

export function PromptSection({
  prompt,
  onChangePrompt,
  category,
  paperSize,
  onPaperSizeChange,
  isBlocked,
  timeLeft,
  remaining,
  maxFreeGenerations,
  activeBrandKit,
  onRemoveBrandKitConstraint,
  aiModel,
  onChangeAiModel,
}: PromptSectionProps) {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isDimensionDropdownOpen, setIsDimensionDropdownOpen] = useState(false);

  const aiPanelOptions = ALL_PAPER_OPTIONS.filter((o) => o.value !== "CUSTOM");
  const selectedOption =
    aiPanelOptions.find((o) => o.value === paperSize) || aiPanelOptions[0];

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <LuMessageSquareCode className="w-3.5 h-3.5 text-gray-400" />
          Describe Your Template
        </label>
        <div
          className={`flex items-center gap-2 text-[9px] font-bold px-2 py-0.5 rounded-full ${
            isBlocked
              ? "bg-red-100 text-red-600"
              : remaining <= 2
              ? "bg-amber-100 text-amber-700"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {isBlocked && <span>Resets in: {timeLeft} | </span>}
          {isBlocked ? "0" : remaining}/{maxFreeGenerations}
        </div>
      </div>

      {/* Main Prompt Box Container */}
      <div
        className={`relative flex flex-col rounded-2xl border bg-white shadow-sm transition-all ${
          prompt.trim() ? "border-indigo-300 ring-4 ring-indigo-50" : "border-gray-200"
        }`}
      >
        {/* Brand Kit Active Indicator (inside prompt box top) */}
        {activeBrandKit && (
          <div className="flex items-center gap-2 px-3 pt-2.5 pb-0">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
              <LuZap className="w-3 h-3 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-700 truncate max-w-[120px]">
                {activeBrandKit.name}
              </span>
              <div className="flex items-center gap-0.5 ml-1">
                {activeBrandKit.colors.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={onRemoveBrandKitConstraint}
              className="p-0.5 rounded text-gray-400 hover:text-red-500 transition-colors"
              title="Remove brand kit constraint"
            >
              <LuX className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Top area: Textarea + Quota Block overlay */}
        <div className="p-3 pb-0 relative">
          <textarea
            value={prompt}
            onChange={(e) => onChangePrompt(e.target.value)}
            placeholder={
              activeBrandKit
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
              <span className="text-[10px] text-gray-500 mt-1">
                Unlock in:{" "}
                <span className="font-mono font-bold text-red-600">{timeLeft}</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom Inner Utility Row */}
        <div className="flex items-center justify-between p-2 border-t border-gray-55 bg-gray-50/30 rounded-b-2xl">
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
                {["Auto", "Creative", "Precise"].map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      onChangeAiModel(model);
                      setIsModelDropdownOpen(false);
                    }}
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
              <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50">
                Upload Image
              </span>
            </button>
            {prompt && (
              <button
                onClick={() => onChangePrompt("")}
                className="group relative p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <LuX className="w-4 h-4" />
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50">
                  Clear
                </span>
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
            <div className="text-gray-400">{selectedOption.icon}</div>
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Canvas Size
              </span>
              <span className="text-xs font-semibold text-gray-700 capitalize flex items-center gap-1.5 truncate">
                {selectedOption.label}
              </span>
            </div>
          </div>
          {isDimensionDropdownOpen ? (
            <LuChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <LuChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isDimensionDropdownOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-full max-h-[300px] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] animate-in slide-in-from-bottom-2 custom-scrollbar py-2">
            {aiPanelOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onPaperSizeChange(o.value);
                  setIsDimensionDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                  paperSize === o.value ? "bg-indigo-50/50" : ""
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 ${
                    paperSize === o.value ? "text-indigo-600" : "text-gray-400"
                  }`}
                >
                  {o.icon}
                </span>
                <span
                  className={`text-xs flex-1 ${
                    paperSize === o.value
                      ? "font-semibold text-indigo-700"
                      : "font-medium text-gray-600"
                  }`}
                >
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
  );
}
