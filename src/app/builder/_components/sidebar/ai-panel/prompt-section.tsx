"use client";

import { useState } from "react";
import {
  LuMessageSquareCode,
  LuClock,
  LuZap,
  LuX,
  LuChevronDown,
  LuPlus,
} from "react-icons/lu";
import type { BrandKit } from "@/lib/types";
import type { PromptGeneratorSelections } from "../_shared/types";
import { AI_MODELS } from "../_shared/types";

interface PromptSectionProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  category: string;
  isBlocked: boolean;
  timeLeft: string;
  remaining: number;
  maxFreeGenerations: number;
  activeBrandKit: BrandKit | null;
  onRemoveBrandKitConstraint: () => void;
  aiModel: string;
  onChangeAiModel: (model: string) => void;
  activeSelections?: PromptGeneratorSelections;
  onOpenPromptGenerator?: () => void;
}

export function PromptSection({
  prompt,
  onChangePrompt,
  category,
  isBlocked,
  timeLeft,
  remaining,
  maxFreeGenerations,
  activeBrandKit,
  onRemoveBrandKitConstraint,
  aiModel,
  onChangeAiModel,
  activeSelections,
  onOpenPromptGenerator,
}: PromptSectionProps) {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Collect active media for inline thumbnails
  const activeMedia: { url: string; label: string; type: "logo" | "image" }[] = [];
  if (activeBrandKit?.logos) {
    activeBrandKit.logos.forEach((url, i) => {
      activeMedia.push({ url, label: `Logo ${i + 1}`, type: "logo" });
    });
  }
  if (activeSelections?.images) {
    activeSelections.images.forEach((img) => {
      activeMedia.push({ url: img.url, label: img.name, type: "image" });
    });
  }

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

        {/* Inline Media Thumbnails (ChatGPT/Gemini style) */}
        {activeMedia.length > 0 && (
          <div className="flex gap-2 px-3 pt-2.5 pb-0 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none" }}>
            {activeMedia.map((media, i) => (
              <div
                key={i}
                className="shrink-0 relative w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.url}
                  alt={media.label}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/50 text-[7px] text-white text-center py-0.5 truncate px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {media.label}
                </span>
              </div>
            ))}
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
              <span className="text-[10px] text-gray-400 mt-1">
                Unlock in:{" "}
                <span className="font-mono font-bold text-red-600">{timeLeft}</span>
              </span>
            </div>
          )}
        </div>

        {/* Bottom Inner Utility Row */}
        <div className="flex items-center justify-between px-2.5 py-2 border-t border-gray-150 bg-gray-50/30 rounded-b-2xl">
          {/* Left: Prompt Generator Button */}
          {onOpenPromptGenerator && (
            <button
              onClick={onOpenPromptGenerator}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 shadow-sm transition-colors"
              title="Open Prompt Generator"
            >
              <LuPlus className="w-2.5 h-2.5" />
              Prompt Gen
            </button>
          )}

          {/* Right: AI Model Selector + Clear */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
              >
                {aiModel}
                <LuChevronDown className="w-2.5 h-2.5 text-gray-400" />
              </button>
              {isModelDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => {
                        onChangeAiModel(model.value);
                        setIsModelDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex flex-col"
                    >
                      <span className="text-[11px] font-semibold text-gray-700">{model.label}</span>
                      <span className="text-[9px] text-gray-400">{model.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {prompt && (
              <button
                onClick={() => onChangePrompt("")}
                className="group relative p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <LuX className="w-3 h-3" />
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50">
                  Clear
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
