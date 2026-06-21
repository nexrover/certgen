"use client";

import { useRef } from "react";
import { LuLayoutGrid, LuPalette, LuShapes, LuImage, LuRuler, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import type { PromptGeneratorSelections } from "../_shared/types";

interface PromptGeneratorRightPanelProps {
  selections: PromptGeneratorSelections;
}

export function PromptGeneratorRightPanel({ selections }: PromptGeneratorRightPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -220 : 220,
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Active Selections</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-750 transition-colors shadow-sm"
            title="Scroll Left"
          >
            <LuChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-750 transition-colors shadow-sm"
            title="Scroll Right"
          >
            <LuChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >        {/* Card 1: Brand Kit */}
        <div
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 ${
            selections.brandKit
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuPalette className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Brand Kit</p>
            <p className={`text-xs font-bold truncate ${selections.brandKit ? "text-gray-800" : "text-gray-400"}`}>
              {selections.brandKit?.name ?? "Not selected"}
            </p>
          </div>
          <div>
            {selections.brandKit ? (
              <div className="flex gap-1 border border-gray-100 rounded-lg p-1.5 bg-gray-50/50">
                {selections.brandKit.colors.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Choose a brand kit</p>
            )}
          </div>
        </div>

        {/* Card 2: Layout */}
        <div
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 ${
            selections.layout
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuLayoutGrid className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Layout</p>
            <p className={`text-xs font-bold truncate ${selections.layout ? "text-gray-800" : "text-gray-400"}`}>
              {selections.layout?.title ?? selections.layout?.name ?? "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 line-clamp-2">
              {selections.layout?.description ?? "Choose layout guidelines"}
            </p>
          </div>
        </div>

        {/* Card 3: Elements */}
        <div
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 ${
            selections.elements.length > 0
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuShapes className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Elements</p>
            <p className={`text-xs font-bold truncate ${selections.elements.length > 0 ? "text-gray-800" : "text-gray-400"}`}>
              {selections.elements.length > 0 ? `${selections.elements.length} Selected` : "Not selected"}
            </p>
          </div>
          <div>
            {selections.elements.length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {selections.elements.slice(0, 4).map((el, i) => (
                  <div key={i} className="w-7 h-7 rounded-lg border border-gray-150 bg-white p-1 flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={el.url} alt={el.label} className="w-full h-full object-contain" />
                  </div>
                ))}
                {selections.elements.length > 4 && (
                  <div className="w-7 h-7 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 flex items-center justify-center shrink-0 select-none">
                    +{selections.elements.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Add design elements</p>
            )}
          </div>
        </div>

        {/* Card 4: Images */}
        <div
          className={`shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 ${
            selections.images.length > 0
              ? "border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
              : "border-gray-200 bg-white opacity-60"
          }`}
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuImage className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Images</p>
            <p className={`text-xs font-bold truncate ${selections.images.length > 0 ? "text-gray-800" : "text-gray-400"}`}>
              {selections.images.length > 0 ? `${selections.images.length} Selected` : "Not selected"}
            </p>
          </div>
          <div>
            {selections.images.length > 0 ? (
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                {selections.images.slice(0, 3).map((img, i) => (
                  <div key={i} className="w-9 h-7 rounded-lg border border-gray-150 bg-white overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </div>
                ))}
                {selections.images.length > 3 && (
                  <div className="w-7 h-7 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 flex items-center justify-center shrink-0 select-none">
                    +{selections.images.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400">Add asset images</p>
            )}
          </div>
        </div>

        {/* Card 5: Canvas Size */}
        <div
          className="shrink-0 w-52 rounded-2xl border-2 p-4 transition-all flex flex-col justify-between h-48 border-indigo-300 bg-gradient-to-br from-indigo-50/40 to-white shadow-md"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white mb-2 shadow-sm">
              <LuRuler className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Canvas Size</p>
            <p className="text-xs font-bold text-gray-800 truncate">
              {selections.canvasSize.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-medium">Target dimensions active</p>
          </div>
        </div>

      </div>
    </div>
  );
}
